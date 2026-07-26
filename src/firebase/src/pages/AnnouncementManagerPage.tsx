import {
  Bell,
  CheckCircle2,
  Megaphone,
  Send,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useAnnouncements from "../hooks/useAnnouncements";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useProgrammes from "../hooks/useProgrammes";
import type {
  AnnouncementAudience,
  AnnouncementPriority,
  AnnouncementTargetType,
} from "../models/Announcement";

export default function AnnouncementManagerPage() {
  const { currentUser, userProfile } = useAuth();
  const { announcements, loading, create, update, remove } = useAnnouncements();
  const { programmes } = useProgrammes();
  const { courseUnits } = useCourseUnits();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [audience, setAudience] = useState<AnnouncementAudience>("students");
  const [targetType, setTargetType] = useState<AnnouncementTargetType>("all");
  const [programmeId, setProgrammeId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProgramme = programmes.find((item) => item.id === programmeId);
  const selectedCourseUnit = courseUnits.find((item) => item.id === courseUnitId);
  const filteredCourseUnits = useMemo(
    () =>
      programmeId
        ? courseUnits.filter((item) => item.programmeId === programmeId)
        : courseUnits,
    [courseUnits, programmeId]
  );

  async function handlePublish() {
    if (!title.trim() || !message.trim()) {
      alert("Enter both the announcement title and message.");
      return;
    }
    if (targetType === "programme" && !programmeId) {
      alert("Select a programme.");
      return;
    }
    if (targetType === "courseUnit" && !courseUnitId) {
      alert("Select a course unit.");
      return;
    }

    try {
      setSaving(true);
      await create({
        title: title.trim(),
        message: message.trim(),
        priority,
        audience,
        targetType,
        ...(targetType === "programme"
          ? {
              programmeId,
              programmeTitle: selectedProgramme?.title ?? "",
            }
          : {}),
        ...(targetType === "courseUnit"
          ? {
              programmeId: selectedCourseUnit?.programmeId ?? "",
              programmeTitle: selectedCourseUnit?.programmeTitle ?? "",
              courseUnitId,
              courseUnitTitle: selectedCourseUnit?.title ?? "",
            }
          : {}),
        isPublished: true,
        expiresAt: null,
        createdByUid: currentUser?.uid ?? "",
        createdByName:
          userProfile?.fullName || currentUser?.email || "Tutor",
      });
      setTitle("");
      setMessage("");
      setPriority("normal");
      setAudience("students");
      setTargetType("all");
      setProgrammeId("");
      setCourseUnitId("");
      alert("Announcement published successfully.");
    } catch (error) {
      console.error("Failed to publish announcement:", error);
      alert(error instanceof Error ? error.message : "Failed to publish announcement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title="Announcements"
      subtitle="Publish institutional notices to students, tutors, programmes or course units."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <Megaphone size={38} />
        <h2 className="mt-4 text-3xl font-bold">Communication Centre</h2>
        <p className="mt-2 max-w-3xl text-blue-100">
          Share semester notices, assessment reminders, room changes and urgent updates.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">New Announcement</h2>
          <div className="mt-5 space-y-4">
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Announcement title" />
            </Field>
            <Field label="Message">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Write the announcement..." />
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as AnnouncementPriority)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>
            <Field label="Audience">
              <select value={audience} onChange={(e) => setAudience(e.target.value as AnnouncementAudience)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option value="students">Students</option>
                <option value="tutors">Tutors</option>
                <option value="all">Everyone</option>
              </select>
            </Field>
            <Field label="Target">
              <select value={targetType} onChange={(e) => { setTargetType(e.target.value as AnnouncementTargetType); setProgrammeId(""); setCourseUnitId(""); }} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option value="all">All eligible users</option>
                <option value="programme">Programme</option>
                <option value="courseUnit">Course unit</option>
              </select>
            </Field>
            {targetType === "programme" && (
              <Field label="Programme">
                <select value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                  <option value="">Select programme</option>
                  {programmes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </Field>
            )}
            {targetType === "courseUnit" && (
              <>
                <Field label="Programme filter">
                  <select value={programmeId} onChange={(e) => { setProgrammeId(e.target.value); setCourseUnitId(""); }} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                    <option value="">All programmes</option>
                    {programmes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                </Field>
                <Field label="Course Unit">
                  <select value={courseUnitId} onChange={(e) => setCourseUnitId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                    <option value="">Select course unit</option>
                    {filteredCourseUnits.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} — ` : ""}{item.title}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Button fullWidth loading={saving} onClick={handlePublish}>
              <Send size={18} /> Publish Announcement
            </Button>
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          {loading ? (
            <Card>Loading announcements...</Card>
          ) : announcements.length === 0 ? (
            <Card className="text-center">
              <Bell className="mx-auto text-slate-400" size={48} />
              <h3 className="mt-4 text-xl font-bold">No announcements yet</h3>
            </Card>
          ) : (
            announcements.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <PriorityBadge priority={item.priority} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{item.audience}</span>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{item.isPublished ? "Published" : "Draft"}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-slate-600">{item.message}</p>
                    <p className="mt-3 text-sm text-slate-500">
                      Target: {item.targetType === "all" ? "All" : item.courseUnitTitle || item.programmeTitle || "Selected group"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => update(item.id, { isPublished: !item.isPublished })}>
                      <CheckCircle2 size={17} /> {item.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button variant="danger" onClick={() => { if (window.confirm("Delete this announcement?")) void remove(item.id); }}>
                      <Trash2 size={17} /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </TutorLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  const classes: Record<AnnouncementPriority, string> = {
    normal: "bg-slate-100 text-slate-700",
    important: "bg-amber-100 text-amber-800",
    urgent: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${classes[priority]}`}>{priority}</span>;
}
