# The Next Block

## A. What this is

This is the **static, copy-paste version** of The Next Block (Version 1). There is no build step, no framework, no backend, no API, no accounts, and no database. It's plain HTML, CSS, and JavaScript. It uses privacy-friendly Vercel Web Analytics for basic traffic counts only — see [section I](#i-analytics) for exactly what is and isn't tracked.

The AI interview does **not** run on this website. The site's only job is to let someone:

1. Pick a mode (Solo / With a Coach / Exploring).
2. Click that card's button, which copies the real, complete interview prompt to their clipboard.
3. Click "Open Claude," which opens claude.ai in a new tab.
4. Paste the prompt into a new Claude chat.
5. Answer Claude's seven-question interview there. Claude builds the offline "Next Block" HTML file directly in that chat.

Nothing about a person's answers, prompts, or generated files ever touches a server this project controls — it's a pure static frontend.

## B. How to run locally

This site needs to be *served*, not opened by double-clicking `index.html` — browsers block `fetch()` on `file://` pages, and the copy buttons rely on `fetch()` to load the real prompt text.

From inside this folder, run one of:

```
npx serve .
```

or

```
python3 -m http.server 8000
```

Then open the printed `localhost` URL in your browser.

## C. How to build

There is no build step. This is a zero-build static site — the files in this folder (`index.html`, `styles.css`, `app.js`, `prompts/`) are exactly what gets deployed. "Building for production" simply means deploying this folder as-is.

## D. Where the prompt files live

```
prompts/
  ReadyToWork.md — Ready to Work mode
  Coaching.md    — With a Coach mode
  Explorer.md    — Exploring mode
```

Each file is complete and self-contained — it explains what The Next Block is, how the model should behave, runs the full seven-question interview (customized per mode), and specifies the offline HTML file Claude must build at the end. None of the three files reference each other or depend on anything else in this repo. Pasting any one of them alone into a fresh Claude chat is enough to run a full session.

**The prompt text lives only in these three files.** `app.js` does not contain any prompt copy, template, or summary — it only knows the file path for each button and fetches that file's raw text when clicked.

## E. How to edit text

**Homepage copy** (hero text, card titles, subtitles, descriptions, footer, nav, Design/Disclaimer/Feedback content) lives in `index.html`. Visual styling (colors, spacing, fonts) is controlled by `styles.css`.

**The actual interview prompts** Claude runs live only in the three files under `prompts/`. Editing a prompt means editing its `.md` file directly, in any plain text editor — no other file needs to change, and the browser cache is bypassed on every click, so edits show up on the next copy.

## F. How to edit icons

The three mode icons (Solo, With a Coach, Exploring) are inline custom SVGs written directly in `index.html`, inside each card's `.title-row`, next to the black mode title. Their sizing and alignment (fixed icon box, shared SVG viewBox, color) are controlled by the `.title-row`, `.icon-box`, and `.path-symbol` rules in `styles.css`. There are no icon library dependencies or image files to manage — every icon is hand-drawn SVG paths in the markup.

## G. How to deploy to Vercel

