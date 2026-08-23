import {
  FileText,
  GraduationCap,
  Layers,
  Save,
  Sparkles,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CandidatePaperPreview from "../components/assessment/CandidatePaperPreview";
import ExaminationBlueprint from "../components/assessment/ExaminationBlueprint";
import MarkingGuidePreview from "../components/assessment/MarkingGuidePreview";
import ExaminationDetailsPanel from "../components/assessment/ExaminationDetailsPanel";
import ExaminationSettingsPanel from "../components/assessment/ExaminationSettingsPanel";
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
import useCourseUnits from "../hooks/useCourseUnits";
import useQuestions from "../hooks/useQuestions";
import { generateAiResponse } from "../firebase/aiAssistant";
import { bulkCreateQuestions } from "../firebase/questions";
import type { Question, QuestionType } from "../models/Question";
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
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [passMark, setPassMark] = useState(50);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [examinationType, setExaminationType] = useState<ExaminationType>("final");
  const [template, setTemplate] = useState<ExaminationTemplate>("uhpab");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [courseUnitTitle, setCourseUnitTitle] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSectionSelection, setAiSectionSelection] = useState({ A: true, B: true, C: true });
  const [targetMarks, setTargetMarks] = useState(100);
  const [previewMode, setPreviewMode] = useState<"candidate" | "marking">("candidate");

  const [sections, setSections] = useState<ExaminationSection[]>(() => createUhpabSections());
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(examId));
  const { courseUnits } = useCourseUnits(true);
  const { questions } = useQuestions();


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
        setDurationMinutes(existing.durationMinutes || 180);
        setPassMark(existing.passMark ?? 50);
        setAttemptsAllowed(existing.attemptsAllowed || 1);
        setOpensAt(existing.opensAt || "");
        setClosesAt(existing.closesAt || "");
        setRandomizeQuestions(Boolean(existing.randomizeQuestions));
        setRandomizeOptions(Boolean(existing.randomizeOptions));
        setShowResultsImmediately(Boolean(existing.showResultsImmediately));
        setYearOfStudy(existing.yearOfStudy || "");
        setExaminationType(existing.examinationType || "final");
        setTemplate((["uhpab", "institutional", "nche", "university"].includes(String(existing.template)) ? existing.template : "uhpab") as ExaminationTemplate);
        setCourseUnitId(existing.courseUnitId || "");
        setCourseUnitTitle(existing.courseUnitTitle || "");
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
    durationMinutes,
    passMark,
    attemptsAllowed,
    opensAt,
    closesAt,
    randomizeQuestions,
    randomizeOptions,
    showResultsImmediately,
    candidateInstructions,
    yearOfStudy,
    examinationType,
    template,
    courseUnitId,
    courseUnitTitle,
    targetMarks,
    sections,
    totalMarks,
    status: "draft",
  };


  const courseQuestions = useMemo(() => questions.filter((question) => question.courseUnitId === courseUnitId && !question.isDeleted), [questions, courseUnitId]);

  function applyUhpabTemplate() {
    setTemplate("uhpab");
    setTargetMarks(100);
    setSections(createUhpabSections());
    setCandidateInstructions("Answer ALL questions in Sections A and B. Answer the essay questions in Section C as instructed by the examiner.");
  }

  async function generateUhpabWithAi() {
    if (!currentUser) return;
    const selectedCourse = courseUnits.find((unit) => unit.id === courseUnitId);
    if (!selectedCourse) { alert("Select the Course Unit before generating the examination."); return; }
    if (!window.confirm("Generate a complete UHPAB paper for the selected Course Unit? Existing section questions will be replaced.")) return;
    try {
      setAiGenerating(true);
      const specs = [
        { key: "A" as const, type: "mcq" as QuestionType, count: 30, marks: 1, label: "Section A" },
        { key: "B" as const, type: "short-answer" as QuestionType, count: 2, marks: 5, label: "Section B", structured: true },
        { key: "C" as const, type: "essay" as QuestionType, count: 3, marks: 20, label: "Section C" },
      ].filter((spec) => aiSectionSelection[spec.key]);
      if (specs.length === 0) { alert("Select at least one examination section for AI generation."); return; }
      const refsByType = new Map<string, Array<{ id: string; questionId: string; order: number; marks: number }>>();
      for (const spec of specs) {
        const reusable = courseQuestions.filter((q) => q.type === spec.type && Number(q.marks || 0) === spec.marks).slice(0, spec.count);
        const refs = reusable.map((q, index) => ({ id: crypto.randomUUID(), questionId: q.id, order: index + 1, marks: spec.marks }));
        const missing = spec.count - refs.length;
        if (missing > 0) {
          const prompt = [
            `Generate exactly ${missing} ${spec.structured ? "structured short-answer" : spec.type} examination question(s) for ${selectedCourse.title}.`,
            `Each question is worth exactly ${spec.marks} mark(s).`,
            "Return ONLY a valid JSON array. Each object must contain questionText, options, correctAnswer, explanation, topic, difficulty, bloomLevel and tags.",
            spec.type === "mcq" ? "For each MCQ provide exactly four options A-D and correctAnswer as A, B, C or D." : "For non-MCQ questions use an empty options array and provide a concise model answer/marking guide in correctAnswer.",
            "Use professional health sciences examination language. Do not include markdown fences.",
          ].join(" ");
          const response = await generateAiResponse({ mode: "tutor_questions", prompt, context: `Course Unit: ${selectedCourse.title}. Description: ${selectedCourse.description || ""}`.slice(0, 40000) });
          const parsed = JSON.parse(response.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()) as Array<Record<string, unknown>>;
          if (!Array.isArray(parsed) || parsed.length < missing) throw new Error(`AI returned fewer than ${missing} usable ${spec.type} questions.`);
          const generated: Question[] = parsed.slice(0, missing).map((row, index) => {
            const optionTexts = Array.isArray(row.options) ? row.options.map(String).slice(0, 4) : [];
            return {
              id: "", programmeId: selectedCourse.programmeId, programmeTitle: selectedCourse.programmeTitle, courseUnitId: selectedCourse.id, courseUnitTitle: selectedCourse.title,
              topic: String(row.topic || selectedCourse.title), type: spec.type, difficulty: (["easy","medium","hard"].includes(String(row.difficulty)) ? String(row.difficulty) : "medium") as Question["difficulty"],
              bloomLevel: (["remember","understand","apply","analyze","evaluate","create"].includes(String(row.bloomLevel)) ? String(row.bloomLevel) : "apply") as Question["bloomLevel"],
              questionText: String(row.questionText || `Generated question ${index + 1}`),
              options: optionTexts.map((text, optionIndex) => ({ id: crypto.randomUUID(), label: String.fromCharCode(65 + optionIndex), text })),
              correctAnswer: String(row.correctAnswer || row.answer || ""), explanation: String(row.explanation || ""), marks: spec.marks, tags: Array.isArray(row.tags) ? row.tags.map(String) : ["AI-generated", "UHPAB"],
              isPublished: false, isDeleted: false, ownerUserId: currentUser.uid, createdByUid: currentUser.uid, assignedTutorIds: [currentUser.uid], institutionId: selectedCourse.institutionId ?? undefined,
            };
          });
          const ids = await bulkCreateQuestions(generated);
          ids.forEach((id) => refs.push({ id: crypto.randomUUID(), questionId: id, order: refs.length + 1, marks: spec.marks }));
        }
        refsByType.set(spec.label, refs);
      }
      const templateSections = createUhpabSections();
      const next = templateSections.map((section) => {
        const label = section.title.split(":")[0];
        if (!refsByType.has(label)) return sections.find((existing) => existing.title.startsWith(label)) || section;
        const refs = refsByType.get(label) || [];
        return { ...section, questions: refs, totalMarks: refs.reduce((sum, ref) => sum + ref.marks, 0) };
      });
      setSections(next); setTemplate("uhpab"); setTargetMarks(100);
      alert("UHPAB examination generated. AI-generated questions were saved as drafts in the Professional Medical Question Bank for tutor review.");
    } catch (error) { console.error("AI examination generation failed:", error); alert(error instanceof Error ? error.message : "AI examination generation failed."); } finally { setAiGenerating(false); }
  }

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

    if (opensAt && closesAt && new Date(closesAt) <= new Date(opensAt)) {
      alert("Closing date and time must be later than the opening date and time.");
      return;
    }

    if (passMark < 0 || passMark > 100) {
      alert("Pass mark must be between 0 and 100 percent.");
      return;
    }

    if (targetMarks > 0 && totalMarks !== targetMarks) {
      alert(`Mark total mismatch: the paper has ${totalMarks} marks but the target is ${targetMarks}.`);
      return;
    }

    if (template === "uhpab") {
      const sectionA = sections.find((section) => section.order === 1);
      const sectionB = sections.find((section) => section.order === 2);
      const sectionC = sections.find((section) => section.order === 3);
      if (!sectionA || sectionA.questions.length !== 30 || sectionA.totalMarks !== 30) {
        alert("UHPAB Section A must contain exactly 30 MCQs totaling 30 marks."); return;
      }
      if (!sectionB || sectionB.questions.length !== 2 || sectionB.totalMarks !== 10) {
        alert("UHPAB Section B must contain exactly 2 structured questions worth 5 marks each (10 marks total)."); return;
      }
      if (!sectionC || sectionC.totalMarks !== 60) {
        alert("UHPAB Section C essay questions must total exactly 60 marks."); return;
      }
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
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <label className="mb-2 block font-semibold text-slate-700">Course Unit</label>
                <select value={courseUnitId} onChange={(event) => { const id = event.target.value; const unit = courseUnits.find((item) => item.id === id); setCourseUnitId(id); setCourseUnitTitle(unit?.title || ""); }} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                  <option value="">Select Course Unit</option>
                  {courseUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
                </select>
                <p className="mt-2 text-sm text-slate-500">AI first reuses suitable questions already linked to this Course Unit, then generates any deficit.</p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                  {(["A","B","C"] as const).map((key) => (
                    <label key={key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <input type="checkbox" checked={aiSectionSelection[key]} onChange={(event) => setAiSectionSelection((current) => ({ ...current, [key]: event.target.checked }))} />
                      Generate Section {key}
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={applyUhpabTemplate}>Reset UHPAB Template</Button>
                  <Button type="button" disabled={aiGenerating || !courseUnitId} onClick={() => void generateUhpabWithAi()}><Sparkles size={17}/>{aiGenerating ? "Generating UHPAB Paper..." : "Generate / Select with AI"}</Button>
                </div>
              </div>
            </div>
          </Card>
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

          <ExaminationSettingsPanel
            durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes}
            passMark={passMark} setPassMark={setPassMark}
            attemptsAllowed={attemptsAllowed} setAttemptsAllowed={setAttemptsAllowed}
            opensAt={opensAt} setOpensAt={setOpensAt}
            closesAt={closesAt} setClosesAt={setClosesAt}
            randomizeQuestions={randomizeQuestions} setRandomizeQuestions={setRandomizeQuestions}
            randomizeOptions={randomizeOptions} setRandomizeOptions={setRandomizeOptions}
            showResultsImmediately={showResultsImmediately} setShowResultsImmediately={setShowResultsImmediately}
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

function createUhpabSections(): ExaminationSection[] {
  return [
    { id: crypto.randomUUID(), title: "Section A: MCQs", instructions: "Answer ALL 30 questions. Each question carries 1 mark.", type: "mcq", order: 1, questions: [], totalMarks: 0 },
    { id: crypto.randomUUID(), title: "Section B: Structured Questions", instructions: "Answer BOTH structured questions. Each question carries 5 marks.", type: "structured", order: 2, questions: [], totalMarks: 0 },
    { id: crypto.randomUUID(), title: "Section C: Essay Questions", instructions: "Answer the essay questions as instructed. Section total: 60 marks.", type: "essay", order: 3, questions: [], totalMarks: 0 },
  ];
}
