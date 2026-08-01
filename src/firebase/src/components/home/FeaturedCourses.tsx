import usePublishedCourseUnits from "../../hooks/usePublishedCourseUnits";
import CourseCard from "../ui/CourseCard";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

export default function FeaturedCourses() {
  const { courseUnits, loading } = usePublishedCourseUnits();

  const explicitlyFeatured = courseUnits.filter((courseUnit) => courseUnit.isFeatured);
  const featuredCourseUnits = (explicitlyFeatured.length > 0 ? explicitlyFeatured : courseUnits).slice(0, 4);

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
            Published course units will appear here as soon as educators make them available.
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