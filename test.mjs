import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { makeLevel, isUnlocked } from './src/logic.js';
import { starsFor, parseProgress, emptyProgress, recordResult, nearest, mathGate } from './src/logic.js';

assert.deepEqual([5, 6, 7, 8].map(starsFor), [0, 1, 2, 3]);
assert.deepEqual(parseProgress(null), emptyProgress());
assert.deepEqual(parseProgress('{oops'), emptyProgress());
assert.deepEqual(parseProgress('["A","B"]'), emptyProgress()); // 旧键的格式
let p = recordResult(emptyProgress(), 's1-01', 2, 100);
assert.deepEqual(p.levels['s1-01'], { stars: 2, at: 100 });
assert.deepEqual(p.stickers, ['s1-01']);
p = recordResult(p, 's1-01', 1, 200);
assert.deepEqual(p.levels['s1-01'], { stars: 2, at: 100 }); // 不降星,不改首次时间
assert.deepEqual(p.stickers, ['s1-01']);                     // 不重复发贴纸
assert.equal(recordResult(emptyProgress(), 's1-01', 0, 1).stickers.length, 0);
const r = (l, t) => ({ left: l, right: l + 10, top: t, bottom: t + 10 });
assert.equal(nearest(r(0, 0), [r(100, 0), r(30, 60)], "right"), 0);
assert.equal(nearest(r(0, 0), [r(100, 0), r(30, 30)], "right"), 1);
let k = 0; const g = mathGate(() => (k = (k + 0.37) % 1));
assert.ok(g.options.includes(g.answer) && new Set(g.options).size === 4);
console.log('logic ok');

// ---- Task 2: levels ----
const json = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));
const ALPHA = json('./src/data/alphabet.json'), CVC = json('./src/data/cvc.json'), LEVELS = json('./src/data/levels.json');

// Emoji 12+ 的码位范围;遇到其中任何一个就说明电视上会显示成方块
const NEW_EMOJI = [[0x1f6d5,0x1f6df],[0x1f6fa,0x1f6ff],[0x1f7e0,0x1f7ff],[0x1f90c,0x1f90f],[0x1f93f,0x1f93f],
  [0x1f971,0x1f972],[0x1f977,0x1f979],[0x1f97b,0x1f97b],[0x1f9a3,0x1f9af],[0x1f9ba,0x1f9bf],[0x1f9c3,0x1f9cf],[0x1fa70,0x1faff]];
const oldEmoji = (s) => [...s].every((c) => !NEW_EMOJI.some(([a, b]) => c.codePointAt(0) >= a && c.codePointAt(0) <= b));
for (const e of CVC.map((w) => w.emoji).concat(LEVELS.map((l) => l.sticker))) assert.ok(oldEmoji(e), `emoji too new: ${e}`);
assert.equal(new Set(CVC.map((w) => w.emoji)).size, CVC.length);
assert.equal(new Set(LEVELS.map((l) => l.id)).size, LEVELS.length);
assert.equal(new Set(LEVELS.map((l) => l.sticker)).size, LEVELS.length);
for (const w of CVC) assert.match(w.word, /^[b-df-hj-np-tv-z][aeiou][b-df-hj-np-tv-z]$/, w.word);

for (const lv of LEVELS) for (let seed = 0; seed < 20; seed++) {
  let s = seed; const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const { questions } = makeLevel(lv, ALPHA, CVC, rand);
  assert.equal(questions.length, 8, lv.id);
  for (const q of questions) {
    assert.equal(q.options.length, 3, lv.id);
    assert.equal(new Set(q.options.map((o) => o.id)).size, 3, lv.id);
    assert.equal(new Set(q.options.map((o) => o.label)).size, 3, lv.id);
    assert.ok(q.options.some((o) => o.id === q.answer), lv.id);
  }
}
const small = { id: 't', stage: 1, type: 'find-upper', letters: 'YZ', sticker: '⭐' }; // 本关字母不够 3 个
assert.equal(makeLevel(small, ALPHA, CVC).questions[0].options.length, 3);
const nl = makeLevel({ id: 't', stage: 1, type: 'next-letter', letters: 'ABC', sticker: '⭐' }, ALPHA, CVC);
assert.ok(nl.questions.every((q) => q.answer === 'C'));
const sl = makeLevel({ id: 't', stage: 2, type: 'sound-letter', letters: 'AB', sticker: '⭐' },
  ALPHA.map((a) => Object.assign({}, a, { phonicsOk: a.id !== 'A' })), CVC);
assert.ok(sl.questions.every((q) => q.answer === 'B'));
assert.equal(isUnlocked(LEVELS, emptyProgress(), 0), true);
assert.equal(isUnlocked(LEVELS, emptyProgress(), 1), false);
assert.equal(isUnlocked(LEVELS, recordResult(emptyProgress(), LEVELS[0].id, 1, 0), 1), true);
assert.equal(isUnlocked(LEVELS, Object.assign(emptyProgress(), { allUnlocked: true }), 5), true);
console.log('levels ok');
