import Container from "../ui/Container";
import Section from "../ui/Section";
import Heading from "../ui/Heading";
import CourseCard from "../ui/CourseCard";

import { featuredCourses } from "../../data/courses";

export default function FeaturedCourses() {
  return (
    <Section>
      <Container>
        <Heading
          subtitle="Featured Courses"
          title="Start with our most popular medical courses"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featuredCourses.map((course) => (
            <CourseCard
              key={course.title}
              course={course}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}