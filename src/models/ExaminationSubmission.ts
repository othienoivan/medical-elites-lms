export interface ExaminationSubmission {
  id: string;
  examinationId: string;
  examinationTitle: string;
  courseUnitId: string;
  courseUnitTitle?: string;
  studentId: string;
  studentName: string;
  ownerUserId: string;
  answerText: string;
  answersJson?: Record<string, string>;
  status: "submitted" | "marked";
  score?: number;
  totalMarks: number;
  percentage?: number;
  tutorFeedback?: string;
  submittedAt?: Date;
  markedAt?: Date;
  markedByUid?: string;
  released?: boolean;
  releasedAt?: Date;
  aiSuggestedScore?: number;
  aiSuggestedFeedback?: string;
  aiMarkedAt?: Date;
}

