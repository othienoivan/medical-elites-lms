import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createLesson } from "../firebase/lessons";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useProgrammes from "../hooks/useProgrammes";

export default function CreateLessonPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const { programmes } = useProgrammes();
  const { courseUnits } = useCourseUnits();
  const { modules } = useModules();

  const [programmeId, setProgrammeId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);

  const [loading, setLoading] = useState(false);

  const filteredCourseUnits = courseUnits.filter(
    (courseUnit) => courseUnit.programmeId === programmeId
  );

  const filteredModules = modules.filter(
    (module) => module.courseUnitId === courseUnitId
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const selectedProgramme = programmes.find(
      (programme) => programme.id === programmeId
    );

    const selectedCourseUnit = courseUnits.find(
      (courseUnit) => courseUnit.id === courseUnitId
    );

    const selectedModule = modules.find((module) => module.id === moduleId);

    if (!selectedProgramme || !selectedCourseUnit || !selectedModule) {
      alert("Please select Programme, Course Unit, and Module.");
      return;
    }

    try {
      setLoading(true);

      await createLesson({
        id: "",
        programmeId: selectedProgramme.id,
        programmeTitle: selectedProgramme.title,
        courseUnitId: selectedCourseUnit.id,
        courseUnitTitle: selectedCourseUnit.title,
        moduleId: selectedModule.id,
        moduleTitle: selectedModule.title,
        title,
        description,
        order,
        estimatedMinutes,
        learningObjectives: [],
        sections: [],
        resources: [],
        quizId: "",
        notesUrl: "",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate("/tutor/modules");
    } catch (error) {
      console.error("Failed to create lesson:", error);
      alert("Failed to create lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TutorLayout
      title="Create Lesson"
      subtitle="Create a lesson under a selected module."
    >
      <Card className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Programme
            </label>

            <select
              aria-label="Programme"
              value={programmeId}
              onChange={(event) => {
                setProgrammeId(event.target.value);
                setCourseUnitId("");
                setModuleId("");
              }}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            >
              <option value="">Select Programme</option>

              {programmes.map((programme, index) => (
                <option key={`${programme.id}-${index}`} value={programme.id}>
                  {programme.title} — {programme.level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Course Unit
            </label>

            <select
              aria-label="Course Unit"
              value={courseUnitId}
              onChange={(event) => {
                setCourseUnitId(event.target.value);
                setModuleId("");
              }}
              required
              disabled={!programmeId}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 disabled:bg-slate-100"
            >
              <option value="">
                {programmeId ? "Select Course Unit" : "Select Programme first"}
              </option>

              {filteredCourseUnits.map((courseUnit, index) => (
                <option key={`${courseUnit.id}-${index}`} value={courseUnit.id}>
                  {courseUnit.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Module
            </label>

            <select
              aria-label="Module"
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
              required
              disabled={!courseUnitId}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 disabled:bg-slate-100"
            >
              <option value="">
                {courseUnitId ? "Select Module" : "Select Course Unit first"}
              </option>

              {filteredModules.map((module, index) => (
                <option key={`${module.id}-${index}`} value={module.id}>
                  Module {module.order}: {module.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Lesson Title
            </label>

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Introduction to Pathology"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Brief lesson description"
              required
              className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Lesson Order
              </label>

              <Input
                type="number"
                min="1"
                value={order}
                onChange={(event) => setOrder(Number(event.target.value))}
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Estimated Minutes
              </label>

              <Input
                type="number"
                min="1"
                value={estimatedMinutes}
                onChange={(event) =>
                  setEstimatedMinutes(Number(event.target.value))
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating Lesson..." : "Create Lesson"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tutor/modules")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </TutorLayout>
  );
}