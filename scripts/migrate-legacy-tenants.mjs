/**
 * Dry-run planning helper for migrating legacy institutionId records to tenantId.
 * This script intentionally does not write to production. Run with Firebase Admin
 * credentials only after reviewing V3_0_0_RC2_MULTI_TENANT_CORE.md.
 */
const collections = [
  "users", "students", "programmes", "courses", "modules", "lessons",
  "quizzes", "questions", "examinations", "attendanceSessions",
];
console.log(JSON.stringify({ mode: "dry-run", strategy: "tenantId = institutionId", collections }, null, 2));
