import { arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, type Unsubscribe } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";

export type SeminarCloudState = {
  tasks: unknown[];
  attendance: unknown[];
  scores: unknown[];
  budget: unknown[];
};

export const KAWEMPE_SEMINAR_ID = "kawempe-2026";
export type CommitteeMember = { uid:string; fullName:string; email:string; role:string; responsibilities:string; active:boolean; institutionId?:string|null };
export type CommitteeTask = { id:string; title:string; assigneeUid:string; assigneeName:string; deadline:string; status:"not-started"|"in-progress"|"done"|"blocked"; institutionId?:string|null };

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

export async function findCommitteeCandidate(email:string){
  const call=httpsCallable<{email:string},{candidate:{uid:string;fullName:string;email:string;institutionId:string|null}|null}>(functions,"findSeminarCommitteeCandidate");
  return (await call({email:email.trim().toLowerCase()})).data.candidate;
}
export function watchCommittee(setter:(rows:CommitteeMember[])=>void){return onSnapshot(query(collection(db,"seminarCommittee"),where("seminarId","==",KAWEMPE_SEMINAR_ID)),s=>setter(s.docs.map(d=>({uid:d.id,...d.data()}) as CommitteeMember)))}
export function watchCommitteeTasks(setter:(rows:CommitteeTask[])=>void){return onSnapshot(query(collection(db,"seminarCommitteeTasks"),where("seminarId","==",KAWEMPE_SEMINAR_ID)),s=>setter(s.docs.map(d=>({id:d.id,...d.data()}) as CommitteeTask)))}
export async function authoriseCommitteeMember(member:CommitteeMember){await setDoc(doc(db,"seminarCommittee",member.uid),{...member,seminarId:KAWEMPE_SEMINAR_ID,updatedAt:serverTimestamp()});await updateDoc(doc(db,"seminars",KAWEMPE_SEMINAR_ID),{committeeUids:arrayUnion(member.uid),updatedAt:serverTimestamp()})}
export async function revokeCommitteeMember(uid:string){await updateDoc(doc(db,"seminarCommittee",uid),{active:false,updatedAt:serverTimestamp()});await updateDoc(doc(db,"seminars",KAWEMPE_SEMINAR_ID),{committeeUids:arrayRemove(uid),updatedAt:serverTimestamp()})}
export async function saveCommitteeTask(task:Omit<CommitteeTask,"id">){const ref=doc(collection(db,"seminarCommitteeTasks"));await setDoc(ref,{...task,seminarId:KAWEMPE_SEMINAR_ID,createdAt:serverTimestamp(),updatedAt:serverTimestamp()})}
export async function updateCommitteeTaskStatus(id:string,status:CommitteeTask["status"]){await updateDoc(doc(db,"seminarCommitteeTasks",id),{status,updatedAt:serverTimestamp()})}

export async function saveSeminar(input: {
  data: SeminarCloudState;
  userId: string;
  institutionId?: string | null;
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
    institutionId: input.institutionId || null,
    ownerUid: input.userId,
    committeeUids: [input.userId],
    createdAt: serverTimestamp(),
  });
}
