/* =========================================================
   GET /api/next-blocks-started
   Vercel serverless function (Node.js). Server-side only.

   Reads the current value of a single persistent counter key from Vercel KV
   (Upstash Redis under the hood) using its REST API directly via fetch() —
   no npm package/dependency needed, so this stays a zero-build static site
   with a couple of small serverless functions alongside it.

   Env vars (set in Vercel Project Settings -> Environment Variables, never
   committed to this repo, never sent to the browser):
     KV_REST_API_URL   — auto-populated when you add the Vercel KV (or
                          Upstash Redis) integration to this project
     KV_REST_API_TOKEN — same as above

   Returns { "total": <number> }. If the key has never been incremented,
   Upstash returns a null result, which genuinely means zero copies so far
   (this project is the only writer of this key), so total: 0 is accurate,
   not invented. If the KV request fails or env vars are missing, this
   returns an error status and the frontend hides the counter rather than
   showing a stale or fake number.
   ========================================================= */

var COUNTER_KEY = "next_block_copy_prompt_total";

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  var baseUrl = process.env.KV_REST_API_URL;
  var token = process.env.KV_REST_API_TOKEN;
  if (!baseUrl || !token) {
    res.status(500).json({ error: "KV_REST_API_URL / KV_REST_API_TOKEN not configured" });
    return;
  }

  try {
    var kvRes = await fetch(baseUrl + "/get/" + COUNTER_KEY, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!kvRes.ok) {
      res.status(502).json({ error: "KV request failed" });
      return;
    }

    var data = await kvRes.json();
    var raw = data ? data.result : null;
    var total = raw === null || raw === undefined ? 0 : parseInt(raw, 10);

    if (!Number.isFinite(total) || total < 0) {
      res.status(502).json({ error: "Unexpected counter value" });
      return;
    }

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.status(200).json({ total: total });
  } catch (err) {
    res.status(502).json({ error: "Failed to reach KV store" });
  }
};
