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

  /* ---------- analytics helper ----------
     Fires a Vercel Web Analytics custom event by name only. Never pass prompt
     text, user-entered text, emails, or any other personal/content data as the
     event's "data" payload — these calls only ever send a fixed event name. */
  function trackEvent(name){
    if (typeof window.va === "function"){
      try { window.va("event", { name: name }); } catch (e){ /* analytics must never break the site */ }
    }
  }

  /* Maps each prompt file to its analytics event name (event name only — never
     the prompt's actual text). */
  var PROMPT_EVENT_NAMES = {
    "prompts/Solo.md": "copy_solo_prompt",
    "prompts/Coaching.md": "copy_coaching_loop_prompt",
    "prompts/Explorer.md": "copy_exploring_prompt"
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
    var postCopy = btn.nextElementSibling && btn.nextElementSibling.classList.contains("post-copy")
      ? btn.nextElementSibling
      : null;

    btn.addEventListener("click", async function(){
      btn.disabled = true;
      var label = "Prompt copied";
      var ok = false;
      try {
        var text = await loadPromptFile(promptFile);
        ok = await copyText(text);
        if (!ok) label = "Couldn't copy — select and copy manually";
      } catch (e){
        label = "Couldn't load prompt — check your connection";
      }
      if (ok && PROMPT_EVENT_NAMES[promptFile]) trackEvent(PROMPT_EVENT_NAMES[promptFile]);
      btn.textContent = label;
      if (ok && postCopy) postCopy.hidden = false;
      setTimeout(function(){
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2400);
    });
  });

  /* ---------- open_claude event on every "Open Claude" link ---------- */
  document.querySelectorAll('a[href="https://claude.ai/new"]').forEach(function(link){
    link.addEventListener("click", function(){ trackEvent("open_claude"); });
  });

  /* ---------- info modal (Design / Disclaimer / Feedback) ---------- */
  var infoModal = document.getElementById("info-modal");
  var infoContent = document.getElementById("info-modal-content");
  var infoClose = document.getElementById("info-modal-close");

  document.querySelectorAll('[data-info]').forEach(function(link){
    link.addEventListener("click", function(e){
      e.preventDefault();
      var key = link.getAttribute("data-info");
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

  /* send_feedback event for the mailto link inside the Feedback modal (delegated,
     since that link is only added to the DOM when the modal's template is cloned) */
  infoContent.addEventListener("click", function(e){
    var target = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (target) trackEvent("send_feedback");
  });

  /* ---------- footer: SEND FEEDBACK (mailto) ---------- */
  var feedbackLink = document.getElementById("feedback-link");
  if (feedbackLink){
    var feedbackSubject = "The Next Block feedback";
    var feedbackBody = "What worked?\nWhat did not?\nAny ideas?";
    feedbackLink.href = feedbackLink.href.split("?")[0]
      + "?subject=" + encodeURIComponent(feedbackSubject)
      + "&body=" + encodeURIComponent(feedbackBody);
    feedbackLink.addEventListener("click", function(){ trackEvent("send_feedback"); });
  }

  /* ---------- footer: SHARE IT (native share, falls back to copy link) ---------- */
  var shareBtn = document.getElementById("share-btn");
  var shareStatus = document.getElementById("share-status");
  if (shareBtn){
    shareBtn.addEventListener("click", async function(){
      trackEvent("share_site");
      var shareData = {
        title: "The Next Block",
        text: "A free prompt that turns a loose intention into one finishable work block.",
        url: window.location.href
      };
      if (navigator.share){
        try { await navigator.share(shareData); }
        catch (e){ /* user cancelled the native share sheet — do nothing further */ }
        return;
      }
      var ok = await copyText(window.location.href);
      if (ok && shareStatus){
        shareStatus.hidden = false;
        setTimeout(function(){ shareStatus.hidden = true; }, 2400);
      }
    });
  }

})();
