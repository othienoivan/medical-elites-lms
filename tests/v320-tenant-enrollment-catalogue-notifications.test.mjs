import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

test("legacy tenant memberships are recovered through a trusted workspace resolver", async () => {
  const client = await read("src/firebase/tenants.ts");
  const functions = await read("functions/src/index.ts");
  assert.match(client, /resolveTenantWorkspaceTrusted/);
  assert.match(functions, /export const resolveTenantWorkspaceTrusted = onCall/);
  assert.match(functions, /tenantMemberships/);
});

test("tutor enrollment manager uses trusted enrollment course catalogue", async () => {
  const page = await read("src/pages/EnrollmentManagerPage.tsx");
  const service = await read("src/firebase/tutorEnrollmentCatalogue.ts");
  const functions = await read("functions/src/index.ts");
  assert.match(page, /getTutorEnrollmentCourseUnits/);
  assert.match(service, /getTutorEnrollmentCourseUnits/);
  assert.match(functions, /export const getTutorEnrollmentCourseUnits = onCall/);
});

test("public catalogue uses second generation server resolver", async () => {
  const client = await read("src/firebase/publicCourseCatalogue.ts");
  const functions = await read("functions/src/index.ts");
  assert.match(client, /getPublicCourseCatalogueSnapshotV2/);
  assert.match(functions, /export const getPublicCourseCatalogueSnapshotV2 = onCall/);
  assert.match(functions, /catalogueVersion: "v2"/);
});

test("publishing a lesson notifies active learners", async () => {
  const functions = await read("functions/src/index.ts");
  assert.match(functions, /notifyStudentsWhenLessonPublished = onDocumentUpdated/);
  assert.match(functions, /lesson-published:/);
  assert.match(functions, /type: "academic"/);
});
