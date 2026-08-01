import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Printer,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import useQuizAttempts from "../hooks/useQuizAttempts";

export default function ResultSlipPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { attempts, loading } = useQuizAttempts();
  const slipRef = useRef<HTMLDivElement | null>(null);

  const attempt = useMemo(
    () => attempts.find((item) => item.id === attemptId),
    [attempts, attemptId]
  );

  async function downloadPdf() {
    if (!slipRef.current || !attempt) return;

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

    const safeTitle = attempt.quizTitle
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    pdf.save(`${safeTitle}_result_slip.pdf`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Loading result slip...</Card>
        </Container>
      </main>
    );
  }

  if (!attempt) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Result slip not found.</Card>
        </Container>
      </main>
    );
  }

  if (!attempt.released) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card className="text-center">
            <h1 className="text-2xl font-bold text-slate-950">
              Result Not Released
            </h1>

            <p className="mt-3 text-slate-600">
              Your tutor has not released this result yet.
            </p>

            <Button
              className="mt-6"
              variant="outline"
              onClick={() => navigate("/assessment-history")}
            >
              Back to History
            </Button>
          </Card>
        </Container>
      </main>
    );
  }

  const manualScore = attempt.manualScore || 0;
  const finalScore = attempt.finalScore ?? attempt.score;
  const finalPercentage = attempt.finalPercentage ?? attempt.percentage;
  const grade = getGrade(finalPercentage);
  const passed = attempt.passed;

  return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/assessment-history")}
            >
              Back to History
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} />
                Print
              </Button>

              <Button onClick={downloadPdf}>
                <Download size={16} />
                Download PDF
              </Button>
            </div>
          </div>

          <div ref={slipRef}>
            <Card>
              <div className="border-b border-slate-200 pb-6 text-center">
                <h1 className="text-3xl font-bold uppercase text-blue-700">
                  Medical Elites LMS
                </h1>

                <p className="mt-2 text-sm font-semibold uppercase text-slate-500">
                  Official Assessment Result Slip
                </p>

                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  {attempt.quizTitle}
                </h2>
              </div>

              <section className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoBox
                  icon={User}
                  label="Student"
                  value={attempt.studentName}
                />
                <InfoBox
                  icon={FileText}
                  label="Assessment"
                  value={attempt.quizTitle}
                />
                <InfoBox
                  icon={Calendar}
                  label="Submitted"
                  value={formatDate(attempt.submittedAt)}
                />
                <InfoBox
                  icon={Calendar}
                  label="Released"
                  value={formatDate(attempt.releasedAt)}
                />
              </section>

              <section className="mt-8 grid gap-4 md:grid-cols-4">
                <ResultMetric
                  label="Objective Marks"
                  value={attempt.score}
                  icon={FileText}
                />

                <ResultMetric
                  label="Manual Marks"
                  value={manualScore}
                  icon={FileText}
                />

                <ResultMetric
                  label="Final Score"
                  value={`${finalScore}/${attempt.totalMarks}`}
                  icon={Trophy}
                />

                <ResultMetric
                  label="Percentage"
                  value={`${finalPercentage}%`}
                  icon={Trophy}
                />
              </section>

              <section className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-sm font-semibold text-blue-700">Grade</p>
                  <p className="mt-2 text-5xl font-bold text-blue-800">
                    {grade}
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-6 text-center ${
                    passed ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      passed ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    Status
                  </p>

                  <p
                    className={`mt-2 flex items-center justify-center gap-2 text-4xl font-bold ${
                      passed ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {passed ? (
                      <CheckCircle size={34} />
                    ) : (
                      <XCircle size={34} />
                    )}
                    {passed ? "PASS" : "FAIL"}
                  </p>
                </div>
              </section>

              <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-xl font-bold text-slate-950">
                  Tutor Remarks
                </h3>

                <p className="mt-3 leading-7 text-slate-700">
                  {attempt.tutorRemarks || "No tutor remarks provided."}
                </p>
              </section>

              <section className="mt-8 grid gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Tutor Signature
                  </p>
                  <div className="mt-8 border-t border-slate-400 pt-2 text-sm text-slate-500">
                    Signature / Stamp
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Verification
                  </p>
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                    Digitally generated academic record
                  </div>
                </div>
              </section>
            </Card>
          </div>
        </div>
      </Container>
    </main>
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

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <Icon size={20} className="mt-0.5 text-blue-700" />

      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon size={24} className="text-blue-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}