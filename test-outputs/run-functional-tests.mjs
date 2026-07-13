import { JSDOM } from '/tmp/node_modules/jsdom/lib/api.js';
import { readFileSync } from 'node:fs';

let totalChecks = 0;
let totalFailures = 0;

function check(label, condition) {
  totalChecks++;
  if (condition) {
    console.log('  ok   ' + label);
  } else {
    totalFailures++;
    console.log('  FAIL ' + label);
  }
}

function pad(n) { return n < 10 ? '0' + n : String(n); }

async function loadFile(path, patch) {
  let html = readFileSync(path, 'utf8');
  if (patch) html = patch(html);
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost/', pretendToBeVisual: true });
  const { window } = dom;
  window.HTMLElement.prototype.scrollIntoView = function () {};
  await new Promise((r) => setTimeout(r, 60));
  return dom;
}

async function testMode(label, path, opts) {
  console.log('\n=== ' + label + ' ===');
  const dom = await loadFile(path);
  const { window } = dom;
  const doc = window.document;

  const errorBanner = doc.getElementById('errorBanner');
  check('loads with no fatal validation error', errorBanner && errorBanner.classList.contains('hidden'));

  // ---- initial state: Begin visible, Finish hidden, active status hidden ----
  const beginArea = doc.getElementById('beginArea');
  const finishArea = doc.getElementById('finishArea');
  const activeBanner = doc.getElementById('activeBanner');
  check('before Begin: beginArea visible', !beginArea.classList.contains('hidden'));
  check('before Begin: finishArea hidden', finishArea.classList.contains('hidden'));
  check('before Begin: activeBanner hidden', activeBanner.classList.contains('hidden'));

  // ---- progress counter starts at 0 / N ----
  const progressCounter = doc.getElementById('progressCounter');
  const stepCount = doc.querySelectorAll('#steps input[type=checkbox]').length;
  check('progress counter initializes to 00 / ' + pad(stepCount), progressCounter.textContent === '00 / ' + pad(stepCount) + ' COMPLETE');

  // ---- Begin ----
  doc.getElementById('beginBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('after Begin: beginArea hidden', beginArea.classList.contains('hidden'));
  check('after Begin: finishArea visible', !finishArea.classList.contains('hidden'));
  check('after Begin: activeBanner visible', !activeBanner.classList.contains('hidden'));

  // ---- checkbox / live progress counter ----
  const checkboxes = doc.querySelectorAll('#steps input[type=checkbox]');
  checkboxes[0].checked = true;
  checkboxes[0].dispatchEvent(new window.Event('change', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('progress counter updates live after checking one box', progressCounter.textContent === '01 / ' + pad(stepCount) + ' COMPLETE');

  // ---- Knock preview ----
  doc.getElementById('previewKnock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  const overlay = doc.getElementById('knockOverlay');
  check('Knock preview opens the overlay', !overlay.classList.contains('hidden'));
  check('Knock question text is set', doc.getElementById('knockQuestion').textContent.length > 0);

  // Yes
  doc.querySelector('#choiceArea button[data-choice="Yes"]').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('"Yes" shows the yes_response line', doc.getElementById('replayArea').textContent.length > 0);
  doc.getElementById('returnToBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('returning to block closes the overlay', overlay.classList.contains('hidden'));

  // Sort of (preview again)
  doc.getElementById('previewKnock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  doc.querySelector('#choiceArea button[data-choice="Sort of"]').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('"Sort of" shows a replay cue', doc.getElementById('replayArea').textContent.length > 0);
  doc.getElementById('returnToBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));

  // No (mode-specific reason capture behavior)
  doc.getElementById('previewKnock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  doc.querySelector('#choiceArea button[data-choice="No"]').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));

  // Note: previewKnock always runs in "preview" mode, which intentionally
  // never opens the optional reason-capture field (a preview isn't a real
  // check-in, so it shouldn't prompt for or record a real excuse). The
  // capture_no_reason behavior itself is covered by testRealNoReasonCapture
  // below, which triggers a genuine (non-preview) Knock.
  check('"No" (preview) goes straight to a replay', doc.getElementById('replayArea').textContent.length > 0);
  doc.getElementById('returnToBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));

  // ---- manual Finish ----
  const exitLog = doc.getElementById('exitLog');
  check('exitLog hidden before Finish', exitLog.classList.contains('hidden'));
  doc.getElementById('finishBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('Finish reveals the exit log', !exitLog.classList.contains('hidden'));
  check('Finish hides the active banner', activeBanner.classList.contains('hidden'));
  check('Finish hides the finishArea (no repeat Finish)', finishArea.classList.contains('hidden'));

  const autoRecorded = doc.getElementById('autoRecorded');
  check('auto-recorded summary is populated', autoRecorded.textContent.includes('Planned start'));

  // ---- repeated Finish prevention ----
  const autoRecordedTextBefore = autoRecorded.textContent;
  doc.getElementById('finishBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('clicking Finish again does not change the captured summary (idempotent)', autoRecorded.textContent === autoRecordedTextBefore);

  // ---- fill + save exit form ----
  const textareas = doc.querySelectorAll('#exitForm textarea');
  textareas.forEach((t, i) => { t.value = 'Test answer ' + (i + 1); });
  const logSection = doc.getElementById('logSection');
  check('logSection hidden before save', logSection.classList.contains('hidden'));
  doc.getElementById('exitForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('logSection revealed after save', !logSection.classList.contains('hidden'));
  const rowsAfterSave = doc.querySelectorAll('#logView table tbody tr');
  check('exactly one row created after first save', rowsAfterSave.length === 1);
  check('Save button disabled after save (prevents duplicate rows)', doc.getElementById('saveExit').disabled === true);

  // ---- row deletion ----
  const deleteBtn = doc.querySelector('#logView [data-delete-row]');
  check('delete control exists on the saved row', !!deleteBtn);
  if (deleteBtn) {
    deleteBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    const rowsAfterDelete = doc.querySelectorAll('#logView table tbody tr');
    check('row count is zero after deleting the only row', rowsAfterDelete.length === 0);
  }

  window.close();
}

async function testRealNoReasonCapture(label, path) {
  console.log('\n=== ' + label + ' (real Knock, capture_no_reason) ===');
  // Shrink the check-in window to a fraction of a second so a genuine
  // (non-preview) Knock fires quickly, then answer "No" for real.
  const dom = await loadFile(path, (html) =>
    html
      .replace(/"min_minutes":\s*[\d.]+/, '"min_minutes": 0.01')
      .replace(/"max_minutes":\s*[\d.]+/, '"max_minutes": 0.01')
  );
  const { window } = dom;
  const doc = window.document;
  doc.getElementById('beginBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 1200));
  const overlay = doc.getElementById('knockOverlay');
  check('a real (scheduled) Knock opens on its own', !overlay.classList.contains('hidden'));
  doc.querySelector('#choiceArea button[data-choice="No"]').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  const noReasonWrap = doc.getElementById('noReasonWrap');
  check('real "No" reveals the optional reason field (capture_no_reason: true)', noReasonWrap && !noReasonWrap.classList.contains('hidden'));
  doc.getElementById('noReasonInput').value = 'Opened the old notes when the scene got hard';
  doc.getElementById('submitNoReason').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  check('after submitting the reason, the fixed evidence reminder shows', doc.getElementById('replayArea').textContent.includes('evidence'));
  window.close();
}

async function testInvalidData(label, path) {
  console.log('\n=== ' + label + ' (invalid DATA handling) ===');
  const dom = await loadFile(path, (html) =>
    html.replace(/"title":\s*"[^"]*"/, '"title": ""')
  );
  const { window } = dom;
  const doc = window.document;
  const errorBanner = doc.getElementById('errorBanner');
  check('missing required field triggers the fatal error banner, not a crash', errorBanner && !errorBanner.classList.contains('hidden'));
  const errorItems = doc.querySelectorAll('#errorList li');
  check('fatal error banner lists at least one specific problem', errorItems.length > 0);
  window.close();
}

async function testHardStop(label, path) {
  console.log('\n=== ' + label + ' (hard stop) ===');
  const now = new Date();
  const nowHHMM = pad(now.getHours()) + ':' + pad(now.getMinutes());
  const dom = await loadFile(path, (html) =>
    html.replace(/"planned_finish":\s*"[^"]*"/, '"planned_finish": "' + nowHHMM + '"')
  );
  const { window } = dom;
  const doc = window.document;
  doc.getElementById('beginBlock').dispatchEvent(new window.Event('click', { bubbles: true }));
  // hard stop fires ~3s after begin when planned_finish is already "now" (Math.max(diff, 0.05) * 60000ms)
  await new Promise((r) => setTimeout(r, 4200));
  const hardStopOverlay = doc.getElementById('hardStopOverlay');
  check('hard stop overlay fires automatically at/after planned finish', !hardStopOverlay.classList.contains('hidden'));
  check('hard stop message is the required exact text', doc.getElementById('hardStopMessage').textContent === 'Time. Write the answer as it stands, and name the next move.');
  doc.getElementById('hardStopContinue').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  const exitLog = doc.getElementById('exitLog');
  check('continuing from hard stop reveals the exit log', !exitLog.classList.contains('hidden'));
  window.close();
}

const BASE = '/sessions/dazzling-eloquent-wright/mnt/outputs/NextBlock/test-outputs';

await testMode('Ready to Work (Caves test case)', BASE + '/ready-to-work-test-caves.html', { capturesNoReason: false });
await testMode('Coaching Loop (practice test case)', BASE + '/coaching-loop-test-practice.html', { capturesNoReason: true });
await testMode('Explorer (city-scouting test case)', BASE + '/explorer-test-city-scouting.html', { capturesNoReason: false });

await testRealNoReasonCapture('Coaching Loop', BASE + '/coaching-loop-test-practice.html');

await testInvalidData('Ready to Work', BASE + '/ready-to-work-test-caves.html');
await testInvalidData('Coaching Loop', BASE + '/coaching-loop-test-practice.html');
await testInvalidData('Explorer', BASE + '/explorer-test-city-scouting.html');

await testHardStop('Explorer', BASE + '/explorer-test-city-scouting.html');

console.log('\n--- SUMMARY ---');
console.log((totalChecks - totalFailures) + '/' + totalChecks + ' checks passed.');
if (totalFailures > 0) {
  console.log(totalFailures + ' failure(s).');
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
