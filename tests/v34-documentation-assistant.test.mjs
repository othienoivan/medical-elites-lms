import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("v3.4 platform copilot is context-aware, knowledge-grounded and role-safe", async () => {
  const [header, copilotService, assistantService, registry, floatingButton] =
    await Promise.all([
      read("src/components/HeaderActions.tsx"),
      read("src/domains/copilot/application/copilot-service.ts"),
      read(
        "src/domains/knowledge/application/documentation-assistant-service.ts",
      ),
      read(
        "src/domains/knowledge/application/route-action-registry.ts",
      ),
      read("src/domains/copilot/presentation/MediFloatingButton.tsx"),
    ]);

  assert.match(header, /MediFloatingButton/);
  assert.match(floatingButton, /Medi Platform Copilot/);
  assert.match(floatingButton, /Explain This Page/);
  assert.match(copilotService, /DeterministicAnswerService\.resolve/);
  assert.match(copilotService, /DocumentationAssistantService\.ask/);
  assert.match(assistantService, /KnowledgeService\.search/);
  assert.match(assistantService, /ContextualHelpService\.resolve/);
  assert.match(assistantService, /documentation_assistant/);
  assert.match(registry, /roles:/);
  assert.match(registry, /resolveDocumentationActions/);
});
