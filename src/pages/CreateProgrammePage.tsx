import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import { createProgramme } from "../firebase/programmes";
import useAuth from "../hooks/useAuth";
import type { ProgrammeLevel } from "../models/Programme";

export default function CreateProgrammePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<ProgrammeLevel>("Diploma");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
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

    await createProgramme({
      id: "",
      title,
      slug: createSlug(title),
      level,
      faculty,
      department,
      description,
      duration,
      image,
      createdBy: currentUser.uid,
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
              Create Programme
            </h1>
            <p className="text-sm text-slate-500">
              Add a formal academic programme.
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
            <Input placeholder="Programme Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

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
              <option>CPD</option>
            </select>

            <Input placeholder="Faculty / School" value={faculty} onChange={(e) => setFaculty(e.target.value)} />

            <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Programme description"
              required
              className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            />

            <Input placeholder="Duration e.g. 3 Years" value={duration} onChange={(e) => setDuration(e.target.value)} required />

            <Input placeholder="Image URL optional" value={image} onChange={(e) => setImage(e.target.value)} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Programme..." : "Create Programme"}
            </Button>
          </form>
        </Card>
      </Container>
    </main>
  );
}