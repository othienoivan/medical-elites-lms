import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("homepage ecosystem uses high contrast dark heading and cards", () => {
  const source = read("src/components/home/PlatformEcosystem.tsx");
  assert.match(source, /dark/);
  assert.match(source, /!bg-slate-900/);
  assert.match(source, /text-slate-200/);
});

test("public footer uses official support email and current platform wording", () => {
  const source = read("src/components/layout/Footer.tsx");
  assert.match(source, /admin@medicalelites\.org/);
  assert.doesNotMatch(source, /Version 1\.2\.1 RC1/);
});

test("creator attribution is globally mounted", () => {
  assert.ok(existsSync("src/components/CreatorAttribution.tsx"));
  assert.match(read("src/App.tsx"), /<CreatorAttribution \/>/);
  assert.match(read("src/components/CreatorAttribution.tsx"), /Othieno Ivan/);
});

test("registered users can submit moderated testimonials", () => {
  assert.match(read("src/pages/TestimonialsPage.tsx"), /submitTestimonial/);
  const rules = read("firestore.rules");
  assert.match(rules, /match \/testimonials\/\{testimonialId\}/);
  assert.match(rules, /request\.resource\.data\.status == 'pending'/);
});

test("featured courses use local image fallback and public catalogue metrics", () => {
  const source = read("src/components/ui/CourseCard.tsx");
  assert.match(source, /course-placeholder\.svg/);
  assert.match(source, /course\.modules/);
  assert.match(source, /course\.lessons/);
  assert.match(source, /course\.rating/);
  assert.match(source, /course\.students/);
});
