import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CandidatePaperPreview from "../components/assessment/CandidatePaperPreview";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getExaminationById } from "../firebase/examinations";
import type { Examination } from "../models/Examination";

export default function ExaminationDetailsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examination, setExamination] = useState<Examination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!examId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getExaminationById(examId);
        if (active) setExamination(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [examId]);

  return (
    <TutorLayout title="Examination Details" subtitle="Preview the examination paper and reopen it for editing.">
      {loading ? (
        <Card>Loading examination...</Card>
      ) : !examination ? (
        <Card>Examination not found.</Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/tutor/exams")}>
              <ArrowLeft size={17} /> Back to Bank
            </Button>
            <Button onClick={() => navigate(`/tutor/exams/${examination.id}/builder`)}>
              <Edit size={17} /> Open Builder
            </Button>
          </div>

          <CandidatePaperPreview examination={examination} />
        </div>
      )}
    </TutorLayout>
  );
}
