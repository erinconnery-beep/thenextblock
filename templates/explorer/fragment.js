/* Explorer -- mode-specific runtime. Built on top of
   templates/_shared/foundation.js. This is the "inquiry-and-decision
   instrument": the file exists to turn one bounded, answerable question
   into a written conclusion and a named next move, with a hard stop that
   always fires so research cannot expand indefinitely. */

var CSV_HEADER = [
  'date', 'question', 'blocked_move', 'planned_start', 'actual_start',
  'planned_finish', 'actual_finish', 'written_output_checks',
  'check_in_responses', 'answer_reached', 'evidence_that_mattered',
  'remaining_unknown', 'research_avoidance', 'next_move'
];

var HARD_STOP_MESSAGE = 'Time. Write the answer as it stands, and name the next move.';

function validate(data) {
  var errors = [];
  if (!data || typeof data !== 'object') {
    return ['The data block is empty or not an object.'];
  }
  var requiredTop = [
    'schema_version', 'mode', 'title', 'start_time', 'planned_finish',
    'blocked_move', 'answerable_question', 'research_boundary',
    'avoidance_move', 'why', 'feeling'
  ];
  requiredTop.forEach(function (key) {
    var value = data[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push('Missing required field: ' + key);
    }
  });
  if (!Array.isArray(data.written_outputs) || data.written_outputs.length < 3 || data.written_outputs.length > 5) {
    errors.push('written_outputs must be an array of 3 to 5 items.');
  } else {
    data.written_outputs.forEach(function (step, index) {
      if (!step || !String(step.title || '').trim() || !String(step.subtext || '').trim()) {
        errors.push('Written output ' + (index + 1) + ' is missing a title or subtext.');
      }
    });
  }
  if (!data.check_in || typeof data.check_in !== 'object') {
    errors.push('Missing required field: check_in');
  } else {
    if (!data.check_in.title) errors.push('check_in.title is missing.');
    if (!data.check_in.question) errors.push('check_in.question is missing.');
    if (typeof data.check_in.min_minutes !== 'number' || typeof data.check_in.max_minutes !== 'number') {
      errors.push('check_in.min_minutes / check_in.max_minutes must be numbers.');
    }
  }
  if (!Array.isArray(data.exit_prompts) || data.exit_prompts.length !== 5) {
    errors.push('exit_prompts must be an array of exactly 5 prompts.');
  }
  return errors;
}

var DATA = readNextBlockData();
if (DATA) {
  var validationErrors = validate(DATA);
  if (validationErrors.length) {
    showFatalError(validationErrors);
  } else {
    try {
      runFocusFile(DATA);
    } catch (error) {
      showFatalError(['Something in this file failed to start. No data was sent anywhere. (' + (error && error.message ? error.message : 'unknown error') + ')']);
    }
  }
}

