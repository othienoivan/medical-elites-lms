import {
  BarChart3,
  BookOpen,
  FileQuestion,
  GraduationCap,
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
import useProgrammes from "../hooks/useProgrammes";

export default function TutorDashboardPage() {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading } = useCourses();
  const { programmes, loading: programmesLoading } = useProgrammes();

  const loading = coursesLoading || programmesLoading;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Medical Elites LMS
            </p>

            <h1 className="text-3xl font-bold text-slate-950">
              Academic Management Portal
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage programmes, course units, modules, lessons, quizzes, and
              learner progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<GraduationCap size={30} />}
            label="Programmes"
            value={loading ? "..." : programmes.length}
            iconClass="text-blue-700"
          />

          <StatCard
            icon={<BookOpen size={30} />}
            label="Course Units"
            value={loading ? "..." : courses.length}
            iconClass="text-green-700"
          />

          <StatCard
            icon={<Layers size={30} />}
            label="Modules"
            value="4"
            iconClass="text-amber-600"
          />

          <StatCard
            icon={<Presentation size={30} />}
            label="Lessons"
            value="1"
            iconClass="text-purple-700"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Academic Structure
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Build your platform from programmes down to lessons and
                  quizzes.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate("/tutor/programmes/new")}
              >
                Add Programme
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <PortalActionCard
                title="Programmes"
                text="Create academic programmes such as Diploma in Clinical Medicine or Bachelor of Nursing."
                icon={<GraduationCap size={26} />}
                onClick={() => navigate("/tutor/programmes/new")}
              />

              <PortalActionCard
                title="Course Units"
                text="Create course units such as General Pathology, Pharmacology, or Nursing Practice."
                icon={<BookOpen size={26} />}
                onClick={() => navigate("/tutor/courses/new")}
              />

              <PortalActionCard
                title="Modules"
                text="Organize each course unit into structured modules with pass marks."
                icon={<Layers size={26} />}
                onClick={() => alert("Module builder coming next.")}
              />

              <PortalActionCard
                title="Lessons"
                text="Add slides, videos, notes, clinical pearls, cases, and knowledge checks."
                icon={<Presentation size={26} />}
                onClick={() => alert("Lesson builder coming next.")}
              />

              <PortalActionCard
                title="Quizzes"
                text="Create assessments and enforce mastery-based progression."
                icon={<FileQuestion size={26} />}
                onClick={() => alert("Quiz builder coming next.")}
              />

              <PortalActionCard
                title="Analytics"
                text="Monitor learner progress, quiz performance, and course engagement."
                icon={<BarChart3 size={26} />}
                onClick={() => alert("Analytics dashboard coming next.")}
              />
            </div>
          </Card>

          <Card>
            <Users className="text-blue-700" size={30} />

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              Learner Analytics
            </h2>

            <p className="mt-2 text-slate-600">
              Student progress, quiz performance, engagement metrics, and
              completion trends will appear here.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Coming Soon
              </p>

              <p className="mt-2 text-sm text-slate-600">
                This panel will help tutors identify struggling learners and
                difficult modules.
              </p>
            </div>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Recent Programmes
            </h2>

            {programmesLoading ? (
              <p className="mt-5 text-slate-600">Loading programmes...</p>
            ) : programmes.length === 0 ? (
              <EmptyState
                icon={<GraduationCap size={36} />}
                title="No programmes yet"
                text="Create your first academic programme to begin organizing your curriculum."
                buttonText="Create Programme"
                onClick={() => navigate("/tutor/programmes/new")}
              />
            ) : (
              <div className="mt-5 space-y-4">
                {programmes.slice(0, 3).map((programme) => (
                  <div
                    key={programme.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-blue-700">
                      {programme.level}
                    </p>

                    <h3 className="mt-1 font-bold text-slate-950">
                      {programme.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {programme.duration}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Recent Course Units
            </h2>

            {coursesLoading ? (
              <p className="mt-5 text-slate-600">Loading course units...</p>
            ) : courses.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={36} />}
                title="No course units yet"
                text="Create your first course unit and attach it to a programme."
                buttonText="Create Course Unit"
                onClick={() => navigate("/tutor/courses/new")}
              />
            ) : (
              <div className="mt-5 space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-blue-700">
                      {course.category}
                    </p>

                    <h3 className="mt-1 font-bold text-slate-950">
                      {course.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {course.level} • {course.duration}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </Container>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconClass: string;
}) {
  return (
    <Card>
      <div className={iconClass}>{icon}</div>

      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>

      <h3 className="mt-2 text-3xl font-bold">{value}</h3>
    </Card>
  );
}

function PortalActionCard({
  title,
  text,
  icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  text,
  buttonText,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <div className="mx-auto flex justify-center text-slate-400">{icon}</div>

      <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>

      <p className="mt-2 text-slate-600">{text}</p>

      <Button className="mt-5" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
  );
}