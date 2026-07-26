import { useCallback, useEffect, useMemo, useState } from "react";
import InstitutionRecordManager from "../components/admin/InstitutionRecordManager";
import AdminLayout from "../components/layout/AdminLayout";
import { createSemester, deleteSemester, getAcademicYears, getSemesters, updateSemester } from "../firebase/institutionCore";
import type { AcademicYear, Semester } from "../models/InstitutionCore";

export default function AdminSemestersPage() {
  const [records, setRecords] = useState<Semester[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => { setLoading(true); try { const [semesterRows, yearRows] = await Promise.all([getSemesters(), getAcademicYears()]); setRecords(semesterRows); setYears(yearRows); } finally { setLoading(false); } }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);
  const options = useMemo(() => years.map((year) => ({ value: year.id, label: year.name })), [years]);
  return <AdminLayout title="Semesters" subtitle="Define semesters and link them to the correct academic year."><InstitutionRecordManager entityLabel="Semester" records={records} loading={loading} onReload={reload} onCreate={createSemester} onUpdate={updateSemester} onDelete={deleteSemester} fields={[
    { name: "name", label: "Semester Name", required: true },
    { name: "academicYearId", label: "Academic Year", type: "select", required: true, options },
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", required: true, options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "archived", label: "Archived" }] },
  ]}/></AdminLayout>;
}
