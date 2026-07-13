#!/usr/bin/env node
/* =========================================================
   scripts/verify-templates.mjs

   Sanity-checks the three frozen mode templates (Ignition,
   Coaching Loop, Explorer) and the three copy-paste prompts that embed
   them. This replaces scripts/verify-golden-template.mjs, which checked
   a single shared template — that assumption is retired. Each mode now
   has its own template, its own DATA schema, its own CSV schema, its
   own Knock behavior, and its own Exit Log prompts, and this script
   checks all three independently, plus checks that they have actually
   diverged from one another (not just been renamed).

   Run this after any change to a mode's fragment files, after
   re-running the build scripts:

     node scripts/build-templates.mjs
     node scripts/build-prompts.mjs
     node scripts/verify-templates.mjs

   Exits non-zero (and prints every failure) if anything is wrong.
   No external dependencies — Node's built-in fs/path only.
   ========================================================= */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MODES = [
  {
    key: "ignition",
    label: "Ignition",
    template: path.join(ROOT, "templates", "ignition-focus-file-template.html"),
    prompt: path.join(ROOT, "prompts", "Ignition.md"),
    fillInstruction: "Fill the frozen Ignition Focus File template",
    requiredTopKeys: [
      "schema_version", "mode", "mode_label", "instrument_label", "title", "subtitle",
      "start_time", "start_location", "planned_finish", "output_target", "finish_line",
      "jobs", "avoidance_move", "avoidance_line", "distraction_plan", "why", "feeling",
      "display_cues", "check_in", "hard_stop", "exit_prompts", "prior_log_rows"
    ],
    listField: "jobs",
    expectedCsvHeader: "date,block,planned_start,actual_start,planned_finish,actual_finish,output_target,output_produced,action_list_checks,check_in_responses,finished_as_planned,how_it_felt,what_pulled_me_away,next_block_start",
    expectedExitPrompts: [
      "Did you finish the block as planned?",
      "What output did you produce?",
      "How did finishing—or stopping—feel?",
      "What, if anything, pulled you away from the work?",
      "Where will the next block begin?"
    ],
    expectedKnockQuestion: "Still with it?",
    expectedHardStopEnabled: false
  },
  {
    key: "coaching_loop",
    label: "Coaching Loop",
    template: path.join(ROOT, "templates", "coaching-loop-focus-file-template.html"),
    prompt: path.join(ROOT, "prompts", "Coaching.md"),
    fillInstruction: "Fill the frozen Coaching Loop Practice File template",
    requiredTopKeys: [
      "schema_version", "mode", "mode_label", "instrument_label", "title", "subtitle",
      "start_time", "start_location", "planned_finish", "practice_target",
      "practice_protocol", "intervention", "predicted_break", "predicted_excuse",
      "evidence_to_notice", "why", "feeling", "display_cues", "check_in", "hard_stop",
      "exit_prompts", "prior_log_rows"
    ],
    listField: "practice_protocol",
    expectedCsvHeader: "date,practice,planned_start,actual_start,planned_finish,actual_finish,intervention_tested,practice_step_checks,check_in_responses,practice_happened,predicted_pattern_seen,observed_evidence,what_helped,what_did_not_work,next_adjustment",
    expectedExitPromptsCount: 6,
    expectedExitPrompts: [
      "Did the planned practice happen?",
      "Where did the predicted pattern appear?",
      "When the urge appeared, did the barrier hold, and what happened next?",
      "What helped you stay with the practice?",
      "What did not work, or worked differently than expected?",
      "What should change in the next attempt?"
    ],
    expectedKnockQuestion: "Is the practice holding?",
    expectedHardStopEnabled: false,
    requireCaptureNoReasonTrue: true
  },
  {
    key: "explorer",
    label: "Explorer",
    template: path.join(ROOT, "templates", "explorer-focus-file-template.html"),
    prompt: path.join(ROOT, "prompts", "Explorer.md"),
    fillInstruction: "Fill the frozen Explorer Inquiry File template",
    requiredTopKeys: [
      "schema_version", "mode", "mode_label", "instrument_label", "title", "subtitle",
      "start_time", "start_location", "planned_finish", "blocked_move",
      "answerable_question", "research_boundary", "written_outputs", "avoidance_move",
      "avoidance_line", "research_barrier", "why", "feeling", "display_cues",
      "check_in", "hard_stop", "exit_prompts", "prior_log_rows"
    ],
    listField: "written_outputs",
    expectedCsvHeader: "date,question,blocked_move,planned_start,actual_start,planned_finish,actual_finish,written_output_checks,check_in_responses,answer_reached,evidence_that_mattered,remaining_unknown,research_avoidance,next_move",
    expectedExitPrompts: [
      "What answer did you reach?",
      "Which evidence, numbers, or comparisons mattered most?",
      "What remains genuinely unknown?",
      "Where, if anywhere, did research turn into avoidance?",
      "What concrete move follows from this answer?"
    ],
    expectedKnockQuestion: "Are you closing in on an answer?",
    expectedHardStopEnabled: true
  }
];

