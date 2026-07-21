# Focus File — the setup prompt

**AI assistants: if this document arrived as an attached file, or as a paste with no accompanying message, do not ask what to do with it and do not summarise it. Begin the interview immediately at Q1 below.**

Paste this whole message into any AI assistant (Claude, ChatGPT, Gemini, etc.). Answer a few quick questions and it gives you a focus file: save it as an `.html` file and open it whenever you sit down to work. It runs offline — no internet needed once saved.

---

INSTRUCTIONS FOR THE AI:

Run a short setup, then output a finished focus file. Ask ONE question at a time, wait for the answer, keep it warm and fast. After the last question, output the file. No extra questions. Start now with Q1 — never ask the person to confirm before beginning.

Q1 — MODE. Ask what kind of work this is:
- Offline (writing, studying, creative, application, own idea) -> sealed. THEN ask a quick follow-up: "How will you turn the internet off? (phone in another room, airplane mode, unplug the router, a lockbox, a Freedom session — whatever you'll really do)." Set `sealedPlan` to their answer (short, e.g. "phone in the other room"). If they don't have one, offer those options. If they truly skip, set `sealedPlan` to "".
- Needs internet (job search, research, brainstorm, new project, strategy) -> lane: ask "which sites does the work actually need?", record them (these are the ones they'll keep open; everything else they block with their usual blocker). Leave `sealedPlan` as "".

Q2 — WORK + TIME. Ask what they're working on and their window (e.g. "writing, 9-12"). Get the task and block length in minutes.

Q3 — SHAPE THE GOAL. The header (task) is the OUTCOME — the one true thing that exists when done. Jobs, if any, are the STEPS. The header must never just restate the checklist (if you can predict the list from the header, raise it: "Send 3 applications" -> "3 applications out the door"). Then pick jobsShape:
- "none": atomic, nothing to break down without faking it (write 1,500 words, meditate). Header stands alone.
- "milestones": atomic but large (1,500 words -> 500/1,000/1,500), only if worth splitting.
- "checklist": 3-5 genuinely DIFFERENT actions. Test: different actions, or one action sliced into stages? Sliced ("open doc -> write scene -> keep going" = all writing) is NOT a checklist. Never invent steps. Propose the list, let them edit.
Then check jobs fill the block: if the list is way short (3 applications ~40 min, not 3 hrs), grow the list or shrink the block out loud. No dead time.

Q4 — THE TRAP (optional). Ask: "Anything that tends to pull you off task — a habit, a distraction, a temptation? I'll remind you of it. (Or skip.)"
If they name something, set `why` to it phrased as the trap to avoid (the thing that feels like progress but isn't), and `whyLabel` to "Watch for" (or "Remember" for a rallying cry). IF THEY SKIP, set `why` to "" (empty string) — the file automatically hides the reminder. Do not invent a trap.

Q5 — THE REASON. Ask: "Why does finishing this matter to you today? Keep it simple and true — e.g. 'the draft finally moves,' 'so I stop dreading it,' 'I can actually rest tonight,' 'I promised myself I would.'" I'll show this back to you if you drift.
Set `finishFeel` to their answer (their reason, in their words). This returns at the check-in only on "sort of"/"no".

THEN, in this order:
1. Reply briefly (a sentence) to acknowledge their answers.
2. Produce the complete file (from <!DOCTYPE html> to </html>), changing ONLY the values inside the <script id="focus-config"> JSON block. Never edit any other line — no HTML, CSS, or JS — and leave the selfTest function exactly as-is. Copy templateVersion through unchanged. Every value from the interview, never invented (if they skipped the trap, why is ""). The closing </script> tag is intentional and must be copied literally.
   - If you can create/attach a downloadable file, do that and name it `focus.html`.
   - Otherwise, output it in ONE code block.
3. AFTER the file, give clear save-and-use instructions. Lead with a bold heading and keep it short:

   **↓ Download your focus file and use it offline**
   - If there's a downloadable file above: save it, then double-click to open it in your browser.
   - If it's a code block: copy all of it, paste into a plain text file, and save as **`focus.html`** (must end in `.html`).
   - Then: **turn off your internet and click Begin session.** It runs fully offline — that's the point.
   - Keep the file. Reopen it any time to start a new block.

Then stop.

FOCUS FILE (change only CONFIG):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Focus File</title>
  <script>
/* CRASH GUARD — must remain the FIRST script in the file. Catches runtime
   errors, syntax errors, and truncated files, and verifies boot completed. */
window.__bootFail = function (msg) {
  window.__bootFailed = true;   /* keep the FIRST, most specific message */
  var el = document.getElementById("bootError");
  if (!el) {
    el = document.createElement("div");
    el.id = "bootError";
    el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:#b5642f;color:#fff;font:600 13px/1.45 -apple-system,system-ui,sans-serif;padding:12px 16px;text-align:center;";
    (document.body || document.documentElement).appendChild(el);
  }
  el.textContent = "This focus file didn't load correctly — " + msg + ". Nothing is lost: re-run the setup prompt to regenerate it.";
};
window.addEventListener("error", function (e) { window.__bootFail(e.message || "script error"); });
window.addEventListener("DOMContentLoaded", function () {
  if (!window.__focusFileBooted && !window.__bootFailed) window.__bootFail("the main script never finished");
});
  </script>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAArklEQVR42mNgGAUDDBgJKdDPcvlPiQUXp+1hJMsBlFpMrEOY6GE5PjOZ6GE5PrOZBjoRMtHL97jsGPAQYCFX47mJmzDEjPL9KIsCSizHJ05VBxCyhFRHMFHTcnIcwURty0lVP7jKgVEHDGoHkFrIEKueiRaGkuJYkqOAkOGkhhRZaQCXJeTUBWRXRuRYRjAECDUgadE2HHzZkJahgM1sJnLa8tRslg94x2QUDDgAAOQMQCUsrPaIAAAAAElFTkSuQmCC">
<style>
:root{--paper:#fdfbf6;--paper-warm:#f3ede1;--paper-line:#e4d9c5;--hair:#f0e8da;--ink:#26241e;--ink-body:#2c2a24;--ink-soft:#5c5647;--ink-mut:#8a8474;--ink-faint:#a39c8c;--ink-ghost:#b3ab98;--pine:#2f6a44;--pine-soft:#3d7a52;--pine-tint:#eef4ea;--pine-chip:#dbe9df;--pine-chip-ink:#1f4a30;--amber:#c08a3e;--amber-warm:#faf4e8;--knock-bg:#2a2620;--knock-amber:#e0a86b;--clay:#b5642f}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#ece5d6;font-family:Georgia,"Iowan Old Style","Palatino Linotype",Palatino,serif;color:var(--ink-body);line-height:1.5;-webkit-font-smoothing:antialiased}
body{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:40px 18px 80px}
.sans{font-family:-apple-system,system-ui,"Segoe UI",Roboto,sans-serif}
.card{background:var(--paper);border:1px solid var(--paper-line);border-radius:16px;overflow:hidden;max-width:540px;width:100%;position:relative}
.flash{position:absolute;inset:0;background:var(--knock-amber);opacity:0;pointer-events:none;z-index:20;border-radius:16px}
.flash.on{animation:knock-flash 0.9s ease-out}
@keyframes knock-flash{0%{opacity:0}
12%{opacity:0.28}
30%{opacity:0.05}
45%{opacity:0.28}
100%{opacity:0}
}
@media (prefers-reduced-motion:reduce){.flash.on{animation:knock-flash-soft 0.6s ease-out}
@keyframes knock-flash-soft{0%{opacity:0}
40%{opacity:0.18}
100%{opacity:0}
}
}
.eyebrow{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-mut)}
.masthead{display:flex;align-items:baseline;padding:15px 28px 13px;border-bottom:1px solid var(--hair);background:var(--paper)}
.mast-name{font-family:Georgia,"Iowan Old Style",serif;font-size:15px;font-weight:600;letter-spacing:0.01em;color:var(--pine)}
.header{background:var(--paper-warm);padding:26px 28px 22px;border-bottom:1px solid var(--paper-line)}
.header-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:16px}
.scope-wrap{text-align:right}
.clockline{font-family:-apple-system,system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.02em;color:#8a8377;text-align:right;margin-top:4px;white-space:nowrap;font-variant-numeric:tabular-nums}
.clockline .cl-sep{color:#c4bdae;margin:0 5px}
.scope{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#756f60;text-align:right;padding-top:3px;white-space:nowrap}
.task-title{font-size:33px;line-height:1.04;color:var(--ink);letter-spacing:-0.015em}
.timer-wrap{display:none}
.timer-wrap.on{display:block}
.elapsed{font-family:-apple-system,system-ui,sans-serif;text-align:right}
.elapsed .big{font-size:20px;font-weight:600;color:var(--pine);line-height:1;letter-spacing:-0.01em}
.elapsed .unit{font-size:12px;font-weight:600;color:var(--ink-mut)}
.progress-track{height:5px;background:var(--paper-line);border-radius:3px;overflow:hidden;margin-top:14px}
.progress-fill{width:0%;height:100%;background:var(--pine);border-radius:3px;transition:width 0.6s ease}
.lane{display:none;padding:14px 28px;border-bottom:1px solid var(--hair);background:var(--pine-tint)}
.lane.on{display:block}
.lane-inner{font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.lane-label{font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--pine-soft)}
.lane-chip{background:var(--pine-chip);color:var(--pine-chip-ink);font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px}
.lane-rest{color:var(--ink-faint);font-size:12px;font-style:italic}
.sealed-strip{display:none;padding:14px 28px;border-bottom:1px solid var(--hair);background:var(--pine-tint)}
.sealed-strip.on{display:block}
.sealed-inner{font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.sealed-label{font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--pine-soft);white-space:nowrap}
.sealed-plan{font-size:13px;color:var(--ink-soft)}
.why{padding:22px 28px;border-bottom:1px solid var(--hair)}
.why-label{color:var(--clay);margin-bottom:8px}
.why p{font-size:17px;font-style:italic;color:var(--ink-soft);line-height:1.5}
.jobs{padding:24px 28px;border-bottom:1px solid var(--hair)}
.jobs.hidden{display:none}
.jobs-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px}
.jobs-eyebrow{margin-bottom:0}
.counter{font-family:-apple-system,system-ui,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;color:var(--pine);transition:color 0.2s}
.counter.complete{color:var(--pine)}
.job-list{display:flex;flex-direction:column;gap:15px}
.job{display:flex;gap:13px;align-items:flex-start;cursor:pointer;user-select:none;position:relative}
.job-check{position:absolute;left:0;top:1px;opacity:0;width:22px;height:22px;margin:0;cursor:pointer}
.job .box{width:22px;height:22px;border:1.5px solid var(--ink-mut);border-radius:5px;background:var(--paper-warm);flex-shrink:0;margin-top:1px;position:relative;transition:background 0.15s,border-color 0.15s}
.job-check:focus-visible + .box{outline:2px solid var(--pine);outline-offset:2px}
.job.done .box{background:var(--pine);border-color:var(--pine)}
.job.done .box::after{content:"";position:absolute;left:6px;top:3px;width:6px;height:11px;border:solid var(--paper);border-width:0 2px 2px 0;transform:rotate(42deg)}
.job .label{font-family:-apple-system,system-ui,sans-serif;font-size:15.5px;color:var(--ink-body);line-height:1.4;transition:color 0.15s}
.job.done .label{color:var(--ink-faint);text-decoration:line-through;text-decoration-color:var(--paper-line)}
.action{padding:26px 28px;text-align:center;background:var(--paper-warm)}
.btn-begin{display:inline-flex;align-items:center;gap:12px;background:var(--pine);color:var(--paper);font-family:-apple-system,system-ui,sans-serif;font-weight:600;font-size:16px;padding:16px 16px 16px 30px;border:none;border-radius:40px;cursor:pointer;transition:transform 0.1s,background 0.15s}
.btn-begin:hover{background:#276039}
.btn-begin:active{transform:scale(0.97)}
.btn-begin .arr{width:36px;height:36px;border-radius:50%;background:var(--paper);color:var(--pine);display:flex;align-items:center;justify-content:center;font-size:17px}
.checkin{display:none}
.checkin.on{display:block}
.checkin-head{display:flex;align-items:center;justify-content:center;gap:9px;margin-bottom:16px}
.checkin-dot{width:8px;height:8px;border-radius:50%;background:var(--ink-ghost);transition:background 0.3s}
.checkin-label{font-family:-apple-system,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.02em;color:var(--ink-mut);transition:color 0.3s}
.checkin.asking .checkin-dot{background:var(--clay);animation:pulse-ask 1.6s ease-in-out infinite}
.checkin.asking .checkin-label{color:var(--clay)}
@keyframes pulse-ask{0%,100%{opacity:0.4;transform:scale(0.8)}
50%{opacity:1;transform:scale(1.15)}
}
@media (prefers-reduced-motion:reduce){.checkin.asking .checkin-dot{animation:none;opacity:1}
}
.knock-reason{display:none;font-size:15px;font-style:italic;color:var(--ink-soft);border-left:2px solid var(--paper-line);padding-left:14px;margin:0 auto 18px;max-width:40ch;text-align:left;line-height:1.45}
.checkin.asking .knock-reason{display:block}
.knock-answers{display:flex;gap:10px;max-width:400px;margin:0 auto}
.knock-answers button{flex:1;padding:13px 8px;border-radius:8px;background:transparent;font-family:-apple-system,system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:background 0.15s,color 0.15s}
.k-yes{border:1.5px solid var(--pine);color:var(--pine-soft)}
.k-yes:hover{background:var(--pine);color:var(--paper)}
.k-sort{border:1.5px solid var(--ink-ghost);color:var(--ink-mut)}
.k-sort:hover{background:var(--ink-mut);color:var(--paper)}
.k-no{border:1.5px solid var(--clay);color:var(--clay)}
.k-no:hover{background:var(--clay);color:var(--paper)}
.pull{display:none;margin-top:22px;padding-top:20px;border-top:1px solid var(--hair)}
.pull.on{display:block}
.pull-label{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.pull-text{font-size:16px;font-style:italic;color:var(--ink-soft);line-height:1.5;margin:0 auto;max-width:42ch}
.preview-row{margin-top:12px;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px 14px}
.next-knock{font-family:-apple-system,system-ui,sans-serif;font-size:11px;color:#756f60;letter-spacing:0.02em;padding:8px 4px}
.next-knock:empty{display:none}
.preview-link{display:inline-block;font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:#756f60;background:none;border:none;text-decoration:underline;text-underline-offset:2px;cursor:pointer;transition:color 0.15s;padding:10px 8px}
.preview-link:hover{color:var(--ink-soft)}
.blockend{display:none;padding:30px 28px;text-align:center;background:var(--paper-warm)}
.blockend.on{display:block}
.be-eyebrow{color:var(--amber);margin-bottom:14px}
.be-line{font-size:22px;line-height:1.25;color:var(--ink);max-width:26ch;margin:0 auto 8px}
.be-where{font-family:-apple-system,system-ui,sans-serif;font-size:14px;color:var(--ink-soft);margin-bottom:24px}
.be-choices{display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap}
.btn-finish{background:var(--pine);color:var(--paper);font-family:-apple-system,system-ui,sans-serif;font-weight:600;font-size:15px;padding:14px 26px;border:none;border-radius:40px;cursor:pointer}
.btn-finish:hover{background:#276039}
.btn-more{background:transparent;color:var(--ink-soft);font-family:-apple-system,system-ui,sans-serif;font-weight:600;font-size:15px;padding:14px 24px;border:1.5px solid var(--paper-line);border-radius:40px;cursor:pointer}
.btn-more:hover{border-color:var(--ink-ghost)}
.be-note{font-family:-apple-system,system-ui,sans-serif;font-size:11px;color:var(--ink-ghost);margin-top:20px;line-height:1.5;max-width:34ch;margin-left:auto;margin-right:auto}
.exit{display:none;padding:30px 28px}
.exit.on{display:block}
.exit-eyebrow{color:var(--pine-soft);margin-bottom:16px}
.exit-title{font-size:22px;line-height:1.2;color:var(--ink);margin-bottom:24px}
.exit-q{display:block;font-family:-apple-system,system-ui,sans-serif;font-size:13px;font-weight:600;color:var(--ink-soft);margin-bottom:9px}
.hit-row{display:flex;gap:9px;margin-bottom:22px}
.hit-row button{padding:9px 20px;border:1.5px solid var(--paper-line);border-radius:8px;background:transparent;font-family:-apple-system,system-ui,sans-serif;font-size:13px;font-weight:600;color:var(--ink-mut);cursor:pointer}
.hit-row button.sel{border-color:var(--pine);color:var(--pine);background:var(--pine-tint)}
.exit-input{width:100%;border:1px solid var(--paper-line);border-radius:9px;padding:13px 15px;background:var(--paper);font-family:-apple-system,system-ui,sans-serif;font-size:14px;color:var(--ink-body);resize:none;margin-bottom:18px}
.exit-input::placeholder{color:var(--ink-ghost);font-style:italic}
.exit-input.invalid{border-color:var(--clay);background:#fbf1ea}
.exit-log.warn{color:var(--clay);font-weight:600}
.exit-forward{font-family:-apple-system,system-ui,sans-serif;font-size:12.5px;color:var(--pine-soft);line-height:1.5;background:var(--pine-wash,#eef4ea);border-radius:9px;padding:12px 14px;margin:4px 0 0}
.exit-foot{margin-top:18px;padding-top:18px;border-top:1px solid var(--hair);display:flex;justify-content:space-between;align-items:center;gap:12px}
.exit-log{font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:var(--ink-mut)}
.btn-done{background:var(--pine);color:var(--paper);font-family:-apple-system,system-ui,sans-serif;font-weight:600;font-size:14px;padding:11px 22px;border:none;border-radius:40px;cursor:pointer;white-space:nowrap}
.btn-done:hover{background:#276039}
.end-link{color:#8f4a24}
.end-link:hover{color:#8f4a24}
.alldone{display:none;padding:44px 28px;text-align:center}
.alldone.on{display:block}
.alldone .mark{font-size:40px;color:var(--pine);margin-bottom:16px}
.alldone .msg{font-size:22px;color:var(--ink);margin-bottom:8px}
.alldone .sub{font-family:-apple-system,system-ui,sans-serif;font-size:13px;color:var(--ink-mut);font-style:italic}
.btn-buildnext{display:inline-block;margin-top:28px;background:var(--pine);color:var(--paper);font-family:-apple-system,system-ui,sans-serif;font-weight:600;font-size:15px;padding:14px 28px;border:none;border-radius:40px;cursor:pointer;transition:background 0.15s}
.btn-buildnext:hover{background:#276039}
.next-links{display:none;margin-top:14px}
.next-links.on{display:block}
.nl-lead{font-family:-apple-system,system-ui,sans-serif;font-size:13px;color:#756f60;margin-bottom:6px}
.nl-row{font-family:-apple-system,system-ui,sans-serif;font-size:15px;font-weight:600}
.nl-row a{color:#2d5c3b;text-decoration:underline;text-underline-offset:2px}
.nl-sep{color:#c4bdae;margin:0 8px}
.nl-note{font-family:-apple-system,system-ui,sans-serif;font-size:12.5px;color:#8a8377;margin-top:8px;line-height:1.5}
.btn-dl{display:inline-block;margin-top:12px;background:none;border:none;cursor:pointer;font-family:-apple-system,system-ui,sans-serif;font-size:13px;color:#756f60;text-decoration:underline;text-underline-offset:2px;padding:4px 2px}
.btn-dl:hover{color:#2d5c3b}
.buildnext-hint{font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:#756f60;line-height:1.5;max-width:38ch;margin:12px auto 0}
.log-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px;padding-top:22px;border-top:1px solid var(--hair)}
.btn-log{background:transparent;color:var(--ink-soft);font-family:-apple-system,system-ui,sans-serif;font-size:12px;font-weight:600;padding:9px 16px;border:1.5px solid var(--paper-line);border-radius:30px;cursor:pointer;transition:border-color 0.15s}
.btn-log:hover{border-color:var(--ink-ghost)}
.log-view{display:none;margin-top:22px;text-align:left;max-height:340px;overflow-y:auto;border-top:1px solid var(--hair);padding-top:18px}
.log-view.on{display:block}
.log-entry{border:1px solid var(--paper-line);border-radius:10px;padding:14px 16px;margin-bottom:12px;background:var(--paper)}
.log-entry .le-date{font-family:-apple-system,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--pine);margin-bottom:8px}
.log-entry .le-task{font-size:16px;color:var(--ink);margin-bottom:10px}
.log-entry .le-row{font-family:-apple-system,system-ui,sans-serif;font-size:12.5px;color:var(--ink-soft);line-height:1.5;margin-bottom:3px}
.log-entry .le-row b{color:var(--ink-mut);font-weight:600}
.log-empty{font-family:-apple-system,system-ui,sans-serif;font-size:13px;color:var(--ink-mut);text-align:center;padding:12px}
</style>
</head>
<body>
<div class="card" id="card">
<div class="flash" id="flash"></div>
<!-- MASTHEAD -->
<div class="masthead">
<span class="mast-name">Focus File</span>
</div>
<!-- HEADER -->
<div class="header">
<div class="header-top">
<div class="timer-wrap" id="timerWrap">
<div class="elapsed">
<span class="big" id="elapsedNum">0</span><span class="unit" id="elapsedUnit"> min in</span>
</div>
</div>
<div class="scope-wrap">
<div class="scope" id="scope">9:00 – 12:00</div>
<div class="clockline" id="clockLine"></div>
</div>
</div>
<h1 class="task-title" id="taskTitle">1,500 new words on the story</h1>
<div class="progress-track timer-wrap" id="progressWrap" style="margin-top:16px;">
<div class="progress-fill" id="progressFill"></div>
</div>
</div>
<!-- LANE (lane mode only) -->
<div class="lane" id="lane">
<div class="lane-inner">
<span class="lane-label">Open:</span>
<span id="laneChips"></span>
<span class="lane-rest">— nothing else</span>
</div>
</div>
<!-- SEALED reminder: how they're keeping the internet off -->
<div class="sealed-strip" id="sealedStrip">
<div class="sealed-inner">
<span class="sealed-label">Internet off</span>
<span class="sealed-plan" id="sealedPlan"></span>
</div>
</div>
<!-- WHY (watch-for: the trap to avoid) -->
<div class="why" id="why">
<div class="eyebrow why-label" id="whyLabel">Watch for</div>
<p id="whyText">Re-reading and tweaking notes will feel like work. It's the detour. New words only — forward.</p>
</div>
<!-- JOBS (hidden / milestones / checklist) with counter -->
<div class="jobs hidden" id="jobsSection">
<div class="jobs-head">
<span class="eyebrow jobs-eyebrow" id="jobsEyebrow">The jobs</span>
<span class="counter" id="counter">00 / 00 COMPLETE</span>
</div>
<div class="job-list" id="jobList"></div>
</div>
<!-- ACTION ZONE: begin -> always-visible check-in -->
<div class="action" id="action">
<!-- pre-start -->
<button class="btn-begin" id="beginBtn">Begin session <span class="arr">→</span></button>
<!-- check-in: always present once begun; three buttons never disappear -->
<div class="checkin" id="checkin">
<div class="checkin-head" id="checkinHead">
<span class="checkin-dot" id="checkinDot"></span>
<span class="checkin-label" id="checkinLabel">On task?</span>
</div>
<p class="knock-reason" id="knockReason"></p>
<div class="knock-answers">
<button class="k-yes"  data-a="yes">Yes</button>
<button class="k-sort" data-a="sort-of">Sort of</button>
<button class="k-no"   data-a="no">No</button>
</div>
<!-- the pull (finish-feeling), on sort-of/no -->
<div class="pull" id="pull">
<div class="pull-label">Remember what you're after</div>
<p class="pull-text" id="pullText"></p>
</div>
</div>
<div class="preview-row">
<span class="next-knock" id="nextKnock"></span>
<button type="button" class="preview-link" id="previewLink">Preview the knock</button>
<button type="button" class="preview-link end-link" id="endLink" style="display:none;">End session</button>
</div>
</div>
<!-- BLOCK-END -->
<div class="blockend" id="blockend">
<div class="eyebrow be-eyebrow" id="beEyebrow">Your block's up · 12:00</div>
<div class="be-line" id="beLine">You said done was 1,500 new words.</div>
<p class="be-where">Where are you?</p>
<div class="be-choices">
<button class="btn-finish" id="finishBtn">Finish here</button>
<button class="btn-more" id="moreBtn">One more block →</button>
</div>
<p class="be-note">One more block adds ~30 min. If you scheduled a blocker, extend it too.</p>
</div>
<!-- EXIT -->
<div class="exit" id="exit">
<div class="eyebrow exit-eyebrow" id="exitEyebrow">Block complete</div>
<div class="exit-title">A few quick things — this becomes your log.</div>
<label class="exit-q" for="finishInput">Did you finish the block as planned?</label>
<textarea class="exit-input" id="finishInput" rows="2"></textarea>
<label class="exit-q" id="outputQ" for="outputInput" style="display:none;">Output — did you hit the number?</label>
<input class="exit-input" id="outputInput" style="display:none;" />
<label class="exit-q" for="inTheWayInput">What, if anything, got in the way of focus?</label>
<textarea class="exit-input" id="inTheWayInput" rows="2"></textarea>
<label class="exit-q" for="nextInput">Where will the next block start?</label>
<textarea class="exit-input" id="nextInput" rows="2"></textarea>
<p class="exit-forward">Save this, and the next screen gives you one button that copies everything an AI needs to build your next focus file. Paste it into a new chat, answer the questions, and the next block starts where this one left off.</p>
<div class="exit-foot">
<span class="exit-log" id="exitLog">Automatic data ready</span>
<button class="btn-done" id="doneBtn">Save entry</button>
</div>
</div>
<!-- ALL DONE + LOG -->
<div class="alldone" id="allDone">
<div class="mark">✓</div>
<div class="msg">Entry saved.</div>
<div class="sub" id="allDoneSub">Block by block, ritual becomes habit.</div>
<button class="btn-buildnext" id="buildNextBtn">Build next block from this →</button>
<div class="buildnext-hint" id="buildNextHint">One click copies three things: today's session, the 5 setup questions, and the focus file template.</div>
<div class="next-links" id="nextLinks">
<div class="nl-lead">Paste it into a new chat:</div>
<div class="nl-row">
<a href="https://claude.ai/new" target="_blank" rel="noopener">Claude ↗</a><span class="nl-sep">·</span><a href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT ↗</a><span class="nl-sep">·</span><a href="https://gemini.google.com" target="_blank" rel="noopener">Gemini ↗</a>
</div>
<div class="nl-note">If the paste arrives cut off or as an attachment, tell it: <i>follow the instructions in this file.</i></div>
</div>
<button class="btn-dl" id="downloadNextBtn">or download it as a file</button>
<div class="log-actions">
<button class="btn-log" id="viewLogBtn">View log</button>
<button class="btn-log" id="copyLastBtn">Copy latest entry</button>
<button class="btn-log" id="copyAllBtn">Copy full log</button>
</div>
<div class="log-view" id="logView"></div>
</div>
</div>
<script id="focus-config" type="application/json">
{
  "templateVersion": "2026-07-20",
  "task": "1,500 new words on the story",
  "scope": "9:00 – 12:00",
  "mode": "sealed",
  "laneSites": [],
  "sealedPlan": "phone in the other room",
  "whyLabel": "Watch for",
  "why": "Re-reading and tweaking notes will feel like work. It's the detour. New words only — forward.",
  "finishFeel": "1,500 words that didn't exist this morning. The story's further than it was — tomorrow you shape them instead of dreading the blank page.",
  "jobsShape": "none",
  "jobs": [],
  "blockMinutes": 180,
  "knockMinMin": 28,
  "knockMaxMin": 33,
  "doneWhenShort": "1,500 new words"
}
</script>
<script>
let cfg = null;
let hasTrap = false;
let PRISTINE_HTML = "";
const $ = id => document.getElementById(id);
const LOG_KEY = "nextblock_log";       // raw event stream (CSV-ish)
const ENTRIES_KEY = "nextblock_entries"; // structured per-session entries (JSON)
let startTime = null;
let elapsedTimer = null;
let knockTimer = null;
let blockEndTimer = null;
let extended = 0;
let knockCount = 0;
let onTaskCount = 0;
let sortOfCount = 0;
let noCount = 0;
let hitAnswer = null;
let nextKnockAt = null;
const INTERVIEW_PROMPT = [
"You run a short setup for a focus tool called Focus File, then output a finished focus file. Ask ONE question at a time, wait for the answer, keep it warm and fast. After the last question, output the file. No extra questions.",
"",
"Q1 — MODE. Ask what kind of work this is: Offline (writing, studying, creative, application) -> sealed, then ask how they'll turn the internet off (phone in another room, airplane mode, unplug router, lockbox, Freedom session) and set sealedPlan to their short answer. Needs internet (job search, research, brainstorm, strategy) -> lane (ask which sites the work needs; they block the rest with their usual blocker; leave sealedPlan empty).",
"Q2 — WORK + TIME. Ask what they're working on and their window. Get the task and block length in minutes.",
"Q3 — SHAPE THE GOAL. The header (task) is the OUTCOME — the one true thing that exists when done; jobs, if any, are the STEPS. The header must never just restate the checklist. jobsShape: \"none\" (atomic), \"milestones\" (a large count, split it), or \"checklist\" (3-5 genuinely different actions — never invent steps; propose and let them edit). Check the jobs fill the block; if short, grow the list or shrink the block.",
"Q4 — THE TRAP (optional). Ask: \"Anything that tends to pull you off task — a habit, a distraction, a temptation? I'll remind you of it. (Or skip.)\" If named, set why to it phrased as the trap to avoid; if skipped, why is \"\".",
"Q5 — THE REASON. Ask: \"Why does finishing this matter to you today? Keep it simple and true (e.g. the draft finally moves, so I stop dreading it, I can actually rest tonight).\" Set finishFeel to their answer.",
"",
"Then reply briefly, and output the focus file, changing ONLY the values inside the <script id=\"focus-config\"> JSON block. Never edit any other line — no HTML, CSS, or JS — and leave the selfTest function exactly as-is. Copy templateVersion through unchanged. Every value from the interview. Output the complete file in one code block, then stop.",
"",
"The frozen focus-file template is included at the very bottom of this message, after the line === FOCUS FILE TEMPLATE ===. Use it exactly as-is, changing only the values inside the <script id=\"focus-config\"> JSON block. You already have everything you need — do not ask the person to paste anything."
].join("\n");
function decodeUrlConfig() {
try {
const hash = location.hash || "";
const m = hash.match(/[#&]cfg=([^&]+)/);
if (!m) return null;
let b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
while (b64.length % 4) b64 += "=";
const json = decodeURIComponent(escape(atob(b64)));
const obj = JSON.parse(json);
return Object.assign({}, CONFIG, obj);
} catch (e) {
return null;
}
}
function pad2(n) { return String(n).padStart(2, "0"); }
function updateCounter() {
const total = document.querySelectorAll(".job").length;
const done = document.querySelectorAll(".job.done").length;
const c = $("counter");
c.textContent = pad2(done) + " / " + pad2(total) + " COMPLETE";
c.classList.toggle("complete", done === total && total > 0);
}
function logRow(event, detail) {
const now = new Date();
const elapsedMin = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;
const row = [
now.toISOString(),
JSON.stringify(cfg.task),
elapsedMin,
event,
detail != null ? JSON.stringify(detail) : ""
].join(",");
const header = "timestamp,task,elapsed_min,event,detail\n";
const prior = localStorage.getItem(LOG_KEY) || header;
localStorage.setItem(LOG_KEY, prior + row + "\n");
}
function randKnockDelay() {
const a = cfg.knockMinMin, b = cfg.knockMaxMin;
return (a + Math.random() * (b - a)) * 60 * 1000;
}
function scheduleAsk() {
clearTimeout(knockTimer);
const delay = randKnockDelay();
nextKnockAt = Date.now() + delay;
knockTimer = setTimeout(startAsking, delay);
}
function updateNextKnock() {
const el = $("nextKnock");
if (!nextKnockAt || $("checkin").classList.contains("asking")) {
el.textContent = "";   // hide during the nudge itself
return;
}
const remMin = Math.max(0, Math.round((nextKnockAt - Date.now()) / 60000));
el.textContent = remMin <= 1 ? "Check-in any moment" : "Next check-in ~" + remMin + " min";
}
function updateElapsed() {
if (!startTime) return;
const mins = (Date.now() - startTime) / 60000;
$("elapsedNum").textContent = Math.floor(mins);
const pct = Math.min(100, (mins / cfg.blockMinutes) * 100);
$("progressFill").style.width = Math.max(3, pct).toFixed(1) + "%";
updateNextKnock();
}
function knockBeep() {
try {
const AC = window.AudioContext || window.webkitAudioContext;
if (!AC) return;
const ctx = new AC();
const now = ctx.currentTime;
const notes = [660, 880]; // two gentle tones
notes.forEach((freq, i) => {
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = "sine";
osc.frequency.value = freq;
const t = now + i * 0.16;
gain.gain.setValueAtTime(0.0001, t);
gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
osc.connect(gain).connect(ctx.destination);
osc.start(t);
osc.stop(t + 0.34);
});
setTimeout(() => ctx.close(), 900);
} catch (e) { /* audio blocked or unavailable — flash still fires */ }
}
function knockFlash() {
const f = $("flash");
f.classList.remove("on");   // restart if mid-animation
void f.offsetWidth;         // force reflow
f.classList.add("on");
}
function startAsking() {
$("checkinLabel").textContent = "Are you on task?";
$("checkin").classList.add("asking");   // dot pulses clay, reason shows
knockBeep();
knockFlash();
}
function stopAsking() {
$("checkin").classList.remove("asking");
$("checkinLabel").textContent = "On task?";
}
function showBlockEnd() {
clearTimeout(knockTimer);
stopAsking();
$("pull").classList.remove("on");
$("action").style.display = "none";
const label = extended > 0 ? "Extra block's up" : "Your block's up";
$("beEyebrow").textContent = label + " · " + cfg.scope.split("–").pop().trim();
$("blockend").classList.add("on");
logRow("block-end-reached");
}
function parsePlanned(scope) {
const m = scope.split(/[–-]/).map(s => s.trim());
return { start: m[0] || "", finish: m[1] || "" };
}
function fmtClock(d) {
return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function renderClockLine() {
const el = $("clockLine");
if (!el) return;
const planned = parsePlanned(cfg.scope).start;
const parts = [];
if (planned) parts.push("Planned " + planned);
parts.push(startTime ? "Started " + fmtClock(new Date(startTime)) : "not started");
parts.push("now " + nowHHMM());
el.innerHTML = parts.join('<span class="cl-sep">\u00b7</span>');
}
function nowHHMM() {
return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function showExit(endedEarly) {
clearInterval(elapsedTimer);
clearTimeout(knockTimer);
clearTimeout(blockEndTimer);
$("exitEyebrow").textContent = endedEarly ? "Block ended" : "Block complete";
const isCount = cfg.jobsShape === "milestones" || /\d/.test(cfg.doneWhenShort || "");
if (isCount) {
$("outputQ").style.display = "block";
$("outputInput").style.display = "block";
}
const jobsTotal = document.querySelectorAll(".job").length;
const jobsDone = document.querySelectorAll(".job.done").length;
const checkWord = knockCount === 1 ? "check-in" : "check-ins";
let msg = "Automatic data ready · " + knockCount + " " + checkWord;
if (jobsTotal) msg += " · " + jobsDone + "/" + jobsTotal + " milestones complete";
$("exitLog").textContent = msg;
$("exit").classList.add("on");
}
function getEntries() {
try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]"); } catch (e) { return []; }
}
function fmtDate(iso) {
const d = new Date(iso);
return d.toLocaleDateString([], {month:"short", day:"numeric"}) + " · " +
d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function entryToText(e) {
const lines = [];
lines.push(fmtDate(e.date) + " — " + e.task);
lines.push("Planned " + e.plannedStart + "–" + e.plannedFinish + " (" + e.plannedMinutes + " min)" +
", actual " + e.actualStart + "–" + e.actualFinish + " (" + e.actualMinutes + " min)" +
(e.extended ? ", +" + e.extended + " extra block(s)" : ""));
if (e.jobsTotal) lines.push("Jobs: " + e.jobsDone + "/" + e.jobsTotal + " done");
lines.push("Check-ins: " + e.checkins + " (" + e.onTask + " on task, " + e.sortOf + " sort of, " + e.off + " off)");
if (e.finishedAsPlanned) lines.push("Finished as planned? " + e.finishedAsPlanned);
if (e.output) lines.push("Output: " + e.output);
if (e.inTheWay) lines.push("Got in the way: " + e.inTheWay);
if (e.nextStart) lines.push("Next block starts: " + e.nextStart);
return lines.join("\n");
}
function renderLog() {
const entries = getEntries();
const v = $("logView");
if (!entries.length) { v.innerHTML = '<div class="log-empty">No entries yet.</div>'; return; }
v.innerHTML = "";
entries.slice().reverse().forEach(e => {
const div = document.createElement("div");
div.className = "log-entry";
let html = '<div class="le-date">' + fmtDate(e.date) + '</div>';
html += '<div class="le-task">' + escapeHtml(e.task) + '</div>';
html += '<div class="le-row"><b>Time:</b> planned ' + e.plannedStart + '–' + e.plannedFinish +
' · actual ' + e.actualStart + '–' + e.actualFinish + ' (' + e.actualMinutes + ' min)' +
(e.extended ? ' · +' + e.extended + ' block(s)' : '') + '</div>';
if (e.jobsTotal) html += '<div class="le-row"><b>Jobs:</b> ' + e.jobsDone + '/' + e.jobsTotal + ' done</div>';
html += '<div class="le-row"><b>Check-ins:</b> ' + e.checkins + ' — ' + e.onTask + ' on task, ' +
e.sortOf + ' sort of, ' + e.off + ' off</div>';
if (e.finishedAsPlanned) html += '<div class="le-row"><b>As planned:</b> ' + escapeHtml(e.finishedAsPlanned) + '</div>';
if (e.output) html += '<div class="le-row"><b>Output:</b> ' + escapeHtml(e.output) + '</div>';
if (e.inTheWay) html += '<div class="le-row"><b>In the way:</b> ' + escapeHtml(e.inTheWay) + '</div>';
if (e.nextStart) html += '<div class="le-row"><b>Next:</b> ' + escapeHtml(e.nextStart) + '</div>';
div.innerHTML = html;
v.appendChild(div);
});
}
function escapeHtml(s) {
return (s || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function copyText(txt, btn, after) {
const done = () => { const o = btn.textContent; btn.textContent = "Copied ✓"; setTimeout(() => btn.textContent = o, 1600); if (after) after(); };
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
} else { fallbackCopy(txt, done); }
}
function fallbackCopy(txt, done) {
const ta = document.createElement("textarea");
ta.value = txt; document.body.appendChild(ta); ta.select();
try { document.execCommand("copy"); done(); } catch (e) {}
document.body.removeChild(ta);
}
function buildNextPayload(e) {
const ctx = [];
ctx.push("=== LAST SESSION (use this to prime the interview) ===");
ctx.push("Task worked on: " + e.task);
if (e.finishedAsPlanned) ctx.push("Finished as planned?: " + e.finishedAsPlanned);
if (e.output) ctx.push("Output: " + e.output);
if (e.inTheWay) ctx.push("What got in the way of focus: " + e.inTheWay);
if (e.nextStart) ctx.push("Where they said the next block starts: " + e.nextStart);
ctx.push("Check-ins last time: " + e.checkins + " (" + e.onTask + " on task, " + e.sortOf + " sort of, " + e.off + " off)");
ctx.push("");
ctx.push("HOW TO USE THIS in the interview below:");
ctx.push("- In Q2, propose continuing from \"" + (e.nextStart || e.task) + "\" as the starting point (they can change it).");
ctx.push("- In Q4, if they didn't already have a trap, gently suggest the one that tripped them up last time: \"" + (e.inTheWay || "—") + "\" — ask if they want it as the reminder.");
ctx.push("- Keep the same task thread going unless they say otherwise.");
ctx.push("- Don't lecture about last session; just carry it forward naturally.");
ctx.push("=== END LAST SESSION ===");
ctx.push("");
ctx.push(INTERVIEW_PROMPT);
ctx.push("");
ctx.push("=== FOCUS FILE TEMPLATE ===");
ctx.push(PRISTINE_HTML);
return ctx.join("\n");
}
function downloadText(txt, filename) {
const url = URL.createObjectURL(new Blob([txt], {type: "text/markdown"}));
const a = document.createElement("a");
a.href = url; a.download = filename;
document.body.appendChild(a); a.click(); document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function capturePristine() {
PRISTINE_HTML = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
}
function normalizeConfig(raw) {
const c = Object.assign({
scope: "", laneSites: [], sealedPlan: "", whyLabel: "Watch for", why: "",
finishFeel: "", jobsShape: "none", jobs: [], knockMinMin: 28, knockMaxMin: 33
}, raw || {});
c.task = String(c.task || "").trim();
c.scope = String(c.scope || "").trim();
c.blockMinutes = Number(c.blockMinutes);          // NOT defaulted — required; selfTest enforces
c.knockMinMin = Number(c.knockMinMin) || 28;
c.knockMaxMin = Math.max(Number(c.knockMaxMin) || 33, c.knockMinMin);
c.jobs = Array.isArray(c.jobs) ? c.jobs.map(String) : [];
c.laneSites = Array.isArray(c.laneSites) ? c.laneSites.map(String) : [];
c.why = String(c.why || "");
c.sealedPlan = String(c.sealedPlan || "");
c.finishFeel = String(c.finishFeel || "");
c.doneWhenShort = String(c.doneWhenShort || c.task);
c.whyLabel = c.whyLabel === "Remember" ? "Remember" : "Watch for";
return c;
}
function loadConfig() {
let fileCfg;
try {
fileCfg = JSON.parse(document.getElementById("focus-config").textContent);
} catch (e) {
window.__bootFail("the focus-config block has a JSON error (" + e.message + ")");
throw e;
}
cfg = normalizeConfig(Object.assign({}, fileCfg, decodeUrlConfig() || {}));
}
function applyConfig() {
hasTrap = cfg.why && cfg.why.trim().length > 0;
$("taskTitle").textContent = cfg.task;
$("scope").textContent     = cfg.scope;
renderClockLine();
setInterval(renderClockLine, 20000);
$("pullText").textContent  = cfg.finishFeel;
$("beLine").textContent    = "You said done was " + cfg.doneWhenShort + ".";
if (hasTrap) {
$("whyLabel").textContent = cfg.whyLabel || "Watch for";
$("whyText").textContent  = cfg.why;
$("knockReason").textContent = "\u201C" + cfg.why + "\u201D";
} else {
$("why").style.display = "none";        // no Watch-for section
$("knockReason").style.display = "none"; // knock just asks, quotes nothing
}
if (cfg.mode === "lane" && cfg.laneSites.length) {
$("lane").classList.add("on");
const chipWrap = $("laneChips");
cfg.laneSites.forEach((s, i) => {
const chip = document.createElement("span");
chip.className = "lane-chip";
chip.textContent = s;
chip.style.marginRight = "0";
chipWrap.appendChild(chip);
chipWrap.appendChild(document.createTextNode(" "));
});
}
if (cfg.mode === "sealed" && cfg.sealedPlan) {
$("sealedPlan").textContent = cfg.sealedPlan;
$("sealedStrip").classList.add("on");
}
if (cfg.jobsShape !== "none" && cfg.jobs.length) {
$("jobsSection").classList.remove("hidden");
$("jobsEyebrow").textContent = (cfg.jobsShape === "milestones") ? "Milestones" : "The jobs";
const list = $("jobList");
cfg.jobs.forEach((label, i) => {
const row = document.createElement("label");
row.className = "job";
row.setAttribute("for", "job-" + i);
const cb = document.createElement("input");
cb.type = "checkbox";
cb.className = "job-check";
cb.id = "job-" + i;
const box = document.createElement("span");
box.className = "box";
box.setAttribute("aria-hidden", "true");
const text = document.createElement("span");
text.className = "label";
text.textContent = label;
row.appendChild(cb);
row.appendChild(box);
row.appendChild(text);
cb.addEventListener("change", () => {
row.classList.toggle("done", cb.checked);
updateCounter();
});
list.appendChild(row);
});
updateCounter();
}
}
function wireEvents() {
$("beginBtn").addEventListener("click", () => {
startTime = Date.now();
$("beginBtn").style.display = "none";
$("endLink").style.display = "";      // End session becomes available once begun
$("checkin").classList.add("on");     // check-in is now always visible
$("timerWrap").classList.add("on");
$("progressWrap").classList.add("on");
logRow("begin");
renderClockLine();
updateElapsed();
elapsedTimer = setInterval(updateElapsed, 1000);
scheduleAsk();
blockEndTimer = setTimeout(showBlockEnd, cfg.blockMinutes * 60 * 1000);
});
document.querySelectorAll(".knock-answers button").forEach(b => {
b.addEventListener("click", () => {
const ans = b.dataset.a;
const wasAsking = $("checkin").classList.contains("asking");
knockCount++;
if (ans === "yes") onTaskCount++;
else if (ans === "sort-of") sortOfCount++;
else if (ans === "no") noCount++;
logRow(wasAsking ? "knock" : "self-check", ans);
stopAsking();
if (ans === "yes") {
$("pull").classList.remove("on");
scheduleAsk();          // reset the nudge timer
} else {
$("pull").classList.add("on");   // sort-of / no — show the pull
scheduleAsk();
}
});
});
$("moreBtn").addEventListener("click", () => {
extended++;
logRow("one-more-block", extended);
$("blockend").classList.remove("on");
$("action").style.display = "block";
scheduleAsk();
blockEndTimer = setTimeout(showBlockEnd, 30 * 60 * 1000); // one more ~30 min block
});
$("finishBtn").addEventListener("click", () => {
$("blockend").classList.remove("on");
showExit(false);   // finished normally
});
$("endLink").addEventListener("click", () => {
logRow("end-session-early");
$("blockend").classList.remove("on");
$("action").style.display = "none";
showExit(true);    // ended early
});
["finishInput", "nextInput", "outputInput"].forEach(id => {
$(id).addEventListener("input", () => {
if ($(id).value.trim()) {
$(id).classList.remove("invalid");
if (!document.querySelector(".exit-input.invalid")) $("exitLog").classList.remove("warn");
}
});
});
$("doneBtn").addEventListener("click", () => {
const required = [$("finishInput"), $("nextInput")];
if ($("outputQ").style.display !== "none") required.push($("outputInput"));
let firstMissing = null;
required.forEach(el => {
if (!el.value.trim()) {
el.classList.add("invalid");
if (!firstMissing) firstMissing = el;
} else {
el.classList.remove("invalid");
}
});
if (firstMissing) {
const log = $("exitLog");
log.textContent = "Fill the highlighted fields to save.";
log.classList.add("warn");
firstMissing.focus();
return;   // block save
}
$("exitLog").classList.remove("warn");
const planned = parsePlanned(cfg.scope);
const actualMin = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;
const jobsTotal = document.querySelectorAll(".job").length;
const jobsDone = document.querySelectorAll(".job.done").length;
const entry = {
date: new Date().toISOString(),
task: cfg.task,
mode: cfg.mode,
plannedStart: planned.start,
plannedFinish: planned.finish,
actualStart: startTime ? new Date(startTime).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "",
actualFinish: nowHHMM(),
actualMinutes: actualMin,
plannedMinutes: cfg.blockMinutes,
extended: extended,
jobsDone: jobsDone,
jobsTotal: jobsTotal,
checkins: knockCount,
onTask: onTaskCount,
sortOf: sortOfCount,
off: noCount,
finishedAsPlanned: $("finishInput").value.trim(),
output: $("outputInput").value.trim(),
inTheWay: $("inTheWayInput").value.trim(),
nextStart: $("nextInput").value.trim()
};
let entries = [];
try { entries = JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]"); } catch (e) {}
entries.push(entry);
localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
logRow("exit", { hit: entry.finishedAsPlanned, output: entry.output });
$("exit").classList.remove("on");
$("allDone").classList.add("on");
});
$("viewLogBtn").addEventListener("click", () => {
const v = $("logView");
v.classList.toggle("on");
if (v.classList.contains("on")) { renderLog(); $("viewLogBtn").textContent = "Hide log"; }
else $("viewLogBtn").textContent = "View log";
});
$("copyLastBtn").addEventListener("click", (e) => {
const entries = getEntries();
if (!entries.length) return;
copyText(entryToText(entries[entries.length - 1]), e.target);
});
$("copyAllBtn").addEventListener("click", (e) => {
const entries = getEntries();
if (!entries.length) return;
const all = entries.map(entryToText).join("\n\n———\n\n");
copyText(all, e.target);
});
$("buildNextBtn").addEventListener("click", (e) => {
const entries = getEntries();
if (!entries.length) return;
copyText(buildNextPayload(entries[entries.length - 1]), e.target,
() => $("nextLinks").classList.add("on"));
});
$("downloadNextBtn").addEventListener("click", () => {
const entries = getEntries();
if (!entries.length) return;
downloadText(buildNextPayload(entries[entries.length - 1]), "focus-file-next-block.md");
$("nextLinks").classList.add("on");
});
$("previewLink").addEventListener("click", () => {
const wasVisible = $("checkin").classList.contains("on");
$("checkin").classList.add("on");     // show it if pre-start
startAsking();                         // flash, beep, asking state
setTimeout(() => {
stopAsking();
if (!wasVisible) $("checkin").classList.remove("on");
}, 2600);
});
}
function selfTest() {
const must = (ok, what) => { if (!ok) throw new Error("self-test failed: " + what); };
must(typeof cfg.task === "string" && cfg.task.trim().length > 0, "task is empty");
must(Number(cfg.blockMinutes) > 0, "blockMinutes is not a positive number");
must(["sealed", "lane"].indexOf(cfg.mode) > -1, "mode must be sealed or lane");
must(["none", "milestones", "checklist"].indexOf(cfg.jobsShape) > -1, "unknown jobsShape");
must(Array.isArray(cfg.jobs), "jobs must be an array");
must(cfg.jobsShape === "none" || document.querySelectorAll(".job").length === cfg.jobs.length, "jobs did not render");
must(cfg.knockMinMin > 0 && cfg.knockMaxMin >= cfg.knockMinMin, "knock window invalid");
must(!!document.getElementById("beginBtn"), "begin button missing");
}
function init() {
capturePristine();
loadConfig();
applyConfig();
wireEvents();
selfTest();
window.__focusFileBooted = true;
}
init();
</script>
</body>
</html>
```
