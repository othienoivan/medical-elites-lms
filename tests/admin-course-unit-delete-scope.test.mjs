import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("admin course-unit deletion passes the active access scope", async () => {
  const source = await readFile(new URL("../src/pages/AdminCourseUnitsPage.tsx", import.meta.url), "utf8");
  assert.match(source, /deleteCourseUnit\(item\.id, accessScope!\)/);
});
