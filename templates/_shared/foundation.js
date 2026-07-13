/* =========================================================
   templates/_shared/foundation.js

   Shared runtime helpers for all three Next Block instruments. Inlined
   verbatim (as plain function declarations, no top-level execution)
   into the top of each mode's <script> block by scripts/build-templates.mjs.

   Every mode's own fragment.js calls into these instead of redefining
   them. This is the "shared technical foundation" the three modes sit
   on top of -- it does NOT decide any mode's data shape, labels,
   interview, Knock question, or Exit Log. Those stay fully separate
   per mode.
   ========================================================= */

function showFatalError(messages) {
  var mainEl = document.getElementById('appMain');
  if (mainEl) mainEl.classList.add('hidden');
  var banner = document.getElementById('errorBanner');
  var list = document.getElementById('errorList');
  list.innerHTML = '';
  messages.forEach(function (msg) {
    var li = document.createElement('li');
    li.textContent = msg;
    list.appendChild(li);
  });
  banner.classList.remove('hidden');
}

function readNextBlockData() {
  var el = document.getElementById('next-block-data');
  if (!el) {
    showFatalError(['Missing the next-block-data script block.']);
    return null;
  }
  var parsed;
  try {
    parsed = JSON.parse(el.textContent);
  } catch (error) {
    showFatalError(['The data block is not valid JSON.']);
    return null;
  }
  return parsed;
}

function pad(value) { return String(value).padStart(2, '0'); }

