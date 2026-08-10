import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readSource(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("Medi Platform Copilot is mounted as a floating authenticated assistant", async () => {
  const [header, copilot] = await Promise.all([
    readSource("src/components/HeaderActions.tsx"),
    readSource("src/domains/copilot/presentation/MediFloatingButton.tsx"),
  ]);

  assert.match(header, /MediFloatingButton/);
  assert.match(copilot, /fixed bottom-20 right-4/);
  assert.match(copilot, /Medi Platform Copilot/);
  assert.match(copilot, /Explain This Page/);
  assert.match(copilot, /Guide Me/);
  assert.match(copilot, /Search Help/);
});

test("Copilot gives a deterministic purchased-course answer before generic AI", async () => {
  const [service, deterministic] = await Promise.all([
    readSource("src/domains/copilot/application/copilot-service.ts"),
    readSource(
      "src/domains/copilot/application/deterministic-answer-service.ts",
    ),
  ]);

  assert.match(service, /DeterministicAnswerService\.resolve/);
  assert.match(deterministic, /Your purchased courses and learning products are available in My Learning Library/);
  assert.match(deterministic, /student\.library/);
  assert.match(deterministic, /student\.purchases/);
});

test("Copilot persists conversation state and suppresses sensitive full-screen routes", async () => {
  const [component, storage] = await Promise.all([
    readSource("src/domains/copilot/presentation/MediFloatingButton.tsx"),
    readSource(
      "src/domains/copilot/infrastructure/copilot-session-storage.ts",
    ),
  ]);

  assert.match(component, /hiddenRoutePatterns/);
  assert.match(component, /marketplace\\\/checkout/);
  assert.match(component, /assessments/);
  assert.match(storage, /sessionStorage/);
  assert.match(storage, /MAX_MESSAGES/);
});
