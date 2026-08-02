import type React from "react";
import { useEffect, useMemo, useState } from "react";

import {
  Award,
  Lock,
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import ModuleCard from "../components/ui/ModuleCard";
import useAuth from "../hooks/useAuth";
import usePublishedCourseUnits from "../hooks/usePublishedCourseUnits";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import useCourseUnitContentStats from "../hooks/useCourseUnitContentStats";
import useModuleProgression from "../hooks/useModuleProgression";
import { markModuleStarted } from "../firebase/enrollments";
import { getCourseUnitByIdentifier } from "../firebase/courseUnits";
import type { CourseUnit } from "../models/CourseUnit";

export default function CourseUnitDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    canAccessCourseUnit,
    loading: accessLoading,
    hasElevatedAccess,
  } = useStudentLearningAccess();

  const {
    courseUnits: publishedCourseUnits,
    loading: publishedCourseUnitsLoading,
  } = usePublishedCourseUnits();
  const {
    courseUnits: accessibleCourseUnits,
    loading: accessibleCourseUnitsLoading,
  } = useCourseUnits(true);

  const courseIdentifier = decodeURIComponent(slug ?? "");
  const [resolvedCourseUnit, setResolvedCourseUnit] = useState<CourseUnit | null>(null);
  const [resolvingCourseUnit, setResolvingCourseUnit] = useState(Boolean(courseIdentifier));

  const visibleCourseUnits = useMemo(
    () =>
      currentUser
        ? [...accessibleCourseUnits, ...publishedCourseUnits]
        : publishedCourseUnits,
    [accessibleCourseUnits, currentUser, publishedCourseUnits],
  );

  const listedCourseUnit = visibleCourseUnits.find(
    (item, index, rows) =>
      rows.findIndex((candidate) => candidate.id === item.id) === index &&
      (item.id === courseIdentifier || item.slug === courseIdentifier ||
        String((item as CourseUnit & { courseId?: unknown }).courseId ?? "") === courseIdentifier),
  );

  useEffect(() => {
    let active = true;

    async function resolveRouteCourseUnit() {
      if (!courseIdentifier || listedCourseUnit) {
        if (active) {
          setResolvedCourseUnit(listedCourseUnit ?? null);
          setResolvingCourseUnit(false);
        }
        return;
      }

      try {
        setResolvingCourseUnit(true);
        const result = await getCourseUnitByIdentifier(courseIdentifier);
        if (active) setResolvedCourseUnit(result);
      } catch (error) {
        console.error("Failed to resolve course unit route:", error);
        if (active) setResolvedCourseUnit(null);
      } finally {
        if (active) setResolvingCourseUnit(false);
      }
    }

    void resolveRouteCourseUnit();
    return () => {
      active = false;
    };
  }, [courseIdentifier, listedCourseUnit]);

  const courseUnit = listedCourseUnit ?? resolvedCourseUnit;

  const courseUnitsLoading =
    resolvingCourseUnit ||
    (currentUser
      ? accessibleCourseUnitsLoading
      : publishedCourseUnitsLoading);

  const { modules, loading: modulesLoading } = useModules(courseUnit?.id);
  const contentStats = useCourseUnitContentStats(courseUnit?.id);
  const progression = useModuleProgression(modules, courseUnit?.id);

  const hasCourseAccess = courseUnit
    ? canAccessCourseUnit(courseUnit.id, courseUnit.programmeId)
    : false;

  function handlePrimaryAction() {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (hasCourseAccess || hasElevatedAccess) {
      const firstModule = modules[0];
      navigate(firstModule ? `/lesson/${firstModule.id}` : "/my-courses");
      return;
    }

    navigate("/my-courses");
  }

  async function handleStartModule(moduleId: string) {
    if (currentUser && courseUnit) {
      try {
        await markModuleStarted({
          userId: currentUser.uid,
          courseId: courseUnit.id,
          moduleId,
        });
      } catch (error) {
        console.warn("Module start progress could not be saved:", error);
      }
    }
    navigate(`/lesson/${moduleId}`);
  }

  if (courseUnitsLoading || accessLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <p className="text-slate-600">Loading course unit...</p>
      </main>
    );
  }

  if (!courseUnit) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <Card className="max-w-lg text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Course Unit Not Found
          </h1>

          <p className="mt-3 text-slate-600">
            The course unit may have been removed, unpublished, or is no longer available.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate("/courses")}>
              Browse Published Course Units
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-blue-700 text-white">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold uppercase tracking-wide text-blue-100">
              {courseUnit.programmeTitle}
            </p>

            <h1 className="mt-4 text-5xl font-extrabold leading-tight">
              {courseUnit.title}
            </h1>

            <p className="mt-6 text-lg leading-8 text-blue-100">
              {courseUnit.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                onClick={handlePrimaryAction}
                className="bg-white text-blue-700 hover:bg-slate-100"
              >
                {!currentUser
                  ? "Sign In to Access"
                  : hasCourseAccess || hasElevatedAccess
                    ? "Start Learning"
                    : "Access Not Assigned"}
              </Button>

              <Link to="/courses">
                <Button
                  variant="outline"
                  className="border-white text-white hover:border-white hover:text-white"
                >
                  Back to Course Units
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/10 p-4">
            <img
              src={courseUnit.image}
              alt={courseUnit.title}
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/900x600/1D4ED8/FFFFFF?text=Medical+Elites";
              }}
              className="h-80 w-full rounded-2xl object-cover"
            />
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-950">
              About this course unit
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              {courseUnit.description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Info
                icon={<GraduationCap size={20} />}
                label="Tutor"
                value={courseUnit.tutor && courseUnit.tutor.toLowerCase() !== "unassigned" ? courseUnit.tutor : "Assigned tutor"}
              />

              <Info
                icon={<Clock size={20} />}
                label="Duration"
                value={courseUnit.duration}
              />

              <Info
                icon={<BookOpen size={20} />}
                label="Modules"
                value={`${contentStats.modules} modules`}
              />

              <Info
                icon={<BookOpen size={20} />}
                label="Lessons"
                value={`${contentStats.lessons} lessons`}
              />

              <Info
                icon={<Star size={20} />}
                label="Rating"
                value={`${courseUnit.rating.toFixed(1)} / 5.0`}
              />

              <Info
                icon={<Users size={20} />}
                label="Students"
                value={courseUnit.students}
              />

              {courseUnit.certificate && (
                <Info
                  icon={<Award size={20} />}
                  label="Certificate"
                  value="Included"
                />
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Course Unit Progression
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Each module includes lessons, video support, notes, and a quiz.
              Learners must score at least 80% to unlock the next module.
            </p>

            <Button onClick={handlePrimaryAction} className="mt-6 w-full">
              {hasCourseAccess || hasElevatedAccess
                ? "Start Learning"
                : "View My Assigned Courses"}
            </Button>

            {!hasCourseAccess && currentUser && !hasElevatedAccess && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                <Lock size={18} className="mt-0.5 shrink-0" />
                This course unit has not been assigned to your active enrolment.
              </div>
            )}
          </Card>
        </div>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-950">
              Course Unit Modules
            </h2>

            <p className="mt-2 text-slate-600">
              Start with Module 1. Other modules unlock after passing the
              previous module assessment with at least 80%.
            </p>
          </div>

          {modulesLoading ? (
            <p className="text-slate-600">Loading modules...</p>
          ) : modules.length === 0 ? (
            <p className="text-slate-600">
              No modules have been published yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isUnlocked={(hasCourseAccess || hasElevatedAccess) && progression.isUnlocked(module.id)}
                  lessonCount={contentStats.lessonCounts[module.id] ?? 0}
                  learningState={progression.getLearningState(module.id)}
                  onStart={() => {
                    if ((hasCourseAccess || hasElevatedAccess) && progression.isUnlocked(module.id)) {
                      handleStartModule(module.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4">
      <div className="text-blue-700">{icon}</div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}