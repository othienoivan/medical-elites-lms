import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { withTtlCache } from "../performance/ttlCache";

export type PlatformMetrics = {
  users: number;
  students: number;
  tutors: number;
  admins: number;
  activeUsers: number;
  programmes: number;
  courseUnits: number;
  quizzes: number;
  attendanceSessions: number;
  payments: number;
  revenue: number;
  outstandingBalance: number;
  aiSessions: number;
  contactRequests: number;
  newContactRequests: number;
  pendingTutorRequests: number;
};

export type PlatformActivity = {
  id: string;
  title: string;
  detail: string;
};

type CollectionResult = {
  snapshot: QuerySnapshot<DocumentData> | null;
  error: unknown;
};

function numeric(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function safelyReadCollection(name: string): Promise<CollectionResult> {
  try {
    return {
      snapshot: await getDocs(collection(db, name)),
      error: null,
    };
  } catch (error) {
    console.error(`Failed to read ${name} platform metrics:`, error);
    return { snapshot: null, error };
  }
}

async function loadPlatformMetrics(): Promise<PlatformMetrics> {
  const [
    usersResult,
    studentsResult,
    programmesResult,
    courseUnitsResult,
    quizzesResult,
    attendanceResult,
    paymentsResult,
    invoicesResult,
    aiResult,
    contactsResult,
  ] = await Promise.all([
    safelyReadCollection("users"),
    safelyReadCollection("students"),
    safelyReadCollection("programmes"),
    safelyReadCollection("courseUnits"),
    safelyReadCollection("quizzes"),
    safelyReadCollection("attendanceSessions"),
    safelyReadCollection("financePayments"),
    safelyReadCollection("studentInvoices"),
    safelyReadCollection("aiUsageLogs"),
    safelyReadCollection("contactRequests"),
  ]);

  const users = usersResult.snapshot?.docs.map((item) => item.data()) ?? [];
  const students = studentsResult.snapshot?.docs.map((item) => item.data()) ?? [];
  const payments = paymentsResult.snapshot?.docs.map((item) => item.data()) ?? [];
  const invoices = invoicesResult.snapshot?.docs.map((item) => item.data()) ?? [];
  const contacts = contactsResult.snapshot?.docs.map((item) => item.data()) ?? [];

  // Prefer authoritative student records. Fall back to student-role user profiles
  // when older installations do not yet have a complete students collection.
  const studentCount = students.length || users.filter((item) => item.role === "student").length;

  return {
    users: users.length,
    students: studentCount,
    tutors: users.filter((item) => item.role === "tutor").length,
    admins: users.filter((item) => item.role === "admin").length,
    activeUsers: users.filter((item) => item.isActive !== false).length,
    programmes: programmesResult.snapshot?.size ?? 0,
    courseUnits: courseUnitsResult.snapshot?.size ?? 0,
    quizzes: quizzesResult.snapshot?.size ?? 0,
    attendanceSessions: attendanceResult.snapshot?.size ?? 0,
    payments: payments.length,
    revenue: payments.reduce((sum, item) => sum + numeric(item.amount), 0),
    outstandingBalance: invoices.reduce(
      (sum, item) => sum + numeric(item.balance),
      0
    ),
    aiSessions: aiResult.snapshot?.size ?? 0,
    contactRequests: contacts.length,
    newContactRequests: contacts.filter((item) => item.status === "new").length,
    pendingTutorRequests: users.filter(
      (item) => item.requestedRole === "tutor" && item.isActive === false
    ).length,
  };
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  return withTtlCache("platform:metrics", 60_000, loadPlatformMetrics);
}

async function safelyReadRecent(
  collectionName: string,
  maxItems = 4
): Promise<QuerySnapshot<DocumentData> | null> {
  try {
    return await getDocs(
      query(
        collection(db, collectionName),
        orderBy("createdAt", "desc"),
        limit(maxItems)
      )
    );
  } catch (error) {
    console.error(`Failed to read recent ${collectionName} activity:`, error);
    return null;
  }
}

async function loadPlatformActivity(): Promise<PlatformActivity[]> {
  const [paymentsSnapshot, contactsSnapshot, aiSnapshot] = await Promise.all([
    safelyReadRecent("financePayments"),
    safelyReadRecent("contactRequests"),
    safelyReadRecent("aiUsageLogs"),
  ]);

  const activities: PlatformActivity[] = [];

  paymentsSnapshot?.docs.forEach((item) => {
    const data = item.data();
    activities.push({
      id: `payment-${item.id}`,
      title: "Payment received",
      detail: `${data.studentName || "Student"} · UGX ${numeric(data.amount).toLocaleString()}`,
    });
  });

  contactsSnapshot?.docs.forEach((item) => {
    const data = item.data();
    activities.push({
      id: `contact-${item.id}`,
      title: "New website enquiry",
      detail: `${data.name || "Visitor"} · ${data.subject || "General enquiry"}`,
    });
  });

  aiSnapshot?.docs.forEach((item) => {
    const data = item.data();
    activities.push({
      id: `ai-${item.id}`,
      title: "Medi session completed",
      detail: `${data.role || "User"} · ${data.action || data.mode || "AI request"}`,
    });
  });

  return activities.slice(0, 8);
}

export async function getPlatformActivity(): Promise<PlatformActivity[]> {
  return withTtlCache("platform:activity", 30_000, loadPlatformActivity);
}