1. Push this project to GitHub (see the GitHub steps below if you haven't done this).
2. Go to [vercel.com](https://vercel.com) and sign in (you can use your GitHub account to sign in).
3. Click **Add New Project**.
4. Import the GitHub repo you just pushed.
5. Let Vercel detect the build settings — this is a static site, so no build command or output directory is needed. Leave Vercel's defaults as-is.
6. Click **Deploy**.
7. Test the temporary `*.vercel.app` URL Vercel gives you once the deploy finishes, before connecting your real domain.

## H. How to connect thenextblock.org

Your domain is registered at Namecheap; hosting lives on Vercel. You do not need Namecheap hosting, WordPress, PremiumDNS, SiteLock, paid SSL, or business email for this site — Vercel issues free SSL automatically once DNS is pointed at it.

1. In Vercel, open **Project Settings → Domains**.
2. Add `thenextblock.org`.
3. Add `www.thenextblock.org`.
4. Copy the exact DNS records Vercel shows you (typically an `A` record for the root domain and a `CNAME` for `www`).
5. In Namecheap, go to **Domain List → Manage → Advanced DNS**.
6. Add or update the Host Records there to match exactly what Vercel provided.
7. Wait for DNS to update — this can take anywhere from a few minutes to about 24-48 hours. Vercel's Domains page shows a green checkmark once it detects correct resolution, and SSL is issued automatically at that point.

## I. Analytics

This project runs two privacy-friendly, cookieless analytics tools side by side — Vercel Web Analytics and Plausible. Neither uses cookies, neither collects personal data, and neither ever sees prompt text, file content, or anything a visitor types. **No Google Analytics is used anywhere in this project.**

### Vercel Web Analytics

**How it was added.** This project has no build step, so it uses Vercel Web Analytics' plain-HTML script method rather than the `@vercel/analytics` npm package (that package is for framework projects like Next.js/React that have a bundler). These script tags live in the `<head>` of `index.html`:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

That second script is served automatically by Vercel once Web Analytics is turned on for the project — there's nothing to install.

**You still need to do one manual step:** in your Vercel dashboard, open the project, click **Analytics** in the sidebar, and click **Enable**. Nothing tracks until that's on and the site is redeployed with these script tags live.

**Where to view it:** Vercel dashboard → your project → **Analytics** in the sidebar. Visits, page views, referrers, and device/browser breakdowns are on the free Hobby plan. **Custom events require a Pro or Enterprise plan to view in the dashboard** — the code fires them regardless, but they'll only show up if your Vercel plan includes the Custom Events feature.

**Custom events tracked (name only, no extra data):**
- `copy_solo_prompt` / `copy_coaching_loop_prompt` / `copy_exploring_prompt` — a mode's Copy prompt button clicked
- `open_claude` — any "Open Claude ↗" link clicked
- `send_feedback` — SEND FEEDBACK (footer) or the Feedback modal's email link clicked
- `share_site` — SHARE IT clicked

### Plausible Analytics

**How it was added.** The exact install snippet from the Plausible dashboard for this site was added to the `<head>` of `index.html`, right after the Vercel tags:

```html
<script async src="https://plausible.io/js/pa-oqBnf5_V4SRV4lbtttuo3.js"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init()
</script>
```

The site identifier is embedded in the script URL itself (`pa-oqBnf5_V4SRV4lbtttuo3.js`), so there's no separate `data-domain` attribute to configure. The inline snippet still queues events safely (via `window.plausible`) even if they fire before the async script finishes loading — the custom `copy_prompt`, `open_claude`, etc. calls in `app.js` didn't need to change.

**Where to view it:** your Plausible dashboard for the `thenextblock.org` site. Visits and page views are automatic; the custom events below appear under Plausible's Goals/Events view once the site starts getting traffic.

**Custom events tracked:**
- `copy_prompt` — a mode's Copy prompt button clicked, with one property: `mode` = `solo`, `coaching`, or `exploring` (never the prompt text itself)
- `open_claude` — any "Open Claude ↗" link clicked
- `download_sample_focus_file` — the showcase's "Download sample Focus File" link clicked (the download itself is untouched — the event just reports the click)
- `share_click` — SHARE IT clicked
- `feedback_click` — SEND FEEDBACK (footer) or the Feedback modal's email link clicked
- `design_notes_click` — the "Design notes" nav link clicked
- `disclaimer_click` — the "Disclaimer" nav link clicked

### What is never tracked, on either tool
- No prompt text or file content — every event fires on the click itself, never on what was copied
- No user-entered text of any kind (nothing on this site accepts free-text input)
- No email addresses or personal data
- No IP address stored or shown to this project (both tools are cookieless and don't expose raw IPs to site owners)
- No cookies, no accounts, no cross-site tracking, no ad identifiers
- **Nothing is ever tracked inside a generated offline focus file, the downloadable sample file, or a local browser log/CSV** — those run entirely on the visitor's own device, disconnected from this website, and this project has no way to see inside them even if it wanted to.

**Analytics policy:** do not add Google Analytics. Do not add a new analytics tool's script unless a real site URL/account for it actually exists — a placeholder tracking script pointed at no real account is worse than no analytics at all.

## K. Public counter ("NEXT BLOCKS STARTED")

The footer shows a small public counter — `[number] NEXT BLOCKS STARTED` (or `1 NEXT BLOCK STARTED` for exactly one) — that aggregates successful Copy prompt clicks across all three modes (Solo, Coaching, Exploring). It only increments after a copy actually succeeds; page loads, Open Claude clicks, downloads, shares, feedback clicks, and failed copy attempts never touch it.

**This is a small, self-contained counter — not a Plausible read.** An earlier version of this counter tried to read Plausible's aggregate `Copy prompt — Total` goal directly (which requires a paid Plausible Business plan), and was removed. This version instead uses its own persistent counter in Vercel KV (Upstash Redis), which has a usable free tier:

- `api/copy-prompt-increment.js` — a serverless function called once per successful copy. It increments a single counter key by 1 and returns nothing meaningful. It's called fire-and-forget from `app.js`, so it can never block or break the Copy prompt button even if it fails.
- `api/next-blocks-started.js` — a serverless function the footer fetches on page load. It reads the same counter key and returns `{ "total": <number> }`.

**Required setup in Vercel (not in this repo):**
1. In your Vercel project, go to **Storage** → add a **KV** database (or connect an Upstash Redis database) and link it to this project.
2. Vercel automatically sets the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables for you — these are server-side only and are never referenced anywhere in `index.html`, `app.js`, or any other client-side file.
3. Redeploy. Until this is set up, both endpoints return an error, the increment call silently no-ops, and the footer counter simply stays hidden — the rest of the site (including Copy prompt buttons) is completely unaffected.

**Caching:** `api/next-blocks-started.js` sets `Cache-Control: public, s-maxage=30, stale-while-revalidate=60`, so the number stays fresh within about 30 seconds without hammering the KV store on every page view.

**Privacy:** both endpoints touch exactly one integer counter. Neither reads, stores, nor forwards prompt text, mode names beyond the increment call itself, user-entered work, local logs/CSVs, or anything else about a visitor. Nothing is ever tracked inside a generated offline Focus File, the downloadable sample Focus File, or a local browser log — those stay entirely on the visitor's own device.

## Launch checklist

Go through this before sharing the link with anyone:

- [ ] Homepage loads
- [ ] Mobile layout works
- [ ] Logo and icons look right
- [ ] Copy Solo Prompt works
- [ ] Copy Coach Prompt works
- [ ] Copy Exploring Prompt works
- [ ] Open Claude link works
- [ ] Design nav link works
- [ ] Disclaimer nav link works
- [ ] Feedback nav link works
- [ ] Footer Share It works
- [ ] Footer Send Feedback opens email
- [ ] No old Witness branding is visible anywhere
- [ ] No API keys or secrets are in the repo
- [ ] Vercel preview URL works
- [ ] thenextblock.org resolves after DNS setup
- [ ] www.thenextblock.org resolves after DNS setup

## Manual QA for the copy buttons specifically

With the site served locally (not opened via `file://`):

- Click **Copy Solo Prompt**, paste into a plain text editor, confirm it's Solo-Sprint-specific language and the button briefly reads "Prompt copied."
- Click **Copy Coach Prompt**, confirm it contains therapist/coach/accountability-partner language and the professional-scope note.
- Click **Copy Exploring Prompt**, confirm it contains open-ended-decision/research language (job search, moving, strategy).
- Confirm all three are genuinely different documents, not the same text three times.
- Paste one full prompt into a fresh Claude chat and confirm Claude greets briefly, asks Question 1, and pushes back on a deliberately vague first answer (e.g. "work on my stuff").

## What was intentionally left out of this version

- No server, no API route, no account, no database — everything here is plain static files.
- No in-site chat interface. The interview only ever runs inside Claude, in a tab the person controls.
- No payments, no cookies, no cross-site tracking, no ad identifiers. Analytics is limited to privacy-friendly, cookieless Vercel Web Analytics — see [section I](#i-analytics).
