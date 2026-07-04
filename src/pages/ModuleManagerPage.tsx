import { BookOpen, Clock, Layers, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useModules from "../hooks/useModules";

export default function ModuleManagerPage() {
  const navigate = useNavigate();
  const { modules, loading } = useModules();

  return (
    <TutorLayout
      title="Module Manager"
      subtitle="Manage modules under each course unit."
    >
      <div className="mb-6 flex justify-end">
        <Button
          className="gap-2"
          onClick={() => navigate("/tutor/modules/new")}
        >
          <Plus size={18} />
          New Module
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading modules...</p>
      ) : modules.length === 0 ? (
        <Card className="text-center">
          <Layers className="mx-auto text-slate-400" size={48} />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No modules created yet
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
          {modules.map((module) => (
            <Card key={module.id}>
              <p className="text-sm font-semibold text-blue-700">
                {module.programmeTitle}
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Module {module.order}: {module.title}
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                {module.courseUnitTitle}
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                {module.description}
              </p>

              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Clock size={16} />
                  {module.duration}
                </p>

                <p className="flex items-center gap-2">
                  <BookOpen size={16} />
                  {module.lessons} lessons
                </p>

                <p className="flex items-center gap-2">
                  <Layers size={16} />
                  Pass mark: {module.passMark}%
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/tutor/lessons/new")}
                >
                  Add Lesson
                </Button>

                <Button onClick={() => navigate("/tutor/lessons/builder")}>
                  Open Builder
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </TutorLayout>
  );
}