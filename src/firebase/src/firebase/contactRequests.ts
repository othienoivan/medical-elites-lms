import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../config/firebase";

export type ContactRequestInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function createContactRequest(
  input: ContactRequestInput
): Promise<string> {
  const reference = await addDoc(collection(db, "contactRequests"), {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "new",
    source: "public-website",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}
