import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  History,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { repairAttendanceIdentityLinks } from "../firebase/attendance";
import useAttendance from "../hooks/useAttendance";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useEnrollments from "../hooks/useEnrollments";
import useStudents from "../hooks/useStudents";
import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
} from "../models/Attendance";

const today = new Date().toISOString().slice(0, 10);

export default function AttendanceManagerPage() {
  const { currentUser, userProfile } = useAuth();
  const { courseUnits, loading: coursesLoading } = useCourseUnits();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { students, loading: studentsLoading } = useStudents();
  const {
    sessions,
    loading: attendanceLoading,
    error: attendanceError,
    saveSession,
    loadSessions,
  } = useAttendance();

  const [courseUnitId, setCourseUnitId] = useState("");
  const [sessionDate, setSessionDate] = useState(today);
  const [lessonTitle, setLessonTitle] = useState("");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const repairedAttendance = useRef(false);

  const selectedCourse = courseUnits.find((item) => item.id === courseUnitId);

  useEffect(() => {
    if (studentsLoading || repairedAttendance.current || students.length === 0) {
      return;
    }

    repairedAttendance.current = true;
    void repairAttendanceIdentityLinks(students)
      .then((count) => {
        if (count > 0) void loadSessions();
      })
      .catch((error) => {
        console.error("Failed to repair attendance identity links:", error);
      });
  }, [loadSessions, students, studentsLoading]);

  const enrolledStudents = useMemo(() => {
    if (!courseUnitId) return [];

    const eligibleEnrollments = enrollments.filter(
      (item) =>
        item.status === "active" &&
        Array.isArray(item.courseUnitIds) &&
        item.courseUnitIds.includes(courseUnitId)
    );

    const studentIds = new Set(
      eligibleEnrollments
        .map((item) => item.studentId)
        .filter((value): value is string => Boolean(value))
    );

    return students
      .filter(
        (student) => studentIds.has(student.id) && student.status === "active"
      )
      .map((student) => {
        const enrollment = eligibleEnrollments.find(
          (item) => item.studentId === student.id
        );

        return {
          ...student,
          authUid:
            student.authUid ||
            enrollment?.studentAuthUid ||
            enrollment?.userId ||
            "",
        };
      });
  }, [courseUnitId, enrollments, students]);

  const visibleRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return records;

    return records.filter(
      (record) =>
        (record.studentName || "").toLowerCase().includes(keyword) ||
        (record.registrationNumber || "").toLowerCase().includes(keyword)
    );
  }, [records, search]);

  const summary = useMemo(() => {
    const count = (status: AttendanceStatus) =>
      records.filter((record) => record.status === status).length;

    return {
      total: records.length,
      present: count("present"),
      absent: count("absent"),
      late: count("late"),
      excused: count("excused"),
    };
  }, [records]);

  function loadSession(session: AttendanceSession) {
    setCourseUnitId(session.courseUnitId);
    setSessionDate(session.sessionDate);
    setLessonTitle(session.lessonTitle);
    setRecords(session.records || []);
    setEditingSessionId(session.id);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prepareRegister() {
    if (!courseUnitId) {
      alert("Please select a course unit.");
      return;
    }

    const existingSession = sessions.find(
      (session) =>
        session.courseUnitId === courseUnitId &&
        session.sessionDate === sessionDate
    );

    if (existingSession) {
      loadSession(existingSession);
      return;
    }

    if (enrolledStudents.length === 0) {
      alert("No active students are enrolled in this course unit.");
      return;
    }

    setEditingSessionId(undefined);
    setRecords(
      enrolledStudents.map((student) => ({
        studentId: student.id,
        studentAuthUid: student.authUid || "",
        studentEmail: student.email || "",
        studentName: student.fullName,
        registrationNumber: student.registrationNumber || "",
        status: "present",
        note: "",
      }))
    );
  }

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setRecords((current) =>
      current.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  }

  function markAll(status: AttendanceStatus) {
    setRecords((current) =>
      current.map((record) => ({ ...record, status }))
    );
  }

  async function handleSave() {
    if (!selectedCourse || records.length === 0) {
      alert("Prepare the attendance register first.");
      return;
    }

    if (!lessonTitle.trim()) {
      alert("Please enter the lesson or session title.");
      return;
    }

    try {
      setSaving(true);
      const savedId = await saveSession(
        {
          courseUnitId: selectedCourse.id,
          courseUnitTitle: selectedCourse.title,
          courseUnitCode: selectedCourse.code || "",
          programmeId: selectedCourse.programmeId || "",
          programmeTitle: selectedCourse.programmeTitle || "",
          sessionDate,
          lessonTitle: lessonTitle.trim(),
          records,
          markedByUid: currentUser?.uid || "",
          markedByName:
            userProfile?.fullName || currentUser?.email || "Tutor",
        },
        editingSessionId
      );

      setEditingSessionId(savedId);
      setSearch("");
      alert(
        editingSessionId
          ? "Attendance register updated successfully."
          : "Attendance register saved successfully."
      );
    } catch (error) {
      console.error("Failed to save attendance:", error);
      alert(
        error instanceof Error ? error.message : "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  function exportAttendance() {
    const rows = sessions.flatMap((session) =>
      (session.records || []).map((record) => ({
        Date: session.sessionDate,
        "Course Unit": session.courseUnitTitle,
        Lesson: session.lessonTitle,
        Student: record.studentName,
        "Registration Number": record.registrationNumber,
        Status: record.status,
        Note: record.note || "",
        "Marked By": session.markedByName,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Attendance"
    );
    XLSX.writeFile(workbook, "medical-elites-attendance.xlsx");
  }

  const loading = coursesLoading || enrollmentsLoading || studentsLoading;

  return (
    <TutorLayout
      title="Attendance Management"
      subtitle="Record attendance, reopen saved registers and monitor learner participation."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Class Attendance Register</h2>
            <p className="mt-2 max-w-3xl text-blue-100">
              Select a course unit and date. Existing registers reopen automatically.
            </p>
          </div>
          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={exportAttendance}
            disabled={sessions.length === 0}
          >
            <Download size={18} /> Export Excel
          </Button>
        </div>
      </section>

      {attendanceError && (
        <Card className="mb-6 border border-red-200 text-red-700">
          Could not load saved attendance: {attendanceError}
        </Card>
      )}

      <section className="mb-8 grid gap-4 md:grid-cols-5">
        <StatCard title="Total" value={summary.total} icon={Users} />
        <StatCard title="Present" value={summary.present} icon={UserCheck} />
        <StatCard title="Absent" value={summary.absent} icon={UserX} />
        <StatCard title="Late" value={summary.late} icon={Clock3} />
        <StatCard title="Excused" value={summary.excused} icon={CheckCircle2} />
      </section>

      <Card className="mb-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Course Unit">
            <select
              value={courseUnitId}
              onChange={(event) => {
                setCourseUnitId(event.target.value);
                setRecords([]);
                setEditingSessionId(undefined);
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">Select course unit</option>
              {courseUnits.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code ? `${course.code} — ` : ""}
                  {course.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Session Date">
            <input
              type="date"
              value={sessionDate}
              onChange={(event) => {
                setSessionDate(event.target.value);
                setRecords([]);
                setEditingSessionId(undefined);
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </Field>

          <Field label="Lesson / Session">
            <input
              value={lessonTitle}
              onChange={(event) => setLessonTitle(event.target.value)}
              placeholder="e.g. Introduction to inflammation"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </Field>

          <div className="flex items-end">
            <Button fullWidth onClick={prepareRegister} disabled={loading}>
              <CalendarDays size={18} /> Load Register
            </Button>
          </div>
        </div>
      </Card>

      {records.length > 0 ? (
        <>
          <Card className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student or registration number"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="success" onClick={() => markAll("present")}>
                  All Present
                </Button>
                <Button size="sm" variant="danger" onClick={() => markAll("absent")}>
                  All Absent
                </Button>
                <Button size="sm" variant="outline" onClick={() => markAll("late")}>
                  All Late
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-slate-100 text-left text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Registration No.</th>
                  <th className="px-5 py-4">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.studentId} className="border-t border-slate-200">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {record.studentName}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {record.registrationNumber || "Not set"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateStatus(record.studentId, status)}
                              className={`rounded-full border px-3 py-1.5 text-sm font-semibold capitalize transition ${
                                record.status === status
                                  ? statusClass(status)
                                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button size="lg" loading={saving} onClick={handleSave}>
              {editingSessionId ? "Update Attendance Register" : "Save Attendance Register"}
            </Button>
          </div>
        </>
      ) : (
        !loading && (
          <Card className="text-center">
            <Users className="mx-auto text-slate-400" size={48} />
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No register loaded
            </h3>
            <p className="mt-2 text-slate-600">
              Select a course unit and date, then load its register.
            </p>
          </Card>
        )
      )}

      <Card className="mt-8 overflow-x-auto p-0">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <History className="text-blue-700" size={22} />
          <div>
            <h3 className="font-bold text-slate-950">Saved Attendance Registers</h3>
            <p className="text-sm text-slate-600">
              These remain available after refreshing the page.
            </p>
          </div>
        </div>

        {attendanceLoading ? (
          <p className="p-6 text-slate-500">Loading attendance history...</p>
        ) : sessions.length === 0 ? (
          <p className="p-6 text-slate-500">No saved attendance registers yet.</p>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-100 text-left text-sm text-slate-600">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Course Unit</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4">Students</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-slate-200">
                  <td className="px-5 py-4">{session.sessionDate}</td>
                  <td className="px-5 py-4 font-semibold">{session.courseUnitTitle}</td>
                  <td className="px-5 py-4">{session.lessonTitle}</td>
                  <td className="px-5 py-4">{session.records?.length || 0}</td>
                  <td className="px-5 py-4">
                    <Button size="sm" variant="outline" onClick={() => loadSession(session)}>
                      Open Register
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </TutorLayout>
  );
}

function statusClass(status: AttendanceStatus) {
  const classes: Record<AttendanceStatus, string> = {
    present: "border-green-600 bg-green-600 text-white",
    absent: "border-red-600 bg-red-600 text-white",
    late: "border-amber-500 bg-amber-500 text-slate-950",
    excused: "border-blue-600 bg-blue-600 text-white",
  };
  return classes[status];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <Icon className="text-blue-700" size={30} />
      </div>
    </Card>
  );
}
