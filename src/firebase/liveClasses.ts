import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { LiveClass, LiveClassAttendance } from "../models/LiveClass";

export type LiveClassDraft = Omit<LiveClass, "id" | "tutorUid" | "tutorName" | "status" | "openShareToken"> & { sessionId?: string; generateOpenLink?: boolean };

export async function listLiveClasses(): Promise<LiveClass[]> {
  const call = httpsCallable<Record<string, never>, { sessions: LiveClass[] }>(functions, "listLiveClasses");
  return (await call({})).data.sessions ?? [];
}

export async function saveLiveClass(input: LiveClassDraft) {
  const call = httpsCallable<LiveClassDraft & { generateOpenLink?: boolean }, { sessionId: string; openShareToken?: string | null }>(functions, "saveLiveClass");
  return (await call(input)).data;
}

export async function manageLiveClass(input: { sessionId: string; action: "start" | "end" | "delete" | "launch_test" | "create_open_link" | "revoke_open_link"; quizId?: string; quizTitle?: string; testDurationMinutes?: number }) {
  const call = httpsCallable<typeof input, Record<string, unknown>>(functions, "manageLiveClass");
  return (await call(input)).data;
}

export interface OpenLiveClassSummary {
  id: string;
  title: string;
  description?: string;
  courseUnitTitle?: string;
  tutorName?: string;
  startsAt: string | null;
  endsAt: string | null;
  status: LiveClass["status"];
}

export async function getOpenLiveClass(shareToken: string) {
  const call = httpsCallable<{ shareToken: string }, { session: OpenLiveClassSummary }>(functions, "getOpenLiveClass");
  return (await call({ shareToken })).data.session;
}

export async function joinOpenLiveClass(input: { shareToken: string; guestName: string; guestEmail: string; guestPhone: string; guestInstitution: string }) {
  const call = httpsCallable<typeof input, { roomUrl: string; token: string; attendeeKey: string }>(functions, "joinOpenLiveClass");
  return (await call(input)).data;
}

export async function updateOpenLiveClassPresence(input: { shareToken: string; attendeeKey: string; action: "heartbeat" | "leave" }) {
  const call = httpsCallable<typeof input, { updated: boolean }>(functions, "updateOpenLiveClassPresence");
  return (await call(input)).data;
}

export async function joinLiveClass(sessionId: string) {
  const call = httpsCallable<{ sessionId: string }, { roomUrl: string; token: string; isOwner: boolean }>(functions, "joinLiveClass");
  return (await call({ sessionId })).data;
}

export async function updateLiveClassPresence(input: { sessionId: string; action: "heartbeat" | "leave" | "attendance"; studentUid?: string; attendanceStatus?: LiveClassAttendance["status"] }) {
  const call = httpsCallable<typeof input, { updated: boolean }>(functions, "updateLiveClassPresence");
  return (await call(input)).data;
}

export async function getLiveClassRoster(sessionId: string) {
  const call = httpsCallable<{ sessionId: string }, { records: LiveClassAttendance[] }>(functions, "getLiveClassRoster");
  return (await call({ sessionId })).data.records ?? [];
}


