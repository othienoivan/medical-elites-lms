import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { Lesson } from "../models/Lesson";

export type PublishedModuleLessonsResult = {
  moduleId: string;
  courseUnitId: string;
  aliases: string[];
  lessons: Lesson[];
};

export async function getPublishedModuleLessonsV2(
  moduleId: string,
): Promise<PublishedModuleLessonsResult> {
  const callable = httpsCallable<
    { moduleId: string },
    PublishedModuleLessonsResult
  >(functions, "getPublishedModuleLessonsV2");

  const result = await callable({ moduleId });

  return {
    moduleId: result.data.moduleId,
    courseUnitId: result.data.courseUnitId,
    aliases: Array.isArray(result.data.aliases)
      ? result.data.aliases
      : [],
    lessons: Array.isArray(result.data.lessons)
      ? result.data.lessons
      : [],
  };
}
