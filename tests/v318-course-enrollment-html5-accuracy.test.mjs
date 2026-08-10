import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("enrollment manager resolves programme by canonical and legacy programme identity", () => {
  const source = read("src/pages/EnrollmentManagerPage.tsx");
  assert.match(source, /selectedProgramme\?\.code/);
  assert.match(source, /courseUnit\.programmeTitle/);
  assert.match(source, /programmeKeys\.has\(key\)/);
});

test("HTML5 lesson iframe delegates fullscreen permission", () => {
  const source = read("src/components/lesson/LessonViewer.tsx");
  assert.match(source, /allow="fullscreen; autoplay"/);
  assert.match(source, /allowFullScreen/);
});

test("public catalogue derives live module lesson learner and marketplace rating data", () => {
  const source = read("functions/src/index.ts");
  assert.match(source, /collection\("modules"\).*where\("courseUnitId"/s);
  assert.match(source, /collection\("lessons"\).*where\("moduleId"/s);
  assert.match(source, /marketplaceCourseAccess/);
  assert.match(source, /linkedResourceIds.*array-contains/s);
});
