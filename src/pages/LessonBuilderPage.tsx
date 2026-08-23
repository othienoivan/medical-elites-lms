import { useEffect, useState } from "react";
import { Eye, Plus, Save, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import LessonBlockRenderer from "../components/editor/LessonBlockRenderer";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getLessonById, updateLesson } from "../firebase/lessons";
import { generateAiResponse } from "../firebase/aiAssistant";
import { bulkCreateQuestions } from "../firebase/questions";
import { createQuiz, updateQuiz } from "../firebase/quizzes";
import useQuizzes from "../hooks/useQuizzes";
import useAuth from "../hooks/useAuth";
import type { Question } from "../models/Question";
import { buildLessonAiContext } from "../utils/lessonAiContext";
import type {
  LessonBlock,
  LessonBlockType,
} from "../models/LessonBlock";

const blockTypes: { label: string; type: LessonBlockType }[] = [
  { label: "Heading", type: "heading" },
  { label: "Objective", type: "objective" },
  { label: "Rich Text", type: "richtext" },
  { label: "HTML5 / CSS", type: "html5" },
  { label: "Image", type: "image" },
  { label: "YouTube Video", type: "youtube" },
  { label: "Upload Video", type: "video" },
  { label: "PDF Resource", type: "pdf" },
  { label: "PowerPoint", type: "powerpoint" },
  { label: "Word Document", type: "document" },
  { label: "Clinical Case", type: "clinical-case" },
  { label: "Drug Table", type: "drug-table" },
  { label: "OSCE Station", type: "osce-station" },
  { label: "Question", type: "question" },
  { label: "Knowledge Check", type: "knowledge-check" },
  { label: "Quiz", type: "quiz" },
  { label: "Assignment", type: "assignment" },
];

