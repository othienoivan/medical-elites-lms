import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";

export type CompetitionEvent = { id:string; title:string; status:"draft"|"live"|"closed"; order:number };
export type Participant = { id:string; eventId:string; name:string; department:string; category:string };
export type JudgeScore = { id:string; participantId:string; eventId:string; judgeUid:string; judgeName:string; total:number; maximum:number; checklist:Array<{criterion:string;score:number;maximum:number;comment:string}> };
export type AudienceScore = { id:string; participantId:string; eventId:string; userId:string; voterName:string; total:number; maximum:number };
export type AudienceAttempt = { id:string; eventId:string; userId:string; participantName:string; score:number; maximum:number };
export type SeminarResource = { id:string; title:string; kind:"questions"|"marking-guide"|"checklist"; fileUrl:string; fileName:string; eventId:string };

const watch=<T>(name:string,seminarId:string,setter:(rows:T[])=>void)=>onSnapshot(query(collection(db,name),where("seminarId","==",seminarId)),snapshot=>setter(snapshot.docs.map(item=>({id:item.id,...item.data()}) as T)));
export const watchCompetitionEvents=(seminarId:string,set:(x:CompetitionEvent[])=>void)=>watch("seminarEvents",seminarId,set);
export const watchParticipants=(seminarId:string,set:(x:Participant[])=>void)=>watch("seminarParticipants",seminarId,set);
export const watchJudgeScores=(seminarId:string,set:(x:JudgeScore[])=>void)=>watch("seminarJudgeScores",seminarId,set);
export const watchAudienceScores=(seminarId:string,set:(x:AudienceScore[])=>void)=>watch("seminarAudienceScores",seminarId,set);
export const watchAudienceAttempts=(seminarId:string,set:(x:AudienceAttempt[])=>void)=>watch("seminarAudienceAttempts",seminarId,set);
export const watchSeminarResources=(seminarId:string,set:(x:SeminarResource[])=>void)=>watch("seminarResources",seminarId,set);

export async function addCompetitionEvent(seminarId:string,input:Omit<CompetitionEvent,"id">){await addDoc(collection(db,"seminarEvents"),{...input,seminarId,createdAt:serverTimestamp()})}
export async function addParticipant(seminarId:string,input:Omit<Participant,"id">){await addDoc(collection(db,"seminarParticipants"),{...input,seminarId,createdAt:serverTimestamp()})}
export async function saveJudgeScore(seminarId:string,input:Omit<JudgeScore,"id">){await setDoc(doc(db,"seminarJudgeScores",`${seminarId}_${input.participantId}_${input.judgeUid}`),{...input,seminarId,createdAt:serverTimestamp()})}
export async function saveAudienceScore(seminarId:string,input:Omit<AudienceScore,"id">){await setDoc(doc(db,"seminarAudienceScores",`${seminarId}_${input.participantId}_${input.userId}`),{...input,seminarId,createdAt:serverTimestamp()})}
export async function saveAudienceAttempt(seminarId:string,input:Omit<AudienceAttempt,"id">){await setDoc(doc(db,"seminarAudienceAttempts",`${seminarId}_${input.eventId}_${input.userId}`),{...input,seminarId,createdAt:serverTimestamp()})}
export async function addSeminarResource(seminarId:string,input:Omit<SeminarResource,"id">){await addDoc(collection(db,"seminarResources"),{...input,seminarId,createdAt:serverTimestamp()})}
