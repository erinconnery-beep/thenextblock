# Focus File — working context

Read this first. It explains how the repo fits together, which decisions are settled,
and where the traps are. `README.md` is the public description; this is the working brief.

---

## If you are an AI assistant reading this in a chat

Uploaded copies of these files are **read-only**, and the exact mount paths differ between
environments — do not assume any particular directory layout. Before editing anything:

1. Copy the project files to a writable working directory and work only there.
2. Put that directory under git, with a baseline commit, so every change is diffable.
3. Run `python3 build.py` after any edit to `focus-file.html` or to the interview
   instructions at the top of `focus-file-prompt.md`.
4. Hand finished files back through whatever output location the environment provides.

Verify before you edit: page copy in `index.html` lives *before* the
`<script type="text/plain" id="fullPrompt">` marker. Confirm any insertion point is below
that offset, and confirm the fullPrompt region is byte-identical afterwards. See the
embedding-chain warning below.

---

## What it is

A free AI prompt that runs a 5-question interview and outputs a self-contained offline
HTML "focus file" for one block of work. Site: **thenextblock.org**. Contact:
**erinconnery@gmail.com**. MIT licensed. Built by Erin Connery to finish a book draft;
it worked, so it's public.

Freedom protects the time; this structures what you do with it.

---

## THE EMBEDDING CHAIN — read before editing anything

The prompt is embedded inside the site. Edits must flow in one direction:

```
focus-file.html                (readable template — the page a session produces)
      ↓  strip TESTS, keep readable line breaks
focus-file-prompt.md           (interview instructions + template in a ```html block)
      ↓  escape </script> → <\/script>
index.html                     (inside <script type="text/plain" id="fullPrompt">)
      ↓  regex-replace the CONFIG block
sample-writing.html / sample-jobsearch.html
```

**Never hand-edit the embedded copy inside `index.html`.** Edit `focus-file.html`,
then run `python3 build.py`, which redoes the whole chain safely.

### The trap that has already bitten once

`index.html` contains a *second* full HTML document as text (the embedded template).
So the file legitimately contains two `<head>`, two `<body>`, two `</html>`.
Any find-and-replace targeting `</style></head>` or similar can land inside the
**embedded template** instead of the page. If an unescaped `</script>` ends up in
there it closes the `fullPrompt` container early, and the rest of the template
becomes live HTML — Copy breaks and ~700 lines of garbage execute.

Symptom: `Unexpected token '<'` in the console, Copy returns truncated text.
Fix: re-run `build.py`, which rebuilds the region from source.

### Why the template is NOT minified

Minifying put the whole template on one 18,751-character line, which stalls large
pastes into chat interfaces. Un-minified, the longest line is ~443 chars. Bigger file,
far more reliable paste. **Do not minify the embedded template.**

### TESTS

`focus-file.html` keeps a `TESTS` object for `?test=writing` style previews.
`build.py` strips it from everything shipped and simplifies the config line to
`urlCfg || CONFIG`. Produced files load config from `CONFIG` or a `#cfg=` base64 hash.

---

## Settled decisions — don't undo these

**The tool records boundaries, it does not enforce them.** It cannot block anything.
All copy says the *person* turns off the internet or blocks sites with their own
blocker. Never write "blocks everything." The lane strip says "— nothing else,"
not "rest blocked."

**Privacy claims must be exactly scoped.** The focus file and its log stay local —
true. But the *interview* happens inside a third-party AI, so that conversation goes
to that provider. Both the Privacy and Log modals say so. Never write "nothing is
ever sent anywhere."

**No analytics in anything that represents a focus file.** `index.html` only.
The samples and the template must make zero network calls; that's tested. Sample
*visits* are captured via the `view_sample` click event on the link instead.

**Model-agnostic.** Claude, ChatGPT, and Gemini are three equal options.

**No "how it felt" field.** The exit log captures: finished as planned / output number
(count goals only) / what got in the way / where the next block starts. Don't promise
a feelings field that doesn't exist.

**Q5 is the reason, not a reward.** "Why does finishing this matter to you today?"
It surfaces only on a "sort of" or "no" at check-in.

**Favicon is a PNG data-URI**, not SVG — SVG data-URI favicons don't render reliably
for local `file://` pages.

**Design notes are a personal story, not a feature list** — the interview modal already
explains mechanics, so the notes carry evidence instead. Keep the Mario Kart line.

---

## Vocabulary

- **focus file** — the offline HTML artifact (lowercase in prose, "Focus File" as product)
- **the knock / check-in** — the ~28–33 min prompt asking if you're on task
- **the trap** — Q4, the thing that feels like work but isn't
- **the reason** — Q5, replayed on drift
- **block** — one work session
- **exit log** — the 60-second close
- **sealed / lane** — offline mode vs. allowlisted-sites mode

---

## Analytics

Plausible, script in `index.html` `<head>` only. Events fire via explicit
`track('name')` calls in the JS — **not** CSS class tagging, which proved unreliable.

Six events, each needing a matching Custom Event goal in Plausible:
`copy_prompt`, `open_ai`, `view_sample`, `design_notes_click`, `share_click`,
`feedback_click`.

Note: `open_ai` can't fire before `copy_prompt` — the AI links are hidden until the
copy reveal. Plausible never backfills, so goals must exist before the clicks.

---

## Deploying

Static files, no build step on the host. **Deploy set:** `index.html` +
`sample-writing.html` + `sample-jobsearch.html` (the samples are linked from the site).
Everything else is source. Vercel auto-deploys from the repo.

When uploading a zip to GitHub, drag the files from *inside* the folder so
`index.html` lands at the repo root.

---

## Known limits — state them honestly, don't paper over

- **Build takes minutes.** The AI must emit ~50KB of HTML token by token. Only real
  fixes are a smaller template or not regenerating it each time, both of which cost
  something. Not a bug.
- **Nothing past the copy is measurable.** No way to know if someone finished the
  interview, built a file, or used it. That's the cost of the offline design.
- **Self-report can be gamed.** Someone can click "Yes" while on Reddit. The exit log
  is where that would show up.
