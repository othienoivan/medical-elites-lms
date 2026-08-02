import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("shared repository scope requires authenticated access context", () => {
  const source = read("src/firebase/repositoryScope.ts");
  assert.match(source, /requireAccessScope/);
  assert.match(source, /where\("tenantId", "==", scope\.tenantId\)/);
  assert.match(source, /where\(field, "==", scope\.uid\)/);
  assert.doesNotMatch(source, /getDocs\(collection\(db,/);
});

test("high-risk tutor repositories no longer use unscoped list reads", () => {
  for (const path of [
    "src/firebase/announcements.ts",
    "src/firebase/timetable.ts",
    "src/firebase/examinations.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /listScopedRecords/);
    assert.doesNotMatch(source, /getDocs\(collection\(db, COLLECTION\)\)/);
  }
});

test("permission service separates tutor ownership from administrator tenant access", () => {
  const source = read("src/services/permissionService.ts");
  assert.match(source, /scope\.role === "tutor"/);
  assert.match(source, /scope\.role === "admin"/);
  assert.match(source, /assignedTutorIds\?\.includes\(scope\.uid\)/);
  assert.match(source, /sameTenant/);
});

test("hooks pass active access scope into protected repositories", () => {
  for (const path of [
    "src/hooks/useAnnouncements.tsx",
    "src/hooks/useTimetable.tsx",
    "src/hooks/useExaminations.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /useAccessScope/);
    assert.match(source, /accessScope/);
  }
});
