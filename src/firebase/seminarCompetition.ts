import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";

export type CompetitionEvent = {
  id: string;
  title: string;
  status: "draft" | "live" | "closed";
  order: number;
};
export type Participant = {
  id: string;
  eventId: string;
  name: string;
  department: string;
  category: string;
};
export type JudgeScore = {
  id: string;
  participantId: string;
  eventId: string;
  judgeUid: string;
  judgeName: string;
  total: number;
  maximum: number;
  checklist: Array<{
    criterion: string;
    score: number;
    maximum: number;
    comment: string;
  }>;
};
export type AudienceScore = {
  id: string;
  participantId: string;
  eventId: string;
  userId: string;
  voterName: string;
  total: number;
  maximum: number;
};
export type AudienceAttempt = {
  id: string;
  eventId: string;
  userId: string;
  participantName: string;
  score: number;
  maximum: number;
};
export type SeminarResource = {
  id: string;
  title: string;
  kind: "questions" | "marking-guide" | "checklist";
  fileUrl: string;
  fileName: string;
  eventId: string;
};
export type SeminarSession = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  status: "scheduled" | "open" | "closed";
};
export type SeminarAttendance = {
  id: string;
  sessionId: string;
  sessionTitle: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  status: "pending" | "confirmed" | "rejected";
};
export type SeminarQuestion = {
  id: string;
  eventId: string;
  type: "mcq" | "short-answer" | "long-answer";
  prompt: string;
  options: string[];
  correctOption: string;
  markingGuide: string;
  marks: number;
  published: boolean;
};
export type SeminarQuestionAttempt = {
  id: string;
  eventId: string;
  userId: string;
  participantName: string;
  answers?: Record<string, string>;
  score: number;
  maximum: number;
  pendingSubjective: boolean;
  feedback?: string;
};

const watch = <T>(
  name: string,
  seminarId: string,
  setter: (rows: T[]) => void,
) =>
  onSnapshot(
    query(collection(db, name), where("seminarId", "==", seminarId)),
    (snapshot) =>
      setter(
        snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T),
      ),
  );
export const watchCompetitionEvents = (
  seminarId: string,
  set: (x: CompetitionEvent[]) => void,
) => watch("seminarEvents", seminarId, set);
export const watchParticipants = (
  seminarId: string,
  set: (x: Participant[]) => void,
) => watch("seminarParticipants", seminarId, set);
export const watchJudgeScores = (
  seminarId: string,
  set: (x: JudgeScore[]) => void,
) => watch("seminarJudgeScores", seminarId, set);
export const watchAudienceScores = (
  seminarId: string,
  set: (x: AudienceScore[]) => void,
) => watch("seminarAudienceScores", seminarId, set);
export const watchAudienceAttempts = (
  seminarId: string,
  set: (x: AudienceAttempt[]) => void,
) => watch("seminarAudienceAttempts", seminarId, set);
export const watchSeminarResources = (
  seminarId: string,
  set: (x: SeminarResource[]) => void,
) => watch("seminarResources", seminarId, set);
export const watchSeminarSessions = (
  seminarId: string,
  set: (x: SeminarSession[]) => void,
) => watch("seminarSessions", seminarId, set);
export const watchSeminarAttendance = (
  seminarId: string,
  set: (x: SeminarAttendance[]) => void,
) => watch("seminarAttendance", seminarId, set);
export const watchSeminarQuestions = (
  seminarId: string,
  set: (x: SeminarQuestion[]) => void,
) => watch("seminarQuestions", seminarId, set);
export const watchSeminarQuestionAttempts = (
  seminarId: string,
  set: (x: SeminarQuestionAttempt[]) => void,
) => watch("seminarAudienceLeaderboard", seminarId, set);
export const watchSeminarResponseSubmissions = (
  seminarId: string,
  set: (x: SeminarQuestionAttempt[]) => void,
) => watch("seminarQuestionAttempts", seminarId, set);

