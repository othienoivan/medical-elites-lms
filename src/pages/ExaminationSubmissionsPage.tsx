import { ArrowLeft, BookOpen, Bot, CheckCircle, ChevronRight, Download, FileEdit, Save, Send, ShieldAlert, UserRound } from "lucide-react";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { generateAiResponse } from "../firebase/aiAssistant";
import { getExaminationById } from "../firebase/examinations";
import { getTutorExaminationSubmissions, markExaminationSubmission, releaseExaminationResults, saveAiExaminationMarkingSuggestion } from "../firebase/examinationSubmissions";
import type { ExaminationSubmission } from "../models/ExaminationSubmission";
import { onlineExamAnswerKey, parseOnlineExamination } from "../utils/onlineExaminationParser";

export default function ExaminationSubmissionsPage() {
  const [items, setItems] = useState<ExaminationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [aiWorking, setAiWorking] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedCourseUnit, setSelectedCourseUnit] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await getTutorExaminationSubmissions());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, { title: string; submissions: ExaminationSubmission[] }>();
    items.forEach((item) => {
      const key = item.courseUnitId || item.courseUnitTitle?.trim() || "unassigned";
      const title = item.courseUnitTitle?.trim() || "Unassigned Course Unit";
      const current = groups.get(key) || { title, submissions: [] };
      current.submissions.push(item);
      groups.set(key, current);
    });
    return [...groups.entries()]
      .map(([courseUnitId, value]) => ({
        courseUnitId,
        courseUnit: value.title,
        submissions: value.submissions.sort((a, b) =>
          a.examinationTitle.localeCompare(b.examinationTitle) || a.studentName.localeCompare(b.studentName)
        ),
      }))
      .sort((a, b) => a.courseUnit.localeCompare(b.courseUnit));
  }, [items]);

  const selectedGroup = grouped.find((group) => group.courseUnitId === selectedCourseUnit) ?? null;
  const studentRows = useMemo(() => {
    if (!selectedGroup) return [];
    const students = new Map<string, { studentId: string; studentName: string; submissions: ExaminationSubmission[] }>();
    selectedGroup.submissions.forEach((submission) => {
      const key = submission.studentId || submission.studentName;
      const current = students.get(key) || { studentId: key, studentName: submission.studentName || "Student", submissions: [] };
      current.submissions.push(submission);
      students.set(key, current);
    });
    return [...students.values()].sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [selectedGroup]);
  const selectedStudent = studentRows.find((student) => student.studentId === selectedStudentId) ?? null;

  async function assist(item: ExaminationSubmission) {
    try {
      setAiWorking(item.id);
      const exam = await getExaminationById(item.examinationId);
      if (!exam) throw new Error("Examination could not be loaded.");
      if (exam.uploadedMarkingGuideUrl && !exam.uploadedMarkingGuideExtractedText?.trim()) {
        throw new Error("The uploaded marking guide is not yet readable by AI. Open the examination, replace the marking guide, and save it so its text can be extracted.");
      }
      const authoritativeGuide = exam.uploadedMarkingGuideExtractedText?.trim() || exam.generatedMarkingGuideText?.trim() || "";
      const response = await generateAiResponse({
        mode: "tutor_marking_guide",
        prompt: [
          `Assess this student's examination responses out of ${item.totalMarks} marks.`,
          authoritativeGuide
            ? "The supplied marking guide is authoritative. Mark strictly from it before applying any general clinical knowledge."
            : "No marking guide was supplied. Derive appropriate model answers and a fair point-based scheme from the examination, then mark against it.",
          "Award marks question by question. Feedback must give question-by-question corrections: what was correct, what was missing or incorrect, and the expected answer. Return ONLY JSON with numeric score and string feedback.",
          "This is an advisory draft only; a tutor will review and approve the final mark and corrections.",
        ].join(" "),
        context: [
          `EXAMINATION:\n${exam.uploadedExamExtractedText || ""}`,
          `AUTHORITATIVE MARKING GUIDE:\n${authoritativeGuide || "Not supplied — derive appropriate answers"}`,
          `STUDENT ANSWERS:\n${item.answerText}`,
        ].join("\n\n").slice(0, 45000),
      });
      const parsed = JSON.parse(response.text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()) as { score?: number; feedback?: string };
      const score = Math.min(Math.max(0, Number(parsed.score) || 0), item.totalMarks);
      await saveAiExaminationMarkingSuggestion(item.id, score, String(parsed.feedback || "AI review completed."));
      await load();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "AI-assisted marking failed.");
    } finally {
      setAiWorking(null);
    }
  }

  async function mark(item: ExaminationSubmission) {
    const score = Number(prompt(`Final tutor-approved score for ${item.studentName} out of ${item.totalMarks}:`, String(item.score ?? item.aiSuggestedScore ?? 0)));
    if (!Number.isFinite(score) || score < 0 || score > item.totalMarks) return alert("Enter a valid score within the total marks.");
    const feedback = prompt("Final tutor feedback:", item.tutorFeedback || item.aiSuggestedFeedback || "") ?? "";
    try {
      setSaving(item.id);
      await markExaminationSubmission(item.id, score, item.totalMarks, feedback);
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function release(item: ExaminationSubmission) {
    if (item.status !== "marked") return alert("Approve the final mark and corrections before releasing results.");
    if (!confirm(`Release ${item.studentName}'s result and corrections? The student will be notified.`)) return;
    try {
      setSaving(item.id);
      await releaseExaminationResults(item.id);
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function downloadAttempt(item: ExaminationSubmission) {
    try {
      setDownloading(item.id);
      let questions = item.questionsSnapshot || [];
      if (questions.length === 0) {
        const exam = await getExaminationById(item.examinationId);
        questions = parseOnlineExamination(exam?.uploadedExamExtractedText || "");
      }
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const margin = 16;
      const width = 178;
      let y = 18;

      const write = (text: string, size = 10, bold = false, gap = 2) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        const lines = pdf.splitTextToSize(text || "—", width) as string[];
        const height = Math.max(1, lines.length) * (size * 0.42 + 1.2);
        if (y + height > 282) { pdf.addPage(); y = 18; }
        pdf.text(lines, margin, y);
        y += height + gap;
      };

      write("MEDICAL ELITES", 16, true, 1);
      write("Student Examination Attempt", 14, true, 5);
      write(`Course Unit: ${item.courseUnitTitle || "Unassigned"}`, 10, true);
      write(`Examination: ${item.examinationTitle}`);
      write(`Student: ${item.studentName}`);
      write(`Submission ID: ${item.id}`);
      if (item.score !== undefined) write(`Result: ${item.score}/${item.totalMarks} (${item.percentage ?? 0}%)`);
      y += 3;

      if (questions.length > 0) {
        questions.forEach((question, index) => {
          write(`Question ${question.number} — ${question.section}`, 11, true, 1);
          write(question.prompt, 10, false, 1);
          const answerKey = "answerKey" in question && question.answerKey ? question.answerKey : onlineExamAnswerKey(question, index);
          const rawAnswer = item.answersJson?.[answerKey]?.trim() || item.answersJson?.[String(question.number)]?.trim() || "No response";
          const selectedOption = question.options?.find((option) => option.label === rawAnswer);
          const answer = selectedOption ? `${selectedOption.label}. ${selectedOption.text}` : rawAnswer;
          write(`Student answer: ${answer}`, 10, true, 5);
        });
      } else {
        write("Recorded answers", 11, true);
        write(item.answerText || "No responses were recorded.");
      }

      if (item.tutorFeedback) {
        write("Tutor feedback and corrections", 11, true);
        write(item.tutorFeedback);
      }
      const filename = `${item.studentName}-${item.examinationTitle}-attempt.pdf`
        .replace(/[^a-z0-9._-]+/gi, "-")
        .replace(/-+/g, "-");
      pdf.save(filename);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "The attempted examination PDF could not be generated.");
    } finally {
      setDownloading(null);
    }
  }

  const renderSubmission = (item: ExaminationSubmission) => (
    <Card key={item.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{item.examinationTitle}</h3>
          <p className="mt-1 font-semibold text-slate-800">Student: {item.studentName}</p>
        </div>
        {item.released ? (
          <span className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800"><CheckCircle size={16}/>Results released</span>
        ) : item.status === "marked" ? (
          <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800"><CheckCircle size={16}/>Marked — awaiting release</span>
        ) : null}
      </div>
      {item.answersJson?._integrity && <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 font-semibold text-red-800"><ShieldAlert size={18}/>{item.answersJson._integrity}</p>}
      <div className="mt-5 whitespace-pre-wrap rounded-xl border bg-slate-50 p-5 leading-7">{item.answerText}</div>
      {item.aiSuggestedScore !== undefined && <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4 text-violet-950"><p className="flex items-center gap-2 font-bold"><Bot size={18}/>AI suggestion: {item.aiSuggestedScore}/{item.totalMarks}</p><p className="mt-2 whitespace-pre-wrap text-sm">{item.aiSuggestedFeedback}</p><p className="mt-2 text-xs font-semibold">Tutor review required before this becomes the final mark.</p></div>}
      {item.tutorFeedback && <div className="mt-4 rounded-xl bg-blue-50 p-4 text-blue-900"><strong>Final corrections and feedback:</strong><p className="mt-2 whitespace-pre-wrap">{item.tutorFeedback}</p></div>}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" disabled={downloading === item.id} onClick={() => void downloadAttempt(item)}><Download size={17}/>{downloading === item.id ? "Preparing PDF..." : "Download Attempt PDF"}</Button>
        <Button variant="outline" disabled={aiWorking === item.id || item.released} onClick={() => void assist(item)}><Bot size={17}/>{aiWorking === item.id ? "AI Reviewing..." : "AI Assist Marking"}</Button>
        <Button disabled={saving === item.id || item.released} onClick={() => void mark(item)}><Save size={17}/>{saving === item.id ? "Saving..." : item.status === "marked" ? "Review / Remark" : "Approve Final Mark"}</Button>
        <Button disabled={saving === item.id || item.status !== "marked" || item.released} onClick={() => void release(item)}><Send size={17}/>{item.released ? "Results Released" : "Release Results & Corrections"}</Button>
      </div>
    </Card>
  );

  return (
    <TutorLayout title="Examination Submissions" subtitle="Submissions grouped by course unit, with AI-assisted marking and tutor-controlled release.">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Online Examination Marking</h2>
        <p className="mt-2 text-blue-100">Review and export complete student attempts, approve marks and corrections, then release results.</p>
      </section>
      {loading ? <Card>Loading submissions...</Card> : items.length === 0 ? (
        <Card className="text-center"><FileEdit size={50} className="mx-auto text-slate-400"/><h2 className="mt-4 text-xl font-bold">No examination submissions yet</h2></Card>
      ) : !selectedGroup ? (
        <section>
          <div className="mb-5"><h2 className="text-2xl font-black text-slate-950">Course Units</h2><p className="mt-1 text-slate-600">Select a course unit to see the students who submitted examinations.</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {grouped.map((group) => {
              const uniqueStudents = new Set(group.submissions.map((item) => item.studentId || item.studentName)).size;
              const awaitingReview = group.submissions.filter((item) => item.status !== "marked").length;
              return <button key={group.courseUnitId} type="button" onClick={() => { setSelectedCourseUnit(group.courseUnitId); setSelectedStudentId(null); }} className="rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-blue-100 p-3 text-blue-700"><BookOpen size={24}/></span><ChevronRight className="text-slate-400"/></div>
                <h3 className="mt-4 text-xl font-black text-slate-950">{group.courseUnit}</h3>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-slate-100 p-2"><strong className="block text-lg">{uniqueStudents}</strong>Students</div>
                  <div className="rounded-xl bg-slate-100 p-2"><strong className="block text-lg">{group.submissions.length}</strong>Submissions</div>
                  <div className="rounded-xl bg-amber-50 p-2 text-amber-900"><strong className="block text-lg">{awaitingReview}</strong>Pending</div>
                </div>
              </button>;
            })}
          </div>
        </section>
      ) : !selectedStudent ? (
        <section>
          <button type="button" onClick={() => { setSelectedCourseUnit(null); setSelectedStudentId(null); }} className="mb-5 flex items-center gap-2 font-bold text-blue-700"><ArrowLeft size={18}/>Back to Course Units</button>
          <div className="mb-5 rounded-2xl bg-slate-900 px-5 py-4 text-white"><p className="text-xs font-bold uppercase tracking-wider text-blue-300">Course Unit</p><h2 className="text-2xl font-black">{selectedGroup.courseUnit}</h2><p className="mt-1 text-sm text-slate-300">{studentRows.length} student{studentRows.length === 1 ? "" : "s"} submitted</p></div>
          <div className="space-y-3">
            {studentRows.map((student) => {
              const marked = student.submissions.filter((item) => item.status === "marked").length;
              const released = student.submissions.filter((item) => item.released).length;
              return <button key={student.studentId} type="button" onClick={() => setSelectedStudentId(student.studentId)} className="flex w-full items-center justify-between gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md">
                <div className="flex min-w-0 items-center gap-4"><span className="rounded-full bg-blue-100 p-3 text-blue-700"><UserRound size={22}/></span><div className="min-w-0"><h3 className="truncate text-lg font-black text-slate-950">{student.studentName}</h3><p className="text-sm text-slate-600">{student.submissions.length} submission{student.submissions.length === 1 ? "" : "s"} · {marked} marked · {released} released</p></div></div><ChevronRight className="shrink-0 text-slate-400"/>
              </button>;
            })}
          </div>
        </section>
      ) : (
        <section>
          <button type="button" onClick={() => setSelectedStudentId(null)} className="mb-5 flex items-center gap-2 font-bold text-blue-700"><ArrowLeft size={18}/>Back to Students</button>
          <div className="mb-5 rounded-2xl bg-slate-900 px-5 py-4 text-white"><p className="text-xs font-bold uppercase tracking-wider text-blue-300">{selectedGroup.courseUnit}</p><h2 className="text-2xl font-black">{selectedStudent.studentName}</h2><p className="mt-1 text-sm text-slate-300">{selectedStudent.submissions.length} submitted examination{selectedStudent.submissions.length === 1 ? "" : "s"}</p></div>
          <div className="space-y-5">{selectedStudent.submissions.map(renderSubmission)}</div>
        </section>
      )}
    </TutorLayout>
  );
}
