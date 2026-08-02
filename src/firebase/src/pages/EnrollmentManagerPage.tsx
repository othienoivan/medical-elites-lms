import {
  BookOpen,
  Calendar,
  GraduationCap,
  PlusCircle,
  Search,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import useCourseUnits from "../hooks/useCourseUnits";
import useEnrollments from "../hooks/useEnrollments";
import useProgrammes from "../hooks/useProgrammes";
import useStudents from "../hooks/useStudents";
import type { EnrollmentStatus } from "../models/Enrollment";

type EnrollmentForm = {
  studentId: string;
  programmeId: string;
  courseUnitIds: string[];
  academicYear: string;
  semester: string;
  intake: string;
  classGroup: string;
  status: EnrollmentStatus;
};

const initialForm: EnrollmentForm = {
  studentId: "",
  programmeId: "",
  courseUnitIds: [],
  academicYear: "",
  semester: "",
  intake: "",
  classGroup: "",
  status: "active",
};

export default function EnrollmentManagerPage() {
  const {
    enrollments,
    loading: enrollmentsLoading,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
  } = useEnrollments();
  const { students, loading: studentsLoading } = useStudents();
  const { programmes, loading: programmesLoading } = useProgrammes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | EnrollmentStatus>("all");
  const [form, setForm] = useState<EnrollmentForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === form.studentId),
    [form.studentId, students]
  );

  const selectedProgramme = useMemo(
    () => programmes.find((programme) => programme.id === form.programmeId),
    [form.programmeId, programmes]
  );

  const availableCourseUnits = useMemo(
    () =>
      courseUnits
        .filter((courseUnit) => courseUnit.programmeId === form.programmeId)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [courseUnits, form.programmeId]
  );

  const filteredEnrollments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return enrollments.filter((enrollment) => {
      const matchesSearch =
        !keyword ||
        (enrollment.studentName ?? "").toLowerCase().includes(keyword) ||
        (enrollment.registrationNumber ?? "").toLowerCase().includes(keyword) ||
        (enrollment.programmeTitle ?? "").toLowerCase().includes(keyword) ||
        (enrollment.academicYear ?? "").toLowerCase().includes(keyword) ||
        (enrollment.semester ?? "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || enrollment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, search, statusFilter]);

  const loading =
    enrollmentsLoading || studentsLoading || programmesLoading || courseUnitsLoading;

  function updateField<K extends keyof EnrollmentForm>(
    field: K,
    value: EnrollmentForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectStudent(studentId: string) {
    const student = students.find((item) => item.id === studentId);

    setForm((current) => ({
      ...current,
      studentId,
      programmeId: student?.programmeId || current.programmeId,
      academicYear: student?.academicYear || current.academicYear,
      semester: student?.semester || current.semester,
      intake: student?.intake || current.intake,
      classGroup:
        student?.yearOfStudy && student?.semester
          ? `${student.yearOfStudy} - ${student.semester}`
          : current.classGroup,
      courseUnitIds: [],
    }));
  }

  function selectProgramme(programmeId: string) {
    setForm((current) => ({
      ...current,
      programmeId,
      courseUnitIds: [],
    }));
  }

  function toggleCourseUnit(courseUnitId: string) {
    setForm((current) => ({
      ...current,
      courseUnitIds: current.courseUnitIds.includes(courseUnitId)
        ? current.courseUnitIds.filter((id) => id !== courseUnitId)
        : [...current.courseUnitIds, courseUnitId],
    }));
  }

  function validateForm() {
    if (!selectedStudent) {
      alert("Please select a registered student.");
      return false;
    }

    if (!selectedProgramme) {
      alert("Please select a programme.");
      return false;
    }

    if (!form.academicYear.trim()) {
      alert("Please enter the academic year.");
      return false;
    }

    if (!form.semester.trim()) {
      alert("Please enter the semester.");
      return false;
    }

    const duplicate = enrollments.some(
      (enrollment) =>
        enrollment.studentId === selectedStudent.id &&
        enrollment.programmeId === selectedProgramme.id &&
        enrollment.academicYear === form.academicYear.trim() &&
        enrollment.semester === form.semester.trim() &&
        enrollment.status !== "transferred"
    );

    if (duplicate) {
      alert(
        "This student already has an enrolment for the selected programme, academic year and semester."
      );
      return false;
    }

    return true;
  }

  async function handleCreateEnrollment() {
    if (!validateForm() || !selectedStudent || !selectedProgramme) return;

    try {
      setSaving(true);

      await createEnrollment({
        studentId: selectedStudent.id,
        studentAuthUid: selectedStudent.authUid || "",
        studentEmailNormalized: selectedStudent.email.trim().toLowerCase(),
        studentName: selectedStudent.fullName,
        registrationNumber: selectedStudent.registrationNumber,
        programmeId: selectedProgramme.id,
        programmeTitle: selectedProgramme.title,
        courseUnitIds: form.courseUnitIds,
        academicYear: form.academicYear.trim(),
        semester: form.semester.trim(),
        intake: form.intake.trim(),
        classGroup: form.classGroup.trim(),
        status: form.status,
      });

      setForm(initialForm);
      alert("Student enrolled successfully.");
    } catch (error) {
      console.error("Failed to create enrolment:", error);
      alert("Failed to create enrolment.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnrollmentStatus(
    enrollmentId: string,
    currentStatus: EnrollmentStatus
  ) {
    const nextStatus: EnrollmentStatus =
      currentStatus === "active" ? "inactive" : "active";

    try {
      await updateEnrollment(enrollmentId, { status: nextStatus });
    } catch (error) {
      console.error("Failed to update enrolment:", error);
      alert("Failed to update enrolment.");
    }
  }

  async function removeEnrollment(enrollmentId: string) {
    const confirmed = window.confirm(
      "Remove this enrolment record? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteEnrollment(enrollmentId);
    } catch (error) {
      console.error("Failed to delete enrolment:", error);
      alert("Failed to delete enrolment.");
    }
  }

  return (
    <TutorLayout
      title="Enrollment Manager"
      subtitle="Assign registered students to programmes, semesters and course units."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Student Enrollment</h2>
        <p className="mt-2 max-w-3xl text-blue-100">
          Link authoritative student records to programmes and published course
          units without manually entering database IDs.
        </p>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Total Enrollments" value={enrollments.length} icon={Users} />
        <StatCard
          title="Active"
          value={enrollments.filter((item) => item.status === "active").length}
          icon={ShieldCheck}
        />
        <StatCard
          title="Programmes"
          value={new Set(enrollments.map((item) => item.programmeId).filter(Boolean)).size}
          icon={GraduationCap}
        />
        <StatCard title="Filtered" value={filteredEnrollments.length} icon={Search} />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">New Enrollment</h2>
            <p className="mt-2 text-sm text-slate-600">
              Select existing records. Names and registration details are filled automatically.
            </p>

            <div className="mt-6 space-y-5">
              <SelectField
                label="Registered Student"
                value={form.studentId}
                onChange={selectStudent}
                options={[
                  { value: "", label: "Select student" },
                  ...students
                    .filter((student) => student.status === "active")
                    .sort((a, b) => a.fullName.localeCompare(b.fullName))
                    .map((student) => ({
                      value: student.id,
                      label: `${student.fullName} — ${student.registrationNumber || student.studentNumber}`,
                    })),
                ]}
              />

              {selectedStudent && (
                <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-950">
                  <p className="font-bold">{selectedStudent.fullName}</p>
                  <p className="mt-1">Registration: {selectedStudent.registrationNumber || "Not set"}</p>
                  <p>Email: {selectedStudent.email || "Not set"}</p>
                </div>
              )}

              <SelectField
                label="Programme"
                value={form.programmeId}
                onChange={selectProgramme}
                options={[
                  { value: "", label: "Select programme" },
                  ...programmes
                    .filter((programme) => programme.published)
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((programme) => ({
                      value: programme.id,
                      label: programme.code
                        ? `${programme.code} — ${programme.title}`
                        : programme.title,
                    })),
                ]}
              />

              <FormField
                label="Academic Year"
                value={form.academicYear}
                onChange={(value) => updateField("academicYear", value)}
                placeholder="2026/2027"
              />

              <FormField
                label="Semester"
                value={form.semester}
                onChange={(value) => updateField("semester", value)}
                placeholder="Semester I"
              />

              <FormField
                label="Intake"
                value={form.intake}
                onChange={(value) => updateField("intake", value)}
                placeholder="July 2026"
              />

              <FormField
                label="Class Group"
                value={form.classGroup}
                onChange={(value) => updateField("classGroup", value)}
                placeholder="BME Year 1"
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => updateField("status", value as EnrollmentStatus)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "completed", label: "Completed" },
                  { value: "transferred", label: "Transferred" },
                ]}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Course Units</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Select the units included in this enrolment.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
                {form.courseUnitIds.length} selected
              </span>
            </div>

            {!form.programmeId ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Select a programme first.
              </p>
            ) : availableCourseUnits.length === 0 ? (
              <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                No published course units are linked to this programme.
              </p>
            ) : (
              <div className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
                {availableCourseUnits.map((courseUnit) => {
                  const checked = form.courseUnitIds.includes(courseUnit.id);

                  return (
                    <label
                      key={courseUnit.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        checked
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCourseUnit(courseUnit.id)}
                        className="mt-1 h-4 w-4"
                      />
                      <span>
                        <span className="block font-semibold text-slate-900">
                          {courseUnit.code ? `${courseUnit.code} — ` : ""}
                          {courseUnit.title}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {courseUnit.yearOfStudy ? `Year ${courseUnit.yearOfStudy}` : "Year not set"}
                          {courseUnit.semester ? ` • Semester ${courseUnit.semester}` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <Button
              className="mt-6 w-full"
              disabled={saving || loading}
              onClick={handleCreateEnrollment}
            >
              <PlusCircle size={18} />
              {saving ? "Saving..." : "Create Enrollment"}
            </Button>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Enrollment Records</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Search and manage existing student placements.
                </p>
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | EnrollmentStatus)
                }
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                aria-label="Filter enrollments by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>

            <div className="relative mt-5">
              <Search size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, registration number, programme, year or semester..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
              />
            </div>
          </Card>

          {loading ? (
            <Card>Loading enrolment data...</Card>
          ) : filteredEnrollments.length === 0 ? (
            <Card className="text-center">
              <Users size={52} className="mx-auto text-slate-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No enrollment records found</h2>
              <p className="mt-2 text-slate-600">Create a new enrolment or adjust your filters.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={enrollment.status} />
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                          {enrollment.academicYear || "Academic year not set"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-bold text-slate-950">
                        {enrollment.studentName || "Unnamed student"}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-blue-700">
                        {enrollment.registrationNumber || "No registration number"}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                        <InfoLine
                          icon={GraduationCap}
                          label="Programme"
                          value={enrollment.programmeTitle || "Not set"}
                        />
                        <InfoLine
                          icon={Calendar}
                          label="Semester"
                          value={enrollment.semester || "Not set"}
                        />
                        <InfoLine
                          icon={BookOpen}
                          label="Course Units"
                          value={`${enrollment.courseUnitIds?.length || 0}`}
                        />
                        <InfoLine
                          icon={User}
                          label="Class Group"
                          value={enrollment.classGroup || "Not set"}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => toggleEnrollmentStatus(enrollment.id, enrollment.status)}
                      >
                        {enrollment.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" onClick={() => removeEnrollment(enrollment.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const labelMap: Record<EnrollmentStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    completed: "Completed",
    transferred: "Transferred",
  };

  const classMap: Record<EnrollmentStatus, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-700",
    completed: "bg-blue-100 text-blue-700",
    transferred: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${classMap[status]}`}>
      {labelMap[status]}
    </span>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
      <Icon size={16} className="mt-0.5 text-blue-700" />
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-slate-600">{value}</p>
      </div>
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
