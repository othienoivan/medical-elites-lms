import { Clock3, MapPin, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useTimetable from "../hooks/useTimetable";
import type { TimetableEntryStatus } from "../models/Timetable";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetableManagerPage() {
  const { currentUser, userProfile } = useAuth();
  const { courseUnits } = useCourseUnits();
  const { entries, loading, error, saveEntry, removeEntry } = useTimetable();
  const [courseUnitId, setCourseUnitId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [venue, setVenue] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [status, setStatus] = useState<TimetableEntryStatus>("scheduled");
  const [saving, setSaving] = useState(false);

  const selectedCourse = courseUnits.find((item) => item.id === courseUnitId);
  const orderedEntries = useMemo(() => [...entries].sort((a, b) => {
    const dayDifference = days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
    return dayDifference || a.startTime.localeCompare(b.startTime);
  }), [entries]);

  async function handleSave() {
    if (!selectedCourse || !venue.trim()) {
      alert("Select a course unit and enter a venue.");
      return;
    }
    if (endTime <= startTime) {
      alert("End time must be later than start time.");
      return;
    }
    const clash = entries.some((entry) =>
      entry.dayOfWeek === dayOfWeek &&
      entry.status !== "cancelled" &&
      entry.venue.trim().toLowerCase() === venue.trim().toLowerCase() &&
      startTime < entry.endTime && endTime > entry.startTime
    );
    if (clash && !window.confirm("This venue has an overlapping timetable entry. Save anyway?")) return;

    try {
      setSaving(true);
      await saveEntry({
        programmeId: selectedCourse.programmeId,
        programmeTitle: selectedCourse.programmeTitle,
        courseUnitId: selectedCourse.id,
        courseUnitTitle: selectedCourse.title,
        courseUnitCode: selectedCourse.code,
        dayOfWeek,
        startTime,
        endTime,
        venue: venue.trim(),
        tutorUid: currentUser?.uid || "",
        tutorName: userProfile?.fullName || currentUser?.email || "Tutor",
        academicYear: academicYear.trim(),
        semester: semester.trim(),
        classGroup: classGroup.trim(),
        status,
      });
      setVenue("");
      alert("Timetable entry saved.");
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : "Failed to save timetable entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout title="Timetable Management" subtitle="Schedule classes, venues, course units and teaching times.">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Institution Timetable</h2>
        <p className="mt-2 text-blue-100">Create a weekly teaching schedule and make it available to enrolled learners.</p>
      </section>

      <Card className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Course Unit"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={courseUnitId} onChange={(event) => setCourseUnitId(event.target.value)}><option value="">Select course unit</option>{courseUnits.map((course) => <option key={course.id} value={course.id}>{course.code ? `${course.code} — ` : ""}{course.title}</option>)}</select></Field>
          <Field label="Day"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)}>{days.map((day) => <option key={day}>{day}</option>)}</select></Field>
          <Field label="Start Time"><input type="time" className="w-full rounded-xl border border-slate-300 px-4 py-3" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></Field>
          <Field label="End Time"><input type="time" className="w-full rounded-xl border border-slate-300 px-4 py-3" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></Field>
          <Field label="Venue"><input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={venue} onChange={(event) => setVenue(event.target.value)} placeholder="Lecture room / skills lab" /></Field>
          <Field label="Academic Year"><input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} placeholder="2026/2027" /></Field>
          <Field label="Semester"><input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={semester} onChange={(event) => setSemester(event.target.value)} placeholder="Semester I" /></Field>
          <Field label="Class Group"><input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={classGroup} onChange={(event) => setClassGroup(event.target.value)} placeholder="DCM 2.1" /></Field>
          <Field label="Status"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={status} onChange={(event) => setStatus(event.target.value as TimetableEntryStatus)}><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></Field>
        </div>
        <div className="mt-5 flex justify-end"><Button loading={saving} onClick={handleSave}><PlusCircle size={18} /> Add Timetable Entry</Button></div>
      </Card>

      {error && <Card className="mb-6 border border-red-200 text-red-700">{error}</Card>}
      <Card className="overflow-x-auto p-0">
        {loading ? <div className="p-8">Loading timetable...</div> : orderedEntries.length === 0 ? <div className="p-10 text-center text-slate-600">No timetable entries have been created.</div> : <table className="w-full min-w-[950px]"><thead className="bg-slate-100 text-left text-sm text-slate-600"><tr><th className="px-5 py-4">Day</th><th className="px-5 py-4">Time</th><th className="px-5 py-4">Course Unit</th><th className="px-5 py-4">Venue</th><th className="px-5 py-4">Class</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr></thead><tbody>{orderedEntries.map((entry) => <tr key={entry.id} className="border-t border-slate-200"><td className="px-5 py-4 font-semibold">{entry.dayOfWeek}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2"><Clock3 size={16} />{entry.startTime}–{entry.endTime}</span></td><td className="px-5 py-4">{entry.courseUnitTitle}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2"><MapPin size={16} />{entry.venue}</span></td><td className="px-5 py-4">{entry.classGroup || "All enrolled"}</td><td className="px-5 py-4 capitalize">{entry.status}</td><td className="px-5 py-4"><Button size="sm" variant="outline" onClick={() => void removeEntry(entry.id)}><Trash2 size={16} /> Remove</Button></td></tr>)}</tbody></table>}
      </Card>
    </TutorLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}
