import CourseCard from "../components/ui/CourseCard";
import Container from "../components/ui/Container";
import Heading from "../components/ui/Heading";
import Section from "../components/ui/Section";
import useCourses from "../hooks/useCourses";

export default function CoursePage() {
  const { courses, loading } = useCourses();

  return (
    <main className="min-h-screen bg-slate-50">
      <Section>
        <Container>
          <Heading
            subtitle="Medical Elites Academy"
            title="Explore Medical Courses"
            align="center"
          />

          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Browse structured medical and health sciences courses designed for
            serious learners, tutors, and healthcare professionals.
          </p>

          {loading ? (
            <p className="mt-12 text-center text-slate-600">
              Loading courses...
            </p>
          ) : courses.length === 0 ? (
            <p className="mt-12 text-center text-slate-600">
              No published courses available yet.
            </p>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}