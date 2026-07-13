#!/usr/bin/env node
/* =========================================================
   scripts/build-templates.mjs

   Assembles the three standalone, mode-specific Focus File templates
   from shared foundation partials + each mode's own fragment:

     templates/_shared/foundation.css   (shared visual foundation)
     templates/_shared/foundation.js    (shared runtime helper library)
     templates/<mode>/fragment.html     (mode-specific markup)
     templates/<mode>/fragment.css      (mode-specific CSS additions)
     templates/<mode>/fragment.js       (mode-specific runtime + validation)
     templates/<mode>/sample-data.json  (mode-specific example DATA block)

   Output (one standalone, fully offline HTML file per mode):

     templates/ready-to-work-focus-file-template.html
     templates/coaching-loop-focus-file-template.html
     templates/explorer-focus-file-template.html

   This is a build step, not a place to hand-author markup: each mode's
   final template is produced by inlining shared + mode-specific code, so
   changes to the shared foundation propagate to all three outputs, and
   changes to one mode's fragment never touch the others. Run this any
   time a fragment or the shared foundation changes:

     node scripts/build-templates.mjs

   ========================================================= */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SHARED_CSS = path.join(ROOT, "templates", "_shared", "foundation.css");
const SHARED_JS = path.join(ROOT, "templates", "_shared", "foundation.js");

const MODES = [
  {
    key: "ready-to-work",
    dir: path.join(ROOT, "templates", "ready-to-work"),
    out: path.join(ROOT, "templates", "ready-to-work-focus-file-template.html"),
    docTitle: "The Next Block — Ready to Work — Focus File"
  },
  {
    key: "coaching-loop",
    dir: path.join(ROOT, "templates", "coaching-loop"),
    out: path.join(ROOT, "templates", "coaching-loop-focus-file-template.html"),
    docTitle: "The Next Block — Coaching Loop — Practice File"
  },
  {
    key: "explorer",
    dir: path.join(ROOT, "templates", "explorer"),
    out: path.join(ROOT, "templates", "explorer-focus-file-template.html"),
    docTitle: "The Next Block — Explorer — Inquiry File"
  }
];

const sharedCss = readFileSync(SHARED_CSS, "utf8");
const sharedJs = readFileSync(SHARED_JS, "utf8");

let failed = false;

for (const mode of MODES) {
  try {
    const fragmentHtml = readFileSync(path.join(mode.dir, "fragment.html"), "utf8");
    const fragmentCss = readFileSync(path.join(mode.dir, "fragment.css"), "utf8");
    const fragmentJs = readFileSync(path.join(mode.dir, "fragment.js"), "utf8");
    const sampleDataRaw = readFileSync(path.join(mode.dir, "sample-data.json"), "utf8");

    // Validate the sample data is well-formed JSON before baking it in.
    const sampleData = JSON.parse(sampleDataRaw);
    const sampleDataJson = JSON.stringify(sampleData, null, 2);

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${mode.docTitle}</title>
<style>
${sharedCss.trim()}

/* ---------- mode-specific additions (${mode.key}) ---------- */
${fragmentCss.trim()}
</style>
</head>
<body>
${fragmentHtml.trim()}

<!-- NEXT_BLOCK_DATA_START -->
<script id="next-block-data" type="application/json">
${sampleDataJson}
</script>
<!-- NEXT_BLOCK_DATA_END -->
<script>
(function () {
  'use strict';

${sharedJs.trim()}

  /* ---------- mode-specific runtime (${mode.key}) ---------- */
${fragmentJs.trim()}
})();
</script>
</body>
</html>
`;

    writeFileSync(mode.out, html, "utf8");
    console.log(`Wrote ${path.relative(ROOT, mode.out)} (${html.length} bytes)`);
  } catch (error) {
    console.error(`ERROR building ${mode.key}: ${error.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
