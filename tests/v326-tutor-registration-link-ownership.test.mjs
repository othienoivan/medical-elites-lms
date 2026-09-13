import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const registrationLinks = fs.readFileSync("src/firebase/registrationLinks.ts", "utf8");
const registrationPage = fs.readFileSync("src/pages/RegistrationLinksPage.tsx", "utf8");
const functions = fs.readFileSync("functions/src/index.ts", "utf8");

test("tutor-created registration links never inherit institution ownership", () => {
  assert.match(registrationLinks, /profile\.role === "tutor" \? undefined/);
  assert.match(functions, /const tutorOwned = ownerRole === "tutor"/);
  assert.match(functions, /institutionId: linkInstitutionId \|\| null/);
  assert.match(functions, /ownerUserId: tutorOwned \? owningTutorId/);
});

test("registration-link claims are processed by trusted backend", () => {
  assert.match(registrationLinks, /claimRegistrationLinkTrusted/);
  assert.match(functions, /export const claimRegistrationLinkTrusted/);
  assert.match(functions, /tenantMemberships/);
  assert.match(functions, /tutor_\$\{owningTutorId\}/);
});

test("tutors can trace and repair learners who joined their registration links", () => {
  assert.match(registrationLinks, /getTutorRegistrationLinkStudents/);
  assert.match(registrationPage, /Registered learners/);
  assert.match(functions, /export const getTutorRegistrationLinkStudents/);
  assert.match(functions, /ownership repair/);
});
