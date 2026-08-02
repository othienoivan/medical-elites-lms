import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import type { AnalyticsActivity, AnalyticsKpi, AnalyticsRole, AnalyticsSnapshot } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: AnalyticsSnapshot }>();

function cacheKey(role: AnalyticsRole, userId: string, institutionId: string) {
  return `${institutionId}:${role}:${userId}`;
}

async function countCollection(name: string, institutionId?: string) {
  const base = collection(db, name);
  const source = institutionId
    ? query(base, where("institutionId", "==", institutionId))
    : base;
  const result = await getCountFromServer(source);
  return result.data().count;
}

async function loadActivity(userId: string, institutionId: string): Promise<AnalyticsActivity[]> {
  try {
    const notificationQuery = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(6)
    );
    const snapshot = await getDocs(notificationQuery);
    return snapshot.docs.map((item) => {
      const data = item.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined;
      return {
        id: item.id,
        title: String(data.title || "Academic update"),
        detail: String(data.body || data.message || "A new update is available."),
        occurredAt: createdAt,
        category: String(data.category || "system") === "clinical" ? "clinical" : "communication",
      } satisfies AnalyticsActivity;
    });
  } catch {
    // Analytics must remain available when optional composite indexes or legacy data are absent.
    return institutionId
      ? [{ id: "analytics-ready", title: "Analytics foundation active", detail: "Institution metrics are ready for aggregation.", category: "system" }]
      : [];
  }
}

async function adminKpis(institutionId: string): Promise<AnalyticsKpi[]> {
  const [students, tutors, programmes, courseUnits] = await Promise.all([
    countCollection("students", institutionId),
    countCollection("users", institutionId),
    countCollection("programmes", institutionId),
    countCollection("courseUnits", institutionId),
  ]);
  return [
    { id: "students", label: "Students", value: students, helper: "Institution enrolment", tone: "blue" },
    { id: "tutors", label: "Users & Tutors", value: tutors, helper: "Active institutional profiles", tone: "purple" },
    { id: "programmes", label: "Programmes", value: programmes, helper: "Academic programmes configured", tone: "green" },
    { id: "course-units", label: "Course Units", value: courseUnits, helper: "Curriculum delivery units", tone: "amber" },
  ];
}

async function tutorKpis(userId: string, institutionId: string): Promise<AnalyticsKpi[]> {
  const [students, questions, examinations, logbooks] = await Promise.all([
    countCollection("students", institutionId),
    countCollection("questions", institutionId),
    countCollection("examinations", institutionId),
    countCollection("clinicalLogbooks", institutionId),
  ]);
  return [
    { id: "students", label: "Students", value: students, helper: "Available in your institution", tone: "blue" },
    { id: "questions", label: "Question Bank", value: questions, helper: "Reusable assessment items", tone: "purple" },
    { id: "examinations", label: "Examinations", value: examinations, helper: "Professional examination records", tone: "amber" },
    { id: "clinical", label: "Clinical Entries", value: logbooks, helper: `Competency evidence available to ${userId ? "review" : "tutors"}`, tone: "green" },
  ];
}

async function studentKpis(userId: string): Promise<AnalyticsKpi[]> {
  const [enrolments, attempts, notifications] = await Promise.all([
    getCountFromServer(query(collection(db, "enrollments"), where("studentId", "==", userId))).then((r) => r.data().count),
    getCountFromServer(query(collection(db, "quizAttempts"), where("studentId", "==", userId))).then((r) => r.data().count),
    getCountFromServer(query(collection(db, "notifications"), where("recipientId", "==", userId), where("isRead", "==", false))).then((r) => r.data().count).catch(() => 0),
  ]);
  return [
    { id: "enrolments", label: "Active Enrolments", value: enrolments, helper: "Assigned learning pathways", tone: "blue" },
    { id: "attempts", label: "Assessments Completed", value: attempts, helper: "Recorded quiz attempts", tone: "green" },
    { id: "notifications", label: "Unread Updates", value: notifications, helper: "Academic notices awaiting review", tone: "purple" },
    { id: "readiness", label: "Analytics Readiness", value: "Active", helper: "More progress metrics will appear as data grows", tone: "amber" },
  ];
}

export async function getAcademicAnalytics(input: {
  role: AnalyticsRole;
  userId: string;
  institutionId?: string;
  forceRefresh?: boolean;
}): Promise<AnalyticsSnapshot> {
  const institutionId = input.institutionId || "default";
  const key = cacheKey(input.role, input.userId, institutionId);
  const cached = cache.get(key);
  if (!input.forceRefresh && cached && cached.expiresAt > Date.now()) return cached.value;

  let kpis: AnalyticsKpi[];
  try {
    kpis = input.role === "admin"
      ? await adminKpis(institutionId)
      : input.role === "tutor"
        ? await tutorKpis(input.userId, institutionId)
        : await studentKpis(input.userId);
  } catch {
    kpis = [{ id: "status", label: "Analytics Status", value: "Ready", helper: "Metrics will populate as authorized data becomes available", tone: "teal" }];
  }

  const value: AnalyticsSnapshot = {
    institutionId,
    generatedAt: new Date(),
    role: input.role,
    kpis,
    activity: await loadActivity(input.userId, institutionId),
    source: "live",
  };
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

export function invalidateAcademicAnalytics(institutionId?: string) {
  if (!institutionId) return cache.clear();
  for (const key of cache.keys()) if (key.startsWith(`${institutionId}:`)) cache.delete(key);
}
