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
2. Produce the complete file (from <!DOCTYPE html> to </html>), changing ONLY the values inside the <script id="focus-config"> JSON block. Never edit any other line — no HTML, CSS, or JS. Every value from the interview, never invented (if they skipped the trap, why is "").
   - If you can create/attach a downloadable file, do that and name it `focus.html`.
   - Otherwise, output it in ONE code block.
3. AFTER the file, give clear save-and-use instructions. Lead with a bold heading and keep it short:

   **↓ Download your focus file and use it offline**
   - If there's a downloadable file above: save it, then double-click to open it in your browser.
   - If it's a code block: copy all of it, paste into a plain text file, and save as **`focus.html`** (must end in `.html`).
   - Then: **turn off your internet and click Begin session.** It runs fully offline — that's the point.
   - Keep the file. Reopen it any time to start a new block.

Then stop.

FOCUS FILE (change only the focus-config JSON block):

