import {
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Save,
} from "lucide-react";
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

  const selectedProgramme = programmes.find(
    (programme) => programme.id === programmeId
  );

  const selectedCourseUnit = courseUnits.find(
    (courseUnit) => courseUnit.id === courseUnitId
  );

  const selectedModule = modules.find((module) => module.id === moduleId);

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

    if (!selectedProgramme || !selectedCourseUnit || !selectedModule) {
      alert("Please select Programme, Course Unit, and Module.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter lesson title.");
      return;
    }

    try {
      setLoading(true);

      const lessonId = await createLesson({
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
        blocks: [],
        quizId: "",
        notesUrl: "",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate(`/tutor/lessons/${lessonId}/builder`);
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
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <BookOpen size={46} />

          <div>
            <h2 className="text-3xl font-bold">New Lesson</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Create a structured lesson and continue directly into the visual
              lesson builder.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold text-slate-950">
              Lesson Details
            </h2>

            <p className="mt-2 text-slate-600">
              Select the academic location of this lesson, then define the title,
              order and estimated teaching time.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <Field label="Programme" htmlFor="programme">
                <select
                  id="programme"
                  aria-label="Programme"
                  title="Programme"
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

                  {programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.title} — {programme.level}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Course Unit" htmlFor="course-unit">
                <select
                  id="course-unit"
                  aria-label="Course Unit"
                  title="Course Unit"
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
                    {programmeId
                      ? filteredCourseUnits.length > 0
                        ? "Select Course Unit"
                        : "No course units found for this programme"
                      : "Select Programme first"}
                  </option>

                  {filteredCourseUnits.map((courseUnit) => (
                    <option key={courseUnit.id} value={courseUnit.id}>
                      {courseUnit.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Module" htmlFor="module">
                <select
                  id="module"
                  aria-label="Module"
                  title="Module"
                  value={moduleId}
                  onChange={(event) => setModuleId(event.target.value)}
                  required
                  disabled={!courseUnitId}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 disabled:bg-slate-100"
                >
                  <option value="">
                    {courseUnitId
                      ? filteredModules.length > 0
                        ? "Select Module"
                        : "No modules found for this course unit"
                      : "Select Course Unit first"}
                  </option>

                  {filteredModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      Module {module.order}: {module.title}
                    </option>
                  ))}
                </select>
              </Field>

              {(selectedProgramme || selectedCourseUnit || selectedModule) && (
                <div className="grid gap-4 md:grid-cols-3">
                  {selectedProgramme && (
                    <InfoBox
                      icon={GraduationCap}
                      title="Programme"
                      description={selectedProgramme.title}
                    />
                  )}

                  {selectedCourseUnit && (
                    <InfoBox
                      icon={BookOpen}
                      title="Course Unit"
                      description={selectedCourseUnit.title}
                    />
                  )}

                  {selectedModule && (
                    <InfoBox
                      icon={Layers}
                      title="Module"
                      description={selectedModule.title}
                    />
                  )}
                </div>
              )}

              <Field label="Lesson Title">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Introduction to Pathology"
                  required
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Brief lesson description"
                  required
                  className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Lesson Order">
                  <Input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(event) => setOrder(Number(event.target.value))}
                    required
                  />
                </Field>

                <Field label="Estimated Minutes">
                  <Input
                    type="number"
                    min="1"
                    value={estimatedMinutes}
                    onChange={(event) =>
                      setEstimatedMinutes(Number(event.target.value))
                    }
                    required
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save size={18} />
                  {loading ? "Creating Lesson..." : "Create and Open Builder"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tutor/lessons")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Lesson Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <SummaryItem
                icon={GraduationCap}
                label="Programme"
                value={selectedProgramme?.title || "Not selected"}
              />

              <SummaryItem
                icon={BookOpen}
                label="Course Unit"
                value={selectedCourseUnit?.title || "Not selected"}
              />

              <SummaryItem
                icon={Layers}
                label="Module"
                value={selectedModule?.title || "Not selected"}
              />

              <SummaryItem
                icon={Clock}
                label="Estimated Time"
                value={`${estimatedMinutes} minutes`}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              What Happens Next?
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• The lesson will be created under the selected module.</li>
              <li>• You will be redirected to the visual lesson builder.</li>
              <li>• Add text, images, video, objectives, PDFs and activities.</li>
              <li>• Students can access the lesson once it is published.</li>
            </ul>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-semibold text-slate-700"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoBox({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <Icon className="text-blue-700" size={24} />

        <div>
          <p className="font-semibold text-blue-950">{title}</p>
          <p className="mt-1 text-blue-800">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <Icon size={18} className="mt-0.5 text-blue-700" />

      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-slate-600">{value}</p>
      </div>
    </div>
  );
}