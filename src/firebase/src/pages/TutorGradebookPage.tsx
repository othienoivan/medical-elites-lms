import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Search,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";

type StatusFilter = "all" | "passed" | "failed";

type FilterOption = {
  id: string;
  title: string;
};

export default function TutorGradebookPage() {
  const { attempts, loading } = useTutorQuizAttempts();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [courseUnitFilter, setCourseUnitFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [assessmentFilter, setAssessmentFilter] = useState("all");

  const programmeOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();

    attempts.forEach((attempt) => {
      if (attempt.programmeId && attempt.programmeTitle) {
        map.set(attempt.programmeId, attempt.programmeTitle);
      }
    });

    return Array.from(map, ([id, title]) => ({ id, title })).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [attempts]);

  const courseUnitOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();

    attempts.forEach((attempt) => {
      const matchesProgramme =
        programmeFilter === "all" ||
        attempt.programmeId === programmeFilter;

      if (
        matchesProgramme &&
        attempt.courseUnitId &&
        attempt.courseUnitTitle
      ) {
        map.set(attempt.courseUnitId, attempt.courseUnitTitle);
      }
    });

    return Array.from(map, ([id, title]) => ({ id, title })).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [attempts, programmeFilter]);

  const moduleOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();

    attempts.forEach((attempt) => {
      const matchesProgramme =
        programmeFilter === "all" ||
        attempt.programmeId === programmeFilter;

      const matchesCourseUnit =
        courseUnitFilter === "all" ||
        attempt.courseUnitId === courseUnitFilter;

      if (
        matchesProgramme &&
        matchesCourseUnit &&
        attempt.moduleId &&
        attempt.moduleTitle
      ) {
        map.set(attempt.moduleId, attempt.moduleTitle);
      }
    });

    return Array.from(map, ([id, title]) => ({ id, title })).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [attempts, programmeFilter, courseUnitFilter]);

  const assessmentOptions = useMemo(() => {
    return Array.from(
      new Set(
        attempts
          .filter((attempt) => {
            const matchesProgramme =
              programmeFilter === "all" ||
              attempt.programmeId === programmeFilter;

            const matchesCourseUnit =
              courseUnitFilter === "all" ||
              attempt.courseUnitId === courseUnitFilter;

            const matchesModule =
              moduleFilter === "all" ||
              attempt.moduleId === moduleFilter;

            return matchesProgramme && matchesCourseUnit && matchesModule;
          })
          .map((attempt) => attempt.quizTitle)
      )
    ).sort();
  }, [attempts, programmeFilter, courseUnitFilter, moduleFilter]);

  const filteredAttempts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const finalPercentage = attempt.finalPercentage ?? attempt.percentage;

      const searchableText = [
        attempt.studentName,
        attempt.quizTitle,
        attempt.programmeTitle,
        attempt.courseUnitTitle,
        attempt.moduleTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keyword.length === 0 || searchableText.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "passed" && finalPercentage >= 50) ||
        (statusFilter === "failed" && finalPercentage < 50);

      const matchesProgramme =
        programmeFilter === "all" ||
        attempt.programmeId === programmeFilter;

      const matchesCourseUnit =
        courseUnitFilter === "all" ||
        attempt.courseUnitId === courseUnitFilter;

      const matchesModule =
        moduleFilter === "all" ||
        attempt.moduleId === moduleFilter;

      const matchesAssessment =
        assessmentFilter === "all" || attempt.quizTitle === assessmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProgramme &&
        matchesCourseUnit &&
        matchesModule &&
        matchesAssessment
      );
    });
  }, [
    attempts,
    search,
    statusFilter,
    programmeFilter,
    courseUnitFilter,
    moduleFilter,
    assessmentFilter,
  ]);

  const rankedAttempts = useMemo(() => {
    return filteredAttempts
      .slice()
      .sort(
        (a, b) =>
          (b.finalPercentage ?? b.percentage) -
          (a.finalPercentage ?? a.percentage)
      )
      .map((attempt, index) => ({
        ...attempt,
        rank: index + 1,
      }));
  }, [filteredAttempts]);

  const passed = filteredAttempts.filter(
    (attempt) => (attempt.finalPercentage ?? attempt.percentage) >= 50
  ).length;

  const failed = filteredAttempts.length - passed;

  const average =
    filteredAttempts.length > 0
      ? Math.round(
          filteredAttempts.reduce(
            (sum, attempt) =>
              sum + (attempt.finalPercentage ?? attempt.percentage),
            0
          ) / filteredAttempts.length
        )
      : 0;

  const highest =
    filteredAttempts.length > 0
      ? Math.max(
          ...filteredAttempts.map(
            (attempt) => attempt.finalPercentage ?? attempt.percentage
          )
        )
      : 0;

  const lowest =
    filteredAttempts.length > 0
      ? Math.min(
          ...filteredAttempts.map(
            (attempt) => attempt.finalPercentage ?? attempt.percentage
          )
        )
      : 0;

  const passRate =
    filteredAttempts.length > 0
      ? Math.round((passed / filteredAttempts.length) * 100)
      : 0;

  function handleProgrammeChange(value: string) {
    setProgrammeFilter(value);
    setCourseUnitFilter("all");
    setModuleFilter("all");
    setAssessmentFilter("all");
  }

  function handleCourseUnitChange(value: string) {
    setCourseUnitFilter(value);
    setModuleFilter("all");
    setAssessmentFilter("all");
  }

  function handleModuleChange(value: string) {
    setModuleFilter(value);
    setAssessmentFilter("all");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setProgrammeFilter("all");
    setCourseUnitFilter("all");
    setModuleFilter("all");
    setAssessmentFilter("all");
  }

  function exportGradebookExcel() {
    const rows = rankedAttempts.map((attempt) => ({
      Rank: attempt.rank,
      Student: attempt.studentName,
      Programme: attempt.programmeTitle || "Not Assigned",
      "Course Unit": attempt.courseUnitTitle || "Not Assigned",
      Module: attempt.moduleTitle || "Not Assigned",
      Assessment: attempt.quizTitle,
      Score: attempt.finalScore ?? attempt.score,
      "Total Marks": attempt.totalMarks,
      Percentage: `${attempt.finalPercentage ?? attempt.percentage}%`,
      Grade: getGrade(attempt.finalPercentage ?? attempt.percentage),
      Status:
        (attempt.finalPercentage ?? attempt.percentage) >= 50
          ? "Passed"
          : "Failed",
      Release: attempt.released ? "Released" : "Pending",
      "Duration (min)": Math.round(attempt.durationSeconds / 60),
      Submitted: formatDate(attempt.submittedAt),
    }));

    const summaryRows = [
      ["Total Attempts", filteredAttempts.length],
      ["Average", `${average}%`],
      ["Highest", `${highest}%`],
      ["Lowest", `${lowest}%`],
      ["Pass Rate", `${passRate}%`],
      ["Passed", passed],
      ["Failed", failed],
      [
        "Programme Filter",
        programmeFilter === "all"
          ? "All Programmes"
          : programmeOptions.find((item) => item.id === programmeFilter)
              ?.title || "Selected Programme",
      ],
      [
        "Course Unit Filter",
        courseUnitFilter === "all"
          ? "All Course Units"
          : courseUnitOptions.find((item) => item.id === courseUnitFilter)
              ?.title || "Selected Course Unit",
      ],
      [
        "Module Filter",
        moduleFilter === "all"
          ? "All Modules"
          : moduleOptions.find((item) => item.id === moduleFilter)?.title ||
            "Selected Module",
      ],
      [
        "Assessment Filter",
        assessmentFilter === "all" ? "All Assessments" : assessmentFilter,
      ],
      [
        "Status Filter",
        statusFilter === "all"
          ? "All Results"
          : statusFilter === "passed"
          ? "Passed Only"
          : "Failed Only",
      ],
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(summaryRows),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Gradebook"
    );

    XLSX.writeFile(workbook, "medical_elites_gradebook.xlsx");
  }

  return (
    <TutorLayout
      title="Gradebook"
      subtitle="Review student assessment performance across programmes, course units, modules and assessments."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Tutor Gradebook 2.0</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Track student performance by programme, course unit, module and
              assessment while reviewing release status, duration and final
              marks.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={exportGradebookExcel}
          >
            <Download size={18} />
            Export Excel
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Attempts"
          value={filteredAttempts.length}
          icon={Users}
        />

        <StatCard title="Average" value={`${average}%`} icon={BarChart3} />
        <StatCard title="Highest" value={`${highest}%`} icon={Trophy} />
        <StatCard title="Lowest" value={`${lowest}%`} icon={BarChart3} />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={CheckCircle} />
        <StatCard title="Failed" value={failed} icon={XCircle} />
      </section>

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-4 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, programme, course unit, module or assessment..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
            />
          </div>

          <FilterSelect
            label="Programme"
            value={programmeFilter}
            onChange={handleProgrammeChange}
            options={[
              { value: "all", label: "All Programmes" },
              ...programmeOptions.map((item) => ({
                value: item.id,
                label: item.title,
              })),
            ]}
          />

          <FilterSelect
            label="Course Unit"
            value={courseUnitFilter}
            onChange={handleCourseUnitChange}
            disabled={programmeFilter !== "all" && courseUnitOptions.length === 0}
            options={[
              { value: "all", label: "All Course Units" },
              ...courseUnitOptions.map((item) => ({
                value: item.id,
                label: item.title,
              })),
            ]}
          />

          <FilterSelect
            label="Module"
            value={moduleFilter}
            onChange={handleModuleChange}
            disabled={courseUnitFilter !== "all" && moduleOptions.length === 0}
            options={[
              { value: "all", label: "All Modules" },
              ...moduleOptions.map((item) => ({
                value: item.id,
                label: item.title,
              })),
            ]}
          />

          <FilterSelect
            label="Assessment"
            value={assessmentFilter}
            onChange={setAssessmentFilter}
            options={[
              { value: "all", label: "All Assessments" },
              ...assessmentOptions.map((assessment) => ({
                value: assessment,
                label: assessment,
              })),
            ]}
          />

          <FilterSelect
            label="Result Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: "all", label: "All Results" },
              { value: "passed", label: "Passed Only" },
              { value: "failed", label: "Failed Only" },
            ]}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card>Loading gradebook...</Card>
      ) : filteredAttempts.length === 0 ? (
        <Card className="text-center">
          <Users size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No attempts found
          </h2>

          <p className="mt-2 text-slate-600">
            No assessment attempts match the current filters.
          </p>

          <Button className="mt-6" variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Programme</th>
                  <th className="p-3">Course Unit</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Assessment</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Release</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Submitted</th>
                </tr>
              </thead>

              <tbody>
                {rankedAttempts.map((attempt) => {
                  const displayScore = attempt.finalScore ?? attempt.score;
                  const displayPercentage =
                    attempt.finalPercentage ?? attempt.percentage;
                  const displayPassed = displayPercentage >= 50;

                  return (
                    <tr
                      key={attempt.id}
                      className="border-b align-top hover:bg-slate-50"
                    >
                      <td className="p-3 font-bold text-blue-700">
                        #{attempt.rank}
                      </td>

                      <td className="p-3 font-semibold text-slate-950">
                        {attempt.studentName}
                      </td>

                      <td className="p-3">
                        {attempt.programmeTitle || "Not Assigned"}
                      </td>

                      <td className="p-3">
                        {attempt.courseUnitTitle || "Not Assigned"}
                      </td>

                      <td className="p-3">
                        {attempt.moduleTitle || "Not Assigned"}
                      </td>

                      <td className="p-3">{attempt.quizTitle}</td>

                      <td className="p-3">
                        {displayScore}/{attempt.totalMarks}
                      </td>

                      <td className="p-3 font-bold text-blue-700">
                        {displayPercentage}%
                      </td>

                      <td className="p-3 font-semibold">
                        {getGrade(displayPercentage)}
                      </td>

                      <td className="p-3">
                        {displayPassed ? (
                          <StatusBadge passed />
                        ) : (
                          <StatusBadge passed={false} />
                        )}
                      </td>

                      <td className="p-3">
                        <ReleaseBadge released={attempt.released === true} />
                      </td>

                      <td className="p-3">
                        <InfoInline
                          icon={Clock}
                          text={`${Math.round(
                            attempt.durationSeconds / 60
                          )} min`}
                        />
                      </td>

                      <td className="p-3">
                        <InfoInline
                          icon={Calendar}
                          text={formatDate(attempt.submittedAt)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </TutorLayout>
  );
}

function getGrade(percentage: number) {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const id = `filter-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
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

function ReleaseBadge({ released }: { released: boolean }) {
  return released ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={16} />
      Released
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
      <Clock size={16} />
      Pending
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