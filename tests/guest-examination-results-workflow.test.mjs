import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const functionsSource = await readFile(new URL("../functions/src/index.ts", import.meta.url), "utf8");
const serviceSource = await readFile(new URL("../src/firebase/contentShareLinks.ts", import.meta.url), "utf8");
const publicPage = await readFile(new URL("../src/pages/PublicSharedContentPage.tsx", import.meta.url), "utf8");
const tutorPage = await readFile(new URL("../src/pages/TutorContentCampaignResultsPage.tsx", import.meta.url), "utf8");

test("guest attempts receive opaque result credentials and stay private until release", () => {
  assert.match(functionsSource, /resultAccessTokenHash:sharedAccessHash\(resultToken\)/);
  assert.match(functionsSource, /released:false/);
  assert.match(functionsSource, /latestAttemptId:attemptRef\.id/);
  assert.match(functionsSource, /getTutorSharedContentResult/);
  assert.match(functionsSource, /attempt\.get\("released"\)===true\?await sharedResourcePayload/);
});

test("tutors review answers, mark, and release as separate actions", () => {
  assert.match(functionsSource, /releaseTutorSharedContentAttempt/);
  assert.match(functionsSource, /Mark this submission before releasing its result/);
  assert.match(tutorPage, /View answers/);
  assert.match(tutorPage, /Release Results/);
  assert.match(tutorPage, /Feedback and corrections/);
  assert.doesNotMatch(tutorPage, /prompt\("Total marks/);
  assert.match(tutorPage, /Review the complete submission above before entering the final mark/);
  assert.match(tutorPage, /onClick=\{\(\) => openAttempt\(attempt\)\}/);
  assert.match(tutorPage, /parseOnlineExamination\(String\(attempt\.examinationText/);
  assert.match(tutorPage, /AI-assisted marking/);
  assert.match(tutorPage, /AI draft — tutor review required/);
});

test("AI marking uses the uploaded guide first and remains a tutor-reviewed draft", () => {
  assert.match(functionsSource, /aiMarkTutorSharedContentAttempt/);
  assert.match(functionsSource, /timeoutSeconds:540/);
  assert.match(functionsSource, /uploadedMarkingGuideExtractedText/);
  assert.match(functionsSource, /Use the supplied tutor marking guide as the primary and authoritative standard/);
  assert.match(functionsSource, /If no marking guide is supplied, derive medically accurate model answers/);
  assert.match(functionsSource, /aiMarkingDraft/);
  assert.match(functionsSource, /The tutor must still save the mark manually/);
  assert.match(serviceSource, /timeout:540000/);
});

test("guests can revisit the shared URL for pending or released results", () => {
  assert.match(serviceSource, /getSharedContentResult/);
  assert.match(publicPage, /query\.set\("attempt",attemptId\)/);
  assert.match(publicPage, /query\.set\("result",resultToken\)/);
  assert.match(publicPage, /Check for released result/);
  assert.match(publicPage, /Questions and your answers/);
});

test("result recovery verifies the contact phone before rotating a token", () => {
  assert.match(functionsSource, /savedPhone&&savedPhone!==suppliedPhone/);
  assert.match(functionsSource, /email and phone number do not match/);
  assert.match(functionsSource, /previousAttempt\.ref\.update\(\{resultAccessTokenHash/);
});
