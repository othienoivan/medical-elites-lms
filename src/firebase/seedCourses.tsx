<<<<<<< HEAD
import { featuredCourses } from "../data/courseUnits";
import { createCourseUnit } from "./courseUnits";
import type { CourseUnit } from "../models/CourseUnit";

export async function seedCourses() {
  for (const course of featuredCourses) {
    const courseUnit: CourseUnit = {
      ...course,
      programmeId: "legacy-programme",
      programmeTitle: "Medical Elites Academy",
      level: "Certificate",
      published: true,
    };

    await createCourseUnit(courseUnit);
  }

  console.log("Course units seeded successfully.");
}
=======
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
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
