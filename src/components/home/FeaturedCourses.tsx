import useCourseUnits from "../../hooks/useCourseUnits";
import CourseCard from "../ui/CourseCard";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

export default function FeaturedCourses() {
  const { courseUnits, loading } = useCourseUnits();

  const featuredCourseUnits = courseUnits.filter(
    (courseUnit) => courseUnit.isFeatured
  );

  return (
    <Section>
      <Container>
        <Heading
          subtitle="Featured Course Units"
          title="Start with our most popular medical course units"
        />

        {loading ? (
          <p className="mt-10 text-slate-600">Loading course units...</p>
        ) : featuredCourseUnits.length === 0 ? (
          <p className="mt-10 text-slate-600">
            No featured course units available yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {featuredCourseUnits.map((courseUnit) => (
              <CourseCard key={courseUnit.id} course={courseUnit} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}