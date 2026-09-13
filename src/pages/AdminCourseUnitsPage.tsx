import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import FileUpload from "../components/upload/FileUpload";
import {
  createCourseUnit,
  deleteCourseUnit,
  getAllCourseUnits,
  updateCourseUnit,
} from "../firebase/courseUnits";
import { getAllProgrammes } from "../firebase/programmes";
import { deleteFileFromStorage } from "../firebase/storage";
import useAuth from "../hooks/useAuth";
import useAccessScope from "../hooks/useAccessScope";
import type { CourseUnit } from "../models/CourseUnit";
import type { Programme } from "../models/Programme";

const PLACEHOLDER_IMAGE = "/images/course-placeholder.svg";

const blank = {
  programmeId: "",
  title: "",
  code: "",
  semester: 1,
  yearOfStudy: 1,
  creditUnits: 3,
  duration: "",
  description: "",
  published: true,
  image: "",
  imagePath: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function AdminCourseUnitsPage() {
  const accessScope = useAccessScope();
  const { currentUser } = useAuth();

  const [records, setRecords] = useState<CourseUnit[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Thumbnail that is currently persisted on the course unit being edited.
  const [originalImagePath, setOriginalImagePath] = useState("");

  // New files uploaded during the current edit session.
  // These are cleaned up if the administrator cancels.
  const [pendingImagePaths, setPendingImagePaths] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const reload = useCallback(async () => {
    if (!accessScope) return;

    setLoading(true);

    try {
      const [courseRows, programmeRows] = await Promise.all([
        getAllCourseUnits(accessScope),
        getAllProgrammes(accessScope),
      ]);

      setRecords(courseRows);
      setProgrammes(programmeRows);
    } finally {
      setLoading(false);
    }
  }, [accessScope]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return records.filter((item) =>
      [item.title, item.code, item.programmeTitle].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword),
      ),
    );
  }, [records, search]);

  const selectedProgramme = programmes.find(
    (item) => item.id === form.programmeId,
  );

  async function cleanupPendingImages(exceptPath = "") {
    const paths = [...new Set(pendingImagePaths)].filter(
      (path) => path && path !== exceptPath,
    );

    await Promise.allSettled(
      paths.map((path) => deleteFileFromStorage(path)),
    );
  }

  function resetState() {
    setForm(blank);
    setEditingId(null);
    setOriginalImagePath("");
    setPendingImagePaths([]);
  }

  async function cancelEditing() {
    await cleanupPendingImages();
    resetState();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !selectedProgramme) return;

    setSaving(true);

    try {
      const common = {
        programmeId: selectedProgramme.id,
        programmeTitle: selectedProgramme.title,
        title: form.title,
        code: form.code,
        semester: form.semester,
        yearOfStudy: form.yearOfStudy,
        creditUnits: form.creditUnits,
        duration: form.duration,
        description: form.description,
        published: form.published,
        slug: slugify(form.title),
        level: selectedProgramme.level,
        image: form.image || PLACEHOLDER_IMAGE,
        imagePath: form.imagePath || "",
      };

      if (editingId) {
        await updateCourseUnit(editingId, common);

        // Firestore now points to the new image (or no uploaded image).
        // Only now is it safe to delete the old persisted Storage object.
        if (
          originalImagePath &&
          originalImagePath !== form.imagePath
        ) {
          await deleteFileFromStorage(originalImagePath).catch((error) =>
            console.warn(
              "Old course thumbnail could not be deleted after save.",
              error,
            ),
          );
        }

        // If several replacements were uploaded during this editing session,
        // keep only the final file referenced by Firestore.
        await cleanupPendingImages(form.imagePath);
      } else {
        await createCourseUnit({
          id: "",
          ...common,
          category: "",
          tutor: currentUser.email ?? "Tutor",
          modules: 0,
          lessons: 0,
          rating: 0,
          students: "0",
          certificate: true,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await cleanupPendingImages(form.imagePath);
      }

      alert(
        `Course unit ${editingId ? "updated" : "created"} successfully.`,
      );

      resetState();
      await reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save course unit.",
      );
    } finally {
      setSaving(false);
    }
  }

  function edit(item: CourseUnit) {
    // Clean any unsaved uploads from the previous editing session.
    void cleanupPendingImages();

    setEditingId(item.id);
    setOriginalImagePath(item.imagePath ?? "");
    setPendingImagePaths([]);

    setForm({
      programmeId: item.programmeId,
      title: item.title,
      code: item.code ?? "",
      semester: item.semester ?? 1,
      yearOfStudy: item.yearOfStudy ?? 1,
      creditUnits: item.creditUnits ?? 3,
      duration: item.duration,
      description: item.description,
      published: item.published,
      image: item.image ?? "",
      imagePath: item.imagePath ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function remove(item: CourseUnit) {
    if (
      window.prompt(
        `Delete ${item.title}? Type DELETE to confirm.`,
      ) !== "DELETE"
    ) {
      return;
    }

    try {
      await deleteCourseUnit(item.id, accessScope!);

      if (item.imagePath) {
        await deleteFileFromStorage(item.imagePath).catch((error) =>
          console.warn(
            "Course thumbnail could not be deleted from Storage.",
            error,
          ),
        );
      }

      await reload();
      alert("Course unit deleted.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete course unit.",
      );
    }
  }

  async function archive(item: CourseUnit) {
    await updateCourseUnit(item.id, {
      published: false,
    });

    await reload();
    alert("Course unit archived.");
  }

  return (
    <AdminLayout
      title="Course Units"
      subtitle="Manage course units, programme linkage and academic placement."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <form
          onSubmit={submit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Plus size={21} />
            </span>

            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Course Unit" : "Create Course Unit"}
              </h2>

              <p className="text-sm text-slate-500">
                Link the unit to a programme and academic stage.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Programme">
              <select
                required
                value={form.programmeId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    programmeId: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select Programme</option>

                {programmes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Course Unit Title">
              <Input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code">
                <Input
                  value={form.code}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      code: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Duration">
                <Input
                  value={form.duration}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      duration: event.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                label="Semester"
                value={form.semester}
                onChange={(value) =>
                  setForm({
                    ...form,
                    semester: value,
                  })
                }
              />

              <NumberField
                label="Year of Study"
                value={form.yearOfStudy}
                onChange={(value) =>
                  setForm({
                    ...form,
                    yearOfStudy: value,
                  })
                }
              />

              <NumberField
                label="Credit Units"
                value={form.creditUnits}
                onChange={(value) =>
                  setForm({
                    ...form,
                    creditUnits: value,
                  })
                }
              />
            </div>

            <Field label="Description">
              <textarea
                required
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </Field>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Unit Thumbnail
              </label>

              {form.image &&
                form.image !== PLACEHOLDER_IMAGE &&
                !form.image.includes("placehold.co") && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={form.image}
                      alt={`${form.title || "Course unit"} thumbnail`}
                      className="aspect-[16/10] w-full object-cover"
                    />

                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="text-sm font-semibold text-slate-600">
                        Current thumbnail
                      </span>

                      <button
                        type="button"
                        className="text-sm font-bold text-red-600 hover:text-red-700"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            image: "",
                            imagePath: "",
                          }));
                        }}
                      >
                        Remove thumbnail
                      </button>
                    </div>
                  </div>
                )}

              <FileUpload
                folder="images"
                accept="image/jpeg,image/png,image/webp"
                label={
                  form.image &&
                  form.image !== PLACEHOLDER_IMAGE &&
                  !form.image.includes("placehold.co")
                    ? "Replace Thumbnail"
                    : "Upload Thumbnail"
                }
                customMetadata={{
                  imagePurpose: "course-unit-thumbnail",
                  ...(editingId
                    ? { courseUnitId: editingId }
                    : {}),
                }}
                onUploaded={(file) => {
                  setPendingImagePaths((current) => [
                    ...current,
                    file.filePath,
                  ]);

                  setForm((current) => ({
                    ...current,
                    image: file.downloadUrl,
                    imagePath: file.filePath,
                  }));
                }}
              />

              <p className="mt-2 text-xs text-slate-500">
                JPEG, PNG or WebP. A landscape image is recommended.
                Existing thumbnails are only deleted after the course unit
                changes have been saved.
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm({
                    ...form,
                    published: event.target.checked,
                  })
                }
              />

              Active / Published
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit" loading={saving}>
              {editingId ? "Save Changes" : "Create Course Unit"}
            </Button>

            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void cancelEditing()}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Configured Course Units
              </h2>

              <p className="text-sm text-slate-500">
                {records.length} records
              </p>
            </div>

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search course units..."
            />
          </div>

          {loading ? (
            <p className="mt-6 text-slate-500">
              Loading...
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <img
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={`${item.title} thumbnail`}
                        className="h-16 w-24 shrink-0 rounded-xl border border-slate-200 object-cover"
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">
                            {item.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              item.published
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {item.published
                              ? "active"
                              : "archived"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.code || "No code"} ·{" "}
                          {item.programmeTitle} · Semester{" "}
                          {item.semester ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <IconButton
                        label="Edit"
                        onClick={() => edit(item)}
                      >
                        <Pencil size={17} />
                      </IconButton>

                      {item.published && (
                        <IconButton
                          label="Archive"
                          onClick={() => void archive(item)}
                        >
                          <Archive size={17} />
                        </IconButton>
                      )}

                      <IconButton
                        label="Delete"
                        danger
                        onClick={() => void remove(item)}
                      >
                        <Trash2 size={17} />
                      </IconButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
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
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min="1"
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />
    </Field>
  );
}

function IconButton({
  label,
  children,
  onClick,
  danger = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-xl border p-2.5 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
