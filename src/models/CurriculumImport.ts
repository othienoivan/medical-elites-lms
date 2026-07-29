export type CurriculumImportDecision = "create" | "merge" | "skip";

export interface ConfidenceField<T> {
  value: T;
  confidence: number;
}

export interface ExtractedModuleDraft {
  tempId: string;
  title: string;
  code?: string;
  description: string;
  estimatedHours?: number;
  learningOutcomes?: string[];
  topics?: string[];
  confidence?: number;
  decision?: CurriculumImportDecision;
}

export interface ExtractedCourseUnitDraft {
  tempId: string;
  title: string;
  code?: string;
  description: string;
  semester?: number;
  yearOfStudy?: number;
  creditUnits?: number;
  contactHours?: number;
  lectureHours?: number;
  tutorialHours?: number;
  practicalHours?: number;
  clinicalHours?: number;
  assessmentHours?: number;
  prerequisites?: string[];
  learningOutcomes?: string[];
  modules: ExtractedModuleDraft[];
  confidence?: number;
  decision?: CurriculumImportDecision;
  matchedCourseUnitId?: string;
}

export interface ExtractedProgrammeDraft {
  title: string;
  code?: string;
  award?: string;
  durationYears?: number;
  department?: string;
  description?: string;
  confidence?: number;
  decision?: CurriculumImportDecision;
  matchedProgrammeId?: string;
}

export interface CurriculumImportDraft {
  sourceFileName: string;
  sourceText: string;
  programme: ExtractedProgrammeDraft;
  courseUnits: ExtractedCourseUnitDraft[];
  analysisMethod: "ai" | "heuristic";
  warnings: string[];
  analysisDurationMs?: number;
  aiProvider?: string;
}

export interface CurriculumComparisonSummary {
  newCourseUnits: number;
  matchingCourseUnits: number;
  changedCourseUnits: number;
  newModules: number;
  matchingModules: number;
}

export interface CurriculumValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
}

export interface CurriculumValidationReport {
  valid: boolean;
  readinessScore: number;
  programmeCount: number;
  courseUnitCount: number;
  moduleCount: number;
  learningOutcomeCount: number;
  duplicateCount: number;
  lowConfidenceCount: number;
  issues: CurriculumValidationIssue[];
  validatedAt: string;
}

export interface CurriculumImportActor {
  uid: string;
  email: string;
  role: "admin" | "tutor";
  fullName?: string;
  institutionId?: string;
}

export interface CurriculumImportSummary {
  programmeId: string;
  programmeCreated: boolean;
  courseUnitsCreated: number;
  courseUnitsMerged: number;
  modulesCreated: number;
  modulesMerged: number;
  duplicatesSkipped: number;
  auditId: string;
  importedByRole: "admin" | "tutor";
  elapsedMs: number;
  warnings: string[];
}
