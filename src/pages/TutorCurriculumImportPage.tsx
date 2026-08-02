import TutorLayout from "../components/layout/TutorLayout";
import CurriculumImportPanel from "../components/curriculum/CurriculumImportPanel";

export default function TutorCurriculumImportPage() {
  return (
    <TutorLayout
      title="Curriculum AI Import"
      subtitle="Extract, review and import course units, modules, contact hours and credit units from approved curriculum documents."
    >
      <CurriculumImportPanel />
    </TutorLayout>
  );
}
