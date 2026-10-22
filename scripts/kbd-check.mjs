// Walks the built app with the keyboard only (arrows / Enter / history.back = the TV remote)
// in headless Chrome over CDP. No dependencies: Node's own fetch + WebSocket.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/kbd-check.mjs http://localhost:4173
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const BASE = process.argv[2] || 'http://localhost:4173';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=960,540',
  '--autoplay-policy=no-user-gesture-required', '--mute-audio', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'kbd-'))}`, 'about:blank'],
{ stdio: 'ignore' });
process.on('exit', () => chrome.kill());

let page;
for (let i = 0; i < 50 && !page; i++) {
  try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch (e) { await sleep(200); }
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
async function js(expr) {
  const d = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (d.result.exceptionDetails) throw new Error(expr + ': ' + d.result.exceptionDetails.text);
  return d.result.result.value;
}
async function waitFor(expr, ms = 15000) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(100)) if (await js(expr)) return;
  throw new Error('timeout waiting for ' + expr);
}
const CODES = { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Enter: 13 };
let presses = 0;
async function key(k) {
  const base = { key: k, code: k, windowsVirtualKeyCode: CODES[k] };
  await send('Input.dispatchKeyEvent', Object.assign({ type: 'keyDown' }, base, k === 'Enter' ? { text: '\r' } : {}));
  await send('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, base));
  await sleep(60);
  presses++;
  // The core promise to the kid: focus is always on something pressable.
  const tag = await js('document.activeElement && document.activeElement.tagName');
  assert.ok(tag === 'BUTTON' || tag === 'A', `after ${k}, focus is on ${tag} at ${await js('location.pathname')}`);
}
// Steer focus to `sel` with arrow keys only.
async function moveTo(sel) {
  for (let i = 0; i < 30; i++) {
    const v = await js(`(() => { const a = document.activeElement.getBoundingClientRect(), t = document.querySelector(${JSON.stringify(sel)});
      if (!t) return 'missing'; if (t === document.activeElement) return 'here';
      const b = t.getBoundingClientRect(), dx = (b.left + b.right - a.left - a.right) / 2, dy = (b.top + b.bottom - a.top - a.bottom) / 2;
      return Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 'ArrowDown' : 'ArrowUp') : (dx > 0 ? 'ArrowRight' : 'ArrowLeft'); })()`);
    if (v === 'here') return;
    if (v === 'missing') throw new Error('no element ' + sel);
    await key(v);
  }
  throw new Error('could not reach ' + sel);
}
async function open(path) {
  await send('Page.navigate', { url: BASE + path });
  await waitFor('document.readyState === "complete" && !!document.querySelector("#app > *")');
  await sleep(300);
}
const path = () => js('location.pathname');
const ready = 'document.querySelector("[data-options]") && document.querySelector("[data-options]").getAttribute("data-busy") === "false"';

// 1. Map → level 1 (one wrong answer) → result → remote Back → level 2 unlocked
await open('/');
await js('localStorage.clear()');
await open('/');
assert.equal(await js('document.activeElement.getAttribute("data-level")'), 's1-01', 'map focuses the first level');
await key('Enter');
await waitFor('location.pathname === "/level/s1-01"');
await waitFor('!!document.querySelector("[data-skip]")');
await moveTo('[data-skip]');
await key('Enter');
for (let q = 0; q < 8; q++) {
  await waitFor(`document.querySelector("[data-options]") && document.querySelector("[data-options]").getAttribute("data-qi") === "${q}"`);
  if (q === 1) { // pressing during the question audio must not count as an answer
    await waitFor('document.querySelector("[data-options]").getAttribute("data-busy") === "true"', 2000).catch(() => {});
    if (await js('document.querySelector("[data-options]").getAttribute("data-busy") === "true"')) {
      await key('Enter');
      assert.equal(await js('document.querySelectorAll("[data-option][data-wrong]").length'), 0, 'press while listening was ignored');
    }
  }
  await waitFor(ready);
  const answer = await js('document.querySelector("[data-options]").getAttribute("data-answer")');
  if (q === 0) {
    const wrong = await js(`document.querySelector('[data-option]:not([data-option="${answer}"])').getAttribute('data-option')`);
    await moveTo(`[data-option="${wrong}"]`);
    await key('Enter');
    await waitFor(ready);
  }
  await moveTo(`[data-option="${answer}"]`);
  await key('Enter');
}
await waitFor('!!document.querySelector("[data-result]")');
assert.equal(await js('document.activeElement.hasAttribute("data-home")'), true, 'result focuses 回地图');
assert.equal(await js('document.querySelector("[data-result]").getAttribute("data-stars")'), '2', '7 first-try → 2 stars');
await js('history.back()');
await waitFor('location.pathname === "/"');
await waitFor('!!document.querySelector("[data-level=s1-02]")');
assert.equal(await js('document.querySelector("[data-level=s1-02]").disabled'), false, 'level 2 unlocked');
assert.equal(await js('document.activeElement.getAttribute("data-level")'), 's1-02', 'map focuses the next level');

// 2. Deep link without history: the on-screen back goes to the map instead of leaving
await open('/level/s1-01');
await moveTo('[data-back]');
await key('Enter');
await waitFor('location.pathname === "/"');

// 3. A locked level by URL bounces to the map
await open('/level/s3-06');
assert.equal(await path(), '/');
await open('/level/nope');
assert.equal(await path(), '/');

// 4. Parent gate: a wrong answer locks the options
await open('/');
await moveTo('[data-parent]');
await key('Enter');
await waitFor('location.pathname === "/parent"');
const gateAnswer = await js('document.querySelector("[data-gate-options]").getAttribute("data-answer")');
await moveTo(`[data-gate]:not([data-gate="${gateAnswer}"])`);
await key('Enter');
assert.equal(await js('[].every.call(document.querySelectorAll("[data-gate]"), (b) => b.getAttribute("aria-disabled") === "true")'), true, 'gate locked after a wrong answer');

// 5. Sticker wall opens and focuses its back button
await open('/stickers');
assert.equal(await js('document.activeElement.hasAttribute("data-back")'), true);

// 6. Corrupt storage still renders the map
await js('localStorage.setItem("alpha_explorer_progress", "{oops")');
await open('/');
assert.equal(await js('!!document.querySelector("[data-level=s1-01]")'), true);

console.log(`kbd-check ok (${presses} key presses, focus never lost)`);
process.exit(0);
