#!/usr/bin/env node
/* =========================================================
   scripts/build-prompts.mjs

   Regenerates the three copy-paste prompt files (prompts/ReadyToWork.md,
   prompts/Coaching.md, prompts/Explorer.md) from:

     1. Their source body text in prompts/_sources/*.body.md
        (the interview, tone rules, and DATA-block instructions — the
        part that's specific to each mode)
     2. The single frozen template in templates/golden-focus-file-template.html
        (the part that must be byte-identical across all three prompts
        and byte-identical to the actual downloadable sample file)

   This keeps the copied prompts' embedded template from ever drifting
   out of sync with templates/golden-focus-file-template.html. Run this
   any time the golden template changes:

     node scripts/build-prompts.mjs

   ========================================================= */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TEMPLATE_PATH = path.join(ROOT, "templates", "golden-focus-file-template.html");
const MARKER = "{{GOLDEN_TEMPLATE}}";

const TARGETS = [
  { source: "prompts/_sources/ready-to-work.body.md", out: "prompts/ReadyToWork.md" },
  { source: "prompts/_sources/coaching-loop.body.md", out: "prompts/Coaching.md" },
  { source: "prompts/_sources/explorer.body.md", out: "prompts/Explorer.md" }
];

const template = readFileSync(TEMPLATE_PATH, "utf8");

if (!template.includes("<!-- NEXT_BLOCK_DATA_START -->") || !template.includes("<!-- NEXT_BLOCK_DATA_END -->")) {
  console.error("ERROR: golden template is missing its NEXT_BLOCK_DATA_START/END markers.");
  process.exit(1);
}

let failed = false;

for (const target of TARGETS) {
  const sourcePath = path.join(ROOT, target.source);
  const outPath = path.join(ROOT, target.out);
  const body = readFileSync(sourcePath, "utf8");

  if (!body.includes(MARKER)) {
    console.error(`ERROR: ${target.source} has no ${MARKER} marker to inject the template into.`);
    failed = true;
    continue;
  }

  const final = body.replace(MARKER, () => template);
  writeFileSync(outPath, final, "utf8");
  console.log(`Wrote ${target.out} (${final.length} bytes, template embedded from ${path.relative(ROOT, TEMPLATE_PATH)})`);
}

if (failed) process.exit(1);
