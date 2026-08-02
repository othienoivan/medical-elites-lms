import {
  BookOpen,
  Brain,
  Sparkles,
  X,
  ClipboardList,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useQuestions from "../hooks/useQuestions";
import { generateAiResponse } from "../firebase/aiAssistant";
import { extractQuestionRows } from "../utils/questionImport";

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const { questions, loading } = useQuestions();

  const [search, setSearch] = useState("");

  function goToCreateQuestion() {
    sessionStorage.setItem("redirectAfterLogin", "/tutor/questions/new");
    navigate("/tutor/questions/new");
  }

  const filteredQuestions = useMemo(() => {
    const keyword = search.toLowerCase();

    return questions.filter((question) => {
    
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
        question.questionText.toLowerCase().includes(keyword) ||
        question.topic.toLowerCase().includes(keyword) ||
        question.type.toLowerCase().includes(keyword) ||
        question.difficulty.toLowerCase().includes(keyword) ||
        question.bloomLevel.toLowerCase().includes(keyword) ||
        question.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });
  }, [questions, search]);

  return (
    <TutorLayout
      title="Question Bank"
      subtitle="Create, organise and reuse questions across lessons, CATs, module tests and examinations."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Medical Question Bank</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Build reusable MCQs, true/false, SAQs, essays, EMQs and clinical
              questions for all assessments in the LMS.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={goToCreateQuestion}
          >
            <Plus size={18} />
            New Question
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Questions"
          value={loading ? "..." : questions.length}
          icon={BookOpen}
        />

        <StatCard title="Bloom Levels" value="Tracked" icon={Brain} />

        <StatCard title="Assessment Use" value="Reusable" icon={Target} />
      </section>

      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            All Questions
          </h2>

          <p className="mt-1 text-slate-600">
            Search by topic, question text, type, difficulty, Bloom level or
            tags.
          </p>
        </div>

        <div className="relative w-full md:max-w-lg">
          <Search
            size={18}
            className="absolute left-4 top-4 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search question bank..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-700"
          />
        </div>
      </section>

      {loading ? (
        <Card>Loading questions...</Card>
      ) : filteredQuestions.length === 0 ? (
        <Card className="text-center">
          <ClipboardList size={56} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold">No Questions Found</h2>

          <p className="mt-2 text-slate-600">
            Start building your reusable medical question bank.
          </p>

          <Button className="mt-6" onClick={goToCreateQuestion}>
            Create First Question
          </Button>
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
                    <Badge>{question.marks} Marks</Badge>
                  </div>

                  <h2 className="mt-4 text-xl font-bold leading-8 text-slate-950">
                    {question.questionText}
                  </h2>

                  {question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tutor/questions/${question.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    onClick={() =>
                      navigate(`/tutor/questions/${question.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}