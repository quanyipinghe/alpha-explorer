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
    if (p && p.levels && typeof p.levels === 'object' && !Array.isArray(p.levels) && Array.isArray(p.stickers)) {
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

// Levels unlock in order; the parent can unlock everything.
export const isUnlocked = (levels, progress, index) =>
  index === 0 || progress.allUnlocked || !!(levels[index - 1] && progress.levels[levels[index - 1].id] && progress.levels[levels[index - 1].id].stars >= 1);

const PROMPT = (key) => `/audio/prompts/${key}.mp3`;
export const PROMPTS = {
  find: 'Find the letter', next: 'What comes next?', sound: 'Which letter makes this sound?',
  first: 'What letter does it start with?', picture: 'Which picture is it?', missing: 'Which letter is missing?',
  great: 'Great job!', again: "Let's try again!",
};
const VOWELS = ['a', 'e', 'i', 'o', 'u'];
const cvcAudio = (w) => `/audio/cvc/${w.word}.mp3`;
const vowelOf = (w) => w.word[1];

// Three distinct options: the answer plus two from the level pool, topped up from `all` if the pool is small.
function pickOptions(answer, pool, all, rand) {
  const others = shuffle(pool.filter((x) => x !== answer), rand);
  const extra = shuffle(all.filter((x) => x !== answer && others.indexOf(x) < 0), rand);
  return shuffle([answer].concat(others.concat(extra).slice(0, 2)), rand);
}

// Each type: which items can be a target, and how one target becomes a question.
const TYPES = {
  'find-upper': { letters: true, q: (t, c) => ({ prompt: [PROMPT('find'), t.audio.name], say: [t.audio.name], show: { kind: 'listen' }, options: c.letterOpts(t, (a) => a.letter.upper) }) },
  'find-lower': { letters: true, q: (t, c) => ({ prompt: [PROMPT('find'), t.audio.name], say: [t.audio.name], show: { kind: 'listen' }, options: c.letterOpts(t, (a) => a.letter.lower) }) },
  'case-match': { letters: true, q: (t, c) => ({ prompt: [PROMPT('find'), t.audio.name], say: [t.audio.name], show: { kind: 'letter', text: t.letter.upper }, options: c.letterOpts(t, (a) => a.letter.lower) }) },
  'next-letter': {
    letters: true,
    ok: (t, c) => c.index(t) >= 2,
    q: (t, c) => {
      const a = c.alphabet[c.index(t) - 2], b = c.alphabet[c.index(t) - 1];
      return { prompt: [a.audio.name, b.audio.name, PROMPT('next')], say: [t.audio.name], show: { kind: 'seq', seq: [a.letter.upper, b.letter.upper] }, options: c.letterOpts(t, (x) => x.letter.upper) };
    },
  },
  'sound-letter': { letters: true, ok: (t) => t.phonicsOk, q: (t, c) => ({ prompt: [PROMPT('sound'), t.audio.phonics], say: [t.audio.phonics, t.audio.name], show: { kind: 'listen' }, options: c.letterOpts(t, (a) => a.letter.upper + a.letter.lower) }) },
  // No word text on screen: the child would just read off its first letter.
  'first-letter': { letters: true, q: (t, c) => ({ prompt: [PROMPT('first'), t.audio.word], say: [t.audio.word, t.audio.name], show: { kind: 'picture', image: t.image }, options: c.letterOpts(t, (a) => a.letter.upper + a.letter.lower) }) },
  'word-picture': { letters: false, q: (t, c) => ({ prompt: [PROMPT('picture'), cvcAudio(t)], say: [cvcAudio(t)], show: { kind: 'listen' }, options: c.wordOpts(t) }) },
  'missing-vowel': {
    letters: false,
    q: (t, c) => ({
      prompt: [PROMPT('missing'), cvcAudio(t)], say: [cvcAudio(t)],
      show: { kind: 'missing', before: t.word[0], after: t.word[2], emoji: t.emoji },
      options: pickOptions(vowelOf(t), [], VOWELS, c.rand).map((v) => ({ id: v, label: v })),
    }),
  },
};

export function makeLevel(level, alphabet, cvc, rand = Math.random) {
  const type = TYPES[level.type];
  if (!type) throw new Error('unknown level type ' + level.type);
  const pool = type.letters
    ? (level.letters ? alphabet.filter((a) => level.letters.indexOf(a.id) >= 0) : alphabet)
    : (level.words ? cvc.filter((w) => level.words.indexOf(w.word) >= 0) : cvc);
  const ctx = { alphabet, rand, index: (t) => alphabet.indexOf(t) };
  const byId = (list, key) => (id) => list.filter((x) => x[key] === id)[0];
  ctx.letterOpts = (t, label) => {
    const ids = pickOptions(t.id, pool.map((a) => a.id), alphabet.map((a) => a.id), rand);
    return ids.map(byId(alphabet, 'id')).map((a) => ({ id: a.id, label: label(a) }));
  };
  ctx.wordOpts = (t) => {
    const ids = pickOptions(t.word, pool.map((w) => w.word), cvc.map((w) => w.word), rand);
    return ids.map(byId(cvc, 'word')).map((w) => ({ id: w.word, label: w.emoji }));
  };
  const targets = pool.filter((t) => !type.ok || type.ok(t, ctx));
  if (!targets.length) throw new Error('no targets for level ' + level.id);
  let deck = [];
  const questions = [];
  while (questions.length < 8) {
    if (!deck.length) deck = shuffle(targets, rand);
    const t = deck.pop();
    const q = type.q(t, ctx);
    q.answer = type.letters ? t.id : (level.type === 'missing-vowel' ? vowelOf(t) : t.word);
    questions.push(q);
  }
  // Warm-up shows at most 4 cards so a whole-alphabet level doesn't open with 26 of them.
  const warmup = shuffle(pool, rand).slice(0, 4).map((x) => (type.letters ? { kind: 'letter', letter: x } : { kind: 'blend', word: x }));
  return { warmup, questions };
}

// Every clip the app plays, with the text Kokoro reads for it. `ipa: true` = text is phonemes.
// Files are relative to public/.
export function audioJobs(alphabet, cvc) {
  const jobs = [];
  alphabet.forEach((a) => {
    // Bare "B" / "Watch" make Kokoro trail or swallow the ending; the "!" closes the clip cleanly.
    // nameIpa/nameFilter: hand-tuned letters the plain text reads wrong (E slid to "ay", F read "af").
    jobs.push(a.nameIpa
      ? { file: a.audio.name.slice(1), text: a.nameIpa, ipa: true, filter: a.nameFilter }
      : { file: a.audio.name.slice(1), text: a.letter.upper + '!' });
    jobs.push({ file: a.audio.word.slice(1), text: a.word.text + '!' });
    jobs.push({ file: a.audio.phonics.slice(1), text: a.phonicsText, ipa: true });
  });
  cvc.forEach((w) => jobs.push({ file: `audio/cvc/${w.word}.mp3`, text: w.word }));
  Object.keys(PROMPTS).forEach((k) => jobs.push({ file: `audio/prompts/${k}.mp3`, text: PROMPTS[k] }));
  return jobs;
}
