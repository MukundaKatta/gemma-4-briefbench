import test from "node:test";
import assert from "node:assert/strict";

import { analyzeBrief, buildUserPrompt, demoAnalysis, extractJson } from "../lib/briefbench.mjs";

const longNotes = `
The civic delivery team is coordinating volunteer drivers across three neighborhoods.
The notes include route uncertainty, privacy-sensitive resident addresses, and a need
for a simple brief that can be reviewed before anyone changes the dispatch plan.
`;

test("extractJson parses plain JSON responses", () => {
  assert.deepEqual(extractJson('{"summary":"ok","risks":[]}'), {
    summary: "ok",
    risks: [],
  });
});

test("extractJson extracts JSON from surrounding model text", () => {
  assert.deepEqual(extractJson('Here is the brief: {"summary":"ok"} Done.'), {
    summary: "ok",
  });
});

test("buildUserPrompt includes the selected model and notes", () => {
  const prompt = buildUserPrompt("Prioritize edge privacy.", "gemma-4-31b-it");

  assert.match(prompt, /Chosen Gemma 4 model: gemma-4-31b-it/);
  assert.match(prompt, /Prioritize edge privacy/);
});

test("demoAnalysis returns submission-ready sections", () => {
  const analysis = demoAnalysis(longNotes, "gemma-4-31b-it");

  assert.equal(typeof analysis.summary, "string");
  assert.ok(analysis.summary.length > 20);
  assert.ok(Array.isArray(analysis.risks));
  assert.ok(Array.isArray(analysis.buildPlan));
  assert.ok(Array.isArray(analysis.userExperience));
  assert.match(analysis.modelRationale, /gemma-4-31b-it/);
});

test("analyzeBrief rejects notes that are too short", async () => {
  await assert.rejects(
    () => analyzeBrief({ notes: "too short", provider: "demo" }),
    /Please add at least a few sentences of notes/,
  );
});

test("analyzeBrief defaults to demo mode with a structured envelope", async () => {
  const result = await analyzeBrief({ notes: longNotes });

  assert.equal(result.provider, "demo");
  assert.equal(result.model, "gemma-4-31b-it");
  assert.match(result.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(typeof result.analysis.summary, "string");
  assert.ok(
    result.analysis.assumptions.includes(
      "The current response is demo mode unless a Gemma API key is configured.",
    ),
  );
});
