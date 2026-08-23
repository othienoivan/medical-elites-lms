import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";

type StatusFilter = "all" | "passed" | "failed";

export default function SubmissionInboxPage() {
  const navigate = useNavigate();
  const { attempts, loading, error, reload } = useTutorQuizAttempts();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cohortFilter, setCohortFilter] = useState("all");

  const cohorts = useMemo(() => {
    const values = new Map<string, string>();
    attempts.forEach((attempt) => {
      const id = attempt.assessmentGroupId || attempt.studentGroupId || attempt.registrationLinkId || "legacy";
      const label = attempt.registrationLinkName || attempt.classInstitutionName || (id === "legacy" ? "Legacy / ungrouped" : id);
      values.set(id, label);
    });
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const matchesSearch =
        (attempt.studentName ?? "Unknown student")
          .toLowerCase()
          .includes(keyword) ||
        (attempt.quizTitle ?? "Untitled assessment")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "passed" && attempt.passed) ||
        (statusFilter === "failed" && !attempt.passed);

      const cohortId = attempt.assessmentGroupId || attempt.studentGroupId || attempt.registrationLinkId || "legacy";
      const matchesCohort = cohortFilter === "all" || cohortId === cohortFilter;

      return matchesSearch && matchesStatus && matchesCohort;
    });
  }, [attempts, cohortFilter, search, statusFilter]);

  const passed = filteredAttempts.filter((attempt) => attempt.passed).length;
  const failed = filteredAttempts.length - passed;
  const needsReview = filteredAttempts.filter((attempt) => !attempt.released).length;

  return (
    <TutorLayout
      title="Submission Inbox"
      subtitle="Review submitted assessments and open attempts for manual marking."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Assessment Submission Inbox</h2>

        <p className="mt-2 max-w-3xl text-blue-100">
          View student submissions, identify completed attempts, and open
          submissions that require tutor review or manual marking.
        </p>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Submissions" value={filteredAttempts.length} icon={Users} />
        <StatCard title="Passed" value={passed} icon={CheckCircle} />
        <StatCard title="Failed" value={failed} icon={XCircle} />
        <StatCard title="Needs Review" value={needsReview} icon={Edit} />
      </section>

      {error && (
        <Card className="mb-6 border border-red-200 bg-red-50 text-red-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" onClick={() => void reload()}>Retry</Button>
          </div>
        </Card>
      )}

      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-lg">
          <Search size={18} className="absolute left-4 top-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student or assessment..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
        <select value={cohortFilter} onChange={(event) => setCohortFilter(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" aria-label="Filter by class or registration link">
          <option value="all">All classes / links</option>
          {cohorts.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
          aria-label="Filter submission status"
          title="Filter submission status"
        >
          <option value="all">All Submissions</option>
          <option value="passed">Passed Only</option>
          <option value="failed">Failed Only</option>
        </select>
        </div>
      </section>

      {loading ? (
        <Card>Loading submissions...</Card>
      ) : filteredAttempts.length === 0 ? (
        <Card className="text-center">
          <Users size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No submissions found
          </h2>

          <p className="mt-2 text-slate-600">
            Submitted student assessments will appear here.
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">Student</th>
                  <th className="p-3">Assessment</th>
                  <th className="p-3">Class / Link</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Auto Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b align-top">
                    <td className="p-3 font-semibold text-slate-950">
                      {attempt.studentName || "Unknown student"}
                    </td>

                    <td className="p-3">{attempt.quizTitle || "Untitled assessment"}</td>
                    <td className="p-3"><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{attempt.registrationLinkName || attempt.classInstitutionName || attempt.assessmentGroupId || attempt.studentGroupId || "Legacy / ungrouped"}</span></td>

                    <td className="p-3">
                      <InfoInline
                        icon={Calendar}
                        text={formatDate(attempt.submittedAt)}
                      />
                    </td>

                    <td className="p-3">
                      <InfoInline
                        icon={Clock}
                        text={`${Math.round((attempt.durationSeconds || 0) / 60)} min`}
                      />
                    </td>

                    <td className="p-3 font-semibold text-blue-700">
                      {attempt.score}/{attempt.totalMarks}
                    </td>

                    <td className="p-3">
                      {attempt.released ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          <CheckCircle size={16} />
                          Marked
                        </span>
                      ) : attempt.passed ? (
                        <StatusBadge passed />
                      ) : (
                        <StatusBadge passed={false} />
                      )}
                    </td>

                    <td className="p-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/tutor/submissions/${attempt.id}/mark`)
                        }
                      >
                        <Edit size={16} />
                        {attempt.released ? "Remark" : "Mark"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </TutorLayout>
  );
}

function formatDate(value: unknown) {
  if (!value) return "-";

  if (value instanceof Date) return value.toLocaleString();

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  }

  return "-";
}

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={16} />
      Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      <XCircle size={16} />
      Failed
    </span>
  );
}

function InfoInline({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-600">
      <Icon size={15} />
      {text}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <Icon size={34} className="text-blue-700" />
      </div>
    </Card>
  );
}