/* =========================================================
   THE NEXT BLOCK — site logic
   This is a copy-prompt workflow: the interview does NOT run
   on this website. Each card's button fetches its mode's real
   prompt file from /prompts and copies the actual file content
   to the clipboard; the person pastes it into Claude themselves
   and Claude builds the offline Next Block file directly in that
   chat. The prompt text lives ONLY in the markdown files under
   prompts/ — nothing here duplicates or summarizes it, so
   editing a prompt only ever means editing its .md file.
   ========================================================= */
(function(){
  "use strict";

  /* ---------- analytics helpers ----------
     Fire a custom event by name only (plus, for Plausible, a small fixed set of
     non-content properties like "mode"). Never pass prompt text, user-entered
     text, emails, or any other personal/content data. */
  function trackEvent(name){
    if (typeof window.va === "function"){
      try { window.va("event", { name: name }); } catch (e){ /* analytics must never break the site */ }
    }
  }

  function trackPlausible(name, props){
    if (typeof window.plausible === "function"){
      try { window.plausible(name, props ? { props: props } : undefined); }
      catch (e){ /* analytics must never break the site */ }
    }
  }

  /* Maps each prompt file to its Vercel analytics event name (event name only —
     never the prompt's actual text). */
  var PROMPT_EVENT_NAMES = {
    "prompts/Solo.md": "copy_solo_prompt",
    "prompts/Coaching.md": "copy_coaching_loop_prompt",
    "prompts/Explorer.md": "copy_exploring_prompt"
  };

  /* Maps each prompt file to its Plausible "mode" property value. */
  var PROMPT_MODE_NAMES = {
    "prompts/Solo.md": "solo",
    "prompts/Coaching.md": "coaching",
    "prompts/Explorer.md": "exploring"
  };

  /* ---------- clipboard helper (with a manual-copy fallback) ---------- */
  async function copyText(text){
    if (navigator.clipboard && navigator.clipboard.writeText){
      try { await navigator.clipboard.writeText(text); return true; }
      catch (e){ /* fall through to legacy path */ }
    }
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e){
      return false;
    }
  }

  /* ---------- prompt file loader, with an in-memory cache per file ---------- */
  var promptCache = Object.create(null);

  async function loadPromptFile(path){
    if (promptCache[path]) return promptCache[path];
    var response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status + " loading " + path);
    var text = await response.text();
    if (!text.trim()) throw new Error("Empty prompt file: " + path);
    promptCache[path] = text;
    return text;
  }

  /* ---------- copy-prompt buttons on each card ---------- */
  document.querySelectorAll(".copy-prompt-btn").forEach(function(btn){
    var promptFile = btn.getAttribute("data-prompt-file");
    var originalText = btn.textContent;
    var card = btn.closest(".path-card");
    var statusEl = card ? card.querySelector(".copy-status") : null;
    var postCopy = card ? card.querySelector(".post-copy") : null;

    btn.addEventListener("click", async function(){
      btn.disabled = true;
      var ok = false;
      var statusMsg = "";
      try {
        var text = await loadPromptFile(promptFile);
        ok = await copyText(text);
        statusMsg = ok
          ? ""
          : "Copy failed. Select and copy the prompt manually.";
      } catch (e){
        statusMsg = "Couldn't load the prompt — check your connection.";
      }
      if (ok && PROMPT_EVENT_NAMES[promptFile]) trackEvent(PROMPT_EVENT_NAMES[promptFile]);
      if (ok && PROMPT_MODE_NAMES[promptFile]) trackPlausible("copy_prompt", { mode: PROMPT_MODE_NAMES[promptFile] });
      if (ok){
        // Fire-and-forget: increments the public "NEXT BLOCKS STARTED" counter.
        // Never awaited, never blocks the button, fails silently on any error.
        try {
          fetch("/api/copy-prompt-increment", { method: "POST" }).catch(function(){});
        } catch (e){ /* never let this break the copy flow */ }
      }
      btn.textContent = ok ? "Copied ✓" : originalText;
      if (statusEl){
        statusEl.textContent = statusMsg;
        statusEl.classList.toggle("is-error", !ok);
        statusEl.hidden = !statusMsg;
      }
      if (ok && postCopy) postCopy.hidden = false;
      setTimeout(function(){
        btn.textContent = originalText;
        btn.disabled = false;
        if (statusEl){
          statusEl.hidden = true;
          statusEl.textContent = "";
          statusEl.classList.remove("is-error");
        }
      }, 2000);
    });
  });

  /* ---------- showcase panel 3: static "knock" demo (no logging, no timers) ---------- */
  var CHECKIN_DEMO_YES = '<p class="fm-plain">Good. Back to the draft.</p>';
  var CHECKIN_DEMO_REPLAY =
    '<div class="knock-replay-callout">' +
    '<p class="fm-label">YOU SAID THIS MATTERED BECAUSE</p>' +
    '<p class="fm-quote">"This book only gets real on the days I don\'t feel like it — and one drafted scene is the book actually happening."</p>' +
    '<p class="fm-label">WATCH FOR</p>' +
    '<p class="fm-quote">"Opening the outline file and reorganizing notes instead of drafting."</p>' +
    '</div>';

  document.querySelectorAll(".checkin-demo-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var group = btn.closest(".checkin-mock");
      var choicesEl = group ? group.querySelector(".mock-choices") : null;
      var responseEl = group ? group.querySelector(".checkin-demo-response") : null;
      var hintEl = group ? group.querySelector(".checkin-demo-hint") : null;
      var backEl = group ? group.querySelector(".checkin-demo-back") : null;
      if (!responseEl) return;
      responseEl.innerHTML = btn.getAttribute("data-answer") === "yes" ? CHECKIN_DEMO_YES : CHECKIN_DEMO_REPLAY;
      if (hintEl) hintEl.hidden = true;
      if (choicesEl) choicesEl.hidden = true;
      if (backEl) backEl.hidden = false;
    });
  });

  document.querySelectorAll(".checkin-demo-back").forEach(function(backBtn){
    backBtn.addEventListener("click", function(){
      var group = backBtn.closest(".checkin-mock");
      var choicesEl = group ? group.querySelector(".mock-choices") : null;
      var responseEl = group ? group.querySelector(".checkin-demo-response") : null;
      var hintEl = group ? group.querySelector(".checkin-demo-hint") : null;
      if (responseEl) responseEl.innerHTML = "";
      if (hintEl) hintEl.hidden = false;
      if (choicesEl) choicesEl.hidden = false;
      backBtn.hidden = true;
    });
  });

  /* ---------- showcase panel 3: Copy CSV (copies a sample log row to clipboard) ---------- */
  var LOG_CSV_TEXT =
    'date,block,planned_start,actual_start,end_time,actions_done,total_actions,output,check_in,where_momentum_broke,how_it_felt,next_start\n' +
    'Jul 10,Draft 1,500 rough words of the Chapter 9 opening,9:00,9:03,10:30,4,4,"1,500 words","Sort of → returned to draft","Opened the outline file and reorganized notes, then returned to drafting.","Rough, but real. The stall is gone.","Fix the marked paragraph, then keep drafting forward."';

  document.querySelectorAll(".log-copy-csv-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var fallbackEl = btn.parentElement ? btn.parentElement.querySelector(".log-copy-fallback") : null;
      var defaultLabel = btn.getAttribute("data-default-label") || btn.textContent;
      var copiedLabel = btn.getAttribute("data-copied-label") || "Copied";
      var showCopied = function(){
        if (fallbackEl) fallbackEl.hidden = true;
        btn.textContent = copiedLabel;
        trackPlausible("copy_log_csv");
        setTimeout(function(){ btn.textContent = defaultLabel; }, 2000);
      };
      var showFailure = function(){
        if (fallbackEl) fallbackEl.hidden = false;
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(LOG_CSV_TEXT).then(showCopied, showFailure);
      } else {
        try {
          var ta = document.createElement("textarea");
          ta.value = LOG_CSV_TEXT;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (ok) showCopied(); else showFailure();
        } catch (e){
          showFailure();
        }
      }
    });
  });

  /* ---------- open_claude event on every "Open Claude" link ---------- */
  document.querySelectorAll('a[href="https://claude.ai/new"]').forEach(function(link){
    link.addEventListener("click", function(){
      trackEvent("open_claude");
      trackPlausible("open_claude");
    });
  });

  /* ---------- download_sample_focus_file event on the showcase's sample download
     link. The click listener only reports the click — it never interferes with
     the browser's normal download behavior. ---------- */
  var downloadLink = document.querySelector(".showcase-download");
  if (downloadLink){
    downloadLink.addEventListener("click", function(){ trackPlausible("download_sample_focus_file"); });
  }

  /* ---------- info modal (Design / Privacy / Feedback) ---------- */
  var infoModal = document.getElementById("info-modal");
  var infoContent = document.getElementById("info-modal-content");
  var infoClose = document.getElementById("info-modal-close");

  document.querySelectorAll('[data-info]').forEach(function(link){
    link.addEventListener("click", function(e){
      e.preventDefault();
      var key = link.getAttribute("data-info");
      if (key === "design") trackPlausible("design_notes_click");
      if (key === "disclaimer") trackPlausible("disclaimer_click");
      var tpl = document.getElementById("info-" + key);
      if (!tpl) return;
      infoContent.innerHTML = "";
      infoContent.appendChild(tpl.content.cloneNode(true));
      infoModal.hidden = false;
    });
  });

  function closeInfoModal(){ infoModal.hidden = true; }
  infoClose.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", function(e){ if (e.target === infoModal) closeInfoModal(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !infoModal.hidden) closeInfoModal(); });

  /* ---------- mobile-only INFO dropdown (Design notes / Privacy / Feedback) ----------
     The menu items reuse the same [data-info] links/handler above, so opening
     the right modal and firing the right Plausible event already works
     identically to desktop. This just handles the dropdown's own open/close. ---------- */
  var infoMenuBtn = document.getElementById("info-menu-btn");
  var infoMenuDropdown = document.getElementById("info-menu-dropdown");
  if (infoMenuBtn && infoMenuDropdown){
    var openInfoMenu = function(){
      infoMenuDropdown.hidden = false;
      infoMenuBtn.setAttribute("aria-expanded", "true");
    };
    var closeInfoMenu = function(){
      infoMenuDropdown.hidden = true;
      infoMenuBtn.setAttribute("aria-expanded", "false");
    };
    infoMenuBtn.addEventListener("click", function(e){
      e.stopPropagation();
      if (infoMenuDropdown.hidden) openInfoMenu(); else closeInfoMenu();
    });
    infoMenuDropdown.addEventListener("click", function(e){
      if (e.target.closest("a")) closeInfoMenu();
    });
    document.addEventListener("click", function(e){
      if (!infoMenuDropdown.hidden && !infoMenuDropdown.contains(e.target) && e.target !== infoMenuBtn){
        closeInfoMenu();
      }
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && !infoMenuDropdown.hidden) closeInfoMenu();
    });
  }

  /* send_feedback event for the mailto link inside the Feedback modal (delegated,
     since that link is only added to the DOM when the modal's template is cloned) */
  infoContent.addEventListener("click", function(e){
    var target = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (target){
      trackEvent("send_feedback");
      trackPlausible("feedback_click");
    }
  });

  /* ---------- footer: public "NEXT BLOCKS STARTED" counter ----------
     Sourced only from our own KV-backed counter (incremented once per
     successful copy, above) via GET /api/next-blocks-started. No local
     counting, no invented numbers: if the request fails or the shape is
     unexpected, the counter simply stays hidden. ---------- */
  var blocksCounterEl = document.getElementById("blocks-started-counter");
  if (blocksCounterEl){
    fetch("/api/next-blocks-started", { cache: "no-store" })
      .then(function(r){ if (!r.ok) throw new Error("bad response"); return r.json(); })
      .then(function(data){
        if (data && typeof data.total === "number" && isFinite(data.total) && data.total >= 0){
          var label = data.total === 1 ? "NEXT BLOCK STARTED" : "NEXT BLOCKS STARTED";
          blocksCounterEl.textContent = data.total + " " + label;
          blocksCounterEl.hidden = false;
        }
      })
      .catch(function(){ /* leave hidden */ });
  }

  /* ---------- footer: SEND FEEDBACK (mailto) ---------- */
  var feedbackLink = document.getElementById("feedback-link");
  if (feedbackLink){
    var feedbackSubject = "The Next Block feedback";
    var feedbackBody = "What worked?\nWhat did not?\nAny ideas?";
    feedbackLink.href = feedbackLink.href.split("?")[0]
      + "?subject=" + encodeURIComponent(feedbackSubject)
      + "&body=" + encodeURIComponent(feedbackBody);
    feedbackLink.addEventListener("click", function(){
      trackEvent("send_feedback");
      trackPlausible("feedback_click");
    });
  }

  /* ---------- footer: SHARE IT (native share, falls back to copy link) ---------- */
  var shareBtn = document.getElementById("share-btn");
  var shareStatus = document.getElementById("share-status");
  if (shareBtn){
    shareBtn.addEventListener("click", async function(){
      trackEvent("share_site");
      trackPlausible("share_click");
      var shareUrl = window.location.origin || window.location.href;
      var shareData = {
        title: "The Next Block",
        text: "A free AI prompt that builds an offline focus file.",
        url: shareUrl
      };
      if (navigator.share){
        try { await navigator.share(shareData); }
        catch (e){ /* user cancelled the native share sheet — do nothing further */ }
        return;
      }
      var ok = await copyText(shareUrl);
      if (shareStatus){
        shareStatus.textContent = ok
          ? "Link copied ✓"
          : "Copy this link: https://www.thenextblock.org/";
        shareStatus.hidden = false;
        setTimeout(function(){ shareStatus.hidden = true; }, ok ? 2400 : 6000);
      }
    });
  }

})();
