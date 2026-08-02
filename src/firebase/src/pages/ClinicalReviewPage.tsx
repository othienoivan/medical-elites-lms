import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { createNotification } from "../firebase/notifications";
import { getClinicalEntryById, reviewClinicalEntry } from "../firebase/clinicalLogbook";
import useAuth from "../hooks/useAuth";
import type { ClinicalLogbookEntry } from "../models/ClinicalLogbook";

export default function ClinicalReviewPage() {
  const { entryId = "" } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [entry, setEntry] = useState<ClinicalLogbookEntry | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getClinicalEntryById(entryId).then((result) => {
      setEntry(result);
      setComment(result?.tutorComment || "");
      setLoading(false);
    });
  }, [entryId]);

  async function handleReview(status: "approved" | "returned" | "rejected") {
    if (!entry || !currentUser) return;
    if (status !== "approved" && !comment.trim()) {
      alert("Please provide feedback before returning or rejecting the entry.");
      return;
    }
    try {
      setSaving(true);
      await reviewClinicalEntry({
        entryId: entry.id,
        status,
        tutorComment: comment,
        reviewedByUid: currentUser.uid,
        reviewedByName: userProfile?.fullName || currentUser.email || "Tutor",
      });
      await createNotification({
        userUid: entry.studentAuthUid,
        title: `Clinical entry ${status}`,
        body: `${entry.procedureName} was ${status}${comment.trim() ? `: ${comment.trim()}` : "."}`,
        type: "clinical",
        link: "/clinical-logbook",
      });
      alert(`Clinical entry ${status}.`);
      navigate("/tutor/clinical-logbook");
    } catch (error) {
      console.error("Failed to review clinical entry:", error);
      alert(error instanceof Error ? error.message : "Failed to review clinical entry.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <TutorLayout title="Clinical Review"><Card>Loading entry...</Card></TutorLayout>;
  if (!entry) return <TutorLayout title="Clinical Review"><Card>Clinical entry not found.</Card></TutorLayout>;

  return (
    <TutorLayout title="Review Clinical Entry" subtitle={`${entry.studentName} · ${entry.registrationNumber}`}>
      <div className="mb-6"><Button variant="outline" onClick={() => navigate("/tutor/clinical-logbook")}><ArrowLeft size={18} /> Back to Queue</Button></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold text-slate-950">{entry.procedureName}</h2>
            <p className="mt-1 text-blue-700">{entry.procedureCategory}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Date" value={entry.procedureDate} /><Info label="Clinical Site" value={entry.clinicalSite} />
              <Info label="Department" value={entry.department || "Not set"} /><Info label="Supervisor" value={entry.supervisorName || "Not set"} />
              <Info label="Patient Age Group" value={entry.patientAgeGroup} /><Info label="Patient Sex" value={entry.patientSex} />
            </div>
          </Card>
          <DetailCard title="Indication / Clinical Reason" value={entry.indication} />
          <DetailCard title="Outcome" value={entry.outcome} />
          <DetailCard title="Student Reflection" value={entry.reflection} />
        </div>

        <Card className="h-fit">
          <h2 className="text-xl font-bold text-slate-950">Tutor Verification</h2>
          <p className="mt-2 text-sm text-slate-600">Provide constructive feedback without adding patient-identifying information.</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={8} placeholder="Tutor comments..." className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3" />
          <div className="mt-5 grid gap-3">
            <Button disabled={saving} variant="success" onClick={() => handleReview("approved")}><CheckCircle2 size={18} /> Approve Entry</Button>
            <Button disabled={saving} variant="outline" onClick={() => handleReview("returned")}><RotateCcw size={18} /> Return for Correction</Button>
            <Button disabled={saving} variant="danger" onClick={() => handleReview("rejected")}><XCircle size={18} /> Reject Entry</Button>
          </div>
        </Card>
      </div>
    </TutorLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900 capitalize">{value}</p></div>;
}
function DetailCard({ title, value }: { title: string; value: string }) {
  return <Card><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{value || "Not provided."}</p></Card>;
}
