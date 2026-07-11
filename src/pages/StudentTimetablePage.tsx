import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { useMemo } from "react";
import Card from "../components/ui/Card";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import useTimetable from "../hooks/useTimetable";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentTimetablePage() {
  const { courseUnitIds, loading: accessLoading } = useStudentLearningAccess();
  const { entries, loading, error } = useTimetable();

  const visibleEntries = useMemo(() => entries.filter((entry) =>
    entry.status === "scheduled" && courseUnitIds.has(entry.courseUnitId)
  ).sort((a, b) => {
    const dayDifference = days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
    return dayDifference || a.startTime.localeCompare(b.startTime);
  }), [courseUnitIds, entries]);

  if (loading || accessLoading) return <main className="min-h-screen bg-slate-50 p-8">Loading timetable...</main>;

  return <main className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-7xl">
    <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white"><h1 className="text-3xl font-bold">My Timetable</h1><p className="mt-2 text-blue-100">Your weekly schedule based on active course-unit enrolments.</p></section>
    {error && <Card className="mt-6 border border-red-200 text-red-700">{error}</Card>}
    <div className="mt-8 space-y-6">{days.map((day) => { const dayEntries = visibleEntries.filter((entry) => entry.dayOfWeek === day); if (!dayEntries.length) return null; return <Card key={day}><div className="flex items-center gap-3"><CalendarDays className="text-blue-700" /><h2 className="text-xl font-bold text-slate-950">{day}</h2></div><div className="mt-5 space-y-3">{dayEntries.map((entry) => <div key={entry.id} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3"><div><p className="font-bold text-slate-950">{entry.courseUnitTitle}</p><p className="text-sm text-slate-500">{entry.courseUnitCode || "Course unit"}</p></div><p className="flex items-center gap-2 text-slate-700"><Clock3 size={17} />{entry.startTime}–{entry.endTime}</p><p className="flex items-center gap-2 text-slate-700"><MapPin size={17} />{entry.venue}</p></div>)}</div></Card>; })}</div>
    {visibleEntries.length === 0 && <Card className="mt-8 p-10 text-center text-slate-600">No timetable entries are available for your enrolled course units.</Card>}
  </div></main>;
}
