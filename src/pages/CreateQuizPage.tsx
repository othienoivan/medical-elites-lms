import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createQuiz } from "../firebase/quizzes";
import { generateAiResponse } from "../firebase/aiAssistant";
import { bulkCreateQuestions } from "../firebase/questions";
import { getLessons } from "../firebase/lessons";
import useAccessScope from "../hooks/useAccessScope";
import type { Question } from "../models/Question";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useProgrammes from "../hooks/useProgrammes";
import useQuestions from "../hooks/useQuestions";
import type { QuizQuestionRef, QuizStatus } from "../models/Quiz";

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const scope = useAccessScope();

  const { programmes } = useProgrammes();
  const { courseUnits } = useCourseUnits(true);
  const { modules } = useModules(undefined, true);
  const { questions, loading: questionsLoading, refresh: refreshQuestions } = useQuestions();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [programmeId, setProgrammeId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [passMark, setPassMark] = useState(50);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);

  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showFeedbackImmediately, setShowFeedbackImmediately] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestionRef[]>(
    []
  );

  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    const requestedModuleId = searchParams.get("moduleId") || "";
    const requestedCourseUnitId = searchParams.get("courseUnitId") || "";
    const requestedPassMark = Number(searchParams.get("passMark") || "");
    if (requestedCourseUnitId) setCourseUnitId(requestedCourseUnitId);
    if (requestedModuleId) setModuleId(requestedModuleId);
    if (Number.isFinite(requestedPassMark) && requestedPassMark > 0) setPassMark(requestedPassMark);
    const requestedModule = modules.find(item => item.id === requestedModuleId);
    if (requestedModule?.programmeId) setProgrammeId(requestedModule.programmeId);
    if (requestedModule && !title) setTitle(`${requestedModule.title} Quiz`);
  }, [modules, searchParams, title]);

  const selectedProgramme = programmes.find((item) => item.id === programmeId);
  const selectedCourseUnit = courseUnits.find((item) => item.id === courseUnitId);
  const selectedModule = modules.find((item) => item.id === moduleId);

  const filteredCourseUnits = programmeId
    ? courseUnits.filter((item) => item.programmeId === programmeId)
    : courseUnits;

  const filteredModules = modules.filter(
    (item) => item.courseUnitId === courseUnitId
  );

  const filteredQuestions = useMemo(() => {
    const keyword = search.toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        question.questionText.toLowerCase().includes(keyword) ||
        question.topic.toLowerCase().includes(keyword) ||
        question.tags.some((tag) => tag.toLowerCase().includes(keyword));

      const matchesProgramme = programmeId
        ? question.programmeId === programmeId
        : true;

      const matchesCourseUnit = courseUnitId
        ? question.courseUnitId === courseUnitId
        : true;

      const matchesModule = moduleId ? question.moduleId === moduleId : true;

      return (
        matchesSearch &&
        matchesProgramme &&
        matchesCourseUnit &&
        matchesModule
      );
    });
  }, [questions, search, programmeId, courseUnitId, moduleId]);

  const totalMarks = selectedQuestions.reduce(
    (sum, question) => sum + question.marks,
    0
  );

  function toggleQuestion(questionId: string, marks: number) {
    setSelectedQuestions((current) => {
      const exists = current.some((item) => item.questionId === questionId);

      if (exists) {
        return current.filter((item) => item.questionId !== questionId);
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          questionId,
          order: current.length + 1,
          marks,
        },
      ];
    });
  }

  function isSelected(questionId: string) {
    return selectedQuestions.some((item) => item.questionId === questionId);
  }


  async function generateQuestionsWithAi() {
    if (!selectedModule || !scope || !currentUser) {
      alert("Select a module before asking AI to create questions.");
      return;
    }
    try {
      setAiGenerating(true);
      const lessonRows = await getLessons(selectedModule.id, scope, true);
      const context = lessonRows.map((lesson) => {
        const blockText = (lesson.blocks || [])
          .map((block) =>
            [block.title, block.content, block.metadata?.fileName]
              .filter(Boolean)
              .join(" "),
          )
          .join("\n");

        return `${lesson.title}\n${lesson.description ?? ""}\n${blockText}`;
      })
      .join("\n\n")
      .slice(0, 40000);
      if (context.trim().length < 80) {
        alert("This module has insufficient lesson text for reliable AI question generation. Add lesson content or extracted document text first.");
        return;
      }
      const response = await generateAiResponse({
        mode: "tutor_questions",
        prompt: "Create exactly 10 single-best-answer MCQs strictly from the supplied module content. Return ONLY valid JSON as an array. Each object must contain questionText, options (exactly 4 strings), correctIndex (0-3), explanation, difficulty (easy|medium|hard), bloomLevel (remember|understand|apply|analyze), topic, and marks.",
        context,
      });
      const cleaned = response.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as Array<Record<string, unknown>>;
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("AI returned no usable questions.");
      const generated = parsed.slice(0, 20).map<Question>((item) => {
        const optionTexts = Array.isArray(item.options) ? item.options.map(String).slice(0, 4) : [];
        if (optionTexts.length !== 4) throw new Error("AI returned a question without four options.");
        const correctIndex = Math.max(0, Math.min(3, Number(item.correctIndex) || 0));
        const optionIds = optionTexts.map((_, index) => String.fromCharCode(65 + index));
        return {
          id: "",
          programmeId: selectedProgramme?.id ?? selectedModule.programmeId,
          programmeTitle: selectedProgramme?.title,
          courseUnitId: selectedCourseUnit?.id ?? selectedModule.courseUnitId,
          courseUnitTitle: selectedCourseUnit?.title,
          moduleId: selectedModule.id,
          moduleTitle: selectedModule.title,
          topic: String(item.topic || selectedModule.title),
          type: "mcq",
          difficulty: (["easy","medium","hard"].includes(String(item.difficulty)) ? String(item.difficulty) : "medium") as Question["difficulty"],
          bloomLevel: (["remember","understand","apply","analyze","evaluate","create"].includes(String(item.bloomLevel)) ? String(item.bloomLevel) : "understand") as Question["bloomLevel"],
          questionText: String(item.questionText || "").trim(),
          options: optionTexts.map((text, index) => ({ id: optionIds[index], label: String.fromCharCode(65 + index), text })),
          correctAnswer: optionIds[correctIndex],
          explanation: String(item.explanation || ""),
          marks: Math.max(1, Number(item.marks) || 1),
          tags: [selectedModule.title, "AI-generated"],
          isPublished: true,
          ownerUserId: currentUser.uid,
          createdBy: currentUser.uid,
          createdByUid: currentUser.uid,
          institutionId: userProfile?.institutionId,
          assignedTutorIds: [currentUser.uid],
        };
      }).filter(item => item.questionText.length > 10);
      const ids = await bulkCreateQuestions(generated);
      setSelectedQuestions(ids.map((questionId, index) => ({ id: crypto.randomUUID(), questionId, order: index + 1, marks: generated[index]?.marks || 1 })));
      await refreshQuestions();
      alert(`${ids.length} AI-generated questions were added to the Question Bank and selected for this quiz.`);
    } catch (error) {
      console.error("AI quiz generation failed", error);
      alert(error instanceof Error ? error.message : "AI could not generate the quiz questions.");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSave(status: QuizStatus) {
    if (!currentUser) {
      navigate("/login?redirect=/tutor/quizzes/new");
      return;
    }

    if (!title.trim()) {
      alert("Please enter quiz title.");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Please select at least one question.");
      return;
    }

    try {
      setSaving(true);

      await createQuiz({
        id: "",
        title,
        description,
assessmentType: "lesson-quiz",
        programmeId: selectedProgramme?.id,
        programmeTitle: selectedProgramme?.title,

        courseUnitId: selectedCourseUnit?.id,
        courseUnitTitle: selectedCourseUnit?.title,

        moduleId: selectedModule?.id,
        moduleTitle: selectedModule?.title,

        questions: selectedQuestions.map((item, index) => {
          const sourceQuestion = questions.find(
            (question) => question.id === item.questionId
          );

          return {
            ...item,
            order: index + 1,
            question: sourceQuestion?.questionText,
            options: sourceQuestion?.options.map((option) => option.text),
            correctAnswer: sourceQuestion?.correctAnswer,
            explanation: sourceQuestion?.explanation,
          };
        }),

        totalMarks,
        passMark,
        timeLimitMinutes,
        attemptsAllowed,

        randomizeQuestions,
        randomizeOptions,
        showFeedbackImmediately,

        status,

        createdBy: currentUser.email || currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate("/tutor/quizzes");
    } catch (error) {
      console.error("Failed to create quiz:", error);
      alert(error instanceof Error ? error.message : "Failed to create quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title="Create Quiz"
      subtitle="Build a medical quiz using reusable questions from the Question Bank."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={aiGenerating || !moduleId} onClick={() => void generateQuestionsWithAi()}>
          {aiGenerating ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>} {aiGenerating ? "Generating from lesson content..." : "Generate Quiz with AI"}
        </Button>
        <p className="self-center text-sm text-slate-600">AI uses the selected module's saved lesson text and extracted document content.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Quiz Title
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Mid-Semester Pharmacology Quiz"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Brief quiz description..."
                className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                label="Programme"
                value={programmeId}
                onChange={(value) => {
                  setProgrammeId(value);
                  setCourseUnitId("");
                  setModuleId("");
                }}
                options={[
                  { label: "All Programmes", value: "" },
                  ...programmes.map((programme) => ({
                    label: `${programme.title} — ${programme.level}`,
                    value: programme.id,
                  })),
                ]}
              />

              <SelectField
                label="Course Unit"
                value={courseUnitId}
                onChange={(value) => {
                  setCourseUnitId(value);
                  setModuleId("");
                  const courseUnit = courseUnits.find((item) => item.id === value);
                  if (courseUnit?.programmeId) setProgrammeId(courseUnit.programmeId);
                }}
                options={[
                  { label: "All Course Units", value: "" },
                  ...filteredCourseUnits.map((courseUnit) => ({
                    label: courseUnit.title,
                    value: courseUnit.id,
                  })),
                ]}
              />

              <SelectField
                label="Module"
                value={moduleId}
                onChange={setModuleId}
                disabled={!courseUnitId}
                options={[
                  { label: "All Modules", value: "" },
                  ...filteredModules.map((module) => ({
                    label: `Module ${module.order}: ${module.title}`,
                    value: module.id,
                  })),
                ]}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <NumberField
                label="Pass Mark"
                value={passMark}
                onChange={setPassMark}
              />

              <NumberField
                label="Time Limit Minutes"
                value={timeLimitMinutes}
                onChange={setTimeLimitMinutes}
              />

              <NumberField
                label="Attempts Allowed"
                value={attemptsAllowed}
                onChange={setAttemptsAllowed}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <CheckboxField
                label="Randomize Questions"
                checked={randomizeQuestions}
                onChange={setRandomizeQuestions}
              />

              <CheckboxField
                label="Randomize Options"
                checked={randomizeOptions}
                onChange={setRandomizeOptions}
              />

              <CheckboxField
                label="Show Instant Feedback"
                checked={showFeedbackImmediately}
                onChange={setShowFeedbackImmediately}
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-slate-950">
                Question Bank
              </h2>

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search questions by topic, tag, or question text..."
                className="mt-4"
              />

              <div className="mt-5 space-y-3">
                {questionsLoading ? (
                  <p className="text-slate-600">Loading questions...</p>
                ) : filteredQuestions.length === 0 ? (
                  <p className="text-slate-600">No questions found.</p>
                ) : (
                  filteredQuestions.map((question) => (
                    <label
                      key={question.id}
                      className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected(question.id)}
                        onChange={() =>
                          toggleQuestion(question.id, question.marks)
                        }
                        className="mt-1"
                      />

                      <div>
                        <p className="font-semibold text-slate-900">
                          {question.questionText}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {question.topic} · {question.type} ·{" "}
                          {question.difficulty} · {question.marks} mark(s)
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Quiz Summary</h2>

          <div className="mt-5 space-y-3 text-slate-700">
            <p>Selected Questions: {selectedQuestions.length}</p>
            <p>Total Marks: {totalMarks}</p>
            <p>Pass Mark: {passMark}</p>
            <p>Time Limit: {timeLimitMinutes} minutes</p>
            <p>Attempts: {attemptsAllowed}</p>
          </div>

          <div className="mt-6 grid gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSave("draft")}
            >
              Save Draft
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSave("published")}
            >
              {saving ? "Saving..." : "Publish Quiz"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/tutor/quizzes")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </TutorLayout>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  const id = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={id}
        aria-label={label}
        title={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <Input
        type="number"
        min="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}