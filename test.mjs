import assert from 'node:assert/strict';
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
