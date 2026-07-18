import {
  GraduationCap,
  Mail,
  Phone,
  Search,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useStudents from "../hooks/useStudents";
import type { StudentStatus } from "../models/Student";

const statusOptions: {
  value: "all" | StudentStatus;
  label: string;
}[] = [
  { value: "all", label: "All Students" },
  { value: "active", label: "Active" },
  { value: "deferred", label: "Deferred" },
  { value: "completed", label: "Completed" },
  { value: "graduated", label: "Graduated" },
];

export default function StudentDirectoryPage() {
  const navigate = useNavigate();
  const { students, loading } = useStudents();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | StudentStatus>("all");

  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        (student.fullName || "").toLowerCase().includes(keyword) ||
        (student.registrationNumber || "").toLowerCase().includes(keyword) ||
        (student.studentNumber || "").toLowerCase().includes(keyword) ||
        (student.email || "").toLowerCase().includes(keyword) ||
       (student.programmeTitle || "").toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const activeStudents = students.filter(
    (student) => student.status === "active"
  ).length;

  const programmeCount = new Set(
    students
      .map((student) => student.programmeTitle || "")
      .filter((programme) => programme.trim() !== "")
  ).size;

  return (
    <TutorLayout
      title="Student Directory"
      subtitle="Search, filter and manage student academic records."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Student Management</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Manage learner records, registration details, programme enrolment,
              intake, semester and academic status.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={() => navigate("/tutor/students/register")}
          >
            <UserPlus size={18} />
            Register Student
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Total Students" value={students.length} icon={Users} />
        <StatCard title="Active" value={activeStudents} icon={User} />
        <StatCard
          title="Programmes"
          value={programmeCount}
          icon={GraduationCap}
        />
        <StatCard
          title="Filtered"
          value={filteredStudents.length}
          icon={Search}
        />
      </section>

      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-lg">
          <Search size={18} className="absolute left-4 top-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, registration number, email or programme..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | StudentStatus)
          }
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
          aria-label="Filter by student status"
          title="Filter by student status"
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <Card>Loading students...</Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="text-center">
          <Users size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No students found
          </h2>

          <p className="mt-2 text-slate-600">
            Register a student or change your search/filter options.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => {
            const safeStatus = isValidStatus(student.status)
              ? student.status
              : "active";

            return (
              <Card key={student.id}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <User size={28} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-950">
                      {student.fullName || "Unnamed Student"}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      {student.registrationNumber || "No registration number"}
                    </p>

                    <StatusBadge status={safeStatus} />
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <InfoLine
                    icon={GraduationCap}
                   text={student.programmeTitle || "Programme not set"}
                  />
                  <InfoLine icon={Mail} text={student.email || "No email"} />
                  <InfoLine icon={Phone} text={student.phone || "No phone"} />
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Student No:</span>{" "}
                    {student.studentNumber || "Not set"}
                  </p>

                  <p className="mt-1">
                    <span className="font-semibold">Intake:</span>{" "}
                    {student.intake || "Not set"}
                  </p>

                  <p className="mt-1">
                    <span className="font-semibold">Year of Study:</span>{" "}
                    {student.yearOfStudy || "Not set"}
                  </p>

                  <p className="mt-1">
                    <span className="font-semibold">Semester:</span>{" "}
                    {student.semester || "Not set"}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/student-profile/${student.id}`)}
                  >
                    View Profile
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/students/${student.id}/edit`)}
                  >
                    Edit Profile
                  </Button>

                  <Button
                    onClick={() => navigate(`/tutor/student-transcript/${student.id}`)}
                  >
                    Transcript
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </TutorLayout>
  );
}

function isValidStatus(value: unknown): value is StudentStatus {
  return (
    value === "active" ||
    value === "deferred" ||
    value === "completed" ||
    value === "graduated"
  );
}

function StatusBadge({ status }: { status: StudentStatus }) {
  const labelMap: Record<StudentStatus, string> = {
    active: "Active",
    deferred: "Deferred",
    completed: "Completed",
    graduated: "Graduated",
  };

  const classMap: Record<StudentStatus, string> = {
    active: "bg-green-100 text-green-700",
    deferred: "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
    graduated: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classMap[status]}`}
    >
      {labelMap[status]}
    </span>
  );
}

function InfoLine({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-blue-700" />
      <span>{text}</span>
    </div>
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <Icon size={34} className="text-blue-700" />
      </div>
    </Card>
  );
}