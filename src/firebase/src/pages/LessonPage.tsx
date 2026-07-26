import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Download,
  FileText,
  PlayCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import LessonViewer from "../components/lesson/LessonViewer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { getLessons } from "../firebase/lessons";
import type { Lesson } from "../models/Lesson";
import type { LessonBlock } from "../models/LessonBlock";
import useAccessScope from "../hooks/useAccessScope";

export default function LessonPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const scope = useAccessScope();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      if (!moduleId || !scope) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await getLessons(moduleId, scope);

        setLessons(
          data.sort((a: Lesson, b: Lesson) => {
            if (a.order !== b.order) {
              return a.order - b.order;
            }

            return a.title.localeCompare(b.title);
          })
        );
      } catch (error) {
        console.error("Failed to load lessons:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, [moduleId, scope]);

  const activeLesson = lessons[activeLessonIndex];

  const lessonBlocks = useMemo(() => {
    if (!activeLesson) return [];

    if (activeLesson.blocks && activeLesson.blocks.length > 0) {
      return activeLesson.blocks;
    }

    return convertLegacyLessonToBlocks(activeLesson);
  }, [activeLesson]);

  function goToPreviousLesson() {
    setActiveLessonIndex((current) => Math.max(current - 1, 0));
  }

  function goToNextLesson() {
    setActiveLessonIndex((current) =>
      Math.min(current + 1, lessons.length - 1)
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Loading lesson...</Card>
        </Container>
      </main>
    );
  }

  if (!activeLesson) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card className="text-center">
            <BookOpen className="mx-auto text-slate-400" size={48} />

            <h1 className="mt-4 text-2xl font-bold text-slate-950">
              No lessons found
            </h1>

            <p className="mt-2 text-slate-600">
              This module does not have published lessons yet.
            </p>

            <Button className="mt-6" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <p className="text-sm font-semibold text-blue-700">
              {activeLesson.moduleTitle}
            </p>

            <h1 className="text-2xl font-bold text-slate-950">
              Lesson {activeLesson.order}: {activeLesson.title}
            </h1>

            <p className="mt-1 text-slate-600">
              {activeLesson.description}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            <Clock size={16} />
            {activeLesson.estimatedMinutes} minutes
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-bold text-slate-950">
                Module Lessons
              </h2>

              <div className="mt-5 space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonIndex(index)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      index === activeLessonIndex
                        ? "bg-blue-700 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Lesson {lesson.order}: {lesson.title}
                  </button>
                ))}
              </div>
            </Card>

            {activeLesson.resources && activeLesson.resources.length > 0 && (
              <Card className="mt-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Resources
                </h2>

                <div className="mt-4 space-y-3">
                  {activeLesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-blue-700 hover:bg-white"
                    >
                      {resource.type === "video" ||
                      resource.type === "youtube" ? (
                        <PlayCircle size={18} />
                      ) : resource.type === "pdf" ||
                        resource.type === "ppt" ? (
                        <Download size={18} />
                      ) : (
                        <FileText size={18} />
                      )}

                      {resource.title}
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </aside>

          <section className="lg:col-span-3">
            <Card>
              <LessonViewer blocks={lessonBlocks} />

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:justify-between">
                <Button
                  variant="outline"
                  disabled={activeLessonIndex === 0}
                  onClick={goToPreviousLesson}
                >
                  Previous Lesson
                </Button>

                <Button
                  disabled={activeLessonIndex === lessons.length - 1}
                  onClick={goToNextLesson}
                >
                  Next Lesson
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </Container>
    </main>
  );
}

function convertLegacyLessonToBlocks(lesson: Lesson): LessonBlock[] {
  const blocks: LessonBlock[] = [];

  lesson.learningObjectives?.forEach((objective) => {
    blocks.push({
      id: `objective-${objective.id}`,
      type: "objective",
      content: objective.objective,
      metadata: {},
    });
  });

  lesson.sections?.forEach((section) => {
    blocks.push({
      id: `heading-${section.id}`,
      type: "heading",
      title: section.title,
      metadata: {},
    });

    blocks.push({
      id: `richtext-${section.id}`,
      type: "richtext",
      content: section.content,
      metadata: {},
    });
  });

  lesson.resources?.forEach((resource) => {
    if (resource.type === "image") {
      blocks.push({
        id: `resource-${resource.id}`,
        type: "image",
        title: resource.title,
        url: resource.url,
        metadata: {},
      });
    }

    if (resource.type === "youtube" || resource.type === "video") {
      blocks.push({
        id: `resource-${resource.id}`,
        type: "youtube",
        title: resource.title,
        url: resource.url,
        metadata: {},
      });
    }

    if (resource.type === "pdf") {
      blocks.push({
        id: `resource-${resource.id}`,
        type: "pdf",
        title: resource.title,
        url: resource.url,
        metadata: {},
      });
    }

    if (resource.type === "ppt") {
      blocks.push({
        id: `resource-${resource.id}`,
        type: "powerpoint",
        title: resource.title,
        url: resource.url,
        metadata: {},
      });
    }
  });

  return blocks;
}