function normalizeTimeValue(value) {
  var match = String(value || '').match(/(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?/i);
  if (!match) return '09:00';
  var hour = parseInt(match[1], 10);
  var minute = parseInt(match[2], 10);
  var meridiem = match[3] ? match[3].toLowerCase().replace(/\./g, '') : null;
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (hour > 23) hour = 23;
  if (minute > 59) minute = 59;
  return pad(hour) + ':' + pad(minute);
}

function localDate(date) {
  date = date || new Date();
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

function localTime(date) {
  date = date || new Date();
  return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function formatClock(date) {
  date = date || new Date();
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
}

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

function minutesUntil(timeValue) {
  var match = String(timeValue || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  var target = new Date();
  target.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
  return Math.round((target.getTime() - Date.now()) / 60000);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 60) || 'block';
}

function csvEscape(value) {
  return '"' + String(value == null ? '' : value).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
}

function csvTextFor(header, rows) {
  var lines = [header.join(',')];
  rows.forEach(function (row) {
    lines.push(header.map(function (field) { return csvEscape(row[field]); }).join(','));
  });
  return lines.join('\n');
}

function tableCell(text) {
  var td = document.createElement('td');
  td.textContent = text == null || text === '' ? '—' : text;
  return td;
}

function downloadCsv(filename, text) {
  var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function copyToClipboardOrPrompt(text, onCopied, promptLabel) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopied, function () {
      window.prompt(promptLabel, text);
    });
  } else {
    window.prompt(promptLabel, text);
  }
}

/* ---------- storage: one JSON array of rows per Focus File instance ---------- */
function getStoredRows(storageKey) {
  try {
    var parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveStoredRows(storageKey, rows) {
  localStorage.setItem(storageKey, JSON.stringify(rows));
}

/* ---------- legacy (schema v1, 13-column) log migration ----------
   Earlier Focus Files (schema_version "1.0") used one shared 13-column
   CSV shape across every mode. The v2 instruments each use their own,
   narrower schema, so old rows can't be merged into a v2 table without
   inventing data. Rather than discarding them or crashing on them, old
   rows are recognized by shape and kept in a clearly separate,
   never-touched legacy bucket the person can still view and copy. */
var LEGACY_V1_FIELDS = [
  'date', 'block', 'planned_start', 'actual_start', 'planned_finish',
  'actual_finish', 'output', 'action_list_checks', 'check_in_responses',
  'what_got_done', 'how_it_felt', 'what_got_in_the_way', 'next_block_start'
];

function looksLikeLegacyV1Row(row) {
  if (!row || typeof row !== 'object') return false;
  // A v1 row has "what_got_done"/"how_it_felt"/"what_got_in_the_way" —
  // field names no v2 mode schema uses under those exact names.
  return 'what_got_done' in row || 'how_it_felt' in row || 'what_got_in_the_way' in row;
}

function splitLegacyRows(priorRows) {
  var legacy = [];
  var current = [];
  (Array.isArray(priorRows) ? priorRows : []).forEach(function (row) {
    if (looksLikeLegacyV1Row(row)) legacy.push(row);
    else current.push(row);
  });
  return { legacy: legacy, current: current };
}

function seedStoredRows(storageKey, rows) {
  if (!rows.length) return;
  var existing = localStorage.getItem(storageKey);
  if (existing) return; // never overwrite what's already there
  saveStoredRows(storageKey, rows);
}

function renderLegacyNotice(container, legacyKey, legacyRows) {
  container.innerHTML = '';
  if (!legacyRows.length) return;
  var note = document.createElement('p');
  note.className = 'legacy-note';
  note.textContent = legacyRows.length + ' earlier row' + (legacyRows.length === 1 ? '' : 's') +
    ' from the previous log format ' + (legacyRows.length === 1 ? 'is' : 'are') +
    ' kept separately and not shown in the table below.';
  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'VIEW LEGACY ROWS';
  var revealed = false;
  var legacyTableWrap = document.createElement('div');
  legacyTableWrap.className = 'table-wrap hidden';
  legacyTableWrap.style.marginTop = '10px';
  var table = document.createElement('table');
  var thead = document.createElement('thead');
  var headRow = document.createElement('tr');
  LEGACY_V1_FIELDS.forEach(function (field) {
    var th = document.createElement('th');
    th.textContent = field;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  var tbody = document.createElement('tbody');
  legacyRows.forEach(function (row) {
    var tr = document.createElement('tr');
    LEGACY_V1_FIELDS.forEach(function (field) {
      tr.appendChild(tableCell(row[field]));
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  legacyTableWrap.appendChild(table);
  toggle.addEventListener('click', function () {
    revealed = !revealed;
    legacyTableWrap.classList.toggle('hidden', !revealed);
    toggle.textContent = revealed ? 'HIDE LEGACY ROWS' : 'VIEW LEGACY ROWS';
  });
  note.appendChild(toggle);
  container.appendChild(note);
  container.appendChild(legacyTableWrap);
}

/* ---------- toast ---------- */
function showToast(toastEl, message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  window.setTimeout(function () { toastEl.classList.add('hidden'); }, 1800);
}

/* ---------- title flash (used while a Knock is open) ---------- */
function makeTitleFlasher(flashLabel) {
  var timer = null;
  var originalTitle = document.title;
  return {
    start: function () {
      var toggle = false;
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        document.title = toggle ? flashLabel + ' — The Next Block' : originalTitle;
        toggle = !toggle;
      }, 850);
    },
    stop: function () {
      window.clearInterval(timer);
      timer = null;
      document.title = originalTitle;
    }
  };
}

/* ---------- a short audio ping, primed on the user's first click
   (autoplay policies require a user gesture before any AudioContext
   will produce sound) ---------- */
function makeChime() {
  var audioContext = null;
  return {
    prime: function () {
      try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();
      } catch (error) {
        audioContext = null;
      }
    },
    play: function () {
      if (!audioContext) return;
      try {
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 660;
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.24);
      } catch (error) {
        /* The title flash still makes the check-in noticeable. */
      }
    }
  };
}

/* ---------- shared modal Escape-to-close wiring ---------- */
function wireEscapeToClose(overlayEl, onClose) {
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlayEl.classList.contains('hidden')) onClose();
  });
}

/* ---------- live checkbox progress counter, shared by all three
   modes' checkable step lists (action list / practice steps /
   written outputs) ---------- */
function makeProgressCounter(listSelector, counterEl) {
  function update() {
    var all = Array.prototype.slice.call(document.querySelectorAll(listSelector + ' input[type="checkbox"]'));
    var checked = all.filter(function (item) { return item.checked; });
    counterEl.textContent = pad(checked.length) + ' / ' + pad(all.length) + ' COMPLETE';
    return checked.length + '/' + all.length;
  }
  return { update: update };
}

function getChecksSummary(listSelector) {
  var all = Array.prototype.slice.call(document.querySelectorAll(listSelector + ' input[type="checkbox"]'));
  var checked = all.filter(function (item) { return item.checked; });
  return checked.length + '/' + all.length;
}

function disableAllChecks(listSelector) {
  Array.prototype.slice.call(document.querySelectorAll(listSelector + ' input[type="checkbox"]'))
    .forEach(function (item) { item.disabled = true; });
}

/* ---------- builds a numbered, checkable step list from an array of
   {title, subtext} items -- shared shape used by every mode's step
   list, whatever that mode calls it on screen ---------- */
function buildStepList(wrapEl, items) {
  items.forEach(function (item, index) {
    var label = document.createElement('label');
    label.className = 'step';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.stepIndex = String(index);

    var span = document.createElement('span');
    var titleSpan = document.createElement('span');
    titleSpan.className = 'step-title';
    titleSpan.textContent = item.title;
    var subSpan = document.createElement('span');
    subSpan.className = 'step-sub';
    subSpan.textContent = item.subtext;

    span.appendChild(titleSpan);
    span.appendChild(subSpan);
    label.appendChild(checkbox);
    label.appendChild(span);
    wrapEl.appendChild(label);
  });
}

/* ---------- builds the Exit Log's written-answer form from an array
   of prompt strings, positionally mapped -- shared shape, each mode
   supplies its own five prompts and reads exitInputs[i].value back
   out in its own order ---------- */
function buildExitForm(formEl, prompts, requiredMask) {
  var inputs = [];
  prompts.forEach(function (promptText, index) {
    var wrap = document.createElement('div');
    var label = document.createElement('label');
    label.setAttribute('for', 'exitAnswer' + index);
    label.textContent = promptText;
    var textarea = document.createElement('textarea');
    textarea.id = 'exitAnswer' + index;
    textarea.required = !requiredMask || requiredMask[index] !== false;
    wrap.appendChild(label);
    wrap.appendChild(textarea);
    formEl.appendChild(wrap);
    inputs.push(textarea);
  });
  var controls = document.createElement('div');
  controls.className = 'controls';
  var saveExit = document.createElement('button');
  saveExit.type = 'submit';
  saveExit.id = 'saveExit';
  saveExit.textContent = 'SAVE EXIT LOG';
  controls.appendChild(saveExit);
  formEl.appendChild(controls);
  return inputs;
}

/* ---------- next-interview handoff: builds a clean, plain-text packet
   from the block that was just saved, so it can be pasted straight into
   a fresh AI chat to seed the next interview. This runs entirely in the
   person's browser -- it never sends anything anywhere on its own; the
   person chooses when and where to paste it. Empty/unanswered fields are
   silently skipped so the packet stays compact. ---------- */
function buildNextInterviewPacket(instructionLine, pairs) {
  var lines = [instructionLine, ''];
  pairs.forEach(function (pair) {
    var value = pair.value;
    if (value === undefined || value === null) return;
    value = String(value).trim();
    if (!value) return;
    lines.push(pair.label + ': ' + value);
  });
  return lines.join('\n');
}

/* ---------- renders a cumulative log table from an explicit column
   list (each mode defines its own visible columns/order) ---------- */
function renderLogTable(container, rows, columns, emptyMessage, onDeleteRow) {
  container.innerHTML = '';
  if (!rows.length) {
    var empty = document.createElement('p');
    empty.className = 'empty-log';
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  var wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  var table = document.createElement('table');
  var thead = document.createElement('thead');
  var headRow = document.createElement('tr');
  columns.forEach(function (col) {
    var th = document.createElement('th');
    th.textContent = col.label;
    headRow.appendChild(th);
  });
  var actionsTh = document.createElement('th');
  actionsTh.textContent = '';
  headRow.appendChild(actionsTh);
  thead.appendChild(headRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  rows.forEach(function (row, index) {
    var tr = document.createElement('tr');
    columns.forEach(function (col) {
      tr.appendChild(tableCell(typeof col.value === 'function' ? col.value(row) : row[col.field]));
    });
    var actionTd = document.createElement('td');
    var del = document.createElement('button');
    del.className = 'danger';
    del.type = 'button';
    del.textContent = 'Delete';
    del.dataset.deleteRow = String(index);
    actionTd.appendChild(del);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);

  if (!container.dataset.deleteWired) {
    container.dataset.deleteWired = 'true';
    container.addEventListener('click', function (event) {
      var button = event.target.closest('[data-delete-row]');
      if (!button) return;
      var index = Number(button.dataset.deleteRow);
      onDeleteRow(index);
    });
  }
}