export default function LessonBuilderPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { quizzes } = useQuizzes();
  const { currentUser, userProfile } = useAuth();

  const [lessonTitle, setLessonTitle] = useState("Visual Lesson Builder");
  const [courseUnitId, setCourseUnitId] = useState<string | undefined>();
  const [moduleId, setModuleId] = useState<string | undefined>();
  const [programmeId, setProgrammeId] = useState<string | undefined>();
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizRequired, setQuizRequired] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [quizPassMark, setQuizPassMark] = useState(80);
  const [quizTimeLimitMinutes, setQuizTimeLimitMinutes] = useState(30);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiObjectivesGenerating, setAiObjectivesGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) return;

      try {
        setLoadingLesson(true);

        const lesson = await getLessonById(lessonId);

        if (!lesson) {
          alert("Lesson not found.");
          return;
        }

        setLessonTitle(lesson.title);
        setCourseUnitId(lesson.courseUnitId ?? lesson.courseId);
        setModuleId(lesson.moduleId);
        setProgrammeId(lesson.programmeId);
        setBlocks(lesson.blocks || []);
        setQuizRequired(lesson.quizRequired === true || lesson.completionCriteria?.passQuiz === true);
        setQuizId(lesson.quizId || "");
        setQuizPassMark(Math.max(0, Math.min(100, Number(lesson.quizPassMark ?? 80))));
      } catch (error) {
        console.error("Failed to load lesson:", error);
        alert("Failed to load lesson.");
      } finally {
        setLoadingLesson(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  function addBlock(type: LessonBlockType) {
    setBlocks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type,
        title: "",
        content: "",
        url: "",
        metadata: {},
      },
    ]);
  }

  function updateBlock(updatedBlock: LessonBlock) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  }

  function deleteBlock(blockId: string) {
    setBlocks((current) => current.filter((block) => block.id !== blockId));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setBlocks((current) => {
      const oldIndex = current.findIndex((block) => block.id === active.id);
      const newIndex = current.findIndex((block) => block.id === over.id);

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  async function generateSmartObjectivesWithAi() {
    if (!lessonId || !currentUser) {
      alert("Save and reopen this lesson before generating SMART objectives.");
      return;
    }

    try {
      setAiObjectivesGenerating(true);

      // Save the latest builder state so AI reads the same content the tutor sees.
      await updateLesson(lessonId, { blocks });
      const savedLesson = await getLessonById(lessonId);
      if (!savedLesson) {
        throw new Error("Lesson not found after saving. Please reopen the lesson builder.");
      }

      // Existing objective blocks are excluded from the source context so AI derives
      // objectives from the actual teaching content instead of simply rewriting old ones.
      const sourceBlocks = blocks.filter((block) => block.type !== "objective");
      const context = buildLessonAiContext({ ...savedLesson, blocks: sourceBlocks });

      if (context.length < 80) {
        alert(
          "There is not enough readable lesson content to create reliable SMART objectives. Add or upload readable lesson content first.",
        );
        return;
      }

      const response = await generateAiResponse({
        mode: "tutor_questions",
        prompt: `Read the supplied lesson content and generate 3 to 5 SMART learning objectives for this lesson. Each objective must be Specific, Measurable, Achievable, Relevant and Time-bound to completion of this lesson. Use observable Bloom's taxonomy action verbs. Start each objective with "By the end of this lesson, the learner will be able to..." and ensure it can be assessed. Avoid vague verbs such as know, understand, learn or appreciate. Return ONLY valid JSON as an array of strings, with one complete objective per item.`,
        context,
      });

      const cleaned = response.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      const arrayStart = cleaned.indexOf("[");
      const arrayEnd = cleaned.lastIndexOf("]");
      const jsonText = arrayStart >= 0 && arrayEnd > arrayStart
        ? cleaned.slice(arrayStart, arrayEnd + 1)
        : cleaned;

      const parsed = JSON.parse(jsonText) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error("AI returned an invalid SMART-objective response.");
      }

      const objectives = parsed
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object" && "objective" in item) {
            return String((item as { objective?: unknown }).objective ?? "").trim();
          }
          return "";
        })
        .filter((item) => item.length >= 20)
        .slice(0, 5);

      if (objectives.length < 3) {
        throw new Error("AI did not return enough valid SMART objectives. Please try again.");
      }

      setBlocks((current) => {
        const existingObjectiveIndex = current.findIndex((block) => block.type === "objective");
        const objectiveBlock: LessonBlock = {
          id: existingObjectiveIndex >= 0 ? current[existingObjectiveIndex].id : crypto.randomUUID(),
          type: "objective",
          title: "SMART Learning Objectives",
          content: objectives.join("\n"),
          url: "",
          metadata: {
            ...(existingObjectiveIndex >= 0 ? current[existingObjectiveIndex].metadata : {}),
            aiGenerated: true,
            objectiveFramework: "SMART",
            generatedAt: new Date().toISOString(),
          },
        };

        if (existingObjectiveIndex >= 0) {
          return current.map((block, index) => index === existingObjectiveIndex ? objectiveBlock : block);
        }

        return [objectiveBlock, ...current];
      });

      alert(
        `${objectives.length} SMART lesson objectives were generated from the lesson content. Review or edit them, then click SAVE LESSON.`,
      );
    } catch (error) {
      console.error("SMART objective generation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "AI could not generate SMART lesson objectives.",
      );
    } finally {
      setAiObjectivesGenerating(false);
    }
  }


  function validateDocumentPreviews() {
    const unsupportedLegacyFile = blocks.find((block) => {
      if ((block.type !== "powerpoint" && block.type !== "document") || !block.url) return false;
      const fileName = String(block.metadata?.fileName || block.url).toLowerCase();
      return fileName.endsWith(".ppt") || fileName.endsWith(".doc");
    });

    if (unsupportedLegacyFile) {
      alert("Legacy .ppt and .doc files cannot be converted reliably. Please save the file as .pptx or .docx and upload it again.");
      return false;
    }

    return true;
  }


  async function generateLessonQuizWithAi() {
    if (!lessonId || !currentUser) {
      alert("Save and reopen this lesson before generating assessment questions.");
      return;
    }

    try {
      setAiGenerating(true);

      // Persist the tutor's latest builder edits first, then build AI context from
      // the complete lesson document (description, objectives, sections, blocks
      // and readable metadata). This avoids false "not enough text" failures when
      // content lives outside block.content or in structured lesson fields.
      await updateLesson(lessonId, { blocks });
      const savedLesson = await getLessonById(lessonId);
      if (!savedLesson) throw new Error("Lesson not found after saving. Please reopen the lesson builder.");
      const context = buildLessonAiContext({ ...savedLesson, blocks });

      if (context.length < 80) {
        alert(
          "There is not enough readable lesson text yet. Add a lesson description, objectives, rich text, clinical content, or readable HTML text before generating questions.",
        );
        return;
      }

      const response = await generateAiResponse({
        mode: "tutor_questions",
        prompt:
          "Generate exactly 10 assessment questions strictly from this lesson content: 6 single-best-answer MCQs, 2 short-answer questions and 2 essay questions. Return ONLY valid JSON as an array. Every item must contain type (mcq|short-answer|essay), questionText, options (4 strings for MCQ, empty array otherwise), correctIndex (0-3 for MCQ, 0 otherwise), modelAnswer, markingGuide, explanation, difficulty (easy|medium|hard), bloomLevel (remember|understand|apply|analyze|evaluate|create), topic and marks. Essay marking guides must be explicit point-based criteria whose allocated points add up exactly to marks.",
        context,
      });

      const cleaned = response.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned) as Array<Record<string, unknown>>;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("AI returned no usable lesson questions.");
      }

      const generated = parsed.slice(0, 20).map<Question>((item) => {
        const type = ["mcq", "short-answer", "essay"].includes(String(item.type))
          ? (String(item.type) as Question["type"])
          : "mcq";
        const optionTexts = type === "mcq" && Array.isArray(item.options)
          ? item.options.map(String).slice(0, 4)
          : [];
        if (type === "mcq" && optionTexts.length !== 4) {
          throw new Error("AI returned an MCQ without four options.");
        }
        const correctIndex = Math.max(0, Math.min(3, Number(item.correctIndex) || 0));
        const optionIds = optionTexts.map((_, index) => String.fromCharCode(65 + index));
        const marks = Math.max(1, Math.floor(Number(item.marks) || (type === "essay" ? 10 : type === "short-answer" ? 5 : 1)));
        const modelAnswer = String(item.modelAnswer || "").trim();
        const markingGuide = String(item.markingGuide || "").trim();

        return {
          id: "",
          programmeId,
          courseUnitId,
          moduleId,
          moduleTitle: lessonTitle,
          topic: String(item.topic || lessonTitle),
          type,
          difficulty: (["easy", "medium", "hard"].includes(String(item.difficulty))
            ? String(item.difficulty)
            : "medium") as Question["difficulty"],
          bloomLevel: (["remember", "understand", "apply", "analyze", "evaluate", "create"].includes(String(item.bloomLevel))
            ? String(item.bloomLevel)
            : "understand") as Question["bloomLevel"],
          questionText: String(item.questionText || "").trim(),
          options: optionTexts.map((text, index) => ({
            id: optionIds[index],
            label: optionIds[index],
            text,
          })),
          correctAnswer: type === "mcq" ? optionIds[correctIndex] : modelAnswer,
          explanation: markingGuide
            ? `${String(item.explanation || "")}\n\nMARKING GUIDE:\n${markingGuide}`.trim()
            : String(item.explanation || ""),
          marks,
          tags: [lessonTitle, "lesson-quiz", "AI-generated"],
          isPublished: true,
          ownerUserId: currentUser.uid,
          createdBy: currentUser.uid,
          createdByUid: currentUser.uid,
          institutionId: userProfile?.institutionId,
          assignedTutorIds: [currentUser.uid],
        };
      }).filter((question) => question.questionText.length > 10);

      if (generated.length === 0) {
        throw new Error("AI did not produce valid lesson questions.");
      }

      const questionIds = await bulkCreateQuestions(generated);
      const questionRefs = questionIds.map((questionId, index) => ({
        id: crypto.randomUUID(),
        questionId,
        order: index + 1,
        marks: generated[index]?.marks ?? 1,
      }));
      const totalMarks = questionRefs.reduce((sum, item) => sum + item.marks, 0);
      const normalizedPassMark = Math.max(0, Math.min(100, Number(quizPassMark || 80)));

      let targetQuizId = quizId;
      if (targetQuizId) {
        await updateQuiz(targetQuizId, {
          title: `${lessonTitle} - Lesson Quiz`,
          description: `AI-assisted lesson assessment for ${lessonTitle}. Tutor review recommended before learner use.`,
          assessmentType: "lesson-quiz",
          programmeId,
          courseUnitId,
          moduleId,
          lessonId,
          lessonTitle,
          questions: questionRefs,
          totalMarks,
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          status: "published",
        });
      } else {
        targetQuizId = await createQuiz({
          id: "",
          title: `${lessonTitle} - Lesson Quiz`,
          description: `AI-assisted lesson assessment for ${lessonTitle}. Tutor review recommended before learner use.`,
          assessmentType: "lesson-quiz",
          programmeId,
          courseUnitId,
          moduleId,
          lessonId,
          lessonTitle,
          questions: questionRefs,
          totalMarks,
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          attemptsAllowed: 3,
          randomizeQuestions: true,
          randomizeOptions: true,
          showFeedbackImmediately: false,
          status: "published",
          createdBy: currentUser.uid,
        });
      }

      setQuizId(targetQuizId);
      setQuizRequired(true);
      await updateLesson(lessonId, {
        blocks,
        quizId: targetQuizId,
        quizRequired: true,
        quizPassMark: normalizedPassMark,
        completionCriteria: { passQuiz: true },
      });

      alert(
        `${generated.length} AI-generated lesson questions were saved to the Question Bank and linked to this lesson quiz. Review them before teaching use.`,
      );
    } catch (error) {
      console.error("AI lesson question generation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "AI could not generate lesson questions.",
      );
    } finally {
      setAiGenerating(false);
    }
  }
  async function handleSave() {
    if (!lessonId) {
      alert("Open this builder from a saved lesson before saving blocks.");
      return;
    }

    if (!validateDocumentPreviews()) return;

    try {
      setSaving(true);
      if (quizRequired && !quizId) {
        alert("Select a published quiz before requiring a lesson assessment.");
        return;
      }

      const normalizedPassMark = Math.max(0, Math.min(100, Number(quizPassMark || 0)));

      await updateLesson(lessonId, {
        blocks,
        quizRequired,
        quizId: quizRequired ? quizId : "",
        quizPassMark: quizRequired ? normalizedPassMark : undefined,
        completionCriteria: {
          passQuiz: quizRequired,
        },
      });

      if (quizRequired && quizId) {
        await updateQuiz(quizId, {
          assessmentType: "lesson-quiz",
          lessonId,
          lessonTitle,
          courseUnitId,
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          status: "published",
        });
      }
      alert("Lesson saved successfully.");
    } catch (error) {
      console.error("Failed to save lesson:", error);
      alert("Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!lessonId) {
      alert("Open this builder from a saved lesson before previewing.");
      return;
    }

    if (!validateDocumentPreviews()) return;

    try {
      setSaving(true);
      if (quizRequired && !quizId) {
        alert("Select a published quiz before requiring a lesson assessment.");
        return;
      }

      const normalizedPassMark = Math.max(0, Math.min(100, Number(quizPassMark || 0)));

      await updateLesson(lessonId, {
        blocks,
        quizRequired,
        quizId: quizRequired ? quizId : "",
        quizPassMark: quizRequired ? normalizedPassMark : undefined,
        completionCriteria: {
          passQuiz: quizRequired,
        },
      });

      if (quizRequired && quizId) {
        await updateQuiz(quizId, {
          assessmentType: "lesson-quiz",
          lessonId,
          lessonTitle,
          courseUnitId,
          passMark: normalizedPassMark,
          timeLimitMinutes: Math.max(1, Math.floor(quizTimeLimitMinutes || 30)),
          status: "published",
        });
      }
      navigate(`/tutor/lessons/${lessonId}/preview`);
    } catch (error) {
      console.error("Failed to save before preview:", error);
      alert("Failed to save lesson before preview.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title={lessonTitle}
      subtitle={
        lessonId
          ? "Build and save rich lesson content."
          : "Open a saved lesson from Lesson Manager to save content."
      }
    >
      <div className="sticky top-0 z-20 mb-6 rounded-2xl border-2 border-blue-700 bg-blue-50 p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              Lesson Saving Panel
            </h2>
            <p className="mt-1 text-sm font-medium text-blue-800">
              {lessonId
                ? "Add blocks, arrange them, then save or preview the lesson."
                : "Open this builder from Lesson Manager to enable saving."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/tutor/lessons")}
            >
              Back to Lessons
            </Button>

            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={saving || loadingLesson}
            >
              <Eye size={18} />
              Preview Lesson
            </Button>


            <Button
              variant="outline"
              onClick={() => void generateSmartObjectivesWithAi()}
              disabled={aiObjectivesGenerating || aiGenerating || saving || loadingLesson || !lessonId}
            >
              <Sparkles size={18} />
              {aiObjectivesGenerating ? "Generating SMART Objectives..." : "Generate SMART Objectives with AI"}
            </Button>

            <Button
              variant="outline"
              onClick={() => void generateLessonQuizWithAi()}
              disabled={aiGenerating || aiObjectivesGenerating || saving || loadingLesson || !lessonId}
            >
              <Sparkles size={18} />
              {aiGenerating ? "Generating Questions..." : "Generate Lesson Questions with AI"}
            </Button>            <Button
              onClick={handleSave}
              disabled={saving || loadingLesson}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              <Save size={18} />
              {saving ? "Saving..." : "SAVE LESSON"}
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Lesson Workspace
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Drag blocks to reorder them.
            </p>
          </div>

          <div className="mt-6">
            {loadingLesson ? (
              <p className="text-slate-600">Loading lesson...</p>
            ) : blocks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <p className="font-semibold text-slate-700">
                  No lesson blocks added yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Use the tools panel to add lesson, resource, medical, and
                  assessment blocks.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((block) => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <SortableLessonBlock
                        key={block.id}
                        block={block}
                        onChange={updateBlock}
                        onDelete={() => deleteBlock(block.id)}
                        lessonId={lessonId}
                        courseUnitId={courseUnitId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Add Block</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select a block type to add it to the lesson.
          </p>

          <div className="mt-6 grid gap-3">
            {blockTypes.map((blockType) => (
              <button
                key={blockType.type}
                type="button"
                onClick={() => addBlock(blockType.type)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-white"
              >
                <Plus size={16} />
                {blockType.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">
              Lesson Blocks
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Total blocks: {blocks.length}
            </p>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-bold text-amber-950">Lesson progression assessment</h3>
            <p className="mt-1 text-sm text-amber-800">
              Require the learner to pass a quiz before the next lesson unlocks.
            </p>

            <label className="mt-4 flex items-center gap-3 font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={quizRequired}
                onChange={(event) => setQuizRequired(event.target.checked)}
              />
              Require a quiz before progressing to the next lesson
            </label>

            {quizRequired && (
              <div className="mt-4 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Lesson Quiz
                  <select
                    value={quizId}
                    onChange={(event) => {
                      const selectedQuizId = event.target.value;
                      setQuizId(selectedQuizId);

                      const selectedQuiz = quizzes.find(
                        (quiz) => quiz.id === selectedQuizId,
                      );

                      if (selectedQuiz?.timeLimitMinutes) {
                        setQuizTimeLimitMinutes(
                          Math.max(
                            1,
                            Math.floor(Number(selectedQuiz.timeLimitMinutes)),
                          ),
                        );
                      }
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                  >
                    <option value="">Select a published quiz</option>
                    {quizzes
                      .filter((quiz) => quiz.status === "published")
                      .filter((quiz) => !courseUnitId || !quiz.courseUnitId || quiz.courseUnitId === courseUnitId)
                      .map((quiz) => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title} ({quiz.passMark}% current pass mark)
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Mandatory Pass Mark (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizPassMark}
                    onChange={(event) =>
                      setQuizPassMark(
                        Math.max(0, Math.min(100, Number(event.target.value))),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                  />
                </label>

                <p className="text-xs leading-5 text-amber-800">
                  The quiz's existing maximum-attempt setting remains authoritative. If the learner exhausts all attempts without reaching this pass mark, the next lesson stays locked.
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>

    </TutorLayout>
  );
}

function SortableLessonBlock({
  block,
  onChange,
  onDelete,
  lessonId,
  courseUnitId,
}: {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  onDelete: () => void;
  lessonId?: string;
  courseUnitId?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-60" : ""}
    >
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:cursor-grabbing"
        >
          Drag
        </button>
      </div>

      <LessonBlockRenderer
        block={block}
        onChange={onChange}
        onDelete={onDelete}
        lessonId={lessonId}
        courseUnitId={courseUnitId}
      />
    </div>
  );
}