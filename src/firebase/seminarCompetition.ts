import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const SEMINAR_ID = "kawempe-2026";
export type CompetitionEvent = { id:string; title:string; status:"draft"|"live"|"closed"; order:number };
export type Participant = { id:string; eventId:string; name:string; department:string; category:string };
export type JudgeScore = { id:string; participantId:string; eventId:string; judgeUid:string; judgeName:string; total:number; maximum:number; checklist:Array<{criterion:string;score:number;maximum:number;comment:string}> };
export type AudienceScore = { id:string; participantId:string; eventId:string; userId:string; voterName:string; total:number; maximum:number };
export type AudienceAttempt = { id:string; eventId:string; userId:string; participantName:string; score:number; maximum:number };
export type SeminarResource = { id:string; title:string; kind:"questions"|"marking-guide"|"checklist"; fileUrl:string; fileName:string; eventId:string };

const watch = <T>(name:string, setter:(rows:T[])=>void, filter?:[string,string]) => {
  const base=collection(db,name); const q=filter?query(base,where(filter[0],"==",filter[1])):query(base,orderBy("createdAt","asc"));
  return onSnapshot(q,s=>setter(s.docs.map(d=>({id:d.id,...d.data()}) as T)));
};
export const watchCompetitionEvents=(set:(x:CompetitionEvent[])=>void)=>watch("seminarEvents",set,["seminarId",SEMINAR_ID]);
export const watchParticipants=(set:(x:Participant[])=>void)=>watch("seminarParticipants",set,["seminarId",SEMINAR_ID]);
export const watchJudgeScores=(set:(x:JudgeScore[])=>void)=>watch("seminarJudgeScores",set,["seminarId",SEMINAR_ID]);
export const watchAudienceScores=(set:(x:AudienceScore[])=>void)=>watch("seminarAudienceScores",set,["seminarId",SEMINAR_ID]);
export const watchAudienceAttempts=(set:(x:AudienceAttempt[])=>void)=>watch("seminarAudienceAttempts",set,["seminarId",SEMINAR_ID]);
export const watchSeminarResources=(set:(x:SeminarResource[])=>void)=>watch("seminarResources",set,["seminarId",SEMINAR_ID]);

export async function addCompetitionEvent(input:Omit<CompetitionEvent,"id">){await addDoc(collection(db,"seminarEvents"),{...input,seminarId:SEMINAR_ID,createdAt:serverTimestamp()})}
export async function addParticipant(input:Omit<Participant,"id">){await addDoc(collection(db,"seminarParticipants"),{...input,seminarId:SEMINAR_ID,createdAt:serverTimestamp()})}
export async function saveJudgeScore(input:Omit<JudgeScore,"id">){await setDoc(doc(db,"seminarJudgeScores",`${input.participantId}_${input.judgeUid}`),{...input,seminarId:SEMINAR_ID,createdAt:serverTimestamp()})}
export async function saveAudienceScore(input:Omit<AudienceScore,"id">){await setDoc(doc(db,"seminarAudienceScores",`${input.participantId}_${input.userId}`),{...input,seminarId:SEMINAR_ID,createdAt:serverTimestamp()})}
export async function saveAudienceAttempt(input:Omit<AudienceAttempt,"id">){await setDoc(doc(db,"seminarAudienceAttempts",`${input.eventId}_${input.userId}`),{...input,seminarId:SEMINAR_ID,createdAt:serverTimestamp()})}
export async function addSeminarResource(input:Omit<SeminarResource,"id">){await addDoc(collection(db,"seminarResources"),{...input,seminarId:SEMINAR_ID,createdAt:serverTimestamp()})}
