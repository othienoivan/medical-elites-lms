export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  courseUnitId: string;
  courseUnitTitle: string;
  tutorUid: string;
  tutorName: string;
  startsAt: string;
  endsAt: string;
  status: LiveClassStatus;
  presentationName?: string | null;
  presentationUrl?: string | null;
  presentationPath?: string | null;
  quizId?: string | null;
  quizTitle?: string | null;
  activeQuizId?: string | null;
  activeQuizTitle?: string | null;
  testEndsAt?: string | null;
  allowJoinBeforeTutor?: boolean;
  earlyJoinMinutes?: number;
  openShareToken?: string | null;
}

export interface LiveClassAttendance {
  id: string;
  sessionId: string;
  studentUid: string;
  studentName?: string;
  role?: "student" | "tutor" | "guest";
  studentEmail?: string;
  phoneNumber?: string;
  institutionName?: string;
  status: "present" | "late" | "absent" | "excused";
  joinedAt?: string | null;
  lastSeenAt?: string | null;
  leftAt?: string | null;
  joinCount?: number;
}


