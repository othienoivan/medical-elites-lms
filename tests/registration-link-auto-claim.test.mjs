import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/pages/RegisterPage.tsx", import.meta.url), "utf8");
const mirror = fs.readFileSync(new URL("../src/firebase/src/pages/RegisterPage.tsx", import.meta.url), "utf8");

test("student registration links automatically claim their academic allocation", () => {
  for (const candidate of [source, mirror]) {
    assert.match(candidate, /claimRegistrationLink\(joinCode/);
    assert.match(candidate, /registrationStatus === "approved"/);
    assert.match(candidate, /navigate\("\/student\/course-units"/);
  }
});
