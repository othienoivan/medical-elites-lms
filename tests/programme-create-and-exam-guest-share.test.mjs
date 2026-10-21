import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("programme writes remove undefined optional fields before reaching Firestore", async () => {
  const repository = await read("src/firebase/programmes.tsx");
  const page = await read("src/pages/CreateProgrammePage.tsx");

  assert.match(repository, /Object\.entries\(payload\)\.filter\(\(\[, value\]\) => value !== undefined\)/);
  assert.match(repository, /setDoc\(docRef, \{\s*\.\.\.definedPayload/);
  assert.match(repository, /updateDoc\(doc\(db, COLLECTION, id\), \{ \.\.\.definedPayload/);
  assert.doesNotMatch(page, /imagePath:\s*imagePath\s*\|\|\s*undefined/);
  assert.match(page, /\.\.\.\(imagePath \? \{ imagePath \} : \{\}\)/);
});

test("published examinations can open a preselected guest-sharing campaign", async () => {
  const bank = await read("src/pages/ExaminationBankPage.tsx");
  const campaigns = await read("src/pages/TutorContentCampaignsPage.tsx");

  assert.match(bank, /exam\.status === "published"/);
  assert.match(bank, /Share with guests/);
  assert.match(bank, /contentType=examination&resourceId=/);
  assert.match(campaigns, /useSearchParams/);
  assert.match(campaigns, /searchParams\.get\("resourceId"\)/);
  assert.match(campaigns, /requestedType==="examination"/);
});
