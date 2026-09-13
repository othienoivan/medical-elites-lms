import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";

export type LessonResourceDisposition = "inline" | "attachment";

export async function getLessonResourceAccessUrl({
  filePath,
  lessonId,
  courseUnitId,
  disposition = "inline",
  fileName,
}: {
  filePath: string;
  lessonId?: string;
  courseUnitId?: string;
  disposition?: LessonResourceDisposition;
  fileName?: string;
}): Promise<string> {
  const callable = httpsCallable<
    { filePath: string; lessonId?: string; courseUnitId?: string; disposition: LessonResourceDisposition; fileName?: string },
    { url: string; expiresAt: string }
  >(functions, "getLessonResourceAccessUrl");
  const result = await callable({ filePath, lessonId, courseUnitId, disposition, fileName });
  return result.data.url;
}
