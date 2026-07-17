# Focus File

A free, offline focus tool for brains that stall at the starting line.

You answer a few quick questions in any AI chat, and it hands back a single self-contained HTML page — a "focus file" — that holds one block of work. You save it, turn off the internet, and open it. It shows what you're doing, quietly tracks your time, and knocks every half hour to ask if you're still on task, replaying your own reasons back to you. When you're done, a 60-second exit log records what happened and builds the seed of your next block.

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
| `index.html` | **The website.** A single self-contained landing page. The full prompt (below) is embedded inside it, so the Copy button hands out everything. This is the only file you host. | Deploy this to Vercel / any static host. |
| `the-next-block.md` | **The setup prompt.** The 5-question interview instructions plus the focus-file HTML template, in one paste-and-go document. This is what `index.html`'s Copy button copies. | Source of truth for the prompt. Not hosted separately — it's embedded in `index.html`. |
| `focus-file.html` | **The focus file template (readable).** The un-minified version of the HTML page a session produces. Kept for reference and editing. The minified version of this is embedded inside `the-next-block.md`. | Not hosted. Reference / editing only. |

**Key point:** only `index.html` gets deployed. The other two are the product's source — they're already baked into `index.html`.

---

## Deploying to Vercel

The site is one static HTML file. No build step, no framework, no dependencies.

**Drag-and-drop (simplest):**
1. Put `index.html` in a folder by itself. The file must be named exactly `index.html`.
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Drag the folder onto the deploy area.
4. Vercel gives you a live URL in seconds.

When asked about a framework or build command, choose **"Other"** or leave it blank — it's a plain static file.

**Custom domain:**
1. In the Vercel project, go to **Settings → Domains**.
2. Add your domain (e.g. `focus-file.com`).
3. Add the DNS records Vercel shows you at your domain registrar.
4. Wait for DNS to propagate (minutes to a few hours).

**After it's live:** click the Copy button on the deployed site and confirm the prompt copies. The clipboard works more reliably on a real `https://` domain than when opening the file locally.

---

## Editing the tool

Because the prompt and the focus file are embedded in `index.html`, changes flow like this:

- **To change the focus file** (the page a session produces): edit `focus-file.html`, minify it, re-embed it into `the-next-block.md`, then re-embed `the-next-block.md` into `index.html`.
- **To change the interview questions**: edit the instructions section at the top of `the-next-block.md`, then re-embed into `index.html`.
- **To change the website itself** (headline, layout, modals): edit `index.html` directly.

The embedding is what keeps the site self-contained — one file the Copy button can hand out in full, with no external requests.

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

Feedback, ideas, or problems: **hello@focus-file.com**

Built by a writer who couldn't start.
