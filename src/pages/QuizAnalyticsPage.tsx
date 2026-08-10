import {
  BarChart3,
  CheckCircle,
  Download,
  FileText,
  Lightbulb,
  Printer,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { getTutorQuizAnalytics } from "../firebase/quizAnalytics";
import type { Question } from "../models/Question";
import type { Quiz } from "../models/Quiz";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function QuizAnalyticsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const questionsLoading = loading;

  useEffect(() => {
    async function loadAnalytics() {
      if (!quizId) return;

      try {
        setLoading(true);

        const analytics = await getTutorQuizAnalytics(quizId);
        setQuiz(analytics.quiz);
        setAttempts(analytics.attempts);
        setQuestionBank(analytics.questions);
      } catch (error) {
        console.error("Failed to load quiz analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [quizId]);

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      
      return {
        average: 0,
        median: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        failRate: 0,
        passed: 0,
        failed: 0,
        averageTime: 0,
        highestMarks: 0,
        lowestMarks: 0,
      };
    }

    const percentages = attempts.map((attempt) => attempt.percentage);
    const scores = attempts.map((attempt) => attempt.score);
    const durations = attempts.map((attempt) => attempt.durationSeconds || 0);

    const passed = attempts.filter((attempt) => attempt.passed).length;
    const failed = attempts.length - passed;

    const average = Math.round(
      percentages.reduce((sum, value) => sum + value, 0) / percentages.length
    );

    const averageTime = Math.round(
      durations.reduce((sum, value) => sum + value, 0) / durations.length / 60
    );

    return {
      average,
      median: getMedian(percentages),
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      passRate: Math.round((passed / attempts.length) * 100),
      failRate: Math.round((failed / attempts.length) * 100),
      passed,
      failed,
      averageTime,
      highestMarks: Math.max(...scores),
      lowestMarks: Math.min(...scores),
    };
  }, [attempts]);

  const questionAnalysis = useMemo(() => {
    if (!quiz) return [];

    return quiz.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((quizQuestion, index) => {
        const question = questionBank.find(
          (item) => item.id === quizQuestion.questionId
        );

        const answersForQuestion = attempts
          .map((attempt) =>
            attempt.answers.find(
              (answer) => answer.questionId === quizQuestion.questionId
            )
          )
          .filter(Boolean);

        const attempted = answersForQuestion.length;

        const correct = answersForQuestion.filter(
          (answer) => answer?.isCorrect === true
        ).length;

        const wrong = attempted - correct;

        const correctPercentage =
          attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        const difficulty = getDifficultyLabel(correctPercentage);

        return {
          number: index + 1,
          questionText: question?.questionText || "Question not found",
          topic: question?.topic || "Unknown topic",
          type: question?.type || "Unknown",
          attempted,
          correct,
          wrong,
          correctPercentage,
          difficulty,
        };
      });
  }, [quiz, questionBank, attempts]);

  const rankedAttempts = useMemo(() => {
    return attempts
      .slice()
      .sort((a, b) => b.percentage - a.percentage)
      .map((attempt, index) => ({
        ...attempt,
        rank: index + 1,
      }));
  }, [attempts]);

  const distribution = useMemo(() => {
    return [
      {
        label: "Excellent",
        range: "80–100%",
        count: attempts.filter((attempt) => attempt.percentage >= 80).length,
      },
      {
        label: "Good",
        range: "70–79%",
        count: attempts.filter(
          (attempt) => attempt.percentage >= 70 && attempt.percentage < 80
        ).length,
      },
      {
        label: "Fair",
        range: "50–69%",
        count: attempts.filter(
          (attempt) => attempt.percentage >= 50 && attempt.percentage < 70
        ).length,
      },
      {
        label: "Poor",
        range: "<50%",
        count: attempts.filter((attempt) => attempt.percentage < 50).length,
      },
    ];
  }, [attempts]);

  const difficultQuestions = useMemo(() => {
    return questionAnalysis
      .slice()
      .sort((a, b) => a.correctPercentage - b.correctPercentage)
      .slice(0, 5);
  }, [questionAnalysis]);

  const totalQuestions = quiz?.questions.length || 0;

  const averageQuestionCorrect =
    questionAnalysis.length > 0
      ? Math.round(
          questionAnalysis.reduce(
            (sum, question) => sum + question.correctPercentage,
            0
          ) / questionAnalysis.length
        )
      : 0;
 function exportExcel() {
  const summaryRows = [
    ["Assessment", quiz?.title || ""],
    ["Students Attempted", attempts.length],
    ["Average Score", `${stats.average}%`],
    ["Median Score", `${stats.median}%`],
    ["Highest Score", `${stats.highest}%`],
    ["Lowest Score", `${stats.lowest}%`],
    ["Pass Rate", `${stats.passRate}%`],
    ["Fail Rate", `${stats.failRate}%`],
    ["Average Time", `${stats.averageTime} min`],
    ["Total Questions", totalQuestions],
    ["Average Question Correct", `${averageQuestionCorrect}%`],
  ];

  const studentRows = rankedAttempts.map((attempt) => ({
    Rank: attempt.rank,
    Student: attempt.studentName,
    Score: attempt.score,
    "Total Marks": attempt.totalMarks,
    Percentage: `${attempt.percentage}%`,
    Status: attempt.passed ? "Passed" : "Failed",
    "Duration (min)": Math.round(attempt.durationSeconds / 60),
  }));

  const questionRows = questionAnalysis.map((item) => ({
    Number: item.number,
    Question: item.questionText,
    Topic: item.topic,
    Type: item.type,
    Attempted: item.attempted,
    Correct: item.correct,
    Wrong: item.wrong,
    "Correct %": `${item.correctPercentage}%`,
    Difficulty: item.difficulty,
  }));

  const distributionRows = distribution.map((item) => ({
    Performance: item.label,
    Range: item.range,
    Students: item.count,
    Percentage:
      attempts.length > 0
        ? `${Math.round((item.count / attempts.length) * 100)}%`
        : "0%",
  }));

  const difficultRows = difficultQuestions.map((item) => ({
    Number: item.number,
    Question: item.questionText,
    Topic: item.topic,
    Type: item.type,
    "Correct %": `${item.correctPercentage}%`,
    Difficulty: item.difficulty,
  }));

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(summaryRows),
    "Summary"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(studentRows),
    "Student Attempts"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(questionRows),
    "Question Analysis"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(distributionRows),
    "Distribution"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(difficultRows),
    "Difficult Questions"
  );

  const safeTitle = (quiz?.title || "assessment")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  XLSX.writeFile(workbook, `${safeTitle}_analytics.xlsx`);
}
  if (loading || questionsLoading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Loading assessment analytics...</Card>
        </Container>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Assessment not found.</Card>
        </Container>
      </main>
    );
  }
    return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <BarChart3 size={48} />

              <div>
                <h1 className="text-3xl font-bold">
                  Assessment Analytics Dashboard
                </h1>

                <p className="mt-2 max-w-3xl text-blue-100">
                  Monitor student performance, identify difficult questions,
                  evaluate pass rates and improve assessment quality.
                </p>

                <p className="mt-3 font-semibold">
                  {quiz.title}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={exportExcel}
              >
                <Download size={18} />
                Export Excel
              </Button>

              <Button
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => window.print()}
              >
                <FileText size={18} />
                Export PDF
              </Button>

              <Button
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => window.print()}
              >
                <Printer size={18} />
                Print
              </Button>
            </div>
          </div>
        </section>

        <div className="mb-8 flex justify-end">
          <Button variant="outline" onClick={() => navigate("/tutor/quizzes")}>
            Back to Assessment Bank
          </Button>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Students Attempted" value={attempts.length} icon={Users} />
          <StatCard title="Average Score" value={`${stats.average}%`} icon={BarChart3} />
          <StatCard title="Median Score" value={`${stats.median}%`} icon={BarChart3} />
          <StatCard title="Highest Score" value={`${stats.highest}%`} icon={Trophy} />
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Lowest Score" value={`${stats.lowest}%`} icon={XCircle} />
          <StatCard title="Pass Rate" value={`${stats.passRate}%`} icon={CheckCircle} />
          <StatCard title="Fail Rate" value={`${stats.failRate}%`} icon={XCircle} />
          <StatCard title="Average Time" value={`${stats.averageTime} min`} icon={BarChart3} />
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Passed" value={stats.passed} icon={CheckCircle} />
          <StatCard title="Failed" value={stats.failed} icon={XCircle} />
          <StatCard title="Total Questions" value={totalQuestions} icon={FileText} />
          <StatCard
            title="Avg Question Correct"
            value={`${averageQuestionCorrect}%`}
            icon={Lightbulb}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-950">
              Performance Distribution
            </h2>

            <p className="mt-2 text-slate-600">
              Distribution of student performance by score range.
            </p>

            <div className="mt-6 space-y-4">
              {distribution.map((item) => (
                <DistributionRow
                  key={item.label}
                  label={item.label}
                  range={item.range}
                  count={item.count}
                  total={attempts.length}
                />
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Top Performers
            </h2>

            <p className="mt-2 text-slate-600">
              Highest scoring students in this assessment.
            </p>

            <div className="mt-5 space-y-3">
              {rankedAttempts.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No attempts yet.
                </p>
              ) : (
                rankedAttempts.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {getRankIcon(attempt.rank)} {attempt.studentName}
                      </p>

                      <p className="text-xs text-slate-500">
                        Rank {attempt.rank}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-blue-700">
                      {attempt.percentage}%
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        <Card className="mt-8">
          <h2 className="text-xl font-bold text-slate-950">
            Most Difficult Questions
          </h2>

          <p className="mt-2 text-slate-600">
            These questions had the lowest correct response rates.
          </p>

          {attempts.length === 0 ? (
            <p className="mt-5 text-slate-600">
              No attempts available yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {difficultQuestions.map((item) => (
                <div
                  key={item.number}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge>Question {item.number}</Badge>
                    <DifficultyBadge difficulty={item.difficulty} />
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">
                    {item.questionText}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-red-700">
                    Correct: {item.correctPercentage}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-8">
          <h2 className="text-xl font-bold text-slate-950">
            Question Analysis
          </h2>

          <p className="mt-2 text-slate-600">
            Item-level performance showing how students performed on each
            question.
          </p>

          {attempts.length === 0 ? (
            <p className="mt-5 text-slate-600">
              No attempts available for question analysis yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">#</th>
                    <th className="p-3">Question</th>
                    <th className="p-3">Topic</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Attempted</th>
                    <th className="p-3">Correct</th>
                    <th className="p-3">Wrong</th>
                    <th className="p-3">Correct %</th>
                    <th className="p-3">Difficulty</th>
                  </tr>
                </thead>

                <tbody>
                  {questionAnalysis.map((item) => (
                    <tr key={item.number} className="border-b align-top">
                      <td className="p-3 font-semibold">{item.number}</td>

                      <td className="max-w-md p-3">
                        {item.questionText}
                      </td>

                      <td className="p-3">{item.topic}</td>

                      <td className="p-3">{item.type}</td>

                      <td className="p-3">{item.attempted}</td>

                      <td className="p-3 text-green-700">{item.correct}</td>

                      <td className="p-3 text-red-700">{item.wrong}</td>

                      <td className="p-3">{item.correctPercentage}%</td>

                      <td className="p-3">
                        <DifficultyBadge difficulty={item.difficulty} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
             <Card className="mt-8">
          <h2 className="text-xl font-bold text-slate-950">
            Student Attempts
          </h2>

          <p className="mt-2 text-slate-600">
            Individual student performance records for this assessment.
          </p>

          {attempts.length === 0 ? (
            <p className="mt-5 text-slate-600">
              No students have attempted this assessment yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Rank</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {rankedAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b">
                      <td className="p-3 font-semibold">
                        {getRankIcon(attempt.rank)} {attempt.rank}
                      </td>

                      <td className="p-3 font-semibold">
                        {attempt.studentName}
                      </td>

                      <td className="p-3">
                        {attempt.score}/{attempt.totalMarks}
                      </td>

                      <td className="p-3">{attempt.percentage}%</td>

                      <td className="p-3">
                        {attempt.passed ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                            Passed
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {Math.round(attempt.durationSeconds / 60)} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="mt-8 border-l-4 border-l-blue-700">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-1 text-blue-700" size={26} />

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                AI Assessment Insights
              </h2>

              <p className="mt-2 text-slate-600">
                Early automated interpretation of assessment quality and learner
                performance.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            {attempts.length === 0 ? (
              <p>
                Insights will appear after students attempt this assessment.
              </p>
            ) : (
              <>
                <p>
                  • Average class performance is{" "}
                  <strong>{stats.average}%</strong>.
                </p>

                <p>
                  • Pass rate is <strong>{stats.passRate}%</strong>, with{" "}
                  <strong>{stats.failed}</strong> student(s) below the pass
                  mark.
                </p>

                <p>
                  • The average question correct rate is{" "}
                  <strong>{averageQuestionCorrect}%</strong>.
                </p>

                {difficultQuestions.length > 0 && (
                  <p>
                    • Question {difficultQuestions[0].number} appears most
                    difficult, with only{" "}
                    <strong>
                      {difficultQuestions[0].correctPercentage}%
                    </strong>{" "}
                    correct responses.
                  </p>
                )}

                {stats.average < 50 && (
                  <p>
                    • Recommendation: review teaching content before retesting,
                    because the class average is below 50%.
                  </p>
                )}

                {averageQuestionCorrect > 85 && (
                  <p>
                    • Recommendation: consider adding more application and
                    analysis-level questions because many questions appear easy.
                  </p>
                )}
              </>
            )}
          </div>
        </Card>
      </Container>
    </main>
  );
}

function getMedian(values: number[]) {
  if (values.length === 0) return 0;

  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return sorted[middle];
}

function getDifficultyLabel(correctPercentage: number) {
  if (correctPercentage >= 80) return "Easy";
  if (correctPercentage >= 50) return "Moderate";
  if (correctPercentage >= 30) return "Difficult";
  return "Very Difficult";
}

function getRankIcon(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "•";
}

function DistributionRow({
  label,
  range,
  count,
  total,
}: {
  label: string;
  range: string;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          {label} ({range})
        </span>

        <span className="text-slate-500">
          {count} student(s) · {percentage}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const baseClasses = "rounded-full px-3 py-1 text-sm font-semibold";

  if (difficulty === "Easy") {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-700`}>
        Easy
      </span>
    );
  }

  if (difficulty === "Moderate") {
    return (
      <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
        Moderate
      </span>
    );
  }

  if (difficulty === "Difficult") {
    return (
      <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
        Difficult
      </span>
    );
  }

  return (
    <span className={`${baseClasses} bg-red-100 text-red-700`}>
      Very Difficult
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
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>

        <Icon size={34} className="text-blue-700" />
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}   