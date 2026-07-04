import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createCourseUnit } from "../firebase/courseUnits";
import useAuth from "../hooks/useAuth";
import useProgrammes from "../hooks/useProgrammes";
import type { ProgrammeLevel } from "../models/CourseUnit";

export default function CreateCourseUnitPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { programmes, loading: programmesLoading } = useProgrammes();

  const [programmeId, setProgrammeId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState<ProgrammeLevel>("Certificate");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

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

    const selectedProgramme = programmes.find(
      (programme) => programme.id === programmeId
    );

    if (!selectedProgramme) {
      alert("Please select a programme.");
      return;
    }

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
      level,
      rating: 0,
      students: "0",
      certificate: true,
      isFeatured: false,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setLoading(false);
    navigate("/tutor");
  }

  return (
    <TutorLayout
      title="Create Course Unit"
      subtitle="Attach a course unit to an academic programme."
    >
      <Card className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Parent Programme
            </label>

            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
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

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Course Unit Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="General Pathology and Immunology"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Category
            </label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Core Medical Sciences"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course unit description"
              required
              className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Duration
            </label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="6 Weeks"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Programme Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as ProgrammeLevel)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            >
              <option>Certificate</option>
              <option>Diploma</option>
              <option>Higher Diploma</option>
              <option>Degree</option>
              <option>Postgraduate Diploma</option>
              <option>Master&apos;s</option>
              <option>PhD</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Course Unit Image URL
            </label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Optional image URL"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating Course Unit..." : "Create Course Unit"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tutor")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </TutorLayout>
  );
}