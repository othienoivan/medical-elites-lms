import CourseCard from "../components/ui/CourseCard";
import Container from "../components/ui/Container";
import Heading from "../components/ui/Heading";
import Section from "../components/ui/Section";
import useCourseUnits from "../hooks/useCourseUnits";

export default function CourseUnitPage() {
  const { courseUnits, loading } = useCourseUnits();

  return (
    <main className="min-h-screen bg-slate-50">
      <Section>
        <Container>
          <Heading
            subtitle="Medical Elites Academy"
            title="Explore Course Units"
            align="center"
          />

          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Browse structured medical and health sciences course units designed
            for learners, tutors, and healthcare professionals.
          </p>

          {loading ? (
            <p className="mt-12 text-center text-slate-600">
              Loading course units...
            </p>
          ) : courseUnits.length === 0 ? (
            <p className="mt-12 text-center text-slate-600">
              No published course units available yet.
            </p>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {courseUnits.map((courseUnit) => (
                <CourseCard
                  key={courseUnit.id}
                  course={courseUnit}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}