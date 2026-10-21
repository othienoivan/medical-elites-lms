import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("DOCX extraction preserves manual line breaks between examination options", async () => {
  const source = await readFile(
    new URL("../src/utils/readableFileText.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /\["t", "tab", "br", "cr"\]/);
  assert.match(source, /node\.localName === "t" \? node\.textContent \|\| "" : "\\n"/);
});
