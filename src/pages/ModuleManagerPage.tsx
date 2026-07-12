import {
  BookOpen,
  Clock,
  Layers,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useModules from "../hooks/useModules";

export default function ModuleManagerPage() {
  const navigate = useNavigate();
  const { modules, loading } = useModules();

  const [search, setSearch] = useState("");

  const filteredModules = useMemo(() => {
    const keyword = search.toLowerCase();

    return modules.filter((module) => {
      return (
        module.title.toLowerCase().includes(keyword) ||
        module.description.toLowerCase().includes(keyword) ||
        (module.programmeTitle ?? "").toLowerCase().includes(keyword) ||
        (module.courseUnitTitle ?? "").toLowerCase().includes(keyword) ||
        module.duration.toLowerCase().includes(keyword)
      );
    });
  }, [modules, search]);

  return (
    <TutorLayout
      title="Module Manager"
      subtitle="Create and organise learning modules under each course unit."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Learning Module Workspace</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Structure course units into teachable modules, attach lessons,
              assessments and learning activities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/modules/new")}
            >
              <Plus size={18} />
              New Module
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/lessons/new")}
            >
              <BookOpen size={18} />
              Add Lesson
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Modules"
          value={loading ? "..." : modules.length}
          icon={Layers}
        />

        <StatCard title="Lessons" value="Linked" icon={BookOpen} />

        <StatCard title="Assessments" value="Ready" icon={Target} />
      </section>

      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">All Modules</h2>

          <p className="mt-1 text-slate-600">
            Browse modules by programme, course unit, duration or title.
          </p>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-4 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>
      </section>

      {loading ? (
        <Card>Loading modules...</Card>
      ) : filteredModules.length === 0 ? (
        <Card className="text-center">
          <Layers className="mx-auto text-slate-400" size={52} />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No modules found
          </h2>

          <p className="mt-2 text-slate-600">
            Create your first module under a course unit.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/tutor/modules/new")}
          >
            Create Module
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredModules.map((module) => (
            <Card key={module.id}>
              <div className="flex flex-wrap gap-2">
                <Badge>{module.programmeTitle}</Badge>
                <Badge>{module.courseUnitTitle}</Badge>
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-950">
                Module {module.order}: {module.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {module.description}
              </p>

              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <InfoRow icon={Clock} text={module.duration} />
                <InfoRow icon={BookOpen} text={`${module.lessons} lessons`} />
                <InfoRow icon={Target} text={`Pass mark: ${module.passMark}%`} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/tutor/lessons/new")}
                >
                  Add Lesson
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/tutor/quizzes/builder")}
                >
                  Add Assessment
                </Button>

                <Button onClick={() => navigate("/tutor/lessons/builder")}>
                  Open Lesson Builder
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </TutorLayout>
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

        <Icon size={36} className="text-blue-700" />
      </div>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <p className="flex items-center gap-2">
      <Icon size={16} className="text-blue-700" />
      {text}
    </p>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}