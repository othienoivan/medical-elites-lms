<<<<<<< HEAD
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
=======
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Stethoscope,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import QuizPlayer from "../components/lesson/QuizPlayer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { lessons } from "../data/lessons";
import { courseModules } from "../data/modules";
import { quizzes } from "../data/quizzes";
import { handleModuleQuizPassed } from "../firebase/progress";
import useAuth from "../hooks/useAuth";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

export default function LessonPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
<<<<<<< HEAD

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      if (!moduleId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await getLessons(moduleId);

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
  }, [moduleId]);

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
=======
  const { currentUser } = useAuth();

  const module = courseModules.find((item) => item.id === moduleId);
  const lesson = lessons.find((item) => item.moduleId === moduleId);
  const quiz = quizzes.find((item) => item.moduleId === moduleId);

  const [sectionIndex, setSectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );

  const currentSection = lesson?.sections[sectionIndex];
  const currentSlide = currentSection?.slides[slideIndex];

  const totalSections = lesson?.sections.length ?? 0;

  const progress = useMemo(() => {
    if (!lesson || !currentSection) return 0;

    const completedSections = sectionIndex;

    const currentSectionProgress =
      currentSection.slides.length > 0
        ? (slideIndex + 1) / currentSection.slides.length
        : 0;

    return Math.round(
      ((completedSections + currentSectionProgress) / lesson.sections.length) *
        100
    );
  }, [lesson, sectionIndex, slideIndex, currentSection]);

  function goNext() {
    if (!lesson || !currentSection) return;

    const hasNextSlide = slideIndex < currentSection.slides.length - 1;
    const hasNextSection = sectionIndex < lesson.sections.length - 1;

    if (hasNextSlide) {
      setSlideIndex((prev) => prev + 1);
      return;
    }

    if (hasNextSection) {
      setSectionIndex((prev) => prev + 1);
      setSlideIndex(0);
    }
  }

  function goPrevious() {
    if (!lesson) return;

    if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
      return;
    }

    if (sectionIndex > 0) {
      const previousSection = lesson.sections[sectionIndex - 1];

      setSectionIndex((prev) => prev - 1);
      setSlideIndex(previousSection.slides.length - 1);
    }
  }

  function selectAnswer(questionId: string, answer: string) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }

  if (!module || !lesson || !currentSection || !currentSlide) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <Card className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Lesson not found
          </h1>

          <p className="mt-3 text-slate-600">
            We could not find a lesson for this module.
          </p>

          <Button className="mt-6" onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
        </Card>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
      </main>
    );
  }

