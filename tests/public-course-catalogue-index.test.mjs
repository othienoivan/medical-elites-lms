import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public course catalogue does not depend on academic access scope", async () => {
  const page = await read("src/pages/CourseUnitPage.tsx");
  const hook = await read("src/hooks/usePublishedCourseUnits.ts");
  const repository = await read("src/firebase/courseUnits.tsx");
  assert.match(page, /usePublishedCourseUnits/);
  assert.doesNotMatch(page, /useCourseUnits/);
  assert.match(hook, /getPublishedCourseUnits/);
  assert.match(repository, /where\("published", "==", true\)/);
});

test("public rules expose only published course units", async () => {
  const rules = await read("firestore.rules");
  assert.match(rules, /match \/courses\/\{documentId\}/);
  assert.match(rules, /resource\.data\.published == true/);
});

test("index reflects marketplace, finance, AI and institutional platform", async () => {
  const hero = await read("src/components/home/Hero.tsx");
  const ecosystem = await read("src/components/home/PlatformEcosystem.tsx");
  const navbar = await read("src/components/home/Navbar.tsx");
  assert.match(hero, /marketplace/i);
  assert.match(hero, /Flutterwave/i);
  assert.match(ecosystem, /Commerce & Finance/);
  assert.match(ecosystem, /Institution Operations/);
  assert.match(ecosystem, /Medical Elites AI/);
  assert.match(navbar, /Marketplace/);
});
