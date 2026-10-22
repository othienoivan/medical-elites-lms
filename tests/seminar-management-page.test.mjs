import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("seminar manager exposes the approved workflow and route", async () => {
  const [page, router, layout] = await Promise.all([
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/routes/AppRouter.tsx", "utf8"),
    readFile("src/components/layout/TutorLayout.tsx", "utf8"),
  ]);
  assert.match(router, /path="\/seminar"/);
  assert.match(layout, /Seminar Management/);
  for (const section of ["schedule", "tasks", "attendance", "scores", "budget"]) assert.match(page, new RegExp(section));
  assert.match(page, /2-8 November 2026/);
  assert.match(page, /11 programmes/);
  assert.match(page, /80%\s+of assigned\s+sessions/);
  assert.match(page, /Changes are retained in this browser/);
});

test("seminar manager supports shared Firestore persistence with restricted rules", async () => {
  const [page, service, rules] = await Promise.all([
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/firebase/seminars.ts", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.match(page, /Save shared data/);
  assert.match(service, /collection|"seminars"/);
  assert.match(service, /committeeUids/);
  assert.match(page, /`\$\{STORE_KEY\}-\$\{seminarId\}`/);
  assert.match(rules, /match \/seminars\/\{seminarId\}/);
  assert.match(rules, /request\.resource\.data\.ownerUid == request\.auth\.uid/);
});

test("seminar competition publishes two-judge averages, checklists and separate audience results", async () => {
  const [manager, live, service, routes, rules] = await Promise.all([
    readFile("src/pages/SeminarCompetitionManagerPage.tsx", "utf8"),
    readFile("src/pages/SeminarLivePage.tsx", "utf8"),
    readFile("src/firebase/seminarCompetition.ts", "utf8"),
    readFile("src/routes/AppRouter.tsx", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.match(routes, /\/seminar\/:seminarId\/competition/);
  assert.match(routes, /\/seminar\/:seminarId\/live/);
  assert.match(manager, /Questions/);
  assert.match(manager, /Marking guide/);
  assert.match(manager, /Checklist \/ rubric/);
  assert.match(live, /View published judge checklists/);
  assert.match(live, /j\.length\s*===\s*2/);
  assert.match(live, /Audience challenge/);
  assert.match(service, /seminarAudienceScores/);
  assert.match(rules, /match \/seminarJudgeScores/);
  assert.match(rules, /request\.resource\.data\.userId == request\.auth\.uid/);
});

test("seminar hub creates and lists independently owned dynamic events", async () => {
  const [hub, service, competition, routes, rules] = await Promise.all([
    readFile("src/pages/SeminarHubPage.tsx", "utf8"),
    readFile("src/firebase/seminars.ts", "utf8"),
    readFile("src/firebase/seminarCompetition.ts", "utf8"),
    readFile("src/routes/AppRouter.tsx", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.match(hub, /createSeminar/);
  assert.match(hub, /`\/seminar\/\$\{id\}`/);
  assert.match(service, /doc\(collection\(db,"seminars"\)\)/);
  assert.match(service, /where\("ownerUid","==",userId\)/);
  assert.match(service, /where\("committeeUids","array-contains",userId\)/);
  assert.match(rules, /allow get, list/);
  assert.doesNotMatch(service, /kawempe-2026/);
  assert.doesNotMatch(competition, /kawempe-2026/);
  assert.doesNotMatch(rules, /kawempe-2026/);
  assert.match(routes, /path="\/seminar\/:seminarId"/);
  assert.match(service, /`\$\{seminarId\}_\$\{uid\}`/);
  assert.match(competition, /`\$\{seminarId\}_\$\{input\.participantId\}_\$\{input\.judgeUid\}`/);
});

test("seminar owner can authorise committee members and assign tracked responsibilities", async () => {
  const [page, service, rules] = await Promise.all([
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/firebase/seminars.ts", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.match(page, /Authorise committee members/);
  assert.match(page, /Assign committee tasks/);
  assert.match(page, /Revoke access/);
  assert.match(service, /findCommitteeCandidate/);
  assert.match(service, /arrayUnion\(member\.uid\)/);
  assert.match(service, /arrayRemove\(uid\)/);
  assert.match(rules, /match \/seminarCommittee\/\{memberId\}/);
  assert.match(rules, /match \/seminarCommitteeTasks\/\{taskId\}/);
  assert.match(rules, /affectedKeys\(\)\.hasOnly\(\['status','updatedAt'\]\)/);
});

test("seminar ownership and committee access do not require institution membership", async () => {
  const [page, service, functions, rules] = await Promise.all([
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/firebase/seminars.ts", "utf8"),
    readFile("functions/src/index.ts", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.doesNotMatch(page, /Your account is not assigned to an institution/);
  assert.match(service, /institutionId:input\.institutionId\|\|null/);
  assert.match(service, /findSeminarCommitteeCandidate/);
  assert.match(functions, /Only the seminar owner can authorise committee members/);
  assert.doesNotMatch(rules, /request\.resource\.data\.ownerUid == request\.auth\.uid\s*&& request\.resource\.data\.institutionId == currentInstitutionId\(\)/);
  assert.match(page, /do not need to belong to an institution/);
});

test("audience links support registration, verified attendance, browser questions and a safe leaderboard", async () => {
  const [manager, management, live, service, functions, rules] = await Promise.all([
    readFile("src/pages/SeminarCompetitionManagerPage.tsx", "utf8"),
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/pages/SeminarLivePage.tsx", "utf8"),
    readFile("src/firebase/seminarCompetition.ts", "utf8"),
    readFile("functions/src/index.ts", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.match(manager, /Copy audience link/);
  assert.match(manager, /Multiple-choice question/);
  assert.match(manager, /Short-answer question/);
  assert.match(manager, /Long-answer question/);
  assert.match(management, /Attendance Officer/);
  assert.match(live, /Register attendance/);
  assert.match(live, /Audience question leaderboard/);
  assert.match(service, /seminarAudienceLeaderboard/);
  assert.match(functions, /getPublicSeminarQuestions/);
  assert.match(functions, /submitSeminarAudienceAnswers/);
  assert.match(functions, /markSeminarAudienceAttempt/);
  assert.match(functions, /correctOption/);
  assert.match(rules, /match \/seminarAttendance\/\{attendanceId\}/);
  assert.match(rules, /hasSeminarRole\(resource\.data\.seminarId, 'Attendance Officer'\)/);
  assert.match(rules, /match \/seminarQuestions\/\{questionId\}/);
  assert.match(rules, /match \/seminarAudienceLeaderboard\/\{entryId\}/);
  assert.doesNotMatch(live, /markingGuide/);
  assert.match(manager, /Review written audience answers/);
  assert.match(manager, /Publish reviewed score/);
});

test("seminar authentication returns learners to the live event and questions follow event availability", async () => {
  const [live, login, register, manager, service, functions] = await Promise.all([
    readFile("src/pages/SeminarLivePage.tsx", "utf8"),
    readFile("src/pages/LoginPage.tsx", "utf8"),
    readFile("src/pages/RegisterPage.tsx", "utf8"),
    readFile("src/pages/SeminarCompetitionManagerPage.tsx", "utf8"),
    readFile("src/firebase/seminarCompetition.ts", "utf8"),
    readFile("functions/src/index.ts", "utf8"),
  ]);
  assert.match(live, /seminarLoginPath/);
  assert.match(live, /redirect=\$\{encodeURIComponent\(seminarReturnPath\)\}/);
  assert.match(login, /safeInternalRedirect/);
  assert.match(login, /register\?role=\$\{selectedRole\}.*redirect=/);
  assert.match(register, /navigate\(returnPath, \{ replace: true \}\)/);
  assert.match(manager, /Audience questions are available only while this event is live/);
  assert.match(service, /updateCompetitionEventStatus/);
  assert.match(functions, /seminarEvent\.get\("status"\)!=="live"/);
  assert.match(functions, /This event's questions are not currently open/);
});
