import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("RC3 domain foundation files exist", async () => {
  const entries = await readdir(new URL("../src/domains", import.meta.url));
  for (const domain of ["identity", "platform", "billing", "marketplace", "ai", "support", "learning", "shared"]) {
    assert.ok(entries.includes(domain), `Missing ${domain} domain`);
  }
});

test("domain layers do not directly depend on Firebase or React", async () => {
  const platformDomain = await read("src/domains/platform/domain/platformTypes.ts");
  assert.doesNotMatch(platformDomain, /from ["']firebase/);
  assert.doesNotMatch(platformDomain, /from ["']react/);
});

test("legacy LMS remains untouched by DDD foundation", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.scripts["validate:domain"], "node scripts/validate-domain-boundaries.mjs");
  const router = await read("src/routes/AppRouter.tsx");
  assert.match(router, /\/tutor\/lessons/);
  assert.match(router, /\/student\/course-units/);
});
