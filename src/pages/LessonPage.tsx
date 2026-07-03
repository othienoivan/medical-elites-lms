import { ArrowLeft, BookOpen, PlayCircle, FileText, HelpCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { courseModules } from "../data/modules";

export default function LessonPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const module = courseModules.find((item) => item.id === moduleId);

  if (!module) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <Card className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Module not found
          </h1>
          <Button className="mt-6" onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex items-center justify-between py-5">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Medical Elites LMS
            </p>
            <h1 className="text-2xl font-bold text-slate-950">
              {module.title}
            </h1>
          </div>

          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Back
          </Button>
        </Container>
      </header>

      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <BookOpen className="text-blue-700" size={30} />
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Lesson Slides
                </h2>
                <p className="text-slate-600">
                  Interactive slides will appear here.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h3 className="text-xl font-bold text-slate-900">
                Slide Viewer Coming Next
              </h3>
              <p className="mt-3 text-slate-600">
                This area will display converted PowerPoint slides, lesson text,
                and navigation controls.
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <PlayCircle className="text-blue-700" size={30} />
              <h3 className="mt-4 text-xl font-bold text-slate-950">
                Video Lecture
              </h3>
              <p className="mt-2 text-slate-600">
                YouTube or uploaded videos will be added here for every lesson.
              </p>
            </Card>

            <Card>
              <FileText className="text-green-700" size={30} />
              <h3 className="mt-4 text-xl font-bold text-slate-950">
                Notes
              </h3>
              <p className="mt-2 text-slate-600">
                Downloadable notes and lesson summaries will appear here.
              </p>
            </Card>

            <Card>
              <HelpCircle className="text-amber-600" size={30} />
              <h3 className="mt-4 text-xl font-bold text-slate-950">
                Quiz
              </h3>
              <p className="mt-2 text-slate-600">
                The quiz unlocks after completing the lesson. Pass mark:{" "}
                <span className="font-bold text-blue-700">
                  {module.passMark}%
                </span>
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}