import {
  BookOpen,
  Brain,
  CheckCircle,
  GraduationCap,
  Layers,
  Save,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createQuestion, getQuestionById, updateQuestion } from "../firebase/questions";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useProgrammes from "../hooks/useProgrammes";
import type {
  BloomLevel,
  QuestionDifficulty,
  QuestionOption,
  QuestionType,
} from "../models/Question";

export default function CreateQuestionPage() {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const isEditing = Boolean(questionId);
  const { currentUser, userProfile } = useAuth();

  const { programmes } = useProgrammes();
  const { courseUnits } = useCourseUnits(true);
  const { modules } = useModules(undefined, true);

  const [programmeId, setProgrammeId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [type, setType] = useState<QuestionType>("mcq");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>("apply");

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: crypto.randomUUID(), label: "A", text: "" },
    { id: crypto.randomUUID(), label: "B", text: "" },
    { id: crypto.randomUUID(), label: "C", text: "" },
    { id: crypto.randomUUID(), label: "D", text: "" },
    { id: crypto.randomUUID(), label: "E", text: "" },
  ]);

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [marks, setMarks] = useState(1);
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(1);
  const [isPublished, setIsPublished] = useState(true);
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredCourseUnits = programmeId
    ? courseUnits.filter((courseUnit) => courseUnit.programmeId === programmeId)
    : courseUnits;

  const filteredModules = modules.filter(
    (module) => module.courseUnitId === courseUnitId
  );

  const selectedProgramme = programmes.find(
    (programme) => programme.id === programmeId
  );

  const selectedCourseUnit = courseUnits.find(
    (courseUnit) => courseUnit.id === courseUnitId
  );

  const selectedModule = modules.find((module) => module.id === moduleId);

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;
    void getQuestionById(questionId).then((question) => {
      if (!question || cancelled) return;
      setProgrammeId(question.programmeId ?? "");
      setCourseUnitId(question.courseUnitId ?? "");
      setModuleId(question.moduleId ?? "");
      setTopic(question.topic ?? "");
      setSubtopic(question.subtopic ?? "");
      setType(question.type);
      setDifficulty(question.difficulty);
      setBloomLevel(question.bloomLevel);
      setQuestionText(question.questionText);
      setOptions(question.options?.length ? question.options : options);
      setCorrectAnswer(question.correctAnswer ?? "");
      setExplanation(question.explanation ?? "");
      setMarks(question.marks ?? 1);
      setEstimatedTimeMinutes(question.estimatedTimeMinutes ?? 1);
      setTagsText((question.tags ?? []).join(", "));
      setIsPublished(question.isPublished ?? true);
    }).catch((error) => {
      console.error("Failed to load question:", error);
      alert("Failed to load question for editing.");
    });
    return () => { cancelled = true; };
  // options is only a fallback for legacy questions without stored options.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  function updateOption(label: string, value: string) {
    setOptions((current) =>
      current.map((option) =>
        option.label === label ? { ...option, text: value } : option
      )
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!topic.trim() || !questionText.trim() || !correctAnswer.trim()) {
      alert("Please complete topic, question text, and correct answer.");
      return;
    }

    const usableOptions =
      type === "mcq" || type === "emq"
        ? options.filter((option) => option.text.trim())
        : [];

    if ((type === "mcq" || type === "emq") && usableOptions.length < 2) {
      alert("Please add at least two options.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: questionId ?? "",

        programmeId: selectedProgramme?.id,
        programmeTitle: selectedProgramme?.title,

        courseUnitId: selectedCourseUnit?.id,
        courseUnitTitle: selectedCourseUnit?.title,

        moduleId: selectedModule?.id,
        moduleTitle: selectedModule?.title,

        topic,
        subtopic,

        type,
        difficulty,
        bloomLevel,

        questionText,
        options: usableOptions,

        correctAnswer,
        explanation,

        marks,
        estimatedTimeMinutes,

        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        isPublished,
        isDeleted: false,
        usageCount: 0,

        createdBy: currentUser.uid,
        ownerUserId: currentUser.uid,
        createdByUid: currentUser.uid,
        institutionId: userProfile?.institutionId,
        assignedTutorIds: [currentUser.uid],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (questionId) {
        await updateQuestion(questionId, payload);
      } else {
        await createQuestion(payload);
      }

      navigate("/tutor/questions");
    } catch (error) {
      console.error("Failed to create question:", error);
      alert("Failed to create question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TutorLayout
      title={isEditing ? "Edit Question" : "Create Question"}
      subtitle={isEditing ? "Update this reusable question and its classification." : "Add a reusable question to the Medical Elites question bank."}
    >
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <Brain size={46} />

          <div>
            <h2 className="text-3xl font-bold">{isEditing ? "Edit Medical Question" : "New Medical Question"}</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Create reusable questions for lesson quizzes, CATs, module tests,
              mock examinations and final assessments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold text-slate-950">
              Question Details
            </h2>

            <p className="mt-2 text-slate-600">
              Link the question to the curriculum, classify it by difficulty and
              Bloom level, then provide the answer and feedback.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <SelectField
                  label="Programme"
                  value={programmeId}
                  onChange={(value) => {
                    setProgrammeId(value);
                    setCourseUnitId("");
                    setModuleId("");
                  }}
                  options={[
                    { label: "Select Programme", value: "" },
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
                    {
                      label: filteredCourseUnits.length > 0
                        ? "Select Course Unit"
                        : "No course units found",
                      value: "",
                    },
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
                    {
                      label: courseUnitId
                        ? filteredModules.length > 0
                          ? "Select Module"
                          : "No modules found"
                        : "Select Course Unit first",
                      value: "",
                    },
                    ...filteredModules.map((module) => ({
                      label: `Module ${module.order}: ${module.title}`,
                      value: module.id,
                    })),
                  ]}
                />
              </div>

              {(selectedProgramme || selectedCourseUnit || selectedModule) && (
                <div className="grid gap-4 md:grid-cols-3">
                  {selectedProgramme && (
                    <InfoBox
                      icon={GraduationCap}
                      title="Programme"
                      description={selectedProgramme.title}
                    />
                  )}

                  {selectedCourseUnit && (
                    <InfoBox
                      icon={BookOpen}
                      title="Course Unit"
                      description={selectedCourseUnit.title}
                    />
                  )}

                  {selectedModule && (
                    <InfoBox
                      icon={Layers}
                      title="Module"
                      description={selectedModule.title}
                    />
                  )}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Topic">
                  <Input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Malaria"
                    required
                  />
                </Field>

                <Field label="Subtopic">
                  <Input
                    value={subtopic}
                    onChange={(event) => setSubtopic(event.target.value)}
                    placeholder="Severe malaria"
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <SelectField
                  label="Question Type"
                  value={type}
                  onChange={(value) => setType(value as QuestionType)}
                  options={[
                    { label: "MCQ / Single Best Answer", value: "mcq" },
                    { label: "True / False", value: "true-false" },
                    { label: "Short Answer", value: "short-answer" },
                    { label: "Essay", value: "essay" },
                    { label: "Extended Matching", value: "emq" },
                  ]}
                />

                <SelectField
                  label="Difficulty"
                  value={difficulty}
                  onChange={(value) =>
                    setDifficulty(value as QuestionDifficulty)
                  }
                  options={[
                    { label: "Easy", value: "easy" },
                    { label: "Medium", value: "medium" },
                    { label: "Hard", value: "hard" },
                  ]}
                />

                <SelectField
                  label="Bloom Level"
                  value={bloomLevel}
                  onChange={(value) => setBloomLevel(value as BloomLevel)}
                  options={[
                    { label: "Remember", value: "remember" },
                    { label: "Understand", value: "understand" },
                    { label: "Apply", value: "apply" },
                    { label: "Analyze", value: "analyze" },
                    { label: "Evaluate", value: "evaluate" },
                    { label: "Create", value: "create" },
                  ]}
                />
              </div>

              <Field label="Question Text">
                <textarea
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  placeholder="Write the question stem here..."
                  required
                  className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                />
              </Field>

              {(type === "mcq" || type === "emq") && (
                <div className="grid gap-4 md:grid-cols-2">
                  {options.map((option) => (
                    <Field key={option.id} label={`Option ${option.label}`}>
                      <Input
                        value={option.text}
                        onChange={(event) =>
                          updateOption(option.label, event.target.value)
                        }
                        placeholder={`Option ${option.label}`}
                      />
                    </Field>
                  ))}
                </div>
              )}

              {type === "true-false" ? (
                <SelectField
                  label="Correct Answer"
                  value={correctAnswer}
                  onChange={setCorrectAnswer}
                  options={[
                    { label: "Select correct answer", value: "" },
                    { label: "True", value: "True" },
                    { label: "False", value: "False" },
                  ]}
                />
              ) : (
                <Field label="Correct Answer">
                  <Input
                    value={correctAnswer}
                    onChange={(event) => setCorrectAnswer(event.target.value)}
                    placeholder="For MCQ, use A, B, C, D, or E"
                    required
                  />
                </Field>
              )}

              <div className="grid gap-6 md:grid-cols-3">
                <Field label="Marks">
                  <Input
                    type="number"
                    min="1"
                    value={marks}
                    onChange={(event) => setMarks(Number(event.target.value))}
                    required
                  />
                </Field>

                <Field label="Estimated Time (minutes)">
                  <Input
                    type="number"
                    min="1"
                    value={estimatedTimeMinutes}
                    onChange={(event) => setEstimatedTimeMinutes(Number(event.target.value))}
                    required
                  />
                </Field>

                <Field label="Tags">
                  <Input
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    placeholder="malaria, infectious disease, pharmacology"
                  />
                </Field>
              </div>

              <Field label="Publication Status">
                <select
                  aria-label="Publication Status"
                  value={isPublished ? "published" : "draft"}
                  onChange={(event) => setIsPublished(event.target.value === "published")}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                >
                  <option value="published">Published — available for assessment use</option>
                  <option value="draft">Draft — keep private while reviewing</option>
                </select>
              </Field>

              <Field label="Explanation / Feedback">
                <textarea
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  placeholder="Explain why the answer is correct..."
                  className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                />
              </Field>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save size={18} />
                  {loading ? "Saving Question..." : isEditing ? "Update Question" : "Save Question"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tutor/questions")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Question Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <SummaryItem
                icon={Target}
                label="Topic"
                value={topic || "Not set"}
              />

              <SummaryItem
                icon={Brain}
                label="Bloom Level"
                value={bloomLevel}
              />

              <SummaryItem
                icon={CheckCircle}
                label="Question Type"
                value={type}
              />

              <SummaryItem
                icon={BookOpen}
                label="Marks"
                value={`${marks} mark(s)`}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              What Happens Next?
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• The question will be saved in the Question Bank.</li>
              <li>• Tutors can reuse it in quizzes, CATs and exams.</li>
              <li>• Analytics will track how students perform on it.</li>
              <li>• Feedback will appear during answer review.</li>
            </ul>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
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
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
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

function InfoBox({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <Icon className="text-blue-700" size={24} />

        <div>
          <p className="font-semibold text-blue-950">{title}</p>
          <p className="mt-1 text-blue-800">{description}</p>
        </div>
      </div>
    </div>
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