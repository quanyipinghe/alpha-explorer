// Pre-generate every clip with Kokoro-82M (Apache-2.0), voice af_heart. Run: npm run tts
// Regenerates everything by default so all clips share one voice; `npm run tts -- --missing` only fills gaps.
import { KokoroTTS } from 'kokoro-js';
import { readFileSync, readdirSync, existsSync, unlinkSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { audioJobs } from '../src/logic.js';

const ROOT = new URL('../', import.meta.url).pathname;
const json = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
const jobs = audioJobs(json('src/data/alphabet.json'), json('src/data/cvc.json'));
const PUB = join(ROOT, 'public');

// Drop clips no longer referenced.
const wanted = new Set(jobs.map((j) => j.file));
let removed = 0;
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return walk(p);
  if (p.endsWith('.mp3') && !wanted.has(p.slice(PUB.length + 1))) { unlinkSync(p); removed++; }
});
walk(join(PUB, 'audio'));

const todo = process.argv.includes('--missing') ? jobs.filter((j) => !existsSync(join(PUB, j.file))) : jobs;
if (todo.length) {
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
  const wav = join(tmpdir(), 'alpha-tts.wav');
  for (const j of todo) {
    // Letter sounds can't be spelled as English text, so feed phonemes straight to the model.
    const audio = j.ipa
      ? await tts.generate_from_ids(tts.tokenizer(j.text, { truncation: true }).input_ids, { voice: 'af_heart' })
      : await tts.generate(j.text, { voice: 'af_heart' });
    await audio.save(wav);
    mkdirSync(dirname(join(PUB, j.file)), { recursive: true });
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', '48k', join(PUB, j.file)]);
    console.log('  +', j.file);
  }
}
console.log(`generated ${todo.length}, removed ${removed}`);
