export type AiAssistantMode =
  | "student_explain"
  | "student_summarize"
  | "student_quiz"
  | "student_feedback"
  | "tutor_questions"
  | "tutor_lesson"
  | "tutor_marking_guide"
  | "tutor_performance";

export interface AiAssistantRequest {
  mode: AiAssistantMode;
  prompt: string;
  context?: string;
}

export interface AiAssistantResponse {
  text: string;
  model?: string;
  requestId?: string;
}
