/* =========================================================
   POST /api/copy-prompt-increment
   Vercel serverless function (Node.js). Server-side only.

   Atomically increments the single "copy_prompt_total" counter in Vercel KV
   by 1. Called by app.js exactly once per SUCCESSFUL clipboard copy (Solo,
   Coaching, or Exploring) — never on page load, never on a failed copy,
   never on any other click (Open Claude, download, share, feedback, nav).

   This endpoint intentionally accepts no body and returns no meaningful
   payload beyond a bare success flag — it never reads or stores prompt
   text, mode names, or anything else about the visitor. The frontend call
   is fire-and-forget: if this request fails (missing env vars, network
   issue, KV outage), it fails silently and never blocks or breaks the
   Copy prompt button.

   Env vars: same KV_REST_API_URL / KV_REST_API_TOKEN as
   api/next-blocks-started.js — set only in Vercel Project Settings.
   ========================================================= */

var COUNTER_KEY = "next_block_copy_prompt_total";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  var baseUrl = process.env.KV_REST_API_URL;
  var token = process.env.KV_REST_API_TOKEN;
  if (!baseUrl || !token) {
    // Fail closed and quiet — the frontend ignores this response either way.
    res.status(500).json({ error: "KV_REST_API_URL / KV_REST_API_TOKEN not configured" });
    return;
  }

  try {
    var kvRes = await fetch(baseUrl + "/incr/" + COUNTER_KEY, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token }
    });

    if (!kvRes.ok) {
      res.status(502).json({ error: "KV increment failed" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: "Failed to reach KV store" });
  }
};
