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
