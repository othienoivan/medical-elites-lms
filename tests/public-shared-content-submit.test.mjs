import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("guest registration button submits the shared-content access form", async () => {
  const page = await readFile(
    new URL("../src/pages/PublicSharedContentPage.tsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /<form onSubmit=\{open\}/);
  assert.match(page, /<Button type="submit" className="w-full" loading=\{busy\}>Continue to Content<\/Button>/);
  assert.match(page, /captureLeadAndOpenContent\(\{code,\.\.\.form\}\)/);
});

test("guest examinations restore secure warnings, timing and unanswered checks", async () => {
  const page = await readFile(
    new URL("../src/pages/PublicSharedContentPage.tsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /Start Full-Screen Examination/);
  assert.match(page, /remainingSeconds/);
  assert.match(page, /Time elapsed\./);
  assert.match(page, /visibilitychange/);
  assert.match(page, /unanswered question\(s\)\. Submit anyway\?/);
});
