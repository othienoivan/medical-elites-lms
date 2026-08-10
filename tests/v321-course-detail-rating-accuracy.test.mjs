import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("course details fall back to enriched catalogue module and lesson totals", async () => {
  const source = await readFile(new URL("src/pages/CourseUnitDetailsPage.tsx", root), "utf8");
  assert.match(source, /Math\.max\(contentStats\.modules, Number\(courseUnit\.modules/);
  assert.match(source, /Math\.max\(contentStats\.lessons, Number\(courseUnit\.lessons/);
});

test("public catalogue ratings are rebuilt from published verified product reviews", async () => {
  const source = await readFile(new URL("functions/src/index.ts", root), "utf8");
  assert.match(source, /collection\("productReviews"\)\.where\("status", "==", "published"\)/);
  assert.match(source, /matchingProductIds/);
  assert.match(source, /directReviewRatings/);
  assert.match(source, /item\.get\("rating"\)/);
});
