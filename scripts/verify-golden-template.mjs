#!/usr/bin/env node
/* =========================================================
   scripts/verify-golden-template.mjs

   Sanity-checks the frozen Golden Focus File template and the three
   copy-paste prompts that embed it. Run this after any change to
   templates/golden-focus-file-template.html or to the prompt files:

     node scripts/verify-golden-template.mjs

   Exits non-zero (and prints every failure) if anything is wrong.
   No external dependencies — Node's built-in fs/path only.
   ========================================================= */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TEMPLATE_PATH = path.join(ROOT, "templates", "golden-focus-file-template.html");
const SAMPLE_PATH = path.join(ROOT, "NextBlock_sample_focus_file.html");
const PROMPT_PATHS = [
  path.join(ROOT, "prompts", "ReadyToWork.md"),
  path.join(ROOT, "prompts", "Coaching.md"),
  path.join(ROOT, "prompts", "Explorer.md")
];

const EXPECTED_CSV_HEADER =
  "date,block,planned_start,actual_start,planned_finish,actual_finish,output,action_list_checks,check_in_responses,what_got_done,how_it_felt,what_got_in_the_way,next_block_start";

const REQUIRED_TOP_KEYS = [
  "schema_version", "mode", "mode_label", "title", "subtitle", "start_time",
  "start_location", "planned_finish", "finish_line", "feeling", "why",
  "avoidance_move", "avoidance_line", "distraction_plan", "jobs",
  "check_in", "hard_stop", "exit_prompts", "prior_log_rows"
];

