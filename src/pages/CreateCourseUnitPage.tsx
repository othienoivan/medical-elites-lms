import { BookOpen, GraduationCap, Image, Layers, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createCourseUnit } from "../firebase/courseUnits";
import useAuth from "../hooks/useAuth";
import useProgrammes from "../hooks/useProgrammes";

export default function CreateCourseUnitPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { programmes, loading: programmesLoading } = useProgrammes();

  const [programmeId, setProgrammeId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProgramme = programmes.find(
    (programme) => programme.id === programmeId
  );

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!selectedProgramme) {
      alert("Please select a programme.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter course unit title.");
      return;
    }

    try {
      setLoading(true);

      await createCourseUnit({
        id: "",
        programmeId: selectedProgramme.id,
        programmeTitle: selectedProgramme.title,
        slug: createSlug(title),
        title,
        category,
        description,
        image:
          image ||
          "https://placehold.co/900x600/1D4ED8/FFFFFF?text=Medical+Elites",
        tutor: currentUser.email || "Medical Elites Tutor",
        duration,
        modules: 0,
        lessons: 0,
        level: selectedProgramme.level,
        rating: 0,
        students: "0",
        certificate: true,
        isFeatured: false,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate("/tutor/programmes");
    } catch (error) {
      console.error("Failed to create course unit:", error);
      alert("Failed to create course unit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TutorLayout
      title="Create Course Unit"
      subtitle="Attach a course unit to an academic programme."
    >
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <BookOpen size={46} />

          <div>
            <h2 className="text-3xl font-bold">New Course Unit</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Create a course unit under a parent programme, define its category,
              duration and learning context.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold text-slate-950">
              Course Unit Details
            </h2>

            <p className="mt-2 text-slate-600">
              Provide the academic identity and description of this course unit.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label
                  htmlFor="programme"
                  className="mb-2 block font-semibold text-slate-700"
                >
                  Parent Programme
                </label>

                <select
                  id="programme"
                  aria-label="Parent Programme"
                  title="Parent Programme"
                  value={programmeId}
                  onChange={(event) => setProgrammeId(event.target.value)}
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
              </div>

              {selectedProgramme && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="text-blue-700" size={24} />

                    <div>
                      <p className="font-semibold text-blue-950">
                        Selected Programme
                      </p>

                      <p className="mt-1 text-blue-800">
                        {selectedProgramme.title}
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        Level: {selectedProgramme.level}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Course Unit Title">
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="General Pathology and Immunology"
                    required
                  />
                </Field>

                <Field label="Category">
                  <Input
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Core Medical Sciences"
                    required
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Brief course unit description"
                  required
                  className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Duration">
                  <Input
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    placeholder="6 Weeks"
                    required
                  />
                </Field>

                <Field label="Course Unit Image URL">
                  <Input
                    value={image}
                    onChange={(event) => setImage(event.target.value)}
                    placeholder="Optional image URL"
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save size={18} />
                  {loading ? "Creating Course Unit..." : "Create Course Unit"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tutor/programmes")}
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
              Course Unit Summary
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
                value={title || "Not set"}
              />

              <SummaryItem
                icon={Layers}
                label="Category"
                value={category || "Not set"}
              />

              <SummaryItem
                icon={Image}
                label="Image"
                value={image ? "Custom image URL" : "Default image"}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              What Happens Next?
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• The course unit will be attached to the selected programme.</li>
              <li>• You can add modules under this course unit.</li>
              <li>• Lessons and assessments can then be attached to modules.</li>
              <li>• Students will access it once published and enrolled.</li>
            </ul>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      {children}
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