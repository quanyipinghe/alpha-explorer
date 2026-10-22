// One shared player. playSeq plays clips in order; a clip that errors or hasn't started
// within 1.5 s is skipped, so a missing file can never leave the options locked.
const player = new Audio();
let token = 0;
let finishCurrent = null;

function playOne(src) {
  return new Promise((resolve) => {
    let started = false;
    const done = () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      player.onplaying = player.onended = player.onerror = null;
      finishCurrent = null;
      resolve();
    };
    const startTimer = setTimeout(() => { if (!started) done(); }, 1500);
    const endTimer = setTimeout(done, 8000); // a stalled stream must not hang the level
    finishCurrent = done;
    player.onplaying = () => { started = true; };
    player.onended = done;
    player.onerror = done;
    player.src = src;
    const p = player.play();
    if (p && p.catch) p.catch(done);
  });
}

export async function playSeq(paths) {
  const mine = ++token;
  if (finishCurrent) finishCurrent(); // interrupt whatever was playing
  player.pause();
  for (let i = 0; i < paths.length; i++) {
    if (mine !== token) return;
    await playOne(paths[i]);
  }
}

// Tiny synthesized cues (from lingopop) so kids who can't read still know right from wrong.
let actx;
export function beep(kind) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { ok: [660, 990], no: [240, 190], pop: [880] }[kind];
    notes.forEach((f, k) => {
      const t = actx.currentTime + k * 0.12;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = kind === 'no' ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t);
      o.stop(t + 0.22);
    });
  } catch (e) { /* no Web Audio: stay silent */ }
}
