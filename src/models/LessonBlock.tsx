export type LessonBlockType =
  | "heading"
  | "objective"
  | "richtext"
  | "html5"
  | "image"
  | "youtube"
  | "video"
  | "pdf"
  | "powerpoint"
  | "document"
  | "clinical-case"
  | "drug-table"
  | "osce-station"
  | "question"
  | "knowledge-check"
  | "quiz"
  | "assignment";

export interface LessonBlockMetadata {
  // ==========================================
  // Clinical Case
  // ==========================================
  chiefComplaint?: string;
  history?: string;
  examination?: string;
  investigations?: string;
  diagnosis?: string;
  management?: string;
  learningPoints?: string;

  // ==========================================
  // Drug Table
  // ==========================================
  drugName?: string;
  genericName?: string;
  drugClass?: string;
  indication?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  contraindications?: string;
  sideEffects?: string;
  precautions?: string;
  interactions?: string;
  monitoring?: string;
  notes?: string;

  // ==========================================
  // OSCE Station
  // ==========================================
  osceStation?: string;
  stationInstructions?: string;
  examinerChecklist?: string;
  equipment?: string;
  timeAllowed?: string;
  markingGuide?: string;
  modelAnswer?: string;

  // ==========================================
  // Question Builder
  // ==========================================
  questionType?:
    | "mcq"
    | "true-false"
    | "short-answer"
    | "essay"
    | "emq";

  questionText?: string;

  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;

  correctAnswer?: string;

  explanation?: string;

  marks?: number;

  // ==========================================
  // Diagnostic Blocks (Future)
  // ==========================================
  labResults?: string;
  ecgFindings?: string;
  xrayFindings?: string;

  // ==========================================
  // Uploaded Resources
  // ==========================================
  fileName?: string;
  filePath?: string;
  contentType?: string;
  size?: number;
  previewPdfUrl?: string;
  previewPdfFileName?: string;
  previewPdfFilePath?: string;

  // ==========================================
  // Future Extensions
  // ==========================================
  [key: string]: unknown;
}

export interface LessonBlock {
  id: string;
  type: LessonBlockType;

  title?: string;
  content?: string;
  url?: string;

  metadata?: LessonBlockMetadata;
}