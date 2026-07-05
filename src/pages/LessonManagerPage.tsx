import { BookOpen, Clock, Edit, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useLessons from "../hooks/useLessons";
import useModules from "../hooks/useModules";

export default function LessonManagerPage() {
  const navigate = useNavigate();
  const { modules } = useModules();

  return (
    <TutorLayout
      title="Lesson Manager"
      subtitle="View, create, and manage lessons across modules."
    >
      <div className="mb-6 flex justify-end">
        <Button
          className="gap-2"
          onClick={() => navigate("/tutor/lessons/new")}
        >
          <Plus size={18} />
          New Lesson
        </Button>
      </div>

      <div className="grid gap-6">
        {modules.length === 0 ? (
          <Card className="text-center">
            <BookOpen className="mx-auto text-slate-400" size={48} />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No modules available
            </h2>

            <p className="mt-2 text-slate-600">
              Create a module first before adding lessons.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/tutor/modules/new")}
            >
              Create Module
            </Button>
          </Card>
        ) : (
          modules.map((module) => (
            <ModuleLessonsCard
              key={module.id}
              moduleId={module.id}
            />
          ))
        )}
      </div>
    </TutorLayout>
  );
}

function ModuleLessonsCard({ moduleId }: { moduleId: string }) {
  const navigate = useNavigate();
  const { lessons, loading } = useLessons(moduleId);

  if (loading) {
    return (
      <Card>
        <p className="text-slate-600">Loading lessons...</p>
      </Card>
    );
  }

  return (
    <Card>
      {lessons.length === 0 ? (
        <div className="text-center">
          <BookOpen
            className="mx-auto text-slate-400"
            size={40}
          />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No lessons in this module yet
          </h3>

          <Button
            className="mt-5"
            onClick={() => navigate("/tutor/lessons/new")}
          >
            Add Lesson
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-blue-700">
                {lesson.moduleTitle}
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-950">
                Lesson {lesson.order}: {lesson.title}
              </h3>

              <p className="mt-2 text-slate-600">
                {lesson.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {lesson.estimatedMinutes} minutes
                </div>

                <div>
                  Blocks: {lesson.blocks?.length ?? 0}
                </div>

                <div>
                  Status:{" "}
                  <span
                    className={
                      lesson.isPublished
                        ? "font-semibold text-green-600"
                        : "font-semibold text-orange-600"
                    }
                  >
                    {lesson.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/tutor/lessons/${lesson.id}/preview`)
                  }
                >
                  <Eye size={16} />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/tutor/lessons/${lesson.id}/builder`)
                  }
                >
                  <Edit size={16} />
                  Open Builder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}