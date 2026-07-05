import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const { currentUser } = useAuth();

  const { programmes, loading: programmesLoading } = useProgrammes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();

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

  const filteredCourseUnits = courseUnits.filter(
    (courseUnit) => courseUnit.programmeId === programmeId
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const selectedCourseUnit = courseUnits.find(
      (courseUnit) => courseUnit.id === courseUnitId
    );

    if (!selectedProgramme || !selectedCourseUnit) {
      alert("Please select both a programme and a course unit.");
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate("/tutor/modules");
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
      subtitle="Create a module under a selected course unit."
    >
      <Card className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="programme"
              className="mb-2 block font-semibold text-slate-700"
            >
              Programme
            </label>

            <select
              id="programme"
              aria-label="Programme"
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

            {selectedProgramme && (
              <p className="mt-2 text-sm text-green-700">
                Selected: {selectedProgramme.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="course-unit"
              className="mb-2 block font-semibold text-slate-700"
            >
              Course Unit
            </label>

            <select
              id="course-unit"
              aria-label="Course Unit"
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

            {programmeId && (
              <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
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
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Module Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Cell Injury and Cell Death"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Module Code
            </label>
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Optional e.g. PATH-MOD-02"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Brief module description"
              required
              className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Module Order
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
                Estimated Hours
              </label>
              <Input
                type="number"
                min="1"
                value={estimatedHours}
                onChange={(event) =>
                  setEstimatedHours(Number(event.target.value))
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Pass Mark (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={passMark}
                onChange={(event) => setPassMark(Number(event.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
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
    </TutorLayout>
  );
}