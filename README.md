# Focus File

A free, offline focus tool for brains that stall at the starting line.

You answer a few quick questions in any AI chat, and it hands back a single self-contained HTML page — a "focus file" — that holds one block of work. You save it, turn off the internet, and open it. It shows what you're doing, quietly tracks your time, and knocks every half hour to ask if you're still on task, replaying your own reasons back to you. When you're done, a 60-second exit log records what happened — including where the next block starts.

No account. No server. Nothing leaves your browser.

---

## How it works

1. **The site** (`index.html`) shows a prompt and a Copy button.
2. **You copy the prompt** and paste it into any AI (Claude, ChatGPT, Gemini).
3. **The AI runs a ~2-minute interview** — five questions that narrow the work to one finishable block, name what will pull you off task, and capture why it matters.
4. **The AI outputs your focus file** — a complete HTML page, customized to your block.
5. **You save it and open it offline** to do the work.

The focus file runs entirely in the browser with no internet connection. The session log lives in the browser's local storage and can be copied out to share with a coach or therapist, or used to build the next block.

---

## The files

| File | What it is | Where it goes |
| --- | --- | --- |
| `index.html` | **The website.** The landing page. Its Copy button fetches `focus-file-prompt.md` at run time. | **Deploy.** |
| `focus-file-prompt.md` | **The setup prompt.** The 5-question interview plus the focus-file HTML template. This is what the Copy button hands out. | **Deploy** — the site fetches it. |
| `sample-writing.html` | **A finished focus file** for a writing block. Linked from the site as a live example. | **Deploy.** |
| `sample-jobsearch.html` | **A finished focus file** for a job-search block. Linked from the site. | **Deploy.** |
| `focus-file.html` | **The focus file template.** The page a session produces. Ships exactly as written — no minifying, no stripping. | Source. |
| `prompt-head.md` | **The interview.** The five questions and output instructions, prepended to the template by `build.py`. | Source. |
| `build.py` | Regenerates `focus-file-prompt.md` and the two samples from the template. | Source. |
| `test-focus-file.js` | jsdom harness — runs a whole block against any focus file. `npm i jsdom`, then `node test-focus-file.js sample-writing.html`. | Source. |

**Deploy set:** `index.html` + `focus-file-prompt.md` + `sample-writing.html` + `sample-jobsearch.html`. All four must go up together — the site fetches the prompt and links to the samples.

---

## Deploying to Vercel

Static HTML files. No build step, no framework, no dependencies.

**Drag-and-drop (simplest):**
1. Put `index.html`, `focus-file-prompt.md`, `sample-writing.html`, and `sample-jobsearch.html` in a folder together. `index.html` must be named exactly that.
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Drag the folder onto the deploy area.
4. Vercel gives you a live URL in seconds.

When asked about a framework or build command, choose **"Other"** or leave it blank — it's plain static files.

**Custom domain:**
1. In the Vercel project, go to **Settings → Domains**.
2. Add your domain (e.g. `thenextblock.org`).
3. Add the DNS records Vercel shows you at your domain registrar.
4. Wait for DNS to propagate (minutes to a few hours).

**After it's live:** click the Copy button on the deployed site and confirm the prompt copies. This also confirms `focus-file-prompt.md` deployed — the button fetches it, so if the file is missing the button opens a 404 instead. Both the clipboard and the fetch work more reliably on a real `https://` domain than on a local file.

---

## Editing the tool

Nothing is embedded in anything. `index.html` fetches the prompt at run time, which is why
there is no escaping, no minifying, and no second copy of the template to keep in sync.

- **To change the focus file** (the page a session produces): edit `focus-file.html`, then run
  `python3 build.py`. That regenerates `focus-file-prompt.md` and both samples.
- **To change the interview questions**: edit `prompt-head.md`, then run `python3 build.py`.
- **To change the website** (headline, layout, modals): edit `index.html` directly. No build needed.

Two rules worth keeping:

- **Never put a literal closing `script` or `textarea` tag inside an inline `<script>` block in
  `index.html`** — it ends the block early and kills the page. `build.py` fails the build if you do.
- **Don't reintroduce embedding.** Carrying a copy of the template inside the page is what used to
  ship files with an unclosed tag that died silently.

After any change, run the harness against a sample: `node test-focus-file.js sample-writing.html`.

---

## Design principles

- **Decide once, then just begin.** The setup ends fast so the doing can start. It plans just enough to begin, not enough to keep you planning.
- **It thinks with you, not for you.** It helps shape the work but builds nothing until you approve it. It doesn't decide what matters — it makes the intention you already chose harder to lose.
- **Accountability in your own words.** The knock replays what *you* said: your task, your reason, your usual escape. It's harder to argue with your own reasons.
- **The file holds the commitment between sessions.** Made the night before, it waits open beside the work like a note from yesterday's self.
- **Why a file?** No account, no service, nothing that can be taken away. The log stays in your browser, and the whole thing works with the Wi-Fi off — which is where most focused work happens anyway.

---

## Privacy

Focus files and logs live on the user's device, not on any server. There are no accounts, no storage, and no dashboard. The site only copies a prompt; whatever the user pastes into their AI is governed by that provider's own terms and privacy policy.

Focus File is not medical or psychological advice.

---

## Contact

Feedback, ideas, or problems: **erinconnery@gmail.com** · [thenextblock.org](https://www.thenextblock.org)

Built by a writer who couldn't start.

## License

MIT — free to use and adapt, including commercially. See `LICENSE`. The only requirement is keeping the copyright notice in copies of the code.
