import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import FileUpload from "../components/upload/FileUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createProgramme } from "../firebase/programmes";
import { deleteFileFromStorage } from "../firebase/storage";
import useAuth from "../hooks/useAuth";
import type { ProgrammeLevel } from "../models/Programme";

export default function CreateProgrammePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<ProgrammeLevel>("Diploma");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePath, setImagePath] = useState("");
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

    try {
      setLoading(true);

      const programmeId = await createProgramme({
        id: "",
        title,
        slug: createSlug(title),
        level,
        faculty,
        department,
        description,
        duration,
        image,
        imagePath: imagePath || undefined,
        createdBy: currentUser.uid,
        ownerUserId: currentUser.uid,
        createdByUid: currentUser.uid,
        institutionId: userProfile?.institutionId,
        assignedTutorIds: [currentUser.uid],
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate("/tutor/programmes", {
        replace: true,
        state: { createdProgrammeId: programmeId, message: "Programme created successfully." },
      });
    } catch (error) {
      console.error("Failed to create programme:", error);
      alert(error instanceof Error ? `Failed to create programme: ${error.message}` : "Failed to create programme. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TutorLayout
      title="Create Programme"
      subtitle="Add a formal academic programme."
    >
      <Card className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Programme Title
            </label>
            <Input
              placeholder="Diploma in Clinical Medicine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="programme-level"
              className="mb-2 block font-semibold text-slate-700"
            >
              Programme Level
            </label>

            <select
              id="programme-level"
              aria-label="Programme Level"
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
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Faculty / School
            </label>
            <Input
              placeholder="School of Health Sciences"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Department
            </label>
            <Input
              placeholder="Department of Clinical Medicine"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Programme description"
              required
              className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Duration
            </label>
            <Input
              placeholder="3 Years"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Programme Cover Image
            </label>

            {image && (
              <div className="mb-4 overflow-hidden rounded-2xl border bg-slate-50">
                <img src={image} alt="Programme cover" className="aspect-[16/7] w-full object-cover" />
                <div className="p-3">
                  <button
                    type="button"
                    className="text-sm font-bold text-red-600"
                    onClick={() => {
                      const pending = imagePath;
                      setImage("");
                      setImagePath("");
                      if (pending) {
                        void deleteFileFromStorage(pending).catch((error) =>
                          console.warn("Unsaved programme cover could not be deleted.", error),
                        );
                      }
                    }}
                  >
                    Remove cover
                  </button>
                </div>
              </div>
            )}

            <FileUpload
              folder="images"
              accept="image/jpeg,image/png,image/webp"
              label={image ? "Replace Programme Cover" : "Upload Programme Cover"}
              customMetadata={{ imagePurpose: "programme-cover" }}
              onUploaded={(file) => {
                const previous = imagePath;
                setImage(file.downloadUrl);
                setImagePath(file.filePath);
                if (previous && previous !== file.filePath) {
                  void deleteFileFromStorage(previous).catch((error) =>
                    console.warn("Previous unsaved programme cover could not be deleted.", error),
                  );
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating Programme..." : "Create Programme"}
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