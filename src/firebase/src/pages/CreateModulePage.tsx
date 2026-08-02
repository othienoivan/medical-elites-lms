import {
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Save,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createModule } from "../firebase/modules";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useProgrammes from "../hooks/useProgrammes";

export default function CreateModulePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedProgrammeId = searchParams.get("programmeId") || "";
  const requestedCourseUnitId = searchParams.get("courseUnitId") || "";
  const { currentUser, userProfile } = useAuth();

  const { programmes, loading: programmesLoading } = useProgrammes(true);
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits(true);

  const [programmeId, setProgrammeId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [passMark, setPassMark] = useState(80);
  const [loading, setLoading] = useState(false);

  const selectedProgramme = programmes.find(
    (programme) => programme.id === programmeId
  );

  const selectedCourseUnit = courseUnits.find(
    (courseUnit) => courseUnit.id === courseUnitId
  );

  const filteredCourseUnits = courseUnits.filter(
    (courseUnit) => courseUnit.programmeId === programmeId
  );

  useEffect(() => {
    if (!requestedCourseUnitId || courseUnits.length === 0) return;
    const requestedCourseUnit = courseUnits.find((item) => item.id === requestedCourseUnitId);
    if (!requestedCourseUnit) return;
    setProgrammeId(requestedProgrammeId || requestedCourseUnit.programmeId);
    setCourseUnitId(requestedCourseUnit.id);
  }, [courseUnits, requestedCourseUnitId, requestedProgrammeId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!selectedProgramme || !selectedCourseUnit) {
      alert("Please select both a programme and a course unit.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter module title.");
      return;
    }

    try {
      setLoading(true);

      await createModule({
        id: "",
        programmeId: selectedProgramme.id,
        programmeTitle: selectedProgramme.title,
        courseUnitId: selectedCourseUnit.id,
        courseUnitTitle: selectedCourseUnit.title,
        title,
        description,
        order,
        code,
        estimatedHours,
        passMark,
        duration: `${estimatedHours} Hours`,
        lessons: 0,
        published: true,
        ownerUserId: currentUser.uid,
        createdByUid: currentUser.uid,
        institutionId: userProfile?.institutionId,
        assignedTutorIds: [currentUser.uid],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate(`/tutor/modules?courseUnitId=${encodeURIComponent(selectedCourseUnit.id)}&programmeId=${encodeURIComponent(selectedProgramme.id)}`);
    } catch (error) {
      console.error("Failed to create module:", error);
      alert("Failed to create module. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TutorLayout
      title="Create Module"
      subtitle="Create a structured learning module under a selected course unit."
    >
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <Layers size={46} />

          <div>
            <h2 className="text-3xl font-bold">New Learning Module</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Create a module under a course unit, define its sequence,
              estimated learning time and assessment pass mark.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold text-slate-950">
              Module Details
            </h2>

            <p className="mt-2 text-slate-600">
              Select the parent programme and course unit, then define the
              module information.
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
                  }}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                >
                  <option value="">
                    {programmesLoading
                      ? "Loading programmes..."
                      : "Select Programme"}
                  </option>

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
                  onChange={(event) => setCourseUnitId(event.target.value)}
                  required
                  disabled={!programmeId || courseUnitsLoading}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 disabled:bg-slate-100"
                >
                  <option value="">
                    {courseUnitsLoading
                      ? "Loading course units..."
                      : programmeId
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

              {(selectedProgramme || selectedCourseUnit) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedProgramme && (
                    <InfoBox
                      icon={GraduationCap}
                      title="Selected Programme"
                      description={`${selectedProgramme.title} — ${selectedProgramme.level}`}
                    />
                  )}

                  {selectedCourseUnit && (
                    <InfoBox
                      icon={BookOpen}
                      title="Selected Course Unit"
                      description={selectedCourseUnit.title}
                    />
                  )}
                </div>
              )}

              {programmeId && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p>
                    Total course units loaded:{" "}
                    <span className="font-bold">{courseUnits.length}</span>
                  </p>
                  <p>
                    Course units under selected programme:{" "}
                    <span className="font-bold">
                      {filteredCourseUnits.length}
                    </span>
                  </p>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Module Title">
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Cell Injury and Cell Death"
                    required
                  />
                </Field>

                <Field label="Module Code">
                  <Input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Optional e.g. PATH-MOD-02"
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Brief module description"
                  required
                  className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Module Order">
                  <Input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(event) => setOrder(Number(event.target.value))}
                    required
                  />
                </Field>

                <Field label="Estimated Hours">
                  <Input
                    type="number"
                    min="1"
                    value={estimatedHours}
                    onChange={(event) =>
                      setEstimatedHours(Number(event.target.value))
                    }
                    required
                  />
                </Field>

                <Field label="Pass Mark (%)">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={passMark}
                    onChange={(event) =>
                      setPassMark(Number(event.target.value))
                    }
                    required
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save size={18} />
                  {loading ? "Creating Module..." : "Create Module"}
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
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Module Summary
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

              <SummaryItem icon={Layers} label="Module" value={title || "Not set"} />

              <SummaryItem
                icon={Clock}
                label="Estimated Time"
                value={`${estimatedHours} Hours`}
              />

              <SummaryItem
                icon={Target}
                label="Pass Mark"
                value={`${passMark}%`}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              What Happens Next?
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• The module will be attached to the selected course unit.</li>
              <li>• You can create lessons under this module.</li>
              <li>• You can attach assessments such as CATs or quizzes.</li>
              <li>• Students will access lessons once published and enrolled.</li>
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