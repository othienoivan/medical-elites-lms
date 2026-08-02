import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type {
  Conversation,
  DirectMessage,
  MessagingContact,
} from "../models/Message";
import { createNotification } from "./notifications";

const CONVERSATIONS = "conversations";
const MESSAGES = "messages";

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function conversationFromSnapshot(
  id: string,
  data: Record<string, unknown>
): Conversation {
  return {
    ...(data as unknown as Conversation),
    id,
    lastMessageAt: toDate(data.lastMessageAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function messageFromSnapshot(
  id: string,
  data: Record<string, unknown>
): DirectMessage {
  return {
    ...(data as unknown as DirectMessage),
    id,
    createdAt: toDate(data.createdAt),
  };
}

export async function getMessagingContacts(): Promise<MessagingContact[]> {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const contacts = new Map<string, MessagingContact>();

  usersSnapshot.docs.forEach((item) => {
    const data = item.data();
    const role = data.role;
    if (role !== "student" && role !== "tutor" && role !== "admin") return;
    if (data.isActive === false) return;

    contacts.set(item.id, {
      uid: item.id,
      fullName:
        typeof data.fullName === "string" && data.fullName.trim()
          ? data.fullName
          : typeof data.email === "string"
            ? data.email
            : "LMS User",
      email: typeof data.email === "string" ? data.email : "",
      role,
    });
  });

  return [...contacts.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );
}

export async function getConversationsForUser(
  userUid: string
): Promise<Conversation[]> {
  const snapshot = await getDocs(
    query(
      collection(db, CONVERSATIONS),
      where("participantUids", "array-contains", userUid)
    )
  );

  return snapshot.docs
    .map((item) => conversationFromSnapshot(item.id, item.data()))
    .sort(
      (a, b) =>
        (b.lastMessageAt?.getTime() || 0) -
        (a.lastMessageAt?.getTime() || 0)
    );
}

export async function getMessagesForConversation(
  conversationId: string
): Promise<DirectMessage[]> {
  const snapshot = await getDocs(
    query(collection(db, MESSAGES), where("conversationId", "==", conversationId))
  );

  return snapshot.docs
    .map((item) => messageFromSnapshot(item.id, item.data()))
    .sort(
      (a, b) =>
        (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
    );
}

export async function getOrCreateConversation(input: {
  currentUser: MessagingContact;
  recipient: MessagingContact;
}): Promise<string> {
  const existing = await getConversationsForUser(input.currentUser.uid);
  const match = existing.find(
    (conversation) =>
      conversation.participantUids.length === 2 &&
      conversation.participantUids.includes(input.recipient.uid)
  );

  if (match) return match.id;

  const reference = await addDoc(collection(db, CONVERSATIONS), {
    participantUids: [input.currentUser.uid, input.recipient.uid],
    participantNames: {
      [input.currentUser.uid]: input.currentUser.fullName,
      [input.recipient.uid]: input.recipient.fullName,
    },
    participantEmails: {
      [input.currentUser.uid]: input.currentUser.email,
      [input.recipient.uid]: input.recipient.email,
    },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    lastSenderUid: "",
    createdByUid: input.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function sendDirectMessage(input: {
  conversationId: string;
  sender: MessagingContact;
  recipient: MessagingContact;
  body: string;
}): Promise<void> {
  const body = input.body.trim();
  if (!body) throw new Error("Please enter a message.");

  await addDoc(collection(db, MESSAGES), {
    conversationId: input.conversationId,
    senderUid: input.sender.uid,
    senderName: input.sender.fullName,
    senderEmail: input.sender.email,
    recipientUid: input.recipient.uid,
    body,
    readByUids: [input.sender.uid],
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, CONVERSATIONS, input.conversationId), {
    lastMessage: body,
    lastMessageAt: serverTimestamp(),
    lastSenderUid: input.sender.uid,
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userUid: input.recipient.uid,
    title: `New message from ${input.sender.fullName}`,
    body: body.length > 100 ? `${body.slice(0, 100)}…` : body,
    type: "message",
    link: input.recipient.role === "student" ? "/messages" : "/tutor/messages",
  });
}
