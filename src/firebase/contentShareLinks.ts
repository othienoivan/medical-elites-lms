import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";

export type SharedContentType = "lesson" | "quiz" | "assessment" | "examination";

export type SharedLinkMetadata = { code:string;campaignName:string;nicheName:string;contentType:SharedContentType;resourceTitle:string;tutorName:string };
export type SharedAccess = { contactId:string;accessToken:string;contentType:SharedContentType;nicheName:string;content:Record<string,unknown> };
export type ContentCampaignData = { links:Array<Record<string,unknown>>;contacts:Array<Record<string,unknown>>;attempts:Array<Record<string,unknown>> };

export async function createContentShareLink(input:{campaignName:string;nicheName:string;contentType:SharedContentType;resourceId:string}){
  const call=httpsCallable<typeof input,{code:string;path:string;assessmentGroupId:string}>(functions,"createTutorContentShareLink");return (await call(input)).data;
}
export async function getContentShareLink(code:string){const call=httpsCallable<{code:string},SharedLinkMetadata>(functions,"getTutorContentShareLink");return (await call({code})).data;}
export async function captureLeadAndOpenContent(input:{code:string;fullName:string;phone:string;email:string;institutionName:string;marketingConsent:boolean}){const call=httpsCallable<typeof input,SharedAccess>(functions,"captureTutorLeadAndOpenContent");return (await call(input)).data;}
export async function submitSharedContentAttempt(input:{code:string;contactId:string;accessToken:string;answers:Record<string,string>;answerText?:string}){const call=httpsCallable<typeof input,{attemptId:string;score:number|null;totalMarks:number|null;percentage:number|null}>(functions,"submitTutorSharedContentAttempt");return (await call(input)).data;}
export async function getContentCampaigns(){const call=httpsCallable<Record<string,never>,ContentCampaignData>(functions,"getTutorContentCampaigns");return (await call({})).data;}
export async function markSharedContentAttempt(input:{attemptId:string;score:number;totalMarks:number;feedback:string}){const call=httpsCallable<typeof input,{attemptId:string;score:number;totalMarks:number;percentage:number}>(functions,"markTutorSharedContentAttempt");return (await call(input)).data;}