<<<<<<< HEAD
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
=======
  const isFirstSlide = sectionIndex === 0 && slideIndex === 0;

  const isLastSlide =
    sectionIndex === lesson.sections.length - 1 &&
    slideIndex === currentSection.slides.length - 1;
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
<<<<<<< HEAD
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
=======
            <p className="text-sm font-semibold text-blue-700">
              Medical Elites LMS
            </p>

            <h1 className="text-2xl font-bold text-slate-950">
              {lesson.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {module.title} • Estimated {lesson.estimatedMinutes} minutes
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </Button>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
        </Container>
      </header>

      <Container className="py-8">
<<<<<<< HEAD
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
=======
        <div className="mb-6 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-blue-700 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mb-8 text-sm font-semibold text-slate-600">
          Progress: {progress}% • Section {sectionIndex + 1} of {totalSections}
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <Card>
              <div className="mb-5 flex items-center gap-3">
                <BookOpen className="text-blue-700" size={30} />

                <div>
                  <p className="text-sm font-bold text-blue-700">
                    Section {currentSection.order}
                  </p>

                  <h2 className="text-2xl font-bold text-slate-950">
                    {currentSection.title}
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl bg-blue-700 p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                  Slide {slideIndex + 1} of {currentSection.slides.length}
                </p>

                <h3 className="mt-3 text-3xl font-bold">
                  {currentSlide.title}
                </h3>

                <p className="mt-6 text-lg leading-9 text-blue-50">
                  {currentSlide.content}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={isFirstSlide}
                  onClick={goPrevious}
                >
                  Previous
                </Button>

                {!isLastSlide ? (
                  <Button className="gap-2" onClick={goNext}>
                    Next
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      document
                        .getElementById("module-quiz")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Proceed to Quiz
                    <CheckCircle2 size={18} />
                  </Button>
                )}
              </div>
            </Card>

            {currentSection.clinicalPearl && (
              <Card className="border border-amber-100 bg-amber-50">
                <div className="flex gap-3">
                  <Lightbulb className="text-amber-600" size={28} />

                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      Clinical Pearl
                    </h3>

                    <p className="mt-2 leading-7 text-slate-700">
                      {currentSection.clinicalPearl}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {currentSection.caseScenario && (
              <Card className="border border-green-100 bg-green-50">
                <div className="flex gap-3">
                  <Stethoscope className="text-green-700" size={28} />

                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      Case Scenario
                    </h3>

                    <p className="mt-2 leading-7 text-slate-700">
                      {currentSection.caseScenario}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {currentSection.knowledgeChecks &&
              currentSection.knowledgeChecks.length > 0 && (
                <Card>
                  <div className="mb-4 flex items-center gap-3">
                    <HelpCircle className="text-blue-700" size={28} />

                    <h3 className="text-xl font-bold text-slate-950">
                      Knowledge Check
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {currentSection.knowledgeChecks.map((check) => {
                      const selected = selectedAnswers[check.id];
                      const isCorrect = selected === check.correctAnswer;

                      return (
                        <div
                          key={check.id}
                          className="rounded-2xl border border-slate-200 p-5"
                        >
                          <p className="font-bold text-slate-900">
                            {check.question}
                          </p>

                          <div className="mt-4 grid gap-3">
                            {check.options.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => selectAnswer(check.id, option)}
                                className={`rounded-xl border px-4 py-3 text-left font-medium transition ${
                                  selected === option
                                    ? "border-blue-700 bg-blue-50 text-blue-700"
                                    : "border-slate-200 hover:border-blue-400"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>

                          {selected && (
                            <div
                              className={`mt-4 rounded-xl p-4 text-sm ${
                                isCorrect
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              <p className="font-bold">
                                {isCorrect ? "Correct" : "Not quite"}
                              </p>

                              <p className="mt-1">{check.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
          </section>

          <aside className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-slate-950">
                Learning Objectives
              </h3>

              <ul className="mt-4 space-y-3">
                {lesson.learningObjectives.map((objective) => (
                  <li key={objective} className="flex gap-2 text-slate-600">
                    <CheckCircle2
                      className="mt-1 shrink-0 text-green-700"
                      size={18}
                    />

                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <PlayCircle className="text-blue-700" size={30} />

              <h3 className="mt-4 text-xl font-bold text-slate-950">
                Video Resources
              </h3>

              {currentSection.videos.length === 0 ? (
                <p className="mt-2 text-slate-600">
                  No video added for this section yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {currentSection.videos.map((video) => (
                    <div key={video.id}>
                      <p className="mb-2 font-semibold text-slate-800">
                        {video.title}
                      </p>

                      {video.type === "youtube" ? (
                        <iframe
                          src={video.url}
                          title={video.title}
                          className="aspect-video w-full rounded-xl"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          controls
                          src={video.url}
                          className="w-full rounded-xl"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <FileText className="text-green-700" size={30} />

              <h3 className="mt-4 text-xl font-bold text-slate-950">Notes</h3>

              {currentSection.notes ? (
                <p className="mt-2 leading-7 text-slate-600">
                  {currentSection.notes}
                </p>
              ) : (
                <p className="mt-2 text-slate-600">
                  Section notes will appear here when added by the tutor.
                </p>
              )}
            </Card>
          </aside>
        </div>

        {quiz && (
          <section id="module-quiz" className="mt-10">
            <QuizPlayer
              quiz={quiz}
              onPassed={async (score) => {
                if (!currentUser || !module) {
                  navigate("/login");
                  return;
                }

                try {
                  const result = await handleModuleQuizPassed({
                    userId: currentUser.uid,
                    courseId: module.courseId,
                    moduleId: module.id,
                    quizId: quiz.id,
                    score,
                    passMark: quiz.passMark,
                  });

                  if (result.passed) {
                    alert(
                      result.nextModuleId
                        ? `🎉 Congratulations! You scored ${score}%.\n\nModule completed successfully.\n\nThe next module has been unlocked!`
                        : `🎉 Congratulations! You scored ${score}%.\n\nYou have completed this course.`
                    );

                    navigate("/dashboard");
                  } else {
                    alert(
                      `You scored ${score}%.\n\nYou need at least ${quiz.passMark}% to unlock the next module.`
                    );
                  }
                } catch (error) {
                  console.error(error);
                  alert("Failed to save your progress. Please try again.");
                }
              }}
            />
          </section>
        )}
      </Container>
    </main>
  );
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
}