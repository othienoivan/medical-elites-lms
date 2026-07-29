import { useEffect, useState } from "react";
import { Eye, Plus, Save } from "lucide-react";
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
import type {
  LessonBlock,
  LessonBlockType,
} from "../models/LessonBlock";

const blockTypes: { label: string; type: LessonBlockType }[] = [
  { label: "Heading", type: "heading" },
  { label: "Objective", type: "objective" },
  { label: "Rich Text", type: "richtext" },
  { label: "Image", type: "image" },
  { label: "YouTube Video", type: "youtube" },
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

  const [lessonTitle, setLessonTitle] = useState("Visual Lesson Builder");
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setBlocks(lesson.blocks || []);
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

  async function handleSave() {
    if (!lessonId) {
      alert("Open this builder from a saved lesson before saving blocks.");
      return;
    }

    if (!validateDocumentPreviews()) return;

    try {
      setSaving(true);
      await updateLesson(lessonId, { blocks });
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
      await updateLesson(lessonId, { blocks });
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
        </Card>
      </section>

    </TutorLayout>
  );
}

function SortableLessonBlock({
  block,
  onChange,
  onDelete,
}: {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  onDelete: () => void;
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
      />
    </div>
  );
}