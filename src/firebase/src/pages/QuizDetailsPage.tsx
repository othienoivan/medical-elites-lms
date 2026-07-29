import { ArrowLeft, BarChart3, CalendarClock, Edit, FileQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getQuizById } from "../firebase/quizzes";
import type { Quiz } from "../models/Quiz";

export default function QuizDetailsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!quizId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getQuizById(quizId);
        if (active) setQuiz(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [quizId]);

  return (
    <TutorLayout title="Assessment Details" subtitle="Review the assessment configuration and open it for editing.">
      {loading ? (
        <Card>Loading assessment...</Card>
      ) : !quiz ? (
        <Card>Assessment not found.</Card>
      ) : (
        <div className="space-y-6">
          <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                  {quiz.assessmentType}
                </p>
                <h2 className="mt-2 text-3xl font-bold">{quiz.title}</h2>
                <p className="mt-3 max-w-3xl text-blue-100">
                  {quiz.description || "No description provided."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigate("/tutor/quizzes")}>
                  <ArrowLeft size={17} /> Back
                </Button>
                <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigate(`/tutor/quizzes/${quiz.id}/builder`)}>
                  <Edit size={17} /> Edit
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Questions" value={quiz.questions.length} />
            <Metric label="Total Marks" value={quiz.totalMarks} />
            <Metric label="Pass Mark" value={`${quiz.passMark}%`} />
            <Metric label="Status" value={quiz.status} />
          </section>

          <Card>
            <div className="grid gap-5 md:grid-cols-2">
              <Info label="Programme" value={quiz.programmeTitle || "Not assigned"} />
              <Info label="Course Unit" value={quiz.courseUnitTitle || "Not assigned"} />
              <Info label="Module" value={quiz.moduleTitle || "Not assigned"} />
              <Info label="Time Limit" value={`${quiz.timeLimitMinutes || 0} minutes`} />
              <Info label="Available From" value={formatDate(quiz.availableFrom)} />
              <Info label="Available Until" value={formatDate(quiz.availableUntil)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/tutor/quizzes/${quiz.id}/analytics`)}>
                <BarChart3 size={17} /> Analytics
              </Button>
              <Button variant="outline" onClick={() => navigate(`/tutor/quizzes/${quiz.id}/builder`)}>
                <FileQuestion size={17} /> Open Builder
              </Button>
            </div>
          </Card>
        </div>
      )}
    </TutorLayout>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <CalendarClock size={16} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value: unknown) {
  if (!value) return "Not set";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const toDate = (value as { toDate?: () => Date }).toDate;
    if (typeof toDate === "function") return toDate().toLocaleString();
  }
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleString();
}
