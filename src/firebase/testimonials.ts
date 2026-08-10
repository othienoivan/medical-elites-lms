import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../config/firebase";

export type PublicTestimonial = {
  id: string;
  authorUid: string;
  name: string;
  school: string;
  image: string;
  rating: number;
  review: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: unknown;
};

export async function getApprovedTestimonials(): Promise<PublicTestimonial[]> {
  const snapshot = await getDocs(query(collection(db, "testimonials"), where("status", "==", "approved")));
  return snapshot.docs.map((item) => {
    const data = item.data() as Partial<PublicTestimonial>;
    return {
      id: item.id, authorUid: String(data.authorUid ?? ""), name: String(data.name ?? "Medical Elites user"),
      school: String(data.school ?? "Medical Elites community"), image: String(data.image ?? ""),
      rating: Math.min(5, Math.max(1, Number(data.rating ?? 5))), review: String(data.review ?? ""),
      status: "approved" as const, createdAt: data.createdAt,
    };
  }).filter((item) => item.review.trim().length > 0);
}

export async function submitTestimonial(input: Omit<PublicTestimonial, "id" | "status" | "createdAt">): Promise<void> {
  await addDoc(collection(db, "testimonials"), {
    ...input, rating: Math.min(5, Math.max(1, Math.round(input.rating))), review: input.review.trim().slice(0, 1500),
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
}
