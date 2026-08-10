import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const testsDirectory = new URL("./", import.meta.url);

async function readRegressionTests() {
  const names = (await readdir(testsDirectory))
    .filter((name) => name.endsWith(".test.mjs"))
    .filter((name) => name !== "regression-suite-quality.test.mjs");

  return Promise.all(
    names.map(async (name) => ({
      name,
      source: await readFile(new URL(name, testsDirectory), "utf8"),
    })),
  );
}

test("regression tests do not depend on authentication variable names", async () => {
  const files = await readRegressionTests();
  const forbidden = [
    /listPurchases\\\(currentUser\\\.uid\\\)/,
    /listPurchases\\\(authenticatedUser\\\.uid\\\)/,
    /where\\\([^\n]*currentUser\\\.uid/,
  ];

  for (const { name, source } of files) {
    for (const pattern of forbidden) {
      assert.doesNotMatch(
        source,
        pattern,
        `${name} is coupled to a local authentication variable name.`,
      );
    }
  }
});

test("regression tests do not reference superseded source paths", async () => {
  const files = await readRegressionTests();
  const supersededPaths = [
    "src/components/layout/Header.tsx",
    "src/domains/marketplace/domain/commerce-asset.ts",
  ];

  for (const { name, source } of files) {
    for (const path of supersededPaths) {
      assert.ok(
        !source.includes(path),
        `${name} references superseded source path: ${path}`,
      );
    }
  }
});
