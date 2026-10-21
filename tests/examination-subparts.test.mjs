import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadParser() {
  const source = await readFile(new URL("../src/utils/onlineExaminationParser.ts", import.meta.url), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
}

test("structured question subparts become independent answerable questions", async () => {
  const { onlineExamAnswerKey, onlineExamQuestionLabel, parseOnlineExamination } = await loadParser();
  const questions = parseOnlineExamination(`
SECTION B: STRUCTURED QUESTIONS
33. A patient presents with severe dehydration:
a) Define dehydration. (2 marks)
b) State three clinical signs. (3 marks)
c) Explain the immediate management. (5 marks)
`);

  assert.equal(questions.length, 3);
  assert.deepEqual(questions.map(onlineExamQuestionLabel), ["33.a", "33.b", "33.c"]);
  assert.deepEqual(questions.map((question) => question.marks), [2, 3, 5]);
  assert.deepEqual(questions.map((question, index) => onlineExamAnswerKey(question, index)), ["q_1", "q_2", "q_3"]);
  assert.match(questions[0].prompt, /Define dehydration/);
  assert.doesNotMatch(questions[0].prompt, /State three clinical signs/);
  assert.match(questions[1].prompt, /State three clinical signs/);
  assert.doesNotMatch(questions[1].prompt, /immediate management/);
});

test("lowercase MCQ choices remain options rather than separate questions", async () => {
  const { parseOnlineExamination } = await loadParser();
  const questions = parseOnlineExamination(`
SECTION A: MULTIPLE CHOICE QUESTIONS
1. The largest organ is:
a) Heart
b) Skin
c) Liver
d) Lung
`);

  assert.equal(questions.length, 1);
  assert.deepEqual(questions[0].options.map((option) => option.label), ["A", "B", "C", "D"]);
});
