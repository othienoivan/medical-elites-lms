import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

import { auth, db } from "../config/firebase";
import type { Examination } from "../models/Examination";
import type { ExaminationSubmission } from "../models/ExaminationSubmission";

const COLLECTION = "examinationSubmissions";
const REVIEW_COLLECTION = "examinationMarkingReviews";

export async function getOwnExaminationSubmission(examinationId: string): Promise<ExaminationSubmission | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await getDocs(query(
    collection(db, COLLECTION),
    where("studentId", "==", user.uid),
    where("examinationId", "==", examinationId)
  ));
  const item = snapshot.docs[0];
  return item ? { ...(item.data() as Omit<ExaminationSubmission,"id">), id: item.id } : null;
}

export async function submitExaminationAnswers(examination: Examination, answerText: string, answersJson?: Record<string,string>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in before submitting an examination.");
  if (!examination.courseUnitId || !examination.ownerUserId) throw new Error("This examination is not configured for online submission.");
  const profile = await getDoc(doc(db, "users", user.uid));
  const profileData = profile.data() || {};
  const studentName = String(profileData.fullName || profileData.displayName || profileData.name || user.displayName || user.email || "Student").trim();
  await setDoc(doc(db, COLLECTION, `${examination.id}_${user.uid}`), {
    examinationId: examination.id,
    examinationTitle: examination.title,
    courseUnitId: examination.courseUnitId,
    courseUnitTitle: examination.courseUnitTitle || "",
    studentId: user.uid,
    studentName,
    ownerUserId: examination.ownerUserId,
    answerText: answerText.trim(),
    answersJson: answersJson || {},
    status: "submitted",
    released: false,
    totalMarks: examination.totalMarks || examination.targetMarks || 100,
    submittedAt: serverTimestamp(),
  });
}

export async function saveAiExaminationMarkingSuggestion(id:string,score:number,feedback:string):Promise<void>{
  const user=auth.currentUser;if(!user)throw new Error("Sign in before using assisted marking.");
  const submission=await getDoc(doc(db,COLLECTION,id));if(!submission.exists())throw new Error("Submission not found.");
  await setDoc(doc(db,REVIEW_COLLECTION,id),{submissionId:id,ownerUserId:user.uid,studentId:submission.get("studentId"),examinationId:submission.get("examinationId"),aiSuggestedScore:score,aiSuggestedFeedback:feedback.trim(),aiMarkedAt:serverTimestamp()},{merge:true});
}

export async function getTutorExaminationSubmissions(): Promise<ExaminationSubmission[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const snapshot = await getDocs(query(collection(db,COLLECTION),where("ownerUserId","==",user.uid)));
  const reviewSnapshot=await getDocs(query(collection(db,REVIEW_COLLECTION),where("ownerUserId","==",user.uid)));
  const reviews=new Map(reviewSnapshot.docs.map(item=>[item.id,item.data()]));
  const submissions = snapshot.docs.map(item=>({...(item.data() as Omit<ExaminationSubmission,"id">),...(reviews.get(item.id)||{}),id:item.id}));
  return Promise.all(submissions.map(async (item) => {
    if (item.studentName && item.studentName !== "Student") return item;
    const profile = await getDoc(doc(db,"users",item.studentId));
    const data = profile.data() || {};
    return {...item,studentName:String(data.fullName||data.displayName||data.name||item.studentName||"Student")};
  }));
}

export async function getOwnExaminationSubmissions(): Promise<ExaminationSubmission[]> {
  const user=auth.currentUser;if(!user)return [];
  const snapshot=await getDocs(query(collection(db,COLLECTION),where("studentId","==",user.uid)));
  return snapshot.docs.map(item=>({...(item.data() as Omit<ExaminationSubmission,"id">),id:item.id}));
}

export async function markExaminationSubmission(id:string, score:number, totalMarks:number, tutorFeedback:string):Promise<void>{
  const user=auth.currentUser;if(!user)throw new Error("Sign in before marking.");
  const safeTotal=Math.max(1,totalMarks);const safeScore=Math.min(Math.max(0,score),safeTotal);
  const submission=await getDoc(doc(db,COLLECTION,id));if(!submission.exists())throw new Error("Submission not found.");
  await setDoc(doc(db,REVIEW_COLLECTION,id),{submissionId:id,ownerUserId:user.uid,studentId:submission.get("studentId"),examinationId:submission.get("examinationId"),score:safeScore,totalMarks:safeTotal,percentage:Math.round((safeScore/safeTotal)*100),tutorFeedback:tutorFeedback.trim(),status:"marked",markedAt:serverTimestamp(),markedByUid:user.uid},{merge:true});
}

export async function releaseExaminationResults(id:string):Promise<void>{
  const user=auth.currentUser;if(!user)throw new Error("Sign in before releasing results.");
  const review=await getDoc(doc(db,REVIEW_COLLECTION,id));if(!review.exists()||review.get("status")!=="marked")throw new Error("Approve the final mark before releasing results.");
  await updateDoc(doc(db,COLLECTION,id),{score:review.get("score"),totalMarks:review.get("totalMarks"),percentage:review.get("percentage"),tutorFeedback:review.get("tutorFeedback")||"",status:"marked",markedAt:review.get("markedAt")||serverTimestamp(),markedByUid:user.uid,released:true,releasedAt:serverTimestamp()});
  await updateDoc(doc(db,REVIEW_COLLECTION,id),{released:true,releasedAt:serverTimestamp()});
}

