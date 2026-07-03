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

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { lessons } from "../data/lessons";
import { courseModules } from "../data/modules";

export default function LessonPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const module = courseModules.find((item) => item.id === moduleId);
  const lesson = lessons.find((item) => item.moduleId === moduleId);

  const [sectionIndex, setSectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );

  const currentSection = lesson?.sections[sectionIndex];
  const currentSlide = currentSection?.slides[slideIndex];

  const totalSections = lesson?.sections.length ?? 0;

  const progress = useMemo(() => {
    if (!lesson) return 0;

    const completedSections = sectionIndex;
    const currentSectionProgress =
      currentSection && currentSection.slides.length > 0
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
      </main>
    );
  }

  const isFirstSlide = sectionIndex === 0 && slideIndex === 0;
  const isLastSlide =
    sectionIndex === lesson.sections.length - 1 &&
    slideIndex === currentSection.slides.length - 1;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
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
        </Container>
      </header>

      <Container className="py-8">
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
                    onClick={() => alert("Quiz engine coming next.")}
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

              <h3 className="mt-4 text-xl font-bold text-slate-950">
                Notes
              </h3>

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
      </Container>
    </main>
  );
}