import {
  BookOpen,
  FileQuestion,
  Layers,
  Plus,
  Presentation,
  Users,
} from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";

export default function TutorDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex items-center justify-between py-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Medical Elites LMS
            </h1>
            <p className="text-sm text-slate-500">Tutor Dashboard</p>
          </div>

          <Button className="gap-2">
            <Plus size={18} />
            New Course
          </Button>
        </Container>
      </header>

      <Container className="py-10">
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-950">
            Tutor Portal
          </h2>

          <p className="mt-2 text-slate-600">
            Create courses, build modules, add lessons, upload resources, and
            manage quizzes.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <Card>
            <BookOpen className="text-blue-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Courses
            </p>
            <h3 className="mt-2 text-3xl font-bold">4</h3>
          </Card>

          <Card>
            <Layers className="text-green-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Modules
            </p>
            <h3 className="mt-2 text-3xl font-bold">4</h3>
          </Card>

          <Card>
            <Presentation className="text-amber-600" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Lessons
            </p>
            <h3 className="mt-2 text-3xl font-bold">1</h3>
          </Card>

          <Card>
            <FileQuestion className="text-purple-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Quizzes
            </p>
            <h3 className="mt-2 text-3xl font-bold">1</h3>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-slate-950">
              My Courses
            </h3>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <BookOpen className="mx-auto text-slate-400" size={40} />

              <h4 className="mt-4 text-lg font-bold text-slate-800">
                Course management coming next
              </h4>

              <p className="mt-2 text-slate-600">
                Tutors will create, edit, publish, and manage courses here.
              </p>
            </div>
          </Card>

          <Card>
            <Users className="text-blue-700" size={30} />

            <h3 className="mt-4 text-xl font-bold text-slate-950">
              Learner Analytics
            </h3>

            <p className="mt-2 text-slate-600">
              Student progress, quiz performance, and engagement metrics will
              appear here.
            </p>
          </Card>
        </section>
      </Container>
    </main>
  );
}