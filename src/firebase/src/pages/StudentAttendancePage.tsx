import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Card from "../components/ui/Card";
import { getStudentAttendanceEntries } from "../firebase/attendance";
import useAuth from "../hooks/useAuth";
import type {
  AttendanceStatus,
  StudentAttendanceEntry,
} from "../models/Attendance";

export default function StudentAttendancePage() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<StudentAttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAttendance() {
      if (!currentUser) {
        if (active) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getStudentAttendanceEntries(
          currentUser.uid,
          currentUser.email
        );
        if (active) setEntries(data);
      } catch (caughtError) {
        console.error("Failed to load student attendance:", caughtError);
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load attendance."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAttendance();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const totals = useMemo(() => {
    const count = (status: AttendanceStatus) =>
      entries.filter((entry) => entry.status === status).length;
    const attended = entries.filter((entry) =>
      ["present", "late", "excused"].includes(entry.status)
    ).length;

    return {
      total: entries.length,
      present: count("present"),
      absent: count("absent"),
      late: count("late"),
      excused: count("excused"),
      percentage: entries.length
        ? Math.round((attended / entries.length) * 100)
        : 0,
    };
  }, [entries]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        Loading attendance...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="mt-2 text-blue-100">
            Review your class participation and attendance percentage.
          </p>
        </section>

        {error && (
          <Card className="mt-6 border border-red-200 text-red-700">
            {error}
          </Card>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Sessions" value={totals.total} icon={CalendarDays} />
          <StatCard
            title="Attendance"
            value={`${totals.percentage}%`}
            icon={UserCheck}
          />
          <StatCard title="Present" value={totals.present} icon={CheckCircle2} />
          <StatCard title="Absent" value={totals.absent} icon={UserX} />
          <StatCard title="Late" value={totals.late} icon={Clock3} />
          <StatCard title="Excused" value={totals.excused} icon={CheckCircle2} />
        </section>

        <Card className="mt-8 overflow-x-auto p-0">
          {entries.length === 0 ? (
            <div className="p-10 text-center text-slate-600">
              No attendance records are available yet.
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-100 text-left text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Course Unit</th>
                  <th className="px-5 py-4">Session</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-200">
                    <td className="px-5 py-4 text-slate-600">
                      {entry.sessionDate}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {entry.courseUnitTitle}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {entry.lessonTitle}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const classes: Record<AttendanceStatus, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-800",
    excused: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <Icon size={26} className="text-blue-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </Card>
  );
}
