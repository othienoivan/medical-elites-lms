import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import FileUpload from "../components/upload/FileUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { getProgrammeById, updateProgramme } from "../firebase/programmes";
import { deleteFileFromStorage } from "../firebase/storage";
import type { ProgrammeLevel } from "../models/Programme";

export default function EditProgrammePage() {
  const { programmeId = "" } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<ProgrammeLevel>("Diploma");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [published, setPublished] = useState(false);
  const [image, setImage] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [originalImagePath, setOriginalImagePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getProgrammeById(programmeId)
      .then((p) => {
        if (!p) throw new Error("Programme not found");
        setTitle(p.title);
        setLevel(p.level);
        setFaculty(p.faculty ?? "");
        setDepartment(p.department ?? "");
        setDescription(p.description);
        setDuration(p.duration);
        setPublished(p.published);
        setImage(p.image ?? "");
        setImagePath(p.imagePath ?? "");
        setOriginalImagePath(p.imagePath ?? "");
      })
      .catch((e) => {
        alert(e instanceof Error ? e.message : "Unable to load programme");
        navigate("/tutor/programmes");
      })
      .finally(() => setLoading(false));
  }, [programmeId, navigate]);

  const slug = (v: string) =>
    v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProgramme(programmeId, {
        title,
        slug: slug(title),
        level,
        faculty,
        department,
        description,
        duration,
        published,
        image,
        imagePath: imagePath || undefined,
      });

      if (originalImagePath && originalImagePath !== imagePath) {
        await deleteFileFromStorage(originalImagePath).catch((error) =>
          console.warn("Previous programme cover could not be deleted.", error),
        );
      }

      navigate("/tutor/programmes");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update programme");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (imagePath && imagePath !== originalImagePath) {
      await deleteFileFromStorage(imagePath).catch((error) =>
        console.warn("Unsaved programme cover could not be deleted.", error),
      );
    }
    navigate("/tutor/programmes");
  }

  return (
    <TutorLayout title="Edit Programme" subtitle="Update programme details, cover image and publication status.">
      <Card className="mx-auto max-w-3xl">
        {loading ? <p>Loading programme...</p> : (
          <form onSubmit={submit} className="space-y-5">
            <label className="block font-semibold">Programme Title<Input value={title} onChange={e => setTitle(e.target.value)} required /></label>
            <label className="block font-semibold">Level
              <select value={level} onChange={e => setLevel(e.target.value as ProgrammeLevel)} className="mt-2 w-full rounded-xl border px-4 py-3">
                <option>Certificate</option><option>Diploma</option><option>Higher Diploma</option><option>Degree</option><option>Postgraduate Diploma</option><option>Master&apos;s</option><option>PhD</option><option>CPD</option>
              </select>
            </label>
            <label className="block font-semibold">Faculty / School<Input value={faculty} onChange={e => setFaculty(e.target.value)} /></label>
            <label className="block font-semibold">Department<Input value={department} onChange={e => setDepartment(e.target.value)} /></label>
            <label className="block font-semibold">Description<textarea value={description} onChange={e => setDescription(e.target.value)} required className="mt-2 min-h-32 w-full rounded-xl border px-4 py-3" /></label>
            <label className="block font-semibold">Duration<Input value={duration} onChange={e => setDuration(e.target.value)} required /></label>

            <div>
              <label className="mb-2 block font-semibold">Programme Cover Image</label>
              {image && (
                <div className="mb-4 overflow-hidden rounded-2xl border bg-slate-50">
                  <img src={image} alt="Programme cover" className="aspect-[16/7] w-full object-cover" />
                  <div className="p-3">
                    <button
                      type="button"
                      className="text-sm font-bold text-red-600"
                      onClick={() => {
                        const pending = imagePath && imagePath !== originalImagePath ? imagePath : "";
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
                customMetadata={{ imagePurpose: "programme-cover", programmeId }}
                onUploaded={(file) => {
                  const previousPending = imagePath && imagePath !== originalImagePath ? imagePath : "";
                  setImage(file.downloadUrl);
                  setImagePath(file.filePath);
                  if (previousPending && previousPending !== file.filePath) {
                    void deleteFileFromStorage(previousPending).catch((error) =>
                      console.warn("Previous unsaved programme cover could not be deleted.", error),
                    );
                  }
                }}
              />
            </div>

            <label className="flex items-center gap-3"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Published and visible to students</label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => void cancel()}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>
    </TutorLayout>
  );
}