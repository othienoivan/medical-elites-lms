import { useCallback, useState } from "react";
import InstitutionRecordManager from "../components/admin/InstitutionRecordManager";
import AdminLayout from "../components/layout/AdminLayout";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "../firebase/institutionCore";
import type { Department } from "../models/InstitutionCore";

export default function AdminDepartmentsPage() {
  const [records, setRecords] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => { setLoading(true); try { setRecords(await getDepartments()); } finally { setLoading(false); } }, []);
  return <AdminLayout title="Departments" subtitle="Organize programmes and academic operations under institutional departments."><InstitutionRecordManager entityLabel="Department" records={records} loading={loading} onReload={reload} onCreate={createDepartment} onUpdate={updateDepartment} onDelete={deleteDepartment} fields={[
    { name: "name", label: "Department Name", required: true },
    { name: "code", label: "Department Code", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "status", label: "Status", type: "select", required: true, options: [{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }] },
  ]}/></AdminLayout>;
}