const REQUIRED_CHECKIN_KEYS = [
  "title", "question", "min_minutes", "max_minutes", "yes_response",
  "sort_of_response", "no_response", "capture_no_reason", "replay_instruction"
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

function checkDataSchema(data, label) {
  if (!data) return;
  REQUIRED_TOP_KEYS.forEach((key) => {
    if (!(key in data)) fail(`${label}: DATA object is missing top-level key "${key}".`);
  });
  if (Object.keys(data).length && REQUIRED_TOP_KEYS.every((k) => k in data)) {
    pass(`${label}: DATA object has all ${REQUIRED_TOP_KEYS.length} required top-level keys.`);
  }

  if (data.check_in && typeof data.check_in === "object") {
    const missing = REQUIRED_CHECKIN_KEYS.filter((k) => !(k in data.check_in));
    if (missing.length) fail(`${label}: check_in is missing key(s): ${missing.join(", ")}.`);
    else pass(`${label}: check_in has all required keys.`);
  } else {
    fail(`${label}: check_in is missing or not an object.`);
  }

  if (Array.isArray(data.exit_prompts) && data.exit_prompts.length === 5) {
    pass(`${label}: exit_prompts has exactly 5 entries.`);
  } else {
    fail(`${label}: exit_prompts must be an array of exactly 5 entries.`);
  }

  if (Array.isArray(data.jobs) && data.jobs.length >= 3 && data.jobs.length <= 5) {
    pass(`${label}: jobs has ${data.jobs.length} entries (3-5 required).`);
  } else {
    fail(`${label}: jobs must have 3 to 5 entries.`);
  }
}

/* ---------- 1. golden template exists ---------- */
section("Golden template file");
if (!existsSync(TEMPLATE_PATH)) {
  fail(`templates/golden-focus-file-template.html does not exist at ${TEMPLATE_PATH}`);
  report();
  process.exit(1);
}
pass("templates/golden-focus-file-template.html exists.");

const templateHtml = readFileSync(TEMPLATE_PATH, "utf8");

/* ---------- 2. exactly one START / one END marker ---------- */
const startCount = (templateHtml.match(/<!-- NEXT_BLOCK_DATA_START -->/g) || []).length;
const endCount = (templateHtml.match(/<!-- NEXT_BLOCK_DATA_END -->/g) || []).length;
if (startCount === 1) pass("exactly one NEXT_BLOCK_DATA_START marker.");
else fail(`expected exactly one NEXT_BLOCK_DATA_START marker, found ${startCount}.`);
if (endCount === 1) pass("exactly one NEXT_BLOCK_DATA_END marker.");
else fail(`expected exactly one NEXT_BLOCK_DATA_END marker, found ${endCount}.`);

/* ---------- 3. data block is valid JSON + schema ---------- */
const templateData = extractDataBlock(templateHtml, "golden template");
if (templateData) pass("golden template's data block parses as valid JSON.");
checkDataSchema(templateData, "golden template");

/* ---------- 4/5/6. no external scripts / stylesheets / network calls ---------- */
checkNoExternalResources(templateHtml, "golden template");

/* ---------- 7. CSV header check (inside the template's own JS) ---------- */
section("CSV header");
const csvHeaderInJs = (templateHtml.match(/CSV_HEADER\s*=\s*\[([\s\S]*?)\]/) || [])[1];
if (csvHeaderInJs) {
  const fields = [...csvHeaderInJs.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  const joined = fields.join(",");
  if (joined === EXPECTED_CSV_HEADER) {
    pass("golden template's CSV_HEADER matches the required 13-column schema exactly.");
  } else {
    fail(`golden template's CSV_HEADER does not match. Got: ${joined}`);
  }
} else {
  fail("could not find a CSV_HEADER array in the golden template's JavaScript.");
}

/* ---------- 8. sample downloadable file ---------- */
section("Downloadable sample Focus File");
if (existsSync(SAMPLE_PATH)) {
  const sampleHtml = readFileSync(SAMPLE_PATH, "utf8");
  pass("NextBlock_sample_focus_file.html exists.");
  checkNoExternalResources(sampleHtml, "sample Focus File");
  const sampleData = extractDataBlock(sampleHtml, "sample Focus File");
  checkDataSchema(sampleData, "sample Focus File");

  // the sample's HTML/CSS/JS outside the data block should match the golden template exactly
  const stripData = (html) =>
    html.replace(
      /<script id="next-block-data" type="application\/json">[\s\S]*?<\/script>/,
      "<script id=\"next-block-data\" type=\"application/json\">DATA</script>"
    );
  const stripTopBar = (html) => html.replace(/<div class="sample-bar" id="topBar">[^<]*<\/div>/, "<div class=\"sample-bar\" id=\"topBar\">BAR</div>");
  const normalizedTemplate = stripTopBar(stripData(templateHtml));
  const normalizedSample = stripTopBar(stripData(sampleHtml));
  if (normalizedTemplate === normalizedSample) {
    pass("sample Focus File's HTML/CSS/JS is otherwise byte-identical to the golden template (only the data block and top bar text differ).");
  } else {
    fail("sample Focus File has drifted from the golden template outside the data block / top bar.");
  }
} else {
  fail(`NextBlock_sample_focus_file.html not found at ${SAMPLE_PATH}`);
}

/* ---------- 9. prompt files embed (or reference) the golden template ---------- */
section("Prompt files");
PROMPT_PATHS.forEach((promptPath) => {
  const name = path.relative(ROOT, promptPath);
  if (!existsSync(promptPath)) {
    fail(`${name} does not exist.`);
    return;
  }
  const promptText = readFileSync(promptPath, "utf8");
  const embedMatch = promptText.match(/```html\n([\s\S]*?)\n```/);
  if (embedMatch && embedMatch[1] === templateHtml) {
    pass(`${name}: embeds the golden template verbatim (byte-identical).`);
  } else if (embedMatch) {
    fail(`${name}: has an embedded HTML block, but it does NOT match templates/golden-focus-file-template.html byte-for-byte. Re-run scripts/build-prompts.mjs.`);
  } else if (/golden focus file template/i.test(promptText)) {
    fail(`${name}: references the golden template by name but has no embedded \`\`\`html block — pasting this prompt elsewhere would not include the template.`);
  } else {
    fail(`${name}: no embedded template and no reference to the Golden Focus File template found.`);
  }

  if (promptText.includes("You are only filling the DATA block")) {
    pass(`${name}: explicitly instructs the AI to only fill the DATA block.`);
  } else {
    fail(`${name}: missing the "only filling the DATA block" instruction.`);
  }
});

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
