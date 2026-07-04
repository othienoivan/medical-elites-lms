import {
  BookOpen,
  FileQuestion,
  Layers,
  Plus,
  Presentation,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import useCourses from "../hooks/useCourses";

export default function TutorDashboardPage() {
  const navigate = useNavigate();
  const { courses, loading } = useCourses();

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

          <div className="flex gap-3">
            <Button
              className="gap-2"
              onClick={() => navigate("/tutor/programmes/new")}
            >
              <Plus size={18} />
              New Programme
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/tutor/courses/new")}
            >
              <Plus size={18} />
              New Course Unit
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-950">Tutor Portal</h2>

          <p className="mt-2 text-slate-600">
            Create programmes, build course units, add modules, upload
            resources, and manage quizzes.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <Card>
            <BookOpen className="text-blue-700" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Course Units
            </p>
            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : courses.length}
            </h3>
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
              My Course Units
            </h3>

            {loading ? (
              <p className="mt-6 text-slate-600">Loading course units...</p>
            ) : courses.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <BookOpen className="mx-auto text-slate-400" size={40} />

                <h4 className="mt-4 text-lg font-bold text-slate-800">
                  No course units created yet
                </h4>

                <p className="mt-2 text-slate-600">
                  Create your first course unit to begin building the academy.
                </p>

                <Button
                  className="mt-5"
                  onClick={() => navigate("/tutor/courses/new")}
                >
                  Create Course Unit
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-700">
                          {course.category}
                        </p>

                        <h4 className="mt-1 text-lg font-bold text-slate-900">
                          {course.title}
                        </h4>

                        <p className="mt-1 text-sm text-slate-600">
                          {course.level} • {course.duration}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => navigate(`/courses/${course.slug}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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