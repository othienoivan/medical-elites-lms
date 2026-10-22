import { arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, type Unsubscribe } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";

export type SeminarCloudState = { tasks: unknown[]; attendance: unknown[]; scores: unknown[]; budget: unknown[] };
export type SeminarSummary = { id:string; title:string; ownerUid:string; ownerName:string; institutionId?:string|null; committeeUids:string[] };
export type CommitteeMember = { uid:string; fullName:string; email:string; role:string; responsibilities:string; active:boolean; institutionId?:string|null };
export type CommitteeTask = { id:string; title:string; assigneeUid:string; assigneeName:string; deadline:string; status:"not-started"|"in-progress"|"done"|"blocked"; institutionId?:string|null };

const seminarDoc = (seminarId:string) => doc(db,"seminars",seminarId);

export function watchAccessibleSeminars(userId:string,setter:(rows:SeminarSummary[])=>void):Unsubscribe {
  const rows=new Map<string,SeminarSummary>();
  const publish=()=>setter([...rows.values()].sort((a,b)=>a.title.localeCompare(b.title)));
  const sync=(snapshots:Array<{id:string;data:()=>Record<string,unknown>}>)=>{for(const item of snapshots)rows.set(item.id,{id:item.id,...item.data()} as SeminarSummary);publish()};
  const owned=onSnapshot(query(collection(db,"seminars"),where("ownerUid","==",userId)),snapshot=>sync(snapshot.docs));
  const committee=onSnapshot(query(collection(db,"seminars"),where("committeeUids","array-contains",userId)),snapshot=>sync(snapshot.docs));
  return()=>{owned();committee()};
}

export async function createSeminar(input:{title:string;userId:string;userName:string;institutionId?:string|null}) {
  const reference=doc(collection(db,"seminars"));
  await setDoc(reference,{title:input.title.trim(),ownerUid:input.userId,ownerName:input.userName,institutionId:input.institutionId||null,committeeUids:[input.userId],tasks:[],attendance:[],scores:[],budget:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  return reference.id;
}

export function watchSeminar(seminarId:string,onData:(data:(SeminarCloudState&SeminarSummary)|null)=>void,onError:(error:Error)=>void):Unsubscribe {
  return onSnapshot(seminarDoc(seminarId),snapshot=>{if(!snapshot.exists())return onData(null);const value=snapshot.data();onData({id:snapshot.id,title:String(value.title||"Untitled seminar"),ownerUid:String(value.ownerUid||""),ownerName:String(value.ownerName||""),institutionId:value.institutionId?String(value.institutionId):null,committeeUids:Array.isArray(value.committeeUids)?value.committeeUids:[],tasks:Array.isArray(value.tasks)?value.tasks:[],attendance:Array.isArray(value.attendance)?value.attendance:[],scores:Array.isArray(value.scores)?value.scores:[],budget:Array.isArray(value.budget)?value.budget:[]})},onError);
}

export async function findCommitteeCandidate(seminarId:string,email:string){
  const call=httpsCallable<{seminarId:string;email:string},{candidate:{uid:string;fullName:string;email:string;institutionId:string|null}|null}>(functions,"findSeminarCommitteeCandidate");
  return (await call({seminarId,email:email.trim().toLowerCase()})).data.candidate;
}
export function watchCommittee(seminarId:string,setter:(rows:CommitteeMember[])=>void){return onSnapshot(query(collection(db,"seminarCommittee"),where("seminarId","==",seminarId)),s=>setter(s.docs.map(d=>({uid:String(d.data().memberUid||d.id),...d.data()}) as CommitteeMember)))}
export function watchCommitteeTasks(seminarId:string,setter:(rows:CommitteeTask[])=>void){return onSnapshot(query(collection(db,"seminarCommitteeTasks"),where("seminarId","==",seminarId)),s=>setter(s.docs.map(d=>({id:d.id,...d.data()}) as CommitteeTask)))}
async function committeeMemberDoc(seminarId:string,uid:string){const legacy=doc(db,"seminarCommittee",uid);const snapshot=await getDoc(legacy);return snapshot.exists()&&snapshot.data().seminarId===seminarId?legacy:doc(db,"seminarCommittee",`${seminarId}_${uid}`)}
export async function authoriseCommitteeMember(seminarId:string,member:CommitteeMember){await setDoc(await committeeMemberDoc(seminarId,member.uid),{...member,memberUid:member.uid,seminarId,updatedAt:serverTimestamp()});await updateDoc(seminarDoc(seminarId),{committeeUids:arrayUnion(member.uid),updatedAt:serverTimestamp()})}
export async function revokeCommitteeMember(seminarId:string,uid:string){await updateDoc(await committeeMemberDoc(seminarId,uid),{active:false,updatedAt:serverTimestamp()});await updateDoc(seminarDoc(seminarId),{committeeUids:arrayRemove(uid),updatedAt:serverTimestamp()})}
export async function saveCommitteeTask(seminarId:string,task:Omit<CommitteeTask,"id">){const ref=doc(collection(db,"seminarCommitteeTasks"));await setDoc(ref,{...task,seminarId,createdAt:serverTimestamp(),updatedAt:serverTimestamp()})}
export async function updateCommitteeTaskStatus(id:string,status:CommitteeTask["status"]){await updateDoc(doc(db,"seminarCommitteeTasks",id),{status,updatedAt:serverTimestamp()})}

export async function saveSeminar(input:{seminarId:string;data:SeminarCloudState;userId:string;institutionId?:string|null;userName:string}) {
  const reference=seminarDoc(input.seminarId);const existing=await getDoc(reference);if(!existing.exists())throw new Error("This seminar no longer exists.");
  await setDoc(reference,{...input.data,updatedByUid:input.userId,updatedByName:input.userName,updatedAt:serverTimestamp()},{merge:true});
}
