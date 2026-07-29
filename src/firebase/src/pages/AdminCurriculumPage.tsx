import AdminLayout from "../components/layout/AdminLayout";
import CurriculumImportPanel from "../components/curriculum/CurriculumImportPanel";

export default function AdminCurriculumPage() {
  return (
    <AdminLayout
      title="Curriculum AI Import"
      subtitle="Use Medi to extract, compare, review and import an approved curriculum into the academic catalogue."
    >
      <CurriculumImportPanel />
    </AdminLayout>
  );
}
