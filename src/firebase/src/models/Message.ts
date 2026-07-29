export interface MessagingContact {
  uid: string;
  fullName: string;
  email: string;
  role: "student" | "tutor" | "admin";
}

export interface Conversation {
  id: string;
  participantUids: string[];
  participantNames: Record<string, string>;
  participantEmails: Record<string, string>;
  lastMessage: string;
  lastMessageAt?: Date;
  lastSenderUid?: string;
  createdByUid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  recipientUid: string;
  body: string;
  readByUids: string[];
  createdAt?: Date;
}
