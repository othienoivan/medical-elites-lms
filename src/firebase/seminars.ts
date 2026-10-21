import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "../config/firebase";

export type SeminarCloudState = {
  tasks: unknown[];
  attendance: unknown[];
  scores: unknown[];
  budget: unknown[];
};

export const KAWEMPE_SEMINAR_ID = "kawempe-2026";

export function watchSeminar(
  onData: (data: SeminarCloudState | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "seminars", KAWEMPE_SEMINAR_ID), snapshot => {
    if (!snapshot.exists()) return onData(null);
    const value = snapshot.data();
    onData({
      tasks: Array.isArray(value.tasks) ? value.tasks : [],
      attendance: Array.isArray(value.attendance) ? value.attendance : [],
      scores: Array.isArray(value.scores) ? value.scores : [],
      budget: Array.isArray(value.budget) ? value.budget : [],
    });
  }, onError);
}

export async function saveSeminar(input: {
  data: SeminarCloudState;
  userId: string;
  institutionId: string;
  userName: string;
}) {
  const reference = doc(db, "seminars", KAWEMPE_SEMINAR_ID);
  const existing = await getDoc(reference);
  const common = {
    ...input.data,
    title: "Kawempe Seminar and Departmental Competition 2026",
    updatedByUid: input.userId,
    updatedByName: input.userName,
    updatedAt: serverTimestamp(),
  };
  if (existing.exists()) {
    await setDoc(reference, common, { merge: true });
    return;
  }
  await setDoc(reference, {
    ...common,
    institutionId: input.institutionId,
    ownerUid: input.userId,
    committeeUids: [input.userId],
    createdAt: serverTimestamp(),
  });
}
