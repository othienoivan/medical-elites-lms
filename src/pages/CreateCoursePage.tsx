import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import { createCourse } from "../firebase/courses";
import useAuth from "../hooks/useAuth";

type ProgrammeLevel =
  | "Certificate"
  | "Diploma"
  | "Higher Diploma"
  | "Degree"
  | "Postgraduate Diploma"
  | "Master's"
  | "PhD";

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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

    setLoading(true);

    await createCourse({
      id: "",
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
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex items-center justify-between py-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Create Course
            </h1>
            <p className="text-sm text-slate-500">
              Add a new Medical Elites course.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/tutor")}>
            Back to Tutor Dashboard
          </Button>
        </Container>
      </header>

      <Container className="py-10">
        <Card className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Course Title
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
                placeholder="Brief course description"
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
                Course Image URL
              </label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Optional image URL"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Course..." : "Create Course"}
            </Button>
          </form>
        </Card>
      </Container>
    </main>
  );
}