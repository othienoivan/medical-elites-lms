import { useCallback, useState } from "react";
import InstitutionRecordManager from "../components/admin/InstitutionRecordManager";
import AdminLayout from "../components/layout/AdminLayout";
import { createAcademicYear, deleteAcademicYear, getAcademicYears, updateAcademicYear } from "../firebase/institutionCore";
import type { AcademicYear } from "../models/InstitutionCore";

export default function AdminAcademicYearsPage() {
  const [records, setRecords] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => { setLoading(true); try { setRecords(await getAcademicYears()); } finally { setLoading(false); } }, []);
  return <AdminLayout title="Academic Years" subtitle="Create, activate and archive institutional academic years."><InstitutionRecordManager entityLabel="Academic Year" records={records} loading={loading} onReload={reload} onCreate={createAcademicYear} onUpdate={updateAcademicYear} onDelete={deleteAcademicYear} fields={[
    { name: "name", label: "Academic Year", required: true },
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", required: true, options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "archived", label: "Archived" }] },
  ]}/></AdminLayout>;
}
