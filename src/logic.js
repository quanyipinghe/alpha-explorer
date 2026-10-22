// Pure rules: no DOM, tested by `node test.mjs`.

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Parent gate, from lingopop: two 10~49 addends, 4 distinct options.
export function mathGate(rand = Math.random) {
  const pick = () => 10 + Math.floor(rand() * 40);
  const a = pick(), b = pick(), answer = a + b;
  const opts = new Set([answer]);
  while (opts.size < 4) opts.add(answer + (rand() < 0.5 ? -1 : 1) * (1 + Math.floor(rand() * 10)));
  return { q: `${a} + ${b}`, answer, options: shuffle([...opts], rand) };
}

// After a wrong gate answer the gate stays shut for a while, so mashing OK can't win.
export function cooldown(ms, now = () => Date.now()) {
  let until = 0;
  return { ready: () => now() >= until, fail: () => { until = now() + ms; }, left: () => Math.max(0, until - now()) };
}

// Spatial navigation for the TV remote: pick the closest box in the arrow's direction,
// weighting sideways drift x2 so a box straight ahead beats a nearer diagonal one.
export function nearest(from, rects, dir) {
  const cx = (r) => (r.left + r.right) / 2, cy = (r) => (r.top + r.bottom) / 2;
  let best = -1, bestScore = Infinity;
  rects.forEach((r, i) => {
    const dx = cx(r) - cx(from), dy = cy(r) - cy(from);
    const [main, side] = dir === 'left' || dir === 'right' ? [dx, dy] : [dy, dx];
    const forward = dir === 'right' || dir === 'down' ? main : -main;
    if (forward <= 1) return; // behind, level with, or the same box
    const score = forward + 2 * Math.abs(side);
    if (score < bestScore) { bestScore = score; best = i; }
  });
  return best;
}

// 8 questions a level; first-try correct 6/7/8 → 1/2/3 stars, fewer → not passed.
export const starsFor = (firstTry) => (firstTry >= 6 ? firstTry - 5 : 0);

export const emptyProgress = () => ({ levels: {}, stickers: [], allUnlocked: false });

export function parseProgress(str) {
  try {
    const p = JSON.parse(str);
    if (p && typeof p.levels === 'object' && !Array.isArray(p.levels) && Array.isArray(p.stickers)) {
      return { levels: p.levels, stickers: p.stickers, allUnlocked: !!p.allUnlocked };
    }
  } catch (e) { /* corrupt storage: start fresh */ }
  return emptyProgress();
}

export function recordResult(progress, levelId, stars, now) {
  if (stars < 1) return progress;
  const old = progress.levels[levelId];
  const levels = Object.assign({}, progress.levels);
  levels[levelId] = old ? { stars: Math.max(old.stars, stars), at: old.at } : { stars, at: now };
  const stickers = progress.stickers.indexOf(levelId) < 0 ? progress.stickers.concat(levelId) : progress.stickers;
  return { levels, stickers, allUnlocked: progress.allUnlocked };
}