function runFocusFile(data) {
  var checkIn = data.check_in || {};
  var displayCues = data.display_cues || {};
  /* Explorer's hard stop always fires, regardless of what the data block
     sets for hard_stop.enabled -- section 7E of the spec requires this
     unconditionally, so it is not left to the authoring prompt to opt out. */
  var hardStop = { enabled: true, message: (data.hard_stop && data.hard_stop.message) || HARD_STOP_MESSAGE };
  var priorSplit = splitLegacyRows(data.prior_log_rows);

  var STORAGE_KEY = 'next_block_explorer_' + slugify(data.title) + '_v2';
  var LEGACY_KEY = STORAGE_KEY + '__legacy_v1';

  /* ---------- static text ---------- */
  document.getElementById('topBar').textContent =
    (data.mode_label ? data.mode_label.toUpperCase() + ' — ' : '') + (data.instrument_label || 'INQUIRY FILE').toUpperCase();
  document.title = 'The Next Block — ' + data.title;
  setText('titleText', data.answerable_question);
  setText('subtitleText', data.subtitle || '');
  document.getElementById('subtitleText').classList.toggle('hidden', !data.subtitle);
  setText('plannedFinishText', data.planned_finish);
  setText('blockedMoveText', displayCues.blocked_move || data.blocked_move);
  setText('researchBoundaryText', displayCues.boundary || data.research_boundary);
  setText('avoidanceMoveText', displayCues.avoidance || data.avoidance_move);

  var startLocationWrap = document.getElementById('startLocationWrap');
  if (data.start_location && String(data.start_location).trim()) {
    setText('startLocationText', data.start_location);
    startLocationWrap.classList.remove('hidden');
  } else {
    startLocationWrap.classList.add('hidden');
  }

  var plannedStart = document.getElementById('plannedStart');
  plannedStart.value = normalizeTimeValue(data.start_time);

  /* ---------- written-output steps ---------- */
  var stepsWrap = document.getElementById('steps');
  buildStepList(stepsWrap, data.written_outputs);
  var progressCounter = document.getElementById('progressCounter');
  var progress = makeProgressCounter('#steps', progressCounter);
  stepsWrap.addEventListener('change', function () { progress.update(); });
  progress.update();

  /* ---------- exit log form ---------- */
  var exitForm = document.getElementById('exitForm');
  var exitInputs = buildExitForm(exitForm, data.exit_prompts, null);

  /* ---------- knock overlay static text ---------- */
  document.getElementById('knock-title').textContent = checkIn.title || 'The knock';
  document.getElementById('knockQuestion').textContent = checkIn.question || 'Are you closing in on an answer?';

  /* ---------- element refs ---------- */
  var beginBlock = document.getElementById('beginBlock');
  var beginArea = document.getElementById('beginArea');
  var previewKnock = document.getElementById('previewKnock');
  var finishArea = document.getElementById('finishArea');
  var finishBlockBtn = document.getElementById('finishBlock');
  var logSection = document.getElementById('logSection');
  var legacyNotice = document.getElementById('legacyNotice');
  var activeBanner = document.getElementById('activeBanner');
  var winBanner = document.getElementById('winBanner');
  var exitLog = document.getElementById('exitLog');
  var autoRecorded = document.getElementById('autoRecorded');
  var overlay = document.getElementById('knockOverlay');
  var choiceArea = document.getElementById('choiceArea');
  var replayArea = document.getElementById('replayArea');
  var returnToBlock = document.getElementById('returnToBlock');
  var hardStopOverlay = document.getElementById('hardStopOverlay');
  var hardStopContinue = document.getElementById('hardStopContinue');
  var logView = document.getElementById('logView');
  var toast = document.getElementById('toast');

  var actualStart = '';
  var actualFinish = '';
  var blockRunning = false;
  var blockFinished = false;
  var capturedActionChecks = '';
  var capturedCheckinResponses = '';
  var checkinTimer = null;
  var hardStopTimer = null;
  var currentCheckinIsPreview = false;
  var checkinResponses = [];

  var titleFlash = makeTitleFlasher(checkIn.title || 'THE KNOCK');
  var chime = makeChime();

  winBanner.textContent = 'Logged: ' + data.answerable_question;

  function randomCheckinDelayMs() {
    var min = checkIn.min_minutes || 20;
    var max = checkIn.max_minutes || 25;
    if (max < min) max = min;
    var minutes = min + Math.random() * (max - min);
    return minutes * 60 * 1000;
  }

  function scheduleNextCheckin() {
    window.clearTimeout(checkinTimer);
    if (!blockRunning) return;
    checkinTimer = window.setTimeout(function () { openKnock(false); }, randomCheckinDelayMs());
  }

  function scheduleHardStop() {
    if (!hardStop.enabled) return;
    window.clearTimeout(hardStopTimer);
    var diff = minutesUntil(data.planned_finish);
    var ms = diff === null ? 60 * 60 * 1000 : Math.max(diff, 0.05) * 60 * 1000;
    hardStopTimer = window.setTimeout(fireHardStop, ms);
  }

  function fireHardStop() {
    if (!blockRunning) return;
    captureFinish();
    setText('hardStopMessage', hardStop.message);
    hardStopOverlay.classList.remove('hidden');
  }

  function buildReplay(container, choice) {
    container.innerHTML = '';
    var replay = document.createElement('div');
    replay.className = 'replay';

    if (choice === 'Sort of') {
      var sortLabel = document.createElement('div');
      sortLabel.className = 'label';
      sortLabel.textContent = 'Before you open anything else';
      var sortText = document.createElement('p');
      sortText.className = 'quote';
      sortText.textContent = checkIn.sort_of_response || 'Write down what you have before you open anything else.';
      replay.appendChild(sortLabel);
      replay.appendChild(sortText);
    } else {
      addReplayLine(replay, 'The question', displayCues.question || data.answerable_question);
      var instruction = document.createElement('p');
      instruction.className = 'quote';
      instruction.textContent = 'Write the best answer the research already supports.';
      replay.appendChild(instruction);
    }

    container.appendChild(replay);
    container.classList.remove('hidden');
  }

  function addReplayLine(container, label, value) {
    var labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = label;
    var valueEl = document.createElement('p');
    valueEl.className = 'quote';
    valueEl.textContent = value;
    container.appendChild(labelEl);
    container.appendChild(valueEl);
  }

  function openKnock(preview) {
    currentCheckinIsPreview = preview;
    choiceArea.classList.remove('hidden');
    replayArea.classList.add('hidden');
    replayArea.innerHTML = '';
    returnToBlock.classList.add('hidden');
    overlay.classList.remove('hidden');

    if (!preview) {
      titleFlash.start();
      chime.play();
    }
  }

  function closeKnock() {
    overlay.classList.add('hidden');
    titleFlash.stop();
    if (blockRunning && !currentCheckinIsPreview) scheduleNextCheckin();
  }

  function finishChoice(choice) {
    if (!currentCheckinIsPreview) checkinResponses.push(choice);

    choiceArea.classList.add('hidden');
    returnToBlock.classList.remove('hidden');
    titleFlash.stop();

    if (choice === 'Yes') {
      var yesEl = document.createElement('p');
      var strong = document.createElement('strong');
      strong.textContent = checkIn.yes_response || 'Good. Keep going.';
      yesEl.appendChild(strong);
      replayArea.innerHTML = '';
      replayArea.appendChild(yesEl);
      replayArea.classList.remove('hidden');
    } else {
      buildReplay(replayArea, choice);
    }
  }

  function renderLog() {
    var rows = getStoredRows(STORAGE_KEY);
    renderLegacyNotice(legacyNotice, LEGACY_KEY, getStoredRows(LEGACY_KEY));
    renderLogTable(logView, rows, [
      { label: 'Date', field: 'date' },
      { label: 'Question', field: 'question' },
      { label: 'Answer reached', field: 'answer_reached' },
      { label: 'Remaining unknown', field: 'remaining_unknown' },
      { label: 'Next move', field: 'next_move' }
    ], 'No entries yet. Complete the Exit log to add the first inquiry.', function (index) {
      var current = getStoredRows(STORAGE_KEY);
      current.splice(index, 1);
      saveStoredRows(STORAGE_KEY, current);
      renderLog();
    });
  }

  function populateAutoRecorded() {
    var fields = [
      ['Planned start', plannedStart.value || 'Not recorded'],
      ['Actual start', actualStart || 'Not recorded'],
      ['Planned finish', data.planned_finish || 'Not recorded'],
      ['Actual finish', actualFinish || 'Not recorded'],
      ['Written output checks', capturedActionChecks],
      ['Check-in responses', capturedCheckinResponses]
    ];
    autoRecorded.innerHTML = '';
    fields.forEach(function (pair) {
      var wrap = document.createElement('div');
      var label = document.createElement('span');
      label.className = 'ar-label';
      label.textContent = pair[0];
      var value = document.createElement('span');
      value.className = 'ar-value';
      value.textContent = pair[1];
      wrap.appendChild(label);
      wrap.appendChild(value);
      autoRecorded.appendChild(wrap);
    });
  }

  function captureFinish() {
    if (blockFinished) return false;
    blockFinished = true;
    blockRunning = false;
    actualFinish = localTime();
    window.clearTimeout(checkinTimer);
    window.clearTimeout(hardStopTimer);
    titleFlash.stop();
    overlay.classList.add('hidden');
    activeBanner.classList.add('hidden');
    finishArea.classList.add('hidden');
    capturedActionChecks = getChecksSummary('#steps');
    disableAllChecks('#steps');
    progress.update();
    capturedCheckinResponses = checkinResponses.length ? checkinResponses.join(' · ') : 'No check-ins recorded';
    populateAutoRecorded();
    return true;
  }

  function revealExitLog() {
    hardStopOverlay.classList.add('hidden');
    exitLog.classList.remove('hidden');
    exitLog.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  beginBlock.addEventListener('click', function () {
    chime.prime();
    actualStart = localTime();
    blockRunning = true;
    checkinResponses = [];
    beginArea.classList.add('hidden');
    finishArea.classList.remove('hidden');
    activeBanner.textContent = 'INQUIRY ACTIVE · STARTED ' + actualStart +
      ' · KNOCK IN ' + (checkIn.min_minutes || 20) + '–' + (checkIn.max_minutes || 25) + ' MIN';
    activeBanner.classList.remove('hidden');
    scheduleNextCheckin();
    scheduleHardStop();
    updateClock();
  });

  previewKnock.addEventListener('click', function () { openKnock(true); });

  finishBlockBtn.addEventListener('click', function () {
    if (!captureFinish()) return;
    revealExitLog();
  });

  choiceArea.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-choice]');
    if (!button) return;
    finishChoice(button.dataset.choice);
  });

  returnToBlock.addEventListener('click', closeKnock);
  wireEscapeToClose(overlay, closeKnock);

  hardStopContinue.addEventListener('click', function () {
    revealExitLog();
  });

  exitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var row = {
      date: localDate(),
      question: data.answerable_question,
      blocked_move: data.blocked_move || '',
      planned_start: plannedStart.value,
      actual_start: actualStart || 'Not recorded',
      planned_finish: data.planned_finish,
      actual_finish: actualFinish || 'Not recorded',
      written_output_checks: capturedActionChecks,
      check_in_responses: capturedCheckinResponses,
      answer_reached: exitInputs[0].value.trim(),
      evidence_that_mattered: exitInputs[1].value.trim(),
      remaining_unknown: exitInputs[2].value.trim(),
      research_avoidance: exitInputs[3].value.trim(),
      next_move: exitInputs[4].value.trim()
    };

    var rows = getStoredRows(STORAGE_KEY);
    rows.push(row);
    saveStoredRows(STORAGE_KEY, rows);
    renderLog();
    logSection.classList.remove('hidden');
    winBanner.classList.remove('hidden');
    document.getElementById('saveExit').disabled = true;
    document.getElementById('saveExit').textContent = 'SAVED TO LOG';
    showToast(toast, 'Exit log saved');
    winBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('copyCsv').addEventListener('click', function () {
    var text = csvTextFor(CSV_HEADER, getStoredRows(STORAGE_KEY));
    copyToClipboardOrPrompt(text, function () { showToast(toast, 'CSV copied'); }, 'Copy the CSV:');
  });

  document.getElementById('downloadCsv').addEventListener('click', function () {
    downloadCsv(slugify(data.title) + '-inquiry-log.csv', csvTextFor(CSV_HEADER, getStoredRows(STORAGE_KEY)));
  });

  plannedStart.addEventListener('change', updateClock);
  window.setInterval(updateClock, 1000);

  function updateClock() {
    var now = new Date();
    document.getElementById('clockNow').textContent = 'Local time: ' + formatClock(now);
    var diff = minutesUntil(plannedStart.value);
    var statusEl = document.getElementById('statusText');
    if (diff === null) {
      statusEl.textContent = '';
    } else if (diff > 1) {
      statusEl.textContent = 'Starts in ' + diff + ' min';
    } else if (diff >= -1) {
      statusEl.textContent = 'Start time is now';
    } else {
      statusEl.textContent = 'Ready when you are';
    }
  }

  updateClock();
  seedStoredRows(STORAGE_KEY, priorSplit.current);
  seedStoredRows(LEGACY_KEY, priorSplit.legacy);
  renderLog();
}
