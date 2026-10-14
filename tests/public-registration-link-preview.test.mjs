import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("unauthenticated join preview uses a trusted callable instead of Firestore getDoc",async()=>{
  const service=await read("src/firebase/registrationLinks.ts");
  assert.match(service,/getPublicRegistrationLinkTrusted/);
  assert.doesNotMatch(service,/getDoc\(doc\(db, LINKS, code\)\)/);
});

test("public registration preview exposes only safe display fields",async()=>{
  const functions=await read("functions/src/index.ts");
  const start=functions.indexOf("export const getPublicRegistrationLinkTrusted");
  const end=functions.indexOf("async function assertTutorProfile",start);
  const block=functions.slice(start,end);
  assert.match(block,/public_registration_link/);
  assert.match(block,/registrationLinks/);
  assert.match(block,/tutorName/);
  assert.match(block,/programmeTitle/);
  assert.doesNotMatch(block,/courseUnitIds/);
  assert.doesNotMatch(block,/moduleIds/);
});

test("raw public registration-link documents are no longer directly readable",async()=>{
  const rules=await read("firestore.rules");
  const block=rules.slice(rules.indexOf("match /registrationLinks"),rules.indexOf("match /contentShareLinks"));
  assert.match(block,/allow read: if signedIn\(\)/);
  assert.doesNotMatch(block,/allow read: if resource\.data\.status == 'active'/);
});
