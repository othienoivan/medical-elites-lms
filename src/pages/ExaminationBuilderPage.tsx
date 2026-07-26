import {
  FileText,
  GraduationCap,
  Layers,
  Save,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CandidatePaperPreview from "../components/assessment/CandidatePaperPreview";
import ExaminationBlueprint from "../components/assessment/ExaminationBlueprint";
import MarkingGuidePreview from "../components/assessment/MarkingGuidePreview";
import ExaminationDetailsPanel from "../components/assessment/ExaminationDetailsPanel";
import SectionBuilder from "../components/assessment/SectionBuilder";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  createExamination,
  getExaminationById,
  updateExamination,
} from "../firebase/examinations";
import useAuth from "../hooks/useAuth";
import type {
  Examination,
  ExaminationSection,
  ExaminationStatus,
  ExaminationTemplate,
  ExaminationType,
} from "../models/Examination";

export default function ExaminationBuilderPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [examinationName, setExaminationName] = useState("");
  const [institutionName, setInstitutionName] = useState(
    "Medical Elites Institute"
  );
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [timeAllowed, setTimeAllowed] = useState("");
  const [candidateInstructions, setCandidateInstructions] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [examinationType, setExaminationType] = useState<ExaminationType>("final");
  const [template, setTemplate] = useState<ExaminationTemplate>("institutional");
  const [targetMarks, setTargetMarks] = useState(100);
  const [previewMode, setPreviewMode] = useState<"candidate" | "marking">("candidate");

  const [sections, setSections] = useState<ExaminationSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(examId));


  useEffect(() => {
    if (!examId) return;

    const existingId = examId;
    let active = true;

    async function loadExistingExamination() {
      try {
        const existing = await getExaminationById(existingId);

        if (!active) return;

        if (!existing) {
          alert("Examination not found.");
          navigate("/tutor/exams");
          return;
        }

        setTitle(existing.title || "");
        setExaminationName(existing.examinationName || "");
        setInstitutionName(existing.institutionName || "Medical Elites Institute");
        setAcademicYear(existing.academicYear || "");
        setSemester(existing.semester || "");
        setTimeAllowed(existing.timeAllowed || "");
        setCandidateInstructions(existing.candidateInstructions || "");
        setYearOfStudy(existing.yearOfStudy || "");
        setExaminationType(existing.examinationType || "final");
        setTemplate(existing.template || "institutional");
        setTargetMarks(existing.targetMarks || existing.totalMarks || 100);
        setSections(existing.sections || []);
      } catch (error) {
        console.error("Failed to load examination:", error);
        alert("Failed to load examination.");
      } finally {
        if (active) setLoadingExisting(false);
      }
    }

    void loadExistingExamination();

    return () => {
      active = false;
    };
  }, [examId, navigate]);

  const totalMarks = sections.reduce(
    (sum, section) => sum + section.totalMarks,
    0
  );

  const examinationPreview: Examination = {
    id: "",
    title,
    description: "",
    institutionName,
    examinationName,
    academicYear,
    semester,
    timeAllowed,
    candidateInstructions,
    yearOfStudy,
    examinationType,
    template,
    targetMarks,
    sections,
    totalMarks,
    status: "draft",
  };

  async function handleSave(status: ExaminationStatus) {
    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter examination title.");
      return;
    }

    if (!examinationName.trim()) {
      alert("Please enter examination name.");
      return;
    }

    if (sections.length === 0) {
      alert("Please add at least one examination section.");
      return;
    }

    if (sections.some((section) => section.questions.length === 0)) {
      alert("Every examination section must contain at least one question.");
      return;
    }

    if (targetMarks > 0 && totalMarks !== targetMarks) {
      alert(`Mark total mismatch: the paper has ${totalMarks} marks but the target is ${targetMarks}.`);
      return;
    }

    try {
      setSaving(true);

      const payload: Examination = {
        ...examinationPreview,
        id: examId || "",
        status,
        createdBy: currentUser.email || currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (examId) {
        await updateExamination(examId, payload);
      } else {
        await createExamination(payload);
      }

      navigate("/tutor/exams");
    } catch (error) {
      console.error("Failed to save examination:", error);
      alert("Failed to save examination.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingExisting) {
    return (
      <TutorLayout title="Examination Builder" subtitle="Loading examination...">
        <Card>Loading examination...</Card>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title={examId ? "Edit Examination" : "Examination Builder"}
      subtitle={
        examId
          ? "Update the examination paper, sections and marking structure."
          : "Create professional candidate papers, examiner papers and marking guides."
      }
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <FileText size={46} />

          <div>
            <h2 className="text-3xl font-bold">
              Professional Examination Builder
            </h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Build sectioned examination papers with candidate instructions,
              total marks, timing, preview and publishing workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Sections"
          value={sections.length}
          icon={Layers}
        />

        <StatCard
          title="Total Marks"
          value={totalMarks}
          icon={GraduationCap}
        />

        <StatCard
          title="Time Allowed"
          value={timeAllowed || "Not set"}
          icon={Timer}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ExaminationDetailsPanel
            title={title}
            setTitle={setTitle}
            examinationName={examinationName}
            setExaminationName={setExaminationName}
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
            semester={semester}
            setSemester={setSemester}
            timeAllowed={timeAllowed}
            setTimeAllowed={setTimeAllowed}
            candidateInstructions={candidateInstructions}
            setCandidateInstructions={setCandidateInstructions}
            yearOfStudy={yearOfStudy}
            setYearOfStudy={setYearOfStudy}
            examinationType={examinationType}
            setExaminationType={setExaminationType}
            template={template}
            setTemplate={setTemplate}
            targetMarks={targetMarks}
            setTargetMarks={setTargetMarks}
          />

          <SectionBuilder sections={sections} setSections={setSections} />
          <ExaminationBlueprint sections={sections} totalMarks={totalMarks} />
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Examination Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <SummaryItem
                icon={FileText}
                label="Title"
                value={title || "Not set"}
              />

              <SummaryItem
                icon={Layers}
                label="Sections"
                value={`${sections.length}`}
              />

              <SummaryItem
                icon={GraduationCap}
                label="Total Marks"
                value={`${totalMarks}`}
              />

              <SummaryItem
                icon={Timer}
                label="Time Allowed"
                value={timeAllowed || "Not set"}
              />
            </div>

            <div className="mt-6 grid gap-3">
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => handleSave("draft")}
              >
                <Save size={16} />
                Save Draft
              </Button>

              <Button
                disabled={saving}
                onClick={() => handleSave("published")}
              >
                <FileText size={16} />
                {saving ? "Saving..." : "Publish Examination"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/tutor/exams")}
              >
                Cancel
              </Button>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant={previewMode === "candidate" ? "primary" : "outline"} onClick={() => setPreviewMode("candidate")}>Candidate Paper</Button>
            <Button variant={previewMode === "marking" ? "primary" : "outline"} onClick={() => setPreviewMode("marking")}>Marking Guide</Button>
          </div>
          {previewMode === "candidate" ? <CandidatePaperPreview examination={examinationPreview} /> : <MarkingGuidePreview examination={examinationPreview} />}
        </div>
      </div>
    </TutorLayout>
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

        <Icon size={36} className="text-blue-700" />
      </div>
    </Card>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <Icon size={18} className="mt-0.5 text-blue-700" />

      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-slate-600">{value}</p>
      </div>
    </div>
  );
}