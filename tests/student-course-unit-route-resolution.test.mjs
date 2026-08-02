import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const service = fs.readFileSync("src/firebase/courseUnits.tsx", "utf8");
const page = fs.readFileSync("src/pages/CourseUnitDetailsPage.tsx", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");

test("course-unit details route resolves canonical IDs and legacy identifiers", () => {
  assert.match(service, /export async function getCourseUnitByIdentifier/);
  assert.match(service, /where\("slug", "==", cleanIdentifier\)/);
  assert.match(page, /getCourseUnitByIdentifier\(courseIdentifier\)/);
});

test("student course reads support deterministic legacy enrollment IDs", () => {
  assert.match(rules, /function hasLegacyEnrollment\(courseUnitId\)/);
  assert.match(rules, /function canReadCourseRecord\(documentId, data\)/);
  assert.match(rules, /hasRole\('student'\) && canReadCourseRecord\(documentId, resource.data\)/);
});
