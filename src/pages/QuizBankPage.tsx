import { BarChart3, CalendarClock, ClipboardList, Lock, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useQuizzes from "../hooks/useQuizzes";
import { deleteQuiz } from "../firebase/quizzes";
import type { AssessmentType } from "../models/Quiz";

const assessmentTypes: {
  value: "all" | AssessmentType;
  label: string;
}[] = [
  { value: "all", label: "All Assessments" },
  { value: "lesson-quiz", label: "Lesson Quizzes" },
  { value: "short-quiz", label: "Short Quizzes" },
  { value: "cat", label: "CATs" },
  { value: "module-test", label: "Module Tests" },
  { value: "practice-test", label: "Practice Tests" },
  { value: "mock-exam", label: "Mock Exams" },
  { value: "final-exam", label: "Final Exams" },
];

export default function QuizBankPage() {
  const navigate = useNavigate();
  const { quizzes, loading, refresh } = useQuizzes();

  const [search, setSearch] = useState("");
  const [assessmentType, setAssessmentType] =
    useState<"all" | AssessmentType>("all");
  const [courseUnitFilter, setCourseUnitFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "course-unit" | "title">("updated");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const courseUnitOptions = useMemo<Array<[string, string]>>(() => {
    const map = new Map<string, string>();
    quizzes.forEach((quiz) => { if (quiz.courseUnitId) map.set(quiz.courseUnitId, quiz.courseUnitTitle || quiz.courseUnitId); });
    return [...map.entries()].sort((a,b)=>a[1].localeCompare(b[1]));
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    const keyword = search.toLowerCase();

    const matched = quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(keyword) ||
        quiz.description.toLowerCase().includes(keyword) ||
        quiz.assessmentCode?.toLowerCase().includes(keyword) ||
        quiz.moduleTitle?.toLowerCase().includes(keyword) ||
        quiz.courseUnitTitle?.toLowerCase().includes(keyword) ||
        quiz.programmeTitle?.toLowerCase().includes(keyword);

      const matchesType =
        assessmentType === "all" ||
        quiz.assessmentType === assessmentType ||
        (!quiz.assessmentType && assessmentType === "lesson-quiz");

      return matchesSearch && matchesType && (courseUnitFilter === "all" || quiz.courseUnitId === courseUnitFilter);
    });
    return matched.sort((a, b) => {
      if (sortBy === "course-unit") return (a.courseUnitTitle || "").localeCompare(b.courseUnitTitle || "") || a.title.localeCompare(b.title);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [quizzes, search, assessmentType, courseUnitFilter, sortBy]);

  async function handlePermanentDelete(id: string, title: string) {
    if (!window.confirm(`Permanently delete ${title}? It will be removed from lesson/module placement and student assessment availability. This cannot be undone.`)) return;
    try { setDeletingId(id); await deleteQuiz(id); await refresh(); } catch (error) { console.error("Quiz deletion failed:", error); alert(error instanceof Error ? error.message : "Quiz deletion failed."); } finally { setDeletingId(null); }
  }

  return (
    <TutorLayout
      title="Assessment Bank"
      subtitle="Create, organise and manage lesson quizzes, CATs, module tests, practice tests, mock exams and final assessments."
    >
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-lg">
          <Search size={18} className="absolute left-4 top-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assessments..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <select value={courseUnitFilter} onChange={(event) => setCourseUnitFilter(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" aria-label="Filter assessments by Course Unit">
            <option value="all">All Course Units</option>
            {courseUnitOptions.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="rounded-xl border border-slate-300 px-4 py-3" aria-label="Sort Quiz Bank">
            <option value="updated">Newest / Updated First</option>
            <option value="course-unit">Sort by Course Unit</option>
            <option value="title">Sort by Assessment Title</option>
          </select>

          <select
            aria-label="Filter by assessment type"
            title="Filter by assessment type"
            value={assessmentType}
            onChange={(event) =>
              setAssessmentType(event.target.value as "all" | AssessmentType)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
          >
            {assessmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <Button
            className="gap-2"
            onClick={() => navigate("/tutor/quizzes/builder")}
          >
            <Plus size={18} />
            New Assessment
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>Loading assessments...</Card>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="text-center">
          <ClipboardList size={56} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold">No Assessments Found</h2>

          <p className="mt-2 text-slate-600">
            Start building lesson quizzes, CATs, module tests and practice
            assessments from your reusable question bank.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/tutor/quizzes/builder")}
          >
            Create First Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AssessmentTypeBadge
                      type={quiz.assessmentType || "lesson-quiz"}
                    />

                    {quiz.assessmentCode && <Badge>{quiz.assessmentCode}</Badge>}

                    <Badge>{quiz.status}</Badge>

                    {quiz.isArchived && <WarningBadge>Archived</WarningBadge>}

                    {quiz.requiresPassword && (
                      <WarningBadge>
                        <Lock size={13} />
                        Password
                      </WarningBadge>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-semibold text-blue-700">
                    {quiz.moduleTitle ||
                      quiz.courseUnitTitle ||
                      quiz.programmeTitle ||
                      "General Assessment"}
                  </p>

                  <h2 className="mt-2 text-xl font-bold">{quiz.title}</h2>

                  <p className="mt-2 text-slate-600">{quiz.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{quiz.questions.length} Questions</Badge>
                    <Badge>{quiz.totalMarks} Marks</Badge>
                    <Badge>Pass Mark: {quiz.passMark}%</Badge>

                    {quiz.timeLimitMinutes && (
                      <Badge>{quiz.timeLimitMinutes} Minutes</Badge>
                    )}

                    {quiz.weightPercentage !== undefined && (
                      <Badge>Weight: {quiz.weightPercentage}%</Badge>
                    )}

                    <Badge>
                      Late Submission:{" "}
                      {quiz.allowLateSubmission ? "Allowed" : "Blocked"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <InfoRow
                      icon={CalendarClock}
                      label="Available From"
                      value={formatDateTime(quiz.availableFrom)}
                    />

                    <InfoRow
                      icon={CalendarClock}
                      label="Available Until"
                      value={formatDateTime(quiz.availableUntil)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/quizzes/${quiz.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/tutor/quizzes/${quiz.id}/analytics`)
                    }
                  >
                    <BarChart3 size={16} />
                    Analytics
                  </Button>

                  <Button
                    onClick={() =>
                      navigate(`/tutor/quizzes/${quiz.id}/builder`)
                    }
                  >
                    Open Builder
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/tutor/quizzes/${quiz.id}/builder`)}>Assign to Lesson / Module</Button>
                  <Button variant="outline" disabled={deletingId === quiz.id} onClick={() => void handlePermanentDelete(quiz.id, quiz.title)}><Trash2 size={16}/>{deletingId === quiz.id ? "Deleting..." : "Delete Permanently"}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </TutorLayout>
  );
}

function getAssessmentTypeLabel(type: AssessmentType) {
  switch (type) {
    case "lesson-quiz":
      return "Lesson Quiz";
    case "short-quiz":
      return "Short Quiz";
    case "cat":
      return "CAT";
    case "module-test":
      return "Module Test";
    case "practice-test":
      return "Practice Test";
    case "mock-exam":
      return "Mock Exam";
    case "final-exam":
      return "Final Exam";
    default:
      return "Assessment";
  }
}

function formatDateTime(value: unknown) {
  if (!value) return "Not set";

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }

  if (typeof value === "string") {
    return new Date(value).toLocaleString();
  }

  return "Not set";
}

function AssessmentTypeBadge({ type }: { type: AssessmentType }) {
  return (
    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
      {getAssessmentTypeLabel(type)}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}

function WarningBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
      <Icon size={16} className="mt-0.5 text-blue-700" />

      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-slate-600">{value}</p>
      </div>
    </div>
  );
}