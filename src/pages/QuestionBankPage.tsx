import {
  BookCopy,
  BookOpen,
  Brain,
  Sparkles,
  X,
  ClipboardList,
  Copy,
  FileUp,
  Plus,
  Search,
  Target,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  bulkCreateQuestions,
  deleteQuestion,
  permanentlyDeleteQuestion,
  duplicateQuestion,
} from "../firebase/questions";
import useAuth from "../hooks/useAuth";
import useQuestions from "../hooks/useQuestions";
import { generateAiResponse } from "../firebase/aiAssistant";
import { extractQuestionRows } from "../utils/questionImport";
import type {
  BloomLevel,
  Question,
  QuestionDifficulty,
  QuestionType,
} from "../models/Question";

const TYPES: Array<{ value: "all" | QuestionType; label: string }> = [
  { value: "all", label: "All types" },
  { value: "mcq", label: "MCQ" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Short Answer" },
  { value: "essay", label: "Essay" },
  { value: "emq", label: "Extended Matching" },
];

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { questions, loading, refresh } = useQuestions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | QuestionType>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | QuestionDifficulty>("all");
  const [bloomFilter, setBloomFilter] = useState<"all" | BloomLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [courseUnitFilter, setCourseUnitFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "course-unit" | "topic">("newest");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [aiCount, setAiCount] = useState(10);
  const [aiType, setAiType] = useState<QuestionType>("mcq");
  const [aiDifficulty, setAiDifficulty] = useState<QuestionDifficulty>("medium");
  const [aiBloom, setAiBloom] = useState<BloomLevel>("apply");

  function goToCreateQuestion() {
    sessionStorage.setItem("redirectAfterLogin", "/tutor/questions/new");
    navigate("/tutor/questions/new");
  }

  const courseUnitOptions = useMemo<Array<[string, string]>>(() => {
    const map = new Map<string, string>();
    questions.forEach((question) => { if (question.courseUnitId) map.set(question.courseUnitId, question.courseUnitTitle || question.courseUnitId); });
    return [...map.entries()].sort((a,b) => a[1].localeCompare(b[1]));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const matched = questions.filter((question) => {
      const matchesSearch = !keyword || [
        question.questionText,
        question.topic,
        question.subtopic ?? "",
        question.type,
        question.difficulty,
        question.bloomLevel,
        question.courseUnitTitle ?? "",
        question.moduleTitle ?? "",
        ...(question.tags ?? []),
      ].some((value) => value.toLowerCase().includes(keyword));

      return matchesSearch
        && (typeFilter === "all" || question.type === typeFilter)
        && (difficultyFilter === "all" || question.difficulty === difficultyFilter)
        && (bloomFilter === "all" || question.bloomLevel === bloomFilter)
        && (courseUnitFilter === "all" || question.courseUnitId === courseUnitFilter)
        && (statusFilter === "all"
          || (statusFilter === "published" ? question.isPublished : !question.isPublished));
    });
    return matched.sort((a, b) => {
      if (sortBy === "course-unit") return (a.courseUnitTitle || "").localeCompare(b.courseUnitTitle || "") || a.topic.localeCompare(b.topic);
      if (sortBy === "topic") return a.topic.localeCompare(b.topic) || a.questionText.localeCompare(b.questionText);
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [questions, search, typeFilter, difficultyFilter, bloomFilter, statusFilter, courseUnitFilter, sortBy]);

  async function handleDelete(question: Question) {
    if (!currentUser) return;
    if (!window.confirm("Move this question out of the active Question Bank? It will be soft-deleted and can be restored by an administrator.")) return;
    try {
      setBusyId(question.id);
      await deleteQuestion(question.id, currentUser.uid);
      await refresh();
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("The question could not be deleted. Confirm that you own it or have administrator access.");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePermanentDelete(question: Question) {
    if (!currentUser) return;
    if (!window.confirm("PERMANENTLY delete this question? It will also be removed from quizzes and professional examinations. This cannot be undone.")) return;
    try { setBusyId(question.id); await permanentlyDeleteQuestion(question.id); await refresh(); }
    catch (error) { console.error("Permanent question deletion failed:", error); alert(error instanceof Error ? error.message : "The question could not be permanently deleted."); }
    finally { setBusyId(null); }
  }

  async function handleDuplicate(question: Question) {
    if (!currentUser) return;
    try {
      setBusyId(question.id);
      await duplicateQuestion(question, currentUser.uid);
      await refresh();
    } catch (error) {
      console.error("Failed to duplicate question:", error);
      alert("The question could not be duplicated.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleImport(file: File) {
    if (!currentUser) return;
    try {
      setImporting(true);
      const rawRows = await extractQuestionRows(file);

      if (rawRows.length === 0) throw new Error("No questions were detected in the file.");
      if (rawRows.length > 400) throw new Error("Import a maximum of 400 questions at a time.");

      const questionsToCreate = rawRows.map((row, index) => normalizeImportedQuestion(
        row,
        index,
        currentUser.uid,
        userProfile?.institutionId,
      ));

      await bulkCreateQuestions(questionsToCreate);
      await refresh();
      alert(`${questionsToCreate.length} question(s) imported successfully.`);
    } catch (error) {
      console.error("Failed to import questions:", error);
      alert(error instanceof Error ? error.message : "Question import failed.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }


  async function handleAiGeneration() {
    if (!currentUser) return;
    if (!aiTopic.trim()) { alert("Enter the topic for question generation."); return; }
    if (aiContext.trim().length < 80) {
      alert("Provide at least 80 characters of source content so the questions remain grounded in your teaching material.");
      return;
    }
    try {
      setAiGenerating(true);
      const prompt = [
        `Create exactly ${Math.max(1, Math.min(50, aiCount))} ${aiType} assessment questions on ${aiTopic.trim()}.`,
        `Difficulty: ${aiDifficulty}. Bloom level: ${aiBloom}.`,
        "Use only the supplied source content. Return ONLY valid JSON as an array.",
        "Each object must contain questionText, options (array; four options for MCQ, two for true-false, otherwise empty), correctAnswer, explanation, topic, difficulty, bloomLevel, marks and tags.",
        "For MCQs, correctAnswer must be the correct option letter A-D. Do not include markdown fences.",
      ].join(" ");
      const response = await generateAiResponse({ mode: "tutor_questions", prompt, context: aiContext.slice(0, 40000) });
      const cleaned = response.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as Array<Record<string, unknown>>;
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("AI returned no usable questions.");
      const generated = parsed.slice(0, 50).map((row, index) => normalizeImportedQuestion(
        { ...row, type: row.type || aiType, difficulty: row.difficulty || aiDifficulty, bloomLevel: row.bloomLevel || aiBloom, topic: row.topic || aiTopic, isPublished: "false" },
        index, currentUser.uid, userProfile?.institutionId,
      ));
      await bulkCreateQuestions(generated);
      await refresh();
      setShowAiGenerator(false);
      setAiContext("");
      alert(`${generated.length} AI-generated question(s) were added as drafts for tutor review.`);
    } catch (error) {
      console.error("AI question generation failed:", error);
      alert(error instanceof Error ? error.message : "AI question generation failed.");
    } finally {
      setAiGenerating(false);
    }
  }

  return (
    <TutorLayout
      title="Question Bank"
      subtitle="Create, organise, import and reuse questions across lessons, CATs, module tests and examinations."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Professional Medical Question Bank</h2>
            <p className="mt-2 max-w-3xl text-blue-100">
              Maintain curriculum-linked questions with Bloom level, difficulty, answer feedback, publication status and reusable assessment metadata.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
            <Button
              variant="outline"
              className="border-white bg-white/10 text-white hover:bg-white/20"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={18} />
              {importing ? "Importing..." : "Import Exam / Questions"}
            </Button>
            <Button
              variant="outline"
              className="border-white bg-white/10 text-white hover:bg-white/20"
              onClick={() => setShowAiGenerator(true)}
            >
              <Sparkles size={18} />
              Generate with AI
            </Button>
            <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={goToCreateQuestion}>
              <Plus size={18} />
              New Question
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Active Questions" value={loading ? "..." : questions.length} icon={BookOpen} />
        <StatCard title="Published" value={loading ? "..." : questions.filter((q) => q.isPublished).length} icon={Target} />
        <StatCard title="Drafts" value={loading ? "..." : questions.filter((q) => !q.isPublished).length} icon={BookCopy} />
        <StatCard title="Bloom Levels" value="6 tracked" icon={Brain} />
      </section>

      <Card className="mb-6">
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search size={18} className="absolute left-4 top-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search question, topic, course unit, module or tag..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
            />
          </div>
          <FilterSelect value={typeFilter} onChange={(v) => setTypeFilter(v as typeof typeFilter)} options={TYPES} label="Question type" />
          <FilterSelect value={difficultyFilter} onChange={(v) => setDifficultyFilter(v as typeof difficultyFilter)} label="Difficulty" options={[
            { value: "all", label: "All difficulties" }, { value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" },
          ]} />
          <FilterSelect value={statusFilter} onChange={(v) => setStatusFilter(v as typeof statusFilter)} label="Status" options={[
            { value: "all", label: "All statuses" }, { value: "published", label: "Published" }, { value: "draft", label: "Draft" },
          ]} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FilterSelect value={courseUnitFilter} onChange={setCourseUnitFilter} label="Course Unit" options={[{ value: "all", label: "All Course Units" }, ...courseUnitOptions.map(([value, label]) => ({ value, label }))]} />
          <FilterSelect value={sortBy} onChange={(value) => setSortBy(value as typeof sortBy)} label="Sort" options={[{ value: "newest", label: "Newest / Updated first" }, { value: "course-unit", label: "Course Unit" }, { value: "topic", label: "Topic" }]} />
          <FilterSelect value={bloomFilter} onChange={(v) => setBloomFilter(v as typeof bloomFilter)} label="Bloom level" options={[
            { value: "all", label: "All Bloom levels" }, { value: "remember", label: "Remember" }, { value: "understand", label: "Understand" }, { value: "apply", label: "Apply" }, { value: "analyze", label: "Analyze" }, { value: "evaluate", label: "Evaluate" }, { value: "create", label: "Create" },
          ]} />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Import a complete PDF, DOCX or TXT examination using numbered questions, A-D options and Answer/Explanation lines. CSV and JSON remain supported for structured bulk imports. Imported and AI-generated questions are saved as drafts for review.
        </p>
      </Card>

      {loading ? (
        <Card>Loading questions...</Card>
      ) : filteredQuestions.length === 0 ? (
        <Card className="text-center">
          <ClipboardList size={56} className="mx-auto text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">No Questions Found</h2>
          <p className="mt-2 text-slate-600">Adjust the filters or create the first reusable medical question.</p>
          <Button className="mt-6" onClick={goToCreateQuestion}>Create Question</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{question.topic}</Badge>
                    <Badge>{question.type}</Badge>
                    <Badge>{question.difficulty}</Badge>
                    <Badge>{question.bloomLevel}</Badge>
                    <Badge>{question.marks} mark(s)</Badge>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${question.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {question.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold leading-8 text-slate-950">{question.questionText}</h2>
                  {(question.courseUnitTitle || question.moduleTitle) && (
                    <p className="mt-2 text-sm text-slate-600">
                      {[question.courseUnitTitle, question.moduleTitle].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  {question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">#{tag}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                  <Button variant="outline" onClick={() => navigate(`/tutor/questions/${question.id}`)}>View</Button>
                  <Button onClick={() => navigate(`/tutor/questions/${question.id}/edit`)}>Edit</Button>
                  <Button variant="outline" disabled={busyId === question.id} onClick={() => void handleDuplicate(question)}>
                    <Copy size={16} /> Duplicate
                  </Button>
                  <Button variant="outline" disabled={busyId === question.id} onClick={() => void handleDelete(question)}>
                    <Trash2 size={16} /> Delete
                  </Button>
                  <Button variant="outline" disabled={busyId === question.id} onClick={() => void handlePermanentDelete(question)} title="Permanently delete question"><Trash2 size={16}/> Delete Permanently</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAiGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="max-h-[92vh] w-full max-w-3xl overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">AI Question Generator</h2>
                <p className="mt-1 text-slate-600">Generate curriculum-grounded draft questions, then review and edit them before publication.</p>
              </div>
              <button aria-label="Close AI generator" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setShowAiGenerator(false)}><X size={22} /></button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2"><span className="mb-2 block font-semibold">Topic</span><input className="w-full rounded-xl border border-slate-300 p-3" value={aiTopic} onChange={(event) => setAiTopic(event.target.value)} placeholder="e.g. Management of severe malaria" /></label>
              <label className="block"><span className="mb-2 block font-semibold">Number of questions</span><input type="number" min="1" max="50" className="w-full rounded-xl border border-slate-300 p-3" value={aiCount} onChange={(event) => setAiCount(Number(event.target.value))} /></label>
              <FilterSelect label="Question type" value={aiType} onChange={(value) => setAiType(value as QuestionType)} options={TYPES.filter((item) => item.value !== "all") as Array<{ value: string; label: string }>} />
              <FilterSelect label="Difficulty" value={aiDifficulty} onChange={(value) => setAiDifficulty(value as QuestionDifficulty)} options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }]} />
              <FilterSelect label="Bloom level" value={aiBloom} onChange={(value) => setAiBloom(value as BloomLevel)} options={[{ value: "remember", label: "Remember" }, { value: "understand", label: "Understand" }, { value: "apply", label: "Apply" }, { value: "analyze", label: "Analyze" }, { value: "evaluate", label: "Evaluate" }, { value: "create", label: "Create" }]} />
              <label className="block md:col-span-2"><span className="mb-2 block font-semibold">Source lesson content</span><textarea className="min-h-56 w-full rounded-xl border border-slate-300 p-3" value={aiContext} onChange={(event) => setAiContext(event.target.value)} placeholder="Paste lesson notes, curriculum content or reference text here. AI will be instructed to use only this content." /></label>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3"><Button variant="outline" onClick={() => setShowAiGenerator(false)}>Cancel</Button><Button disabled={aiGenerating} onClick={() => void handleAiGeneration()}><Sparkles size={18} />{aiGenerating ? "Generating..." : "Generate Draft Questions"}</Button></div>
          </Card>
        </div>
      )}
    </TutorLayout>
  );
}

function normalizeImportedQuestion(
  row: Record<string, unknown>,
  index: number,
  uid: string,
  institutionId?: string,
): Question {
  const value = (key: string) => String(row[key] ?? "").trim();
  const questionText = value("questionText") || value("question") || value("stem");
  const topic = value("topic");
  const suppliedAnswer = value("correctAnswer") || value("answer");
  if (!questionText || !topic) {
    throw new Error(`Row ${index + 1}: questionText and topic are required.`);
  }

  const type = normalizeEnum<QuestionType>(value("type"), ["mcq", "true-false", "short-answer", "essay", "emq"], "mcq");
  const difficulty = normalizeEnum<QuestionDifficulty>(value("difficulty"), ["easy", "medium", "hard"], "medium");
  const bloomLevel = normalizeEnum<BloomLevel>(value("bloomLevel"), ["remember", "understand", "apply", "analyze", "evaluate", "create"], "apply");
  const optionTexts = splitList(row.options ?? row.optionTexts);
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const optionRows = optionTexts.map((text, optionIndex) => ({ id: `opt-${optionIndex + 1}-${crypto.randomUUID()}`, label: labels[optionIndex], text }));
  const answerLetter = suppliedAnswer.match(/^[A-Z]$/i)?.[0]?.toUpperCase();
  const answerIndex = answerLetter ? labels.indexOf(answerLetter) : -1;
  const correctAnswer = answerIndex >= 0 && optionRows[answerIndex]
    ? optionRows[answerIndex].id
    : suppliedAnswer || "Review required";

  return {
    id: "",
    programmeId: value("programmeId") || undefined,
    programmeTitle: value("programmeTitle") || undefined,
    courseUnitId: value("courseUnitId") || undefined,
    courseUnitTitle: value("courseUnitTitle") || undefined,
    moduleId: value("moduleId") || undefined,
    moduleTitle: value("moduleTitle") || undefined,
    topic,
    subtopic: value("subtopic") || undefined,
    type,
    difficulty,
    bloomLevel,
    questionText,
    options: optionRows,
    correctAnswer,
    explanation: value("explanation"),
    marks: Math.max(1, Number(value("marks")) || 1),
    estimatedTimeMinutes: Math.max(1, Number(value("estimatedTimeMinutes")) || 1),
    tags: splitList(row.tags),
    isPublished: ["true", "yes", "1", "published"].includes(value("isPublished").toLowerCase()) || !value("isPublished"),
    isDeleted: false,
    usageCount: 0,
    createdBy: uid,
    ownerUserId: uid,
    createdByUid: uid,
    institutionId,
    assignedTutorIds: [uid],
  };
}

function normalizeEnum<T extends string>(value: string, allowed: T[], fallback: T): T {
  const normalized = value.toLowerCase().replace(/\s+/g, "-") as T;
  return allowed.includes(normalized) ? normalized : fallback;
}

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "").split("|").map((item) => item.trim()).filter(Boolean);
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select aria-label={label} title={label} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">
      {options.map((option) => <option key={`${label}-${option.value}`} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return <Card><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div><Icon size={36} className="text-blue-700" /></div></Card>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{children}</span>;
}
