import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useCourseUnits from "../hooks/useCourseUnits";
import useProgrammes from "../hooks/useProgrammes";

export default function CurriculumExplorerPage() {
  const navigate = useNavigate();
  const { programmes, loading: programmesLoading } = useProgrammes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();

  const [openProgrammeId, setOpenProgrammeId] = useState<string | null>(null);

  const loading = programmesLoading || courseUnitsLoading;

  return (
    <TutorLayout
      title="Curriculum Explorer"
      subtitle="Browse programmes, course units, modules, and lessons in one academic structure."
    >
      <div className="mb-6 flex flex-wrap gap-3">
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
          onClick={() => navigate("/tutor/course-units/new")}
        >
          <Plus size={18} />
          New Course Unit
        </Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-slate-600">Loading curriculum...</p>
        ) : programmes.length === 0 ? (
          <div className="py-12 text-center">
            <GraduationCap className="mx-auto text-slate-400" size={48} />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No programmes found
            </h2>

            <p className="mt-2 text-slate-600">
              Create a programme first, then attach course units to it.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/tutor/programmes/new")}
            >
              Create Programme
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {programmes.map((programme) => {
              const isOpen = openProgrammeId === programme.id;

              const programmeCourseUnits = courseUnits.filter(
                (courseUnit) => courseUnit.programmeId === programme.id
              );

              return (
                <div
                  key={programme.id}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenProgrammeId(isOpen ? null : programme.id)
                    }
                    className="flex w-full items-center justify-between bg-slate-50 p-5 text-left transition hover:bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                        <GraduationCap size={24} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-700">
                          {programme.level}
                        </p>

                        <h3 className="text-lg font-bold text-slate-950">
                          {programme.title}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {programme.duration}
                        </p>
                      </div>
                    </div>

                    {isOpen ? (
                      <ChevronDown className="text-slate-500" />
                    ) : (
                      <ChevronRight className="text-slate-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">
                          Course Units
                        </h4>

                        <Button
                          variant="outline"
                          onClick={() => navigate("/tutor/course-units/new")}
                        >
                          Add Course Unit
                        </Button>
                      </div>

                      {programmeCourseUnits.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                          <BookOpen
                            className="mx-auto text-slate-400"
                            size={36}
                          />

                          <p className="mt-3 font-semibold text-slate-800">
                            No course units attached yet
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            Add a course unit and select this programme as its
                            parent.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {programmeCourseUnits.map((courseUnit) => (
                            <div
                              key={courseUnit.id}
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                  <BookOpen className="mt-1 text-green-700" />

                                  <div>
                                    <h5 className="font-bold text-slate-950">
                                      {courseUnit.title}
                                    </h5>

                                    <p className="mt-1 text-sm text-slate-600">
                                      {courseUnit.category} •{" "}
                                      {courseUnit.duration}
                                    </p>

                                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                      <Layers size={16} />
                                      Modules will appear here next.
                                    </p>
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  onClick={() => navigate("/tutor/modules")}
                                >
                                  Manage Modules
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </TutorLayout>
  );
}