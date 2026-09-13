import {
  BarChart3,
  CheckCircle,
  Download,
  Search,
  Users,
  XCircle,
} from "lucide-react";import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";

type StudentGrade = {
  studentId: string;
  studentName: string;
  attemptsCompleted: number;
  average: number;
  highest: number;
  lowest: number;
  finalTotal: number;
  grade: string;
  passed: boolean;
  cohortId: string;
  cohortName: string;
};

export default function AutomaticGradebookPage() {
  const navigate = useNavigate();
  const { attempts, loading } = useTutorQuizAttempts();
  const [search, setSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState("all");

  const cohorts = useMemo(() => {
    const values = new Map<string, string>();
    attempts.forEach((attempt) => {
      const id = attempt.assessmentGroupId || attempt.studentGroupId || attempt.registrationLinkId || "legacy";
      const name = attempt.registrationLinkName || attempt.classInstitutionName || (id === "legacy" ? "Legacy / ungrouped" : id);
      values.set(id, name);
    });
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [attempts]);

  const studentGrades = useMemo<StudentGrade[]>(() => {
    const grouped = new Map<string, typeof attempts>();

    attempts.forEach((attempt) => {
      const cohortId = attempt.assessmentGroupId || attempt.studentGroupId || attempt.registrationLinkId || "legacy";
      const groupKey = `${cohortId}::${attempt.studentId}`;
      const current = grouped.get(groupKey) || [];
      grouped.set(groupKey, [...current, attempt]);
    });

    return Array.from(grouped.entries())
      .map(([_groupKey, studentAttempts]) => {
        const studentId = studentAttempts[0]?.studentId || "";
        const cohortId = studentAttempts[0]?.assessmentGroupId || studentAttempts[0]?.studentGroupId || studentAttempts[0]?.registrationLinkId || "legacy";
        const cohortName = studentAttempts[0]?.registrationLinkName || studentAttempts[0]?.classInstitutionName || (cohortId === "legacy" ? "Legacy / ungrouped" : cohortId);
        const percentages = studentAttempts.map(
          (attempt) => attempt.finalPercentage ?? attempt.percentage
        );

        const average =
          percentages.length > 0
            ? Math.round(
                percentages.reduce((sum, value) => sum + value, 0) /
                  percentages.length
              )
            : 0;

        const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
        const lowest = percentages.length > 0 ? Math.min(...percentages) : 0;

        return {
          studentId,
          studentName: studentAttempts[0]?.studentName || "Student",
          attemptsCompleted: studentAttempts.length,
          average,
          highest,
          lowest,
          finalTotal: average,
          grade: getGrade(average),
          passed: average >= 50,
          cohortId,
          cohortName,
        };
      })
      .sort((a, b) => b.finalTotal - a.finalTotal);
  }, [attempts]);

  const filteredGrades = useMemo(() => {
    const keyword = search.toLowerCase();

    return studentGrades.filter((student) =>
      (student.studentName.toLowerCase().includes(keyword) || student.cohortName.toLowerCase().includes(keyword))
      && (cohortFilter === "all" || student.cohortId === cohortFilter)
    );
  }, [cohortFilter, studentGrades, search]);

  const average =
    filteredGrades.length > 0
      ? Math.round(
          filteredGrades.reduce((sum, student) => sum + student.average, 0) /
            filteredGrades.length
        )
      : 0;

  const passed = filteredGrades.filter((student) => student.passed).length;
  const failed = filteredGrades.length - passed;

  function exportExcel() {
    const rows = filteredGrades.map((student, index) => ({
      Position: index + 1,
      Student: student.studentName,
      "Class / Registration Link": student.cohortName,
      "Assessment Cohort ID": student.cohortId,
      "Assessments Completed": student.attemptsCompleted,
      Average: `${student.average}%`,
      Highest: `${student.highest}%`,
      Lowest: `${student.lowest}%`,
      "Final Total": `${student.finalTotal}%`,
      Grade: student.grade,
      Status: student.passed ? "Passed" : "Failed",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Automatic Gradebook");
    XLSX.writeFile(workbook, "automatic_gradebook.xlsx");
  }

  return (
    <TutorLayout
      title="Automatic Gradebook"
      subtitle="Automatically calculate student performance from completed assessments."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Automatic Gradebook</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Group completed attempts by student, calculate averages, final
              totals, grades and pass/fail status automatically.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={exportExcel}
          >
            <Download size={18} />
            Export Excel
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Students" value={filteredGrades.length} icon={Users} />
        <StatCard title="Average" value={`${average}%`} icon={BarChart3} />
        <StatCard title="Passed" value={passed} icon={CheckCircle} />
        <StatCard title="Failed" value={failed} icon={XCircle} />
      </section>

      <section className="mb-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative w-full lg:max-w-lg">
          <Search size={18} className="absolute left-4 top-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>
        <select value={cohortFilter} onChange={(event) => setCohortFilter(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" aria-label="Filter by class or registration link">
          <option value="all">All classes / registration links</option>
          {cohorts.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </section>

      {loading ? (
        <Card>Loading automatic gradebook...</Card>
      ) : filteredGrades.length === 0 ? (
        <Card className="text-center">
          <Users size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No student grades found
          </h2>

          <p className="mt-2 text-slate-600">
            Completed assessment attempts will appear here automatically.
          </p>
        </Card>
      ) : (
        <Card>
          <p className="mb-4 text-sm text-slate-500">
            Click any student row to open the full student performance profile.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">Position</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Class / Link</th>
                  <th className="p-3">Completed</th>
                  <th className="p-3">Average</th>
                  <th className="p-3">Highest</th>
                  <th className="p-3">Lowest</th>
                  <th className="p-3">Final Total</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredGrades.map((student, index) => (
                  <tr
                    key={`${student.cohortId}-${student.studentId}`}
                    onClick={() =>
                      navigate(`/tutor/student-performance/${student.studentId}?cohort=${encodeURIComponent(student.cohortId)}`)
                    }
                    className="cursor-pointer border-b align-top transition hover:bg-blue-50"
                  >
                    <td className="p-3 font-bold text-blue-700">
                      #{index + 1}
                    </td>

                    <td className="p-3 font-semibold text-slate-950">
                      {student.studentName}
                    </td>
                    <td className="p-3"><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{student.cohortName}</span></td>

                    <td className="p-3">{student.attemptsCompleted}</td>

                    <td className="p-3 font-bold text-blue-700">
                      {student.average}%
                    </td>

                    <td className="p-3">{student.highest}%</td>

                    <td className="p-3">{student.lowest}%</td>

                    <td className="p-3 font-bold text-slate-950">
                      {student.finalTotal}%
                    </td>

                    <td className="p-3">
                      <GradeBadge grade={student.grade} />
                    </td>

                    <td className="p-3">
                      {student.passed ? (
                        <StatusBadge passed />
                      ) : (
                        <StatusBadge passed={false} />
                      )}
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

function getGrade(percentage: number) {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {grade}
    </span>
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