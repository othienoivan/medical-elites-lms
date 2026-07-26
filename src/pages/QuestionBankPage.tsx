import {
  BookCopy,
  BookOpen,
  Brain,
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
  duplicateQuestion,
} from "../firebase/questions";
import useAuth from "../hooks/useAuth";
import useQuestions from "../hooks/useQuestions";
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  function goToCreateQuestion() {
    sessionStorage.setItem("redirectAfterLogin", "/tutor/questions/new");
    navigate("/tutor/questions/new");
  }

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return questions.filter((question) => {
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
        && (statusFilter === "all"
          || (statusFilter === "published" ? question.isPublished : !question.isPublished));
    });
  }, [questions, search, typeFilter, difficultyFilter, bloomFilter, statusFilter]);

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
      const text = await file.text();
      const rawRows = file.name.toLowerCase().endsWith(".json")
        ? parseJsonRows(text)
        : parseCsvRows(text);

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
              accept=".csv,.json,text/csv,application/json"
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
              {importing ? "Importing..." : "Import CSV / JSON"}
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
        <div className="mt-4 max-w-sm">
          <FilterSelect value={bloomFilter} onChange={(v) => setBloomFilter(v as typeof bloomFilter)} label="Bloom level" options={[
            { value: "all", label: "All Bloom levels" }, { value: "remember", label: "Remember" }, { value: "understand", label: "Understand" }, { value: "apply", label: "Apply" }, { value: "analyze", label: "Analyze" }, { value: "evaluate", label: "Evaluate" }, { value: "create", label: "Create" },
          ]} />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Import columns: questionText, topic, type, difficulty, bloomLevel, correctAnswer, explanation, marks, options, tags, programmeId, courseUnitId and moduleId. Separate options and tags with a vertical bar (|).
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
                </div>
              </div>
            </Card>
          ))}
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
  const correctAnswer = value("correctAnswer") || value("answer");
  if (!questionText || !topic || !correctAnswer) {
    throw new Error(`Row ${index + 1}: questionText, topic and correctAnswer are required.`);
  }

  const type = normalizeEnum<QuestionType>(value("type"), ["mcq", "true-false", "short-answer", "essay", "emq"], "mcq");
  const difficulty = normalizeEnum<QuestionDifficulty>(value("difficulty"), ["easy", "medium", "hard"], "medium");
  const bloomLevel = normalizeEnum<BloomLevel>(value("bloomLevel"), ["remember", "understand", "apply", "analyze", "evaluate", "create"], "apply");
  const optionTexts = splitList(row.options ?? row.optionTexts);
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
    options: optionTexts.map((text, optionIndex) => ({ id: crypto.randomUUID(), label: labels[optionIndex], text })),
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

function parseJsonRows(text: string): Record<string, unknown>[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("JSON import must contain an array of question objects.");
  return parsed as Record<string, unknown>[];
}

function parseCsvRows(text: string): Record<string, unknown>[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field); field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
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
