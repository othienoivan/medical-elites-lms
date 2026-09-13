import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { Module } from "../models/Module";

type Response = { courseUnitId: string; aliases: string[]; modules: Module[] };
export async function getPublishedCourseModulesV2(courseUnitId: string): Promise<Response> {
  const callable = httpsCallable<{ courseUnitId: string }, Response>(functions, "getPublishedCourseModulesV2");
  const result = await callable({ courseUnitId });
  return { courseUnitId: result.data.courseUnitId, aliases: result.data.aliases ?? [], modules: result.data.modules ?? [] };
}