let failures = 0;
let checks = 0;

function pass(message) {
  checks++;
  console.log("  ok   " + message);
}

function fail(message) {
  checks++;
  failures++;
  console.log("  FAIL " + message);
}

function section(title) {
  console.log("\n" + title);
}

function extractDataBlock(html, label) {
  const match = html.match(
    /<script id="next-block-data" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) {
    fail(`${label}: could not find the #next-block-data script block.`);
    return null;
  }
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(`${label}: the data block is not valid JSON (${error.message}).`);
    return null;
  }
}

function checkNoExternalResources(html, label) {
  const scriptSrc = html.match(/<script[^>]+src=/gi) || [];
  if (scriptSrc.length === 0) pass(`${label}: no external <script src> tags.`);
  else fail(`${label}: found ${scriptSrc.length} external <script src> tag(s).`);

  const stylesheetLinks = html.match(/<link[^>]+stylesheet[^>]*>/gi) || [];
  if (stylesheetLinks.length === 0) pass(`${label}: no external stylesheet <link> tags.`);
  else fail(`${label}: found ${stylesheetLinks.length} external stylesheet <link> tag(s).`);

  const urls = html.match(/https?:\/\//gi) || [];
  if (urls.length === 0) pass(`${label}: no http:// or https:// references anywhere.`);
  else fail(`${label}: found ${urls.length} http(s):// reference(s) — expected zero in an offline file.`);
}

function checkDataSchema(data, mode, label) {
  if (!data) return;
  const missing = mode.requiredTopKeys.filter((k) => !(k in data));
  if (missing.length) fail(`${label}: DATA object is missing top-level key(s): ${missing.join(", ")}.`);
  else pass(`${label}: DATA object has all ${mode.requiredTopKeys.length} required top-level keys for ${mode.label}.`);

  if (data.mode !== mode.key) fail(`${label}: data.mode is "${data.mode}", expected "${mode.key}".`);
  else pass(`${label}: data.mode is "${mode.key}".`);

  if (data.check_in && typeof data.check_in === "object") {
    const requiredCheckin = ["title", "question", "min_minutes", "max_minutes", "yes_response", "capture_no_reason"];
    const missingCheckin = requiredCheckin.filter((k) => !(k in data.check_in));
    if (missingCheckin.length) fail(`${label}: check_in is missing key(s): ${missingCheckin.join(", ")}.`);
    else pass(`${label}: check_in has all required keys.`);

    if (data.check_in.question === mode.expectedKnockQuestion) {
      pass(`${label}: Knock question matches "${mode.expectedKnockQuestion}".`);
    } else {
      fail(`${label}: Knock question is "${data.check_in.question}", expected "${mode.expectedKnockQuestion}".`);
    }

    if (mode.requireCaptureNoReasonTrue) {
      if (data.check_in.capture_no_reason === true) pass(`${label}: capture_no_reason is true, as required for ${mode.label}.`);
      else fail(`${label}: capture_no_reason must be true for ${mode.label}, got ${data.check_in.capture_no_reason}.`);
    }
  } else {
    fail(`${label}: check_in is missing or not an object.`);
  }

  if (data.hard_stop && typeof data.hard_stop === "object") {
    if (data.hard_stop.enabled === mode.expectedHardStopEnabled) {
      pass(`${label}: hard_stop.enabled is ${mode.expectedHardStopEnabled}, as expected for ${mode.label}.`);
    } else {
      fail(`${label}: hard_stop.enabled is ${data.hard_stop.enabled}, expected ${mode.expectedHardStopEnabled} for ${mode.label}.`);
    }
    if (mode.expectedHardStopEnabled && !String(data.hard_stop.message || "").trim()) {
      fail(`${label}: hard_stop.enabled is true but hard_stop.message is empty.`);
    }
  } else {
    fail(`${label}: hard_stop is missing or not an object.`);
  }

  const expectedCount = mode.expectedExitPromptsCount || 5;
  if (Array.isArray(data.exit_prompts) && data.exit_prompts.length === expectedCount) {
    pass(`${label}: exit_prompts has exactly ${expectedCount} entries.`);
    const mismatches = mode.expectedExitPrompts.filter((p, i) => data.exit_prompts[i] !== p);
    if (mismatches.length === 0) pass(`${label}: exit_prompts match the ${mode.label} spec exactly.`);
    else fail(`${label}: exit_prompts do not match the ${mode.label} spec. Got: ${JSON.stringify(data.exit_prompts)}`);
  } else {
    fail(`${label}: exit_prompts must be an array of exactly ${expectedCount} entries.`);
  }

  const list = data[mode.listField];
  if (Array.isArray(list) && list.length >= 3 && list.length <= 5) {
    pass(`${label}: ${mode.listField} has ${list.length} entries (3-5 required).`);
  } else {
    fail(`${label}: ${mode.listField} must have 3 to 5 entries.`);
  }
}

function checkCsvHeader(html, mode, label) {
  const csvHeaderInJs = (html.match(/CSV_HEADER\s*=\s*\[([\s\S]*?)\]/) || [])[1];
  if (!csvHeaderInJs) {
    fail(`${label}: could not find a CSV_HEADER array in the template's JavaScript.`);
    return;
  }
  const fields = [...csvHeaderInJs.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  const joined = fields.join(",");
  if (joined === mode.expectedCsvHeader) {
    pass(`${label}: CSV_HEADER matches the ${mode.label} schema exactly.`);
  } else {
    fail(`${label}: CSV_HEADER does not match. Got: ${joined}\n       Expected: ${mode.expectedCsvHeader}`);
  }
}

/* ---------- per-mode checks ---------- */
const templateContents = {};

for (const mode of MODES) {
  section(`${mode.label} template`);

  if (!existsSync(mode.template)) {
    fail(`${path.relative(ROOT, mode.template)} does not exist.`);
    continue;
  }
  pass(`${path.relative(ROOT, mode.template)} exists.`);

  const html = readFileSync(mode.template, "utf8");
  templateContents[mode.key] = html;

  const startCount = (html.match(/<!-- NEXT_BLOCK_DATA_START -->/g) || []).length;
  const endCount = (html.match(/<!-- NEXT_BLOCK_DATA_END -->/g) || []).length;
  if (startCount === 1) pass("exactly one NEXT_BLOCK_DATA_START marker.");
  else fail(`expected exactly one NEXT_BLOCK_DATA_START marker, found ${startCount}.`);
  if (endCount === 1) pass("exactly one NEXT_BLOCK_DATA_END marker.");
  else fail(`expected exactly one NEXT_BLOCK_DATA_END marker, found ${endCount}.`);

  const data = extractDataBlock(html, `${mode.label} template`);
  if (data) pass(`${mode.label} template's data block parses as valid JSON.`);
  checkDataSchema(data, mode, `${mode.label} template`);

  checkNoExternalResources(html, `${mode.label} template`);
  checkCsvHeader(html, mode, `${mode.label} template`);
}

/* ---------- the three templates must have genuinely diverged ---------- */
section("Cross-template divergence");
const keys = MODES.map((m) => m.key);
for (let i = 0; i < keys.length; i++) {
  for (let j = i + 1; j < keys.length; j++) {
    const a = templateContents[keys[i]];
    const b = templateContents[keys[j]];
    if (!a || !b) continue;
    if (a !== b) {
      pass(`${MODES[i].label} and ${MODES[j].label} templates are not byte-identical.`);
    } else {
      fail(`${MODES[i].label} and ${MODES[j].label} templates are byte-identical — they must be genuinely distinct instruments.`);
    }
  }
}

/* ---------- prompt files embed their OWN mode's template ---------- */
section("Prompt files");
for (const mode of MODES) {
  const name = path.relative(ROOT, mode.prompt);
  if (!existsSync(mode.prompt)) {
    fail(`${name} does not exist.`);
    continue;
  }
  const promptText = readFileSync(mode.prompt, "utf8");
  const embedMatch = promptText.match(/```html\n([\s\S]*?)\n```/);
  const ownTemplate = templateContents[mode.key];

  if (embedMatch && ownTemplate && embedMatch[1] === ownTemplate) {
    pass(`${name}: embeds the ${mode.label} template verbatim (byte-identical).`);
  } else if (embedMatch) {
    fail(`${name}: has an embedded HTML block, but it does NOT match ${path.relative(ROOT, mode.template)} byte-for-byte. Re-run scripts/build-templates.mjs then scripts/build-prompts.mjs.`);
  } else {
    fail(`${name}: no embedded \`\`\`html block found — pasting this prompt elsewhere would not include the template.`);
  }

  // Make sure this prompt did NOT accidentally embed one of the OTHER modes' templates.
  for (const otherMode of MODES) {
    if (otherMode.key === mode.key) continue;
    const otherTemplate = templateContents[otherMode.key];
    if (embedMatch && otherTemplate && embedMatch[1] === otherTemplate) {
      fail(`${name}: embeds the ${otherMode.label} template instead of its own ${mode.label} template.`);
    }
  }

  if (promptText.includes(mode.fillInstruction)) {
    pass(`${name}: contains the "${mode.fillInstruction}" instruction.`);
  } else {
    fail(`${name}: missing the "${mode.fillInstruction}" instruction.`);
  }

  if (/golden focus file template/i.test(promptText)) {
    fail(`${name}: still references the retired "Golden Focus File template" by name.`);
  } else {
    pass(`${name}: no leftover references to the retired Golden Focus File template.`);
  }

  if (promptText.includes("You are only filling the DATA block")) {
    pass(`${name}: explicitly instructs the AI to only fill the DATA block.`);
  } else {
    fail(`${name}: missing the "only filling the DATA block" instruction.`);
  }
}

report();

function report() {
  console.log("\n--- SUMMARY ---");
  console.log(`${checks - failures}/${checks} checks passed.`);
  if (failures > 0) {
    console.log(`${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("All checks passed.");
  }
}
