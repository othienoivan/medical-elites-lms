import {
  Brain,
  BookOpen,
  ClipboardCheck,
  Copy,
  FileQuestion,
  GraduationCap,
  LoaderCircle,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { generateAiResponse } from "../firebase/aiAssistant";
import useAuth from "../hooks/useAuth";
import type { AiAssistantMode } from "../models/AiAssistant";

const studentTemplates: Array<{
  mode: AiAssistantMode;
  title: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
}> = [
  {
    mode: "student_explain",
    title: "Explain a Topic",
    description: "Get a clear, step-by-step medical explanation.",
    icon: BookOpen,
    prompt: "Explain this topic at diploma or undergraduate health-sciences level: ",
  },
  {
    mode: "student_summarize",
    title: "Summarize Notes",
    description: "Turn lesson content into focused revision notes.",
    icon: MessageSquareText,
    prompt: "Summarize the following lesson content into concise revision notes:\n\n",
  },
  {
    mode: "student_quiz",
    title: "Quiz Me",
    description: "Generate questions, then hide the answers until requested.",
    icon: FileQuestion,
    prompt: "Quiz me on this topic using 10 questions of increasing difficulty: ",
  },
  {
    mode: "student_feedback",
    title: "Review My Answer",
    description: "Receive constructive feedback on a short answer.",
    icon: ClipboardCheck,
    prompt: "Review my answer, identify what is correct, what is missing, and provide an improved model answer:\n\n",
  },
];

const tutorTemplates: Array<{
  mode: AiAssistantMode;
  title: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
}> = [
  {
    mode: "tutor_questions",
    title: "Generate Questions",
    description: "Create MCQs, SEQs, essays, OSCEs, or case-based questions.",
    icon: FileQuestion,
    prompt: "Generate a balanced assessment on this topic using Bloom's taxonomy. Include answers and a marking guide: ",
  },
  {
    mode: "tutor_lesson",
    title: "Draft a Lesson",
    description: "Create objectives, lesson flow, activities, and assessment.",
    icon: GraduationCap,
    prompt: "Prepare a competency-based health-sciences lesson plan on: ",
  },
  {
    mode: "tutor_marking_guide",
    title: "Create Marking Guide",
    description: "Produce a structured, point-based marking guide.",
    icon: ClipboardCheck,
    prompt: "Create a detailed marking guide for the following assessment question(s):\n\n",
  },
  {
    mode: "tutor_performance",
    title: "Analyze Performance",
    description: "Interpret class results and suggest remediation.",
    icon: Brain,
    prompt: "Analyze the following anonymized class-performance data and recommend targeted remediation:\n\n",
  },
];

export default function AiAssistantPage() {
  const { userProfile } = useAuth();
  const isTutor = userProfile?.role === "tutor" || userProfile?.role === "admin";
  const templates = useMemo(
    () => (isTutor ? tutorTemplates : studentTemplates),
    [isTutor]
  );

  const [mode, setMode] = useState<AiAssistantMode>(templates[0].mode);
  const [prompt, setPrompt] = useState(templates[0].prompt);
  const [context, setContext] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function chooseTemplate(template: (typeof templates)[number]) {
    setMode(template.mode);
    setPrompt(template.prompt);
    setResponse("");
    setError(null);
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Enter a question or instruction first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await generateAiResponse({ mode, prompt, context });
      setResponse(result.text);
    } catch (caughtError) {
      console.error("AI request failed:", caughtError);
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "The AI assistant could not complete the request.";
      setError(
        message.includes("not-found") || message.includes("UNAVAILABLE")
          ? "The AI service is not deployed yet. Deploy the Firebase function and configure the OPENAI_API_KEY secret."
          : message
      );
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <>
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/15 p-4">
            <Sparkles size={34} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medical Elites AI Assistant</h1>
            <p className="mt-2 max-w-3xl text-blue-100">
              {isTutor
                ? "Generate teaching and assessment materials, then review every output before publishing."
                : "Study with guided explanations, revision questions, summaries, and feedback."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const selected = mode === template.mode;
          return (
            <button
              key={template.mode}
              type="button"
              onClick={() => chooseTemplate(template)}
              className={`rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                selected
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Icon className="text-blue-700" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">{template.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{template.description}</p>
            </button>
          );
        })}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Your request</h2>
          <p className="mt-1 text-sm text-slate-600">
            Do not include patient names, phone numbers, addresses, hospital numbers, or other identifying information.
          </p>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Instruction or question
            </span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={10}
              className="w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-blue-600"
              placeholder="Ask the AI assistant..."
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Optional supporting context
            </span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-blue-600"
              placeholder="Paste anonymized notes, learning objectives, questions, or class data."
            />
          </label>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button className="mt-5" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            {loading ? "Generating..." : "Generate with AI"}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">AI response</h2>
              <p className="mt-1 text-sm text-slate-600">
                AI output may contain errors. Verify clinical and academic content before use.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!response}
              onClick={() => void navigator.clipboard.writeText(response)}
            >
              <Copy size={16} /> Copy
            </Button>
          </div>

          <div className="mt-6 min-h-[420px] whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 leading-7 text-slate-800">
            {loading
              ? "The assistant is preparing your response..."
              : response || "Your generated response will appear here."}
          </div>
        </Card>
      </div>
    </>
  );

  if (isTutor) {
    return (
      <TutorLayout
        title="AI Academic Assistant"
        subtitle="Generate and refine teaching, assessment, and performance-support materials."
      >
        {content}
      </TutorLayout>
    );
  }

  return <main className="min-h-screen bg-slate-100 px-6 py-10"><div className="mx-auto max-w-7xl">{content}</div></main>;
}
