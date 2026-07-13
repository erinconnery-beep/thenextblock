/* Coaching Loop -- mode-specific runtime. Built on top of
   templates/_shared/foundation.js. This is the "practice-and-evidence
   instrument": the file presents a practice experiment, the Knock
   supports observation without shame, and the Exit Log produces
   evidence and a next adjustment rather than a grade. */

var CSV_HEADER = [
  'date', 'practice', 'planned_start', 'actual_start', 'planned_finish',
  'actual_finish', 'intervention_tested', 'practice_step_checks',
  'check_in_responses', 'practice_happened', 'predicted_pattern_seen',
  'observed_evidence', 'what_helped', 'what_did_not_work', 'next_adjustment'
];

function validate(data) {
  var errors = [];
  if (!data || typeof data !== 'object') {
    return ['The data block is empty or not an object.'];
  }
  var requiredTop = [
    'schema_version', 'mode', 'title', 'start_time', 'planned_finish',
    'practice_target', 'intervention', 'predicted_break',
    'evidence_to_notice', 'why', 'feeling'
  ];
  requiredTop.forEach(function (key) {
    var value = data[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push('Missing required field: ' + key);
    }
  });
  if (!Array.isArray(data.practice_protocol) || data.practice_protocol.length < 3 || data.practice_protocol.length > 5) {
    errors.push('practice_protocol must be an array of 3 to 5 items.');
  } else {
    data.practice_protocol.forEach(function (step, index) {
      if (!step || !String(step.title || '').trim() || !String(step.subtext || '').trim()) {
        errors.push('Practice step ' + (index + 1) + ' is missing a title or subtext.');
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
  if (!Array.isArray(data.exit_prompts) || data.exit_prompts.length !== 6) {
    errors.push('exit_prompts must be an array of exactly 6 prompts (the third being the generated evidence question).');
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
  var hardStop = data.hard_stop || { enabled: false, message: '' };
  var priorSplit = splitLegacyRows(data.prior_log_rows);

  var STORAGE_KEY = 'next_block_coaching_' + slugify(data.title) + '_v2';
  var LEGACY_KEY = STORAGE_KEY + '__legacy_v1';

  /* ---------- static text ---------- */
  document.getElementById('topBar').textContent =
    (data.mode_label ? data.mode_label.toUpperCase() + ' — ' : '') + (data.instrument_label || 'PRACTICE FILE').toUpperCase();
  document.title = 'The Next Block — ' + data.title;
  setText('titleText', data.practice_target);
  setText('subtitleText', data.subtitle || '');
  document.getElementById('subtitleText').classList.toggle('hidden', !data.subtitle);
  setText('plannedFinishText', data.planned_finish);
  setText('interventionText', displayCues.intervention || data.intervention);
  setText('predictedBreakText', displayCues.predicted_break || data.predicted_break);
  setText('evidenceText', displayCues.evidence || data.evidence_to_notice);

  var startLocationWrap = document.getElementById('startLocationWrap');
  if (data.start_location && String(data.start_location).trim()) {
    setText('startLocationText', data.start_location);
    startLocationWrap.classList.remove('hidden');
  } else {
    startLocationWrap.classList.add('hidden');
  }

  var plannedStart = document.getElementById('plannedStart');
  plannedStart.value = normalizeTimeValue(data.start_time);

  /* ---------- practice steps ---------- */
  var stepsWrap = document.getElementById('steps');
  buildStepList(stepsWrap, data.practice_protocol);
  var progressCounter = document.getElementById('progressCounter');
  var progress = makeProgressCounter('#steps', progressCounter);
  stepsWrap.addEventListener('change', function () { progress.update(); });
  progress.update();

  /* ---------- exit log form ---------- */
  var exitForm = document.getElementById('exitForm');
  var exitInputs = buildExitForm(exitForm, data.exit_prompts, null);

  /* ---------- knock overlay static text ---------- */
  document.getElementById('knock-title').textContent = checkIn.title || 'The knock';
  document.getElementById('knockQuestion').textContent = checkIn.question || 'Is the practice holding?';
  document.getElementById('noReasonLabel').textContent = 'What happened?';

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
  var noReasonWrap = document.getElementById('noReasonWrap');
  var noReasonInput = document.getElementById('noReasonInput');
  var submitNoReason = document.getElementById('submitNoReason');
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
  var pendingChoice = null;
  var checkinResponses = [];

  var titleFlash = makeTitleFlasher(checkIn.title || 'THE KNOCK');
  var chime = makeChime();

  winBanner.textContent = 'Practice attempt logged: ' + data.practice_target;

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
    if (!hardStop || !hardStop.enabled) return;
    window.clearTimeout(hardStopTimer);
    var diff = minutesUntil(data.planned_finish);
    var ms = diff === null ? 60 * 60 * 1000 : Math.max(diff, 0.05) * 60 * 1000;
    hardStopTimer = window.setTimeout(fireHardStop, ms);
  }

  function fireHardStop() {
    if (!blockRunning) return;
    captureFinish();
    setText('hardStopMessage', hardStop.message || 'Time. Record what happened, and name the next adjustment.');
    hardStopOverlay.classList.remove('hidden');
  }

  function buildReplay(container, choice, reason) {
    container.innerHTML = '';
    var replay = document.createElement('div');
    replay.className = 'replay';

    if (choice === 'Sort of') {
      var noticed = document.createElement('p');
      var noticedStrong = document.createElement('strong');
      noticedStrong.textContent = 'You noticed it early.';
      noticed.appendChild(noticedStrong);
      replay.appendChild(noticed);
      addReplayLine(replay, 'Predicted break', displayCues.predicted_break || data.predicted_break);
      addReplayLine(replay, 'What you’re trying differently', displayCues.intervention || data.intervention);
      var tryLine = document.createElement('p');
      tryLine.className = 'quote';
      tryLine.textContent = checkIn.sort_of_response || 'Try the intervention and stay with the practice.';
      replay.appendChild(tryLine);
    } else {
      var reminder = document.createElement('div');
      reminder.className = 'label';
      reminder.textContent = 'Evidence, not failure';
      var reminderText = document.createElement('p');
      reminderText.className = 'quote';
      reminderText.textContent = checkIn.no_response || 'Record it. That is evidence, not failure.';
      replay.appendChild(reminder);
      replay.appendChild(reminderText);
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
    pendingChoice = null;
    choiceArea.classList.remove('hidden');
    noReasonWrap.classList.add('hidden');
    noReasonInput.value = '';
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

  function finishChoice(choice, reason) {
    if (!currentCheckinIsPreview) {
      var entry = choice;
      if (reason && String(reason).trim()) entry += ' → ' + reason.trim();
      checkinResponses.push(entry);
    }

    choiceArea.classList.add('hidden');
    noReasonWrap.classList.add('hidden');
    returnToBlock.classList.remove('hidden');
    titleFlash.stop();

    if (choice === 'Yes') {
      var yesEl = document.createElement('p');
      var strong = document.createElement('strong');
      strong.textContent = checkIn.yes_response || 'Good. Keep practicing.';
      yesEl.appendChild(strong);
      replayArea.innerHTML = '';
      replayArea.appendChild(yesEl);
      replayArea.classList.remove('hidden');
    } else {
      buildReplay(replayArea, choice, reason);
    }
  }

  function renderLog() {
    var rows = getStoredRows(STORAGE_KEY);
    renderLegacyNotice(legacyNotice, LEGACY_KEY, getStoredRows(LEGACY_KEY));
    renderLogTable(logView, rows, [
      { label: 'Date', field: 'date' },
      { label: 'Practice', field: 'practice' },
      { label: 'Intervention', field: 'intervention_tested' },
      { label: 'Predicted pattern seen', field: 'predicted_pattern_seen' },
      { label: 'Observed evidence', field: 'observed_evidence' },
      { label: 'Next adjustment', field: 'next_adjustment' }
    ], 'No entries yet. Complete the Exit log to add the first attempt.', function (index) {
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
      ['Practice step checks', capturedActionChecks],
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
    activeBanner.textContent = 'PRACTICE ACTIVE · STARTED ' + actualStart +
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
    var choice = button.dataset.choice;

    if (choice === 'No' && checkIn.capture_no_reason && !currentCheckinIsPreview) {
      pendingChoice = choice;
      choiceArea.classList.add('hidden');
      noReasonWrap.classList.remove('hidden');
      noReasonInput.focus();
      return;
    }

    finishChoice(choice, '');
  });

  submitNoReason.addEventListener('click', function () {
    if (!pendingChoice) return;
    var choice = pendingChoice;
    pendingChoice = null;
    finishChoice(choice, noReasonInput.value);
  });

  returnToBlock.addEventListener('click', closeKnock);
  wireEscapeToClose(overlay, closeKnock);

  hardStopContinue.addEventListener('click', function () {
    revealExitLog();
  });

  var lastHandoffText = '';

  exitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var row = {
      date: localDate(),
      practice: data.title,
      planned_start: plannedStart.value,
      actual_start: actualStart || 'Not recorded',
      planned_finish: data.planned_finish,
      actual_finish: actualFinish || 'Not recorded',
      intervention_tested: data.intervention || '',
      practice_step_checks: capturedActionChecks,
      check_in_responses: capturedCheckinResponses,
      practice_happened: exitInputs[0].value.trim(),
      predicted_pattern_seen: exitInputs[1].value.trim(),
      observed_evidence: exitInputs[2].value.trim(),
      what_helped: exitInputs[3].value.trim(),
      what_did_not_work: exitInputs[4].value.trim(),
      next_adjustment: exitInputs[5].value.trim()
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

    lastHandoffText = buildNextInterviewPacket('Use this previous block record to help build my next block.', [
      { label: 'Mode', value: 'Coaching Loop' },
      { label: 'Practice', value: row.practice },
      { label: 'Planned start', value: row.planned_start },
      { label: 'Actual start', value: row.actual_start },
      { label: 'Planned finish', value: row.planned_finish },
      { label: 'Actual finish', value: row.actual_finish },
      { label: 'Intervention tested', value: row.intervention_tested },
      { label: 'Practice step checks', value: row.practice_step_checks },
      { label: 'Check-in responses', value: row.check_in_responses },
      { label: 'Practice happened', value: row.practice_happened },
      { label: 'Predicted pattern seen', value: row.predicted_pattern_seen },
      { label: 'Observed evidence', value: row.observed_evidence },
      { label: 'What helped', value: row.what_helped },
      { label: 'What did not work', value: row.what_did_not_work },
      { label: 'Next adjustment', value: row.next_adjustment }
    ]);
    document.getElementById('handoffNote').textContent =
      'Paste this into your next interview so the next attempt can be adjusted from what actually happened.';
    document.getElementById('handoffArea').classList.remove('hidden');
  });

  document.getElementById('copyNextInterview').addEventListener('click', function () {
    copyToClipboardOrPrompt(lastHandoffText, function () { showToast(toast, 'Copied for next interview'); }, 'Copy this for your next interview:');
  });

  document.getElementById('copyCsv').addEventListener('click', function () {
    var text = csvTextFor(CSV_HEADER, getStoredRows(STORAGE_KEY));
    copyToClipboardOrPrompt(text, function () { showToast(toast, 'CSV copied'); }, 'Copy the CSV:');
  });

  document.getElementById('downloadCsv').addEventListener('click', function () {
    downloadCsv(slugify(data.title) + '-practice-log.csv', csvTextFor(CSV_HEADER, getStoredRows(STORAGE_KEY)));
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
