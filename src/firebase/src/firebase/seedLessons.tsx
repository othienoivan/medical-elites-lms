import { lessons } from "../data/lessons";
import { createLesson } from "./lessons";

export async function seedLessons() {
  for (const lesson of lessons) {
    await createLesson(lesson);
  }

  console.log("Lessons seeded successfully.");
}