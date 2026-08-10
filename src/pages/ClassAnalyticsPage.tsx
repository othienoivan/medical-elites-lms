import {
  BarChart3,
  CheckCircle,
  Download,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import * as XLSX from "xlsx";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";

export default function ClassAnalyticsPage() {
  const { attempts, loading, error, reload } = useTutorQuizAttempts();

  const percentages = useMemo(
    () =>
      attempts.map(
        (attempt) => attempt.finalPercentage ?? attempt.percentage
      ),
    [attempts]
  );

  const average =
    percentages.length > 0
      ? Math.round(
          percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
        )
      : 0;

  const median = useMemo(() => {
    if (percentages.length === 0) return 0;

    const sorted = [...percentages].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
    }

    return sorted[middle];
  }, [percentages]);

  const standardDeviation = useMemo(() => {
    if (percentages.length === 0) return "0.0";

    const mean =
      percentages.reduce((sum, value) => sum + value, 0) /
      percentages.length;

    const variance =
      percentages.reduce(
        (sum, value) => sum + Math.pow(value - mean, 2),
        0
      ) / percentages.length;

    return Math.sqrt(variance).toFixed(1);
  }, [percentages]);

  const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
  const lowest = percentages.length > 0 ? Math.min(...percentages) : 0;
  const passed = attempts.filter((attempt) => attempt.passed).length;
  const failed = attempts.length - passed;

  const topPerformer = useMemo(() => {
    if (attempts.length === 0) return null;

    return attempts.reduce((best, current) =>
      (current.finalPercentage ?? current.percentage) >
      (best.finalPercentage ?? best.percentage)
        ? current
        : best
    );
  }, [attempts]);

  const atRisk = useMemo(() => attempts.filter((attempt) => !attempt.passed), [attempts]);

  const gradeDistribution = useMemo(() => {
    const grades = ["A", "B+", "B", "C+", "C", "D", "F"];

    return grades.map((grade) => ({
      grade,
      count: attempts.filter(
        (attempt) =>
          getGrade(attempt.finalPercentage ?? attempt.percentage) === grade
      ).length,
    }));
  }, [attempts]);

  function exportExcel() {
    const rows = attempts.map((attempt) => ({
      Student: attempt.studentName,
      Assessment: attempt.quizTitle,
      Score: attempt.finalScore ?? attempt.score,
      "Total Marks": attempt.totalMarks,
      Percentage: `${attempt.finalPercentage ?? attempt.percentage}%`,
      Grade: getGrade(attempt.finalPercentage ?? attempt.percentage),
      Status: attempt.passed ? "Passed" : "Failed",
    }));

    const summaryRows = [
      ["Attempts", attempts.length],
      ["Average", `${average}%`],
      ["Median", `${median}%`],
      ["Highest", `${highest}%`],
      ["Lowest", `${lowest}%`],
      ["Passed", passed],
      ["Failed", failed],
      ["Standard Deviation", standardDeviation],
      [
        "Top Performer",
        topPerformer
          ? `${topPerformer.studentName} - ${
              topPerformer.finalPercentage ?? topPerformer.percentage
            }%`
          : "N/A",
      ],
      ["Students At Risk", atRisk.length],
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
      "Attempts"
    );

    XLSX.writeFile(workbook, "class_analytics.xlsx");
  }  return (
    <TutorLayout
      title="Class Analytics"
      subtitle="Analyze overall student performance, pass rates, grade distribution and risk indicators."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Class Performance Analytics
            </h2>

            <p className="mt-2 text-blue-100">
              View class-wide statistics generated from completed assessment
              attempts.
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

      {error && (
        <Card className="mb-6 border border-red-200 bg-red-50 text-red-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" onClick={() => void reload()}>Retry</Button>
          </div>
        </Card>
      )}

      <section className="mb-8 grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <StatCard title="Attempts" value={attempts.length} icon={Users} />
        <StatCard title="Average" value={`${average}%`} icon={BarChart3} />
        <StatCard title="Median" value={`${median}%`} icon={BarChart3} />
        <StatCard title="Highest" value={`${highest}%`} icon={Trophy} />
        <StatCard title="Lowest" value={`${lowest}%`} icon={BarChart3} />
        <StatCard title="Passed" value={passed} icon={CheckCircle} />
        <StatCard title="Failed" value={failed} icon={XCircle} />
        <StatCard
          title="Std Dev"
          value={standardDeviation}
          icon={BarChart3}
        />
      </section>

      {loading ? (
        <Card>Loading class analytics...</Card>
      ) : attempts.length === 0 ? (
        <Card className="text-center">
          <BarChart3 size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No analytics yet
          </h2>

          <p className="mt-2 text-slate-600">
            Class analytics will appear after students complete assessments.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-xl font-bold text-slate-950">
                Grade Distribution
              </h2>

              <div className="mt-5 space-y-4">
                {gradeDistribution.map((item) => (
                  <div key={item.grade}>
                    <div className="mb-1 flex justify-between text-sm font-semibold text-slate-700">
                      <span>{item.grade}</span>
                      <span>{item.count}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-700"
                        style={{
                          width:
                            attempts.length > 0
                              ? `${Math.round(
                                  (item.count / attempts.length) * 100
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-slate-950">
                Pass / Fail
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <SummaryBox
                  label="Passed"
                  value={passed}
                  className="bg-green-50 text-green-700"
                />

                <SummaryBox
                  label="Failed"
                  value={failed}
                  className="bg-red-50 text-red-700"
                />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Pass Rate
                </p>

                <p className="mt-2 text-4xl font-bold text-blue-700">
                  {attempts.length > 0
                    ? Math.round((passed / attempts.length) * 100)
                    : 0}
                  %
                </p>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-xl font-bold text-slate-950">
                Top Performer
              </h2>

              {topPerformer ? (
                <>
                  <p className="mt-4 text-lg font-bold text-slate-950">
                    {topPerformer.studentName}
                  </p>

                  <p className="mt-2 text-4xl font-bold text-blue-700">
                    {topPerformer.finalPercentage ??
                      topPerformer.percentage}
                    %
                  </p>

                  <p className="mt-2 text-slate-600">
                    {topPerformer.quizTitle}
                  </p>
                </>
              ) : (
                <p className="mt-4 text-slate-600">
                  No top performer yet.
                </p>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-slate-950">
                Students At Risk
              </h2>

              <p className="mt-5 text-5xl font-bold text-red-600">
                {atRisk.length}
              </p>

              <p className="mt-3 text-slate-600">
                Assessment attempts scoring below 50%.
              </p>
            </Card>
          </div>
        </div>
      )}
    </TutorLayout>
  );
}function getGrade(percentage: number) {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function SummaryBox({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className: string;
}) {
  return (
    <div className={`rounded-2xl p-5 text-center ${className}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
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