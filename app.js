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
    "prompts/ReadyToWork.md": "copy_solo_prompt",
    "prompts/Coaching.md": "copy_coaching_loop_prompt",
    "prompts/Explorer.md": "copy_exploring_prompt"
  };

  /* Maps each prompt file to its Plausible "mode" property value. */
  var PROMPT_MODE_NAMES = {
    "prompts/ReadyToWork.md": "solo",
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
    '<p class="fm-quote">"A book becomes real one finished scene at a time. I do not need to solve the whole thing today. I need to finish this one."</p>' +
    '<p class="fm-label">WATCH FOR</p>' +
    '<p class="fm-quote">"When I want to stop, I will be tempted to polish, research, or reorganize. That is my signal to write the next rough sentence."</p>' +
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

  /* ---------- showcase panel 3: Copy CSV (copies a sample cumulative log to clipboard) ----------
     The five dates are computed fresh on each click, from the visitor's local calendar date
     (never toISOString, which can shift the date across time zones). The five rows span the
     previous seven days, unevenly spaced, to show cumulative logging rather than a single
     example entry — a mix of finished, partial, and disrupted blocks. */
  var LOG_CSV_HEADER =
    'date,block,planned_start,actual_start,planned_finish,actual_finish,output,action_list_checks,check_in_responses,what_got_done,how_it_felt,what_got_in_the_way,next_block_start';

  function sampleLogDate(daysAgo){
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function buildSampleLogCsv(){
    var rows = [
      sampleLogDate(7) + ',"Draft Chapter 9 from the doorbell to the brother leaving—1,500 rough words by 10:30.",09:00,09:03,10:30,10:27,"1,500 new words","4/4","Sort of → returned to the draft","Yes — finished the block as planned.","Relieved. The scene exists.","Started reorganizing notes, then returned to the draft.","Draft the silence right after the door closes."',
      sampleLogDate(5) + ',"Draft the silence right after the door closes—the first thing said once the brother is gone.",09:00,09:24,10:30,10:18,"420 new words; 2 paragraphs revised","2/4","No → reopened the Focus File","No — completed the reaction paragraph but not the full drafting target.","Frustrating at first, then useful.","Email pulled me away before I started; I kept editing instead of drafting.","Begin with the first line spoken after the door closes and draft forward."',
      sampleLogDate(4) + ',"Draft the conversation that follows the brother\'s exit.",09:00,09:01,10:30,10:34,"1,120 new words","4/4","Yes","Yes — finished the block as planned.","Focused and steady.","Nothing significant.","Reread the conversation once, then draft what happens next."',
      sampleLogDate(2) + ',"Draft what happens next after the conversation ends.",09:00,10:12,10:30,11:02,"530 new words","2/4","Sort of → put the phone away and returned","No — started late and only drafted half the scene.","Scattered, but glad I returned.","Stayed on my phone after breakfast and lost the start window.","Open where the scene stopped and carry it through to its end."',
      sampleLogDate(1) + ',"Finish the scene after the brother\'s exit and write the next chapter\'s opening line.",09:00,09:05,10:30,10:22,"860 new words","4/4","Sort of → returned to the draft","Yes — finished the block as planned.","Relieved. The scene now exists in full.","I wanted to revise the earlier pages, but kept moving forward.","Read the new material once and mark only structural problems."'
    ];
    return LOG_CSV_HEADER + "\n" + rows.join("\n");
  }

  document.querySelectorAll(".log-copy-csv-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var panelBody = btn.closest(".panel-body");
      var fallbackEl = panelBody ? panelBody.querySelector(".log-copy-fallback") : null;
      var defaultLabel = btn.getAttribute("data-default-label") || btn.textContent;
      var copiedLabel = btn.getAttribute("data-copied-label") || "Copied";
      var csvText = buildSampleLogCsv();
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
        navigator.clipboard.writeText(csvText).then(showCopied, showFailure);
      } else {
        try {
          var ta = document.createElement("textarea");
          ta.value = csvText;
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

  /* ---------- open_ai event on every post-copy AI link (Claude / ChatGPT / Gemini) ---------- */
  document.querySelectorAll(".post-copy-link").forEach(function(link){
    link.addEventListener("click", function(){
      var provider = link.getAttribute("data-provider") || "ai";
      trackEvent("open_" + provider);
      trackPlausible("open_ai", { provider: provider });
    });
  });

  /* ---------- download_sample_focus_file event on the showcase's sample download
     link. The click listener only reports the click — it never interferes with
     the browser's normal download behavior. ---------- */
  var downloadLink = document.querySelector("a.showcase-download[download]");
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
