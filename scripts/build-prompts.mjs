#!/usr/bin/env node
/* =========================================================
   scripts/build-prompts.mjs

   Regenerates the three copy-paste prompt files (prompts/ReadyToWork.md,
   prompts/Coaching.md, prompts/Explorer.md) from:

     1. Their source body text in prompts/_sources/*.body.md
        (the interview, tone rules, and DATA-block instructions — the
        part that's specific to each mode)
     2. That mode's own frozen template in templates/*-focus-file-template.html
        (the part that must be byte-identical between a mode's prompt
        and that mode's actual downloadable template)

   Unlike the retired single-Golden-Template system, each mode now embeds
   its OWN template, not a shared one — Ready to Work embeds the Ready to
   Work template, Coaching Loop embeds the Coaching Loop template, and
   Explorer embeds the Explorer template. Changes to one mode's fragment
   files never leak into another mode's generated prompt.

   This keeps each copied prompt's embedded template from ever drifting
   out of sync with its own templates/<mode>-focus-file-template.html.
   Run this any time a mode's fragment changes (after re-running
   scripts/build-templates.mjs):

     node scripts/build-templates.mjs && node scripts/build-prompts.mjs

   ========================================================= */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TARGETS = [
  {
    source: "prompts/_sources/ready-to-work.body.md",
    out: "prompts/ReadyToWork.md",
    template: "templates/ready-to-work-focus-file-template.html",
    marker: "{{READY_TO_WORK_TEMPLATE}}"
  },
  {
    source: "prompts/_sources/coaching-loop.body.md",
    out: "prompts/Coaching.md",
    template: "templates/coaching-loop-focus-file-template.html",
    marker: "{{COACHING_LOOP_TEMPLATE}}"
  },
  {
    source: "prompts/_sources/explorer.body.md",
    out: "prompts/Explorer.md",
    template: "templates/explorer-focus-file-template.html",
    marker: "{{EXPLORER_TEMPLATE}}"
  }
];

let failed = false;

for (const target of TARGETS) {
  const sourcePath = path.join(ROOT, target.source);
  const outPath = path.join(ROOT, target.out);
  const templatePath = path.join(ROOT, target.template);

  if (!existsSync(templatePath)) {
    console.error(`ERROR: ${target.template} does not exist. Run scripts/build-templates.mjs first.`);
    failed = true;
    continue;
  }

  const template = readFileSync(templatePath, "utf8");

  if (!template.includes("<!-- NEXT_BLOCK_DATA_START -->") || !template.includes("<!-- NEXT_BLOCK_DATA_END -->")) {
    console.error(`ERROR: ${target.template} is missing its NEXT_BLOCK_DATA_START/END markers.`);
    failed = true;
    continue;
  }

  const body = readFileSync(sourcePath, "utf8");

  if (!body.includes(target.marker)) {
    console.error(`ERROR: ${target.source} has no ${target.marker} marker to inject its template into.`);
    failed = true;
    continue;
  }

  const final = body.replace(target.marker, () => template);
  writeFileSync(outPath, final, "utf8");
  console.log(`Wrote ${target.out} (${final.length} bytes, template embedded from ${target.template})`);
}

if (failed) process.exit(1);
