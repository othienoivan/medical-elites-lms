import { ArrowLeft, BookOpen, GraduationCap, Lock } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import CourseCard from "../components/ui/CourseCard";
import useCourseUnits from "../hooks/useCourseUnits";
import usePublishedCourseUnits from "../hooks/usePublishedCourseUnits";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const { courseUnits, loading: coursesLoading } = useCourseUnits();
  const { courseUnits: publicCourseUnits, loading: publicLoading } = usePublishedCourseUnits();
  const {
    enrollments,
    courseUnitIds,
    programmeIds,
    loading: accessLoading,
    error,
  } = useStudentLearningAccess();

  const assignedCourseUnits = useMemo(() => {
    const enrichedById = new Map(publicCourseUnits.map((courseUnit) => [courseUnit.id, courseUnit]));
    return courseUnits.filter((courseUnit) => courseUnitIds.has(courseUnit.id) || programmeIds.has(courseUnit.programmeId)).map((courseUnit) => ({ ...courseUnit, ...(enrichedById.get(courseUnit.id) ?? {}) }));
  }, [courseUnitIds, courseUnits, programmeIds, publicCourseUnits]);

  const loading = coursesLoading || publicLoading || accessLoading;

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
            <h1 className="text-2xl font-bold text-slate-950">My Course Units</h1>
            <p className="mt-1 text-slate-600">
              Course units assigned through your active academic enrolment.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/assessments")}>
            View Assessments
          </Button>
        </Container>
      </header>

      <Container className="py-10">
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={GraduationCap}
            label="Active Enrolments"
            value={enrollments.length}
          />
          <SummaryCard
            icon={BookOpen}
            label="Assigned Course Units"
            value={assignedCourseUnits.length}
          />
          <SummaryCard
            icon={Lock}
            label="Access Mode"
            value="Enrolment controlled"
          />
        </section>

        {loading ? (
          <Card>Loading your assigned course units...</Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 text-red-800">{error}</Card>
        ) : assignedCourseUnits.length === 0 ? (
          <Card className="text-center">
            <BookOpen size={52} className="mx-auto text-slate-400" />
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              No course units assigned
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              Your tutor or administrator must add course units to your active
              enrolment before learning content appears here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {assignedCourseUnits.map((courseUnit) => (
              <CourseCard key={courseUnit.id} course={courseUnit} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <Icon size={32} className="text-blue-700" />
      </div>
    </Card>
  );
}