export async function addCompetitionEvent(
  seminarId: string,
  input: Omit<CompetitionEvent, "id">,
) {
  await addDoc(collection(db, "seminarEvents"), {
    ...input,
    seminarId,
    createdAt: serverTimestamp(),
  });
}
export async function addParticipant(
  seminarId: string,
  input: Omit<Participant, "id">,
) {
  await addDoc(collection(db, "seminarParticipants"), {
    ...input,
    seminarId,
    createdAt: serverTimestamp(),
  });
}
export async function saveJudgeScore(
  seminarId: string,
  input: Omit<JudgeScore, "id">,
) {
  await setDoc(
    doc(
      db,
      "seminarJudgeScores",
      `${seminarId}_${input.participantId}_${input.judgeUid}`,
    ),
    { ...input, seminarId, createdAt: serverTimestamp() },
  );
}
export async function saveAudienceScore(
  seminarId: string,
  input: Omit<AudienceScore, "id">,
) {
  await setDoc(
    doc(
      db,
      "seminarAudienceScores",
      `${seminarId}_${input.participantId}_${input.userId}`,
    ),
    { ...input, seminarId, createdAt: serverTimestamp() },
  );
}
export async function saveAudienceAttempt(
  seminarId: string,
  input: Omit<AudienceAttempt, "id">,
) {
  await setDoc(
    doc(
      db,
      "seminarAudienceAttempts",
      `${seminarId}_${input.eventId}_${input.userId}`,
    ),
    { ...input, seminarId, createdAt: serverTimestamp() },
  );
}
export async function addSeminarResource(
  seminarId: string,
  input: Omit<SeminarResource, "id">,
) {
  await addDoc(collection(db, "seminarResources"), {
    ...input,
    seminarId,
    createdAt: serverTimestamp(),
  });
}
export async function addSeminarSession(
  seminarId: string,
  input: Omit<SeminarSession, "id">,
) {
  await addDoc(collection(db, "seminarSessions"), {
    ...input,
    seminarId,
    createdAt: serverTimestamp(),
  });
}
export async function registerSeminarAttendance(
  seminarId: string,
  input: Omit<SeminarAttendance, "id" | "status">,
) {
  await setDoc(
    doc(
      db,
      "seminarAttendance",
      `${seminarId}_${input.sessionId}_${input.userId}`,
    ),
    {
      ...input,
      seminarId,
      status: "pending",
      checkedInAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
export async function verifySeminarAttendance(
  id: string,
  status: "confirmed" | "rejected",
) {
  await updateDoc(doc(db, "seminarAttendance", id), {
    status,
    verifiedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
export async function addSeminarQuestion(
  seminarId: string,
  input: Omit<SeminarQuestion, "id">,
) {
  await addDoc(collection(db, "seminarQuestions"), {
    ...input,
    seminarId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
export async function getPublicSeminarQuestions(
  seminarId: string,
  eventId = "",
) {
  const call = httpsCallable<
    { seminarId: string; eventId: string },
    { questions: SeminarQuestion[] }
  >(functions, "getPublicSeminarQuestions");
  return (await call({ seminarId, eventId })).data.questions;
}
export async function submitSeminarAnswers(
  seminarId: string,
  eventId: string,
  answers: Record<string, string>,
) {
  const call = httpsCallable<
    { seminarId: string; eventId: string; answers: Record<string, string> },
    { attempt: SeminarQuestionAttempt }
  >(functions, "submitSeminarAudienceAnswers");
  return (await call({ seminarId, eventId, answers })).data.attempt;
}
export async function markSeminarAnswerAttempt(input: {
  attemptId: string;
  score: number;
  maximum: number;
  feedback: string;
}) {
  const call = httpsCallable<
    typeof input,
    { attemptId: string; score: number; maximum: number }
  >(functions, "markSeminarAudienceAttempt");
  return (await call(input)).data;
}
