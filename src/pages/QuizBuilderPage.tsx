import { useEffect, useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import QuestionPicker from "../components/assessment/QuestionPicker";
import SelectedQuestionsPanel from "../components/assessment/SelectedQuestionsPanel";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createQuiz, getQuizById, updateQuiz } from "../firebase/quizzes";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useProgrammes from "../hooks/useProgrammes";
import type { Question } from "../models/Question";
import type { AssessmentType, QuizQuestionRef } from "../models/Quiz";

const assessmentTypes: {
  value: AssessmentType;
  label: string;
}[] = [
  { value: "lesson-quiz", label: "Lesson Quiz" },
  { value: "short-quiz", label: "Short Quiz" },
  { value: "cat", label: "Continuous Assessment Test (CAT)" },
  { value: "module-test", label: "Module Test" },
  { value: "practice-test", label: "Practice Test" },
  { value: "mock-exam", label: "Mock Examination" },
  { value: "final-exam", label: "Final Examination" },
];

export default function QuizBuilderPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const { programmes } = useProgrammes();
  const { courseUnits } = useCourseUnits(true);
  const { modules } = useModules();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [programmeId, setProgrammeId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [assessmentType, setAssessmentType] =
    useState<AssessmentType>("lesson-quiz");

  const [assessmentCode, setAssessmentCode] = useState("");
  const [weightPercentage, setWeightPercentage] =
    useState<number | undefined>();

  const [passMark, setPassMark] = useState(50);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);

  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showFeedbackImmediately, setShowFeedbackImmediately] = useState(true);

  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [accessPassword, setAccessPassword] = useState("");
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);

  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestionRef[]>(
    []
  );

  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(quizId));


  useEffect(() => {
    if (!quizId) return;

    const existingId = quizId;
    let active = true;

    async function loadExistingQuiz() {
      try {
        const existing = await getQuizById(existingId);

        if (!active) return;

        if (!existing) {
          alert("Assessment not found.");
          navigate("/tutor/quizzes");
          return;
        }

        setTitle(existing.title || "");
        setDescription(existing.description || "");
        setProgrammeId(existing.programmeId || "");
        setCourseUnitId(existing.courseUnitId || "");
        setModuleId(existing.moduleId || "");
        setAssessmentType(existing.assessmentType || "lesson-quiz");
        setAssessmentCode(existing.assessmentCode || "");
        setWeightPercentage(existing.weightPercentage ?? undefined);
        setPassMark(existing.passMark ?? 50);
        setTimeLimitMinutes(existing.timeLimitMinutes ?? 60);
        setAttemptsAllowed(existing.attemptsAllowed ?? 1);
        setRandomizeQuestions(Boolean(existing.randomizeQuestions));
        setRandomizeOptions(Boolean(existing.randomizeOptions));
        setShowFeedbackImmediately(existing.showFeedbackImmediately !== false);
        setAvailableFrom(toDateTimeInput(existing.availableFrom));
        setAvailableUntil(toDateTimeInput(existing.availableUntil));
        setRequiresPassword(Boolean(existing.requiresPassword));
        setAccessPassword(existing.accessPassword || "");
        setAllowLateSubmission(Boolean(existing.allowLateSubmission));
        setSelectedQuestions(existing.questions || []);
      } catch (error) {
        console.error("Failed to load assessment:", error);
        alert("Failed to load assessment.");
      } finally {
        if (active) setLoadingExisting(false);
      }
    }

    void loadExistingQuiz();

    return () => {
      active = false;
    };
  }, [navigate, quizId]);

  const totalMarks = selectedQuestions.reduce(
    (sum, question) => sum + question.marks,
    0
  );

  const filteredCourseUnits = courseUnits.filter(
    (courseUnit) => courseUnit.programmeId === programmeId
  );

  const filteredModules = modules.filter(
    (module) => module.courseUnitId === courseUnitId
  );

  const selectedProgramme = programmes.find((item) => item.id === programmeId);
  const selectedCourseUnit = courseUnits.find(
    (item) => item.id === courseUnitId
  );
  const selectedModule = modules.find((item) => item.id === moduleId);

  const selectedAssessmentLabel =
    assessmentTypes.find((type) => type.value === assessmentType)?.label ||
    "Assessment";

  function addQuestion(question: Question) {
    if (!question.id) {
      alert("This question has no valid database ID. Refresh the question bank and try again.");
      return;
    }

    const alreadySelected = selectedQuestions.some(
      (item) => item.questionId === question.id
    );

    if (alreadySelected) return;

    setSelectedQuestions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        questionId: question.id,
        order: current.length + 1,
        marks: question.marks,
      },
    ]);
  }

  function removeQuestion(questionId: string) {
    setSelectedQuestions((current) =>
      current
        .filter((item) => item.questionId !== questionId)
        .map((item, index) => ({
          ...item,
          order: index + 1,
        }))
    );
  }

  async function handleSave(status: "draft" | "published") {
    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    if (!programmeId) {
      alert("Please select a programme.");
      return;
    }

    if (!courseUnitId) {
      alert("Please select a course unit.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter assessment title.");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    if (requiresPassword && !accessPassword.trim()) {
      alert("Please enter the access password or disable password protection.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: quizId || "",
        title: title.trim(),
        description: description.trim(),

        assessmentType,
        assessmentCode: assessmentCode.trim() || undefined,
        weightPercentage: weightPercentage ?? null,

        programmeId,
        programmeTitle: selectedProgramme?.title || "",

        courseUnitId,
        courseUnitTitle: selectedCourseUnit?.title || "",

        moduleId: moduleId || undefined,
        moduleTitle: selectedModule?.title || undefined,

        questions: selectedQuestions,
        totalMarks,
        passMark,
        timeLimitMinutes,
        attemptsAllowed,

        randomizeQuestions,
        randomizeOptions,
        showFeedbackImmediately,

        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,

        requiresPassword,
        accessPassword: requiresPassword ? accessPassword.trim() : "",

        isArchived: false,
        allowLateSubmission,

        status,
        createdBy: currentUser.email || currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (quizId) {
        await updateQuiz(quizId, payload);
      } else {
        await createQuiz(payload);
      }

      navigate("/tutor/quizzes");
    } catch (error) {
      console.error("Failed to save assessment:", error);
      alert(error instanceof Error ? error.message : "Failed to save assessment.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingExisting) {
    return (
      <TutorLayout title="Assessment Builder" subtitle="Loading assessment...">
        <Card>Loading assessment...</Card>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title={quizId ? "Edit Assessment" : "Universal Assessment Builder"}
      subtitle={
        quizId
          ? "Update assessment questions, settings and availability."
          : "Create lesson quizzes, CATs, module tests, practice tests, mock exams and final assessments."
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold text-slate-950">
              Assessment Details
            </h2>

            <p className="mt-2 text-slate-600">
              Define the assessment category, timing, pass mark, grading weight
              and student attempt rules.
            </p>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="mb-5 text-lg font-bold text-blue-800">
                Academic Hierarchy
              </h3>

              <div className="grid gap-5 md:grid-cols-3">
                <SelectField
                  label="Programme"
                  value={programmeId}
                  onChange={(value) => {
                    setProgrammeId(value);
                    setCourseUnitId("");
                    setModuleId("");
                  }}
                  options={[
                    { value: "", label: "Select Programme" },
                    ...programmes.map((programme) => ({
                      value: programme.id,
                      label: programme.title,
                    })),
                  ]}
                />

                <SelectField
                  label="Course Unit"
                  value={courseUnitId}
                  onChange={(value) => {
                    setCourseUnitId(value);
                    setModuleId("");
                  }}
                  options={[
                    { value: "", label: "Select Course Unit" },
                    ...filteredCourseUnits.map((courseUnit) => ({
                      value: courseUnit.id,
                      label: courseUnit.title,
                    })),
                  ]}
                />

                <SelectField
                  label="Module"
                  value={moduleId}
                  onChange={setModuleId}
                  options={[
                    { value: "", label: "Select Module" },
                    ...filteredModules.map((module) => ({
                      value: module.id,
                      label: module.title,
                    })),
                  ]}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="assessment-type"
                  className="mb-2 block font-semibold text-slate-700"
                >
                  Assessment Type
                </label>

                <select
                  id="assessment-type"
                  aria-label="Assessment Type"
                  title="Assessment Type"
                  value={assessmentType}
                  onChange={(event) =>
                    setAssessmentType(event.target.value as AssessmentType)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                >
                  {assessmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Assessment Title
                </label>

                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="General Pathology CAT 1"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Assessment Code
                </label>

                <Input
                  value={assessmentCode}
                  onChange={(event) => setAssessmentCode(event.target.value)}
                  placeholder="CAT I, MT-01, MOCK-2026"
                />
              </div>

              <NumberField
                label="Contribution to Final Mark (%)"
                value={weightPercentage ?? ""}
                onChange={(value) =>
                  setWeightPercentage(value === 0 ? undefined : value)
                }
                allowEmpty
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Brief instructions or description for students..."
                className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <NumberField
                label="Pass Mark (%)"
                value={passMark}
                onChange={setPassMark}
              />

              <NumberField
                label="Time Limit (Minutes)"
                value={timeLimitMinutes}
                onChange={setTimeLimitMinutes}
              />

              <NumberField
                label="Attempts Allowed"
                value={attemptsAllowed}
                onChange={setAttemptsAllowed}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
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
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-slate-950">
              Availability & Access Control
            </h2>

            <p className="mt-2 text-slate-600">
              Control when students can access this assessment and whether a
              password is required.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <DateTimeField
                label="Available From"
                value={availableFrom}
                onChange={setAvailableFrom}
              />

              <DateTimeField
                label="Available Until"
                value={availableUntil}
                onChange={setAvailableUntil}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <CheckboxField
                label="Require Access Password"
                checked={requiresPassword}
                onChange={setRequiresPassword}
              />

              <CheckboxField
                label="Allow Late Submission"
                checked={allowLateSubmission}
                onChange={setAllowLateSubmission}
              />
            </div>

            {requiresPassword && (
              <div className="mt-5">
                <label className="mb-2 block font-semibold text-slate-700">
                  Access Password
                </label>

                <Input
                  value={accessPassword}
                  onChange={(event) => setAccessPassword(event.target.value)}
                  placeholder="Enter assessment password"
                />
              </div>
            )}
          </Card>

          <QuestionPicker
            selectedQuestions={selectedQuestions}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
          />
        </div>

        <div className="space-y-6">
          <SelectedQuestionsPanel
            questions={selectedQuestions}
            onRemove={removeQuestion}
          />

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Assessment Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p>Programme: {selectedProgramme?.title || "Not set"}</p>
              <p>Course Unit: {selectedCourseUnit?.title || "Not set"}</p>
              <p>Module: {selectedModule?.title || "Not set"}</p>
              <p>Type: {selectedAssessmentLabel}</p>
              <p>Code: {assessmentCode || "Not set"}</p>
              <p>Total Questions: {selectedQuestions.length}</p>
              <p>Total Marks: {totalMarks}</p>
              <p>Pass Mark: {passMark}%</p>
              <p>Time Limit: {timeLimitMinutes} minutes</p>
              <p>Attempts Allowed: {attemptsAllowed}</p>
              <p>
                Weight:{" "}
                {weightPercentage === undefined
                  ? "Not set"
                  : `${weightPercentage}%`}
              </p>
              <p>Available From: {availableFrom || "Not set"}</p>
              <p>Available Until: {availableUntil || "Not set"}</p>
              <p>Password: {requiresPassword ? "Required" : "Not required"}</p>
              <p>Late Submission: {allowLateSubmission ? "Allowed" : "Blocked"}</p>
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

              <Button disabled={saving} onClick={() => handleSave("published")}>
                <CheckCircle size={16} />
                {saving ? "Publishing..." : "Publish Assessment"}
              </Button>

              <Button variant="ghost" onClick={() => navigate("/tutor/quizzes")}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}

function NumberField({
  label,
  value,
  onChange,
  allowEmpty = false,
}: {
  label: string;
  value: number | "";
  onChange: (value: number) => void;
  allowEmpty?: boolean;
}) {
  const id = `number-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <Input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(event) => {
          if (allowEmpty && event.target.value === "") {
            onChange(0);
            return;
          }

          onChange(Number(event.target.value));
        }}
      />
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `datetime-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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


function toDateTimeInput(value: unknown): string {
  if (!value) return "";

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    date = (value as { toDate: () => Date }).toDate();
  } else {
    date = new Date(value as string);
  }

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
