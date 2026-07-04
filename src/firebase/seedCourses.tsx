import { featuredCourses } from "../data/courses";
import { createCourse } from "./courses";

export async function seedCourses() {
  for (const course of featuredCourses) {
    await createCourse({
      ...course,
      published: true,
    });
  }

  console.log("Courses seeded successfully.");
}