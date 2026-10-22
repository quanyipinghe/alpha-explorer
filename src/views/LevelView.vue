<template>
  <div class="h-screen overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-200 px-8 py-4 flex flex-col">
    <div class="flex items-center justify-between h-12">
      <BackButton />
      <div v-if="phase === 'quiz'" class="flex">
        <span v-for="i in 8" :key="i" class="w-5 h-5 mx-1 rounded-full"
          :class="i - 1 < qi ? 'bg-green-400' : i - 1 === qi ? 'bg-orange-400' : 'bg-white'"></span>
      </div>
      <button v-if="phase === 'warmup'" data-skip class="px-5 py-2 rounded-full bg-white/80 text-xl font-bold shadow" @click="startQuiz">跳过 ⏭</button>
      <span v-else class="w-24"></span>
    </div>

    <!-- Warm-up cards: look and listen, nothing to score. -->
    <div v-if="phase === 'warmup'" class="flex-1 flex flex-col items-center justify-center">
      <template v-if="card.kind === 'letter'">
        <div class="flex items-center">
          <span class="text-9xl font-extrabold text-sky-700 mr-8">{{ card.letter.letter.upper }}{{ card.letter.letter.lower }}</span>
          <img :src="card.letter.image" class="w-40 h-40" alt="" />
        </div>
        <p class="text-4xl font-bold text-gray-700 mb-4">{{ card.letter.word.text }} <span class="text-2xl text-gray-500">{{ card.letter.word.translation }}</span></p>
        <div class="flex mb-4">
          <button class="mx-3 px-5 py-3 rounded-full bg-orange-400 text-white text-2xl font-bold" @click="say([card.letter.audio.name])">🔤 字母</button>
          <button class="mx-3 px-5 py-3 rounded-full bg-rose-400 text-white text-2xl font-bold" @click="say([card.letter.audio.phonics])">🔊 发音</button>
          <button class="mx-3 px-5 py-3 rounded-full bg-green-500 text-white text-2xl font-bold" @click="say([card.letter.audio.word])">🍎 单词</button>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center mb-4">
          <span v-for="(c, i) in card.word.word.split('')" :key="i" class="text-9xl font-extrabold mx-3"
            :class="lit === i ? 'glow' : 'text-sky-700'">{{ c }}</span>
          <span class="text-9xl ml-8" :style="{ visibility: lit === 3 ? 'visible' : 'hidden' }">{{ card.word.emoji }}</span>
        </div>
        <button class="mb-4 px-5 py-3 rounded-full bg-rose-400 text-white text-2xl font-bold" @click="blend">🔊 再拼一次</button>
      </template>
      <button data-autofocus class="px-8 py-4 rounded-full bg-sky-500 text-white text-3xl font-bold shadow-lg" @click="nextCard">
        {{ ci < warmup.length - 1 ? '下一张 ➡' : '开始闯关 ▶' }}</button>
    </div>

    <!-- Questions -->
    <div v-else-if="phase === 'quiz'" class="flex-1 flex flex-col items-center justify-center">
      <div class="h-56 flex items-center justify-center mb-4">
        <button v-if="q.show.kind === 'listen'" class="w-44 h-44 rounded-full bg-white text-8xl shadow-lg" :aria-disabled="busy ? 'true' : null" @click="replay">👂</button>
        <template v-else>
          <span v-if="q.show.kind === 'letter'" class="text-9xl font-extrabold text-sky-700 mr-8">{{ q.show.text }}</span>
          <span v-if="q.show.kind === 'seq'" class="text-8xl font-extrabold text-sky-700 mr-8">{{ q.show.seq.join(' ') }} <span class="text-orange-400">?</span></span>
          <img v-if="q.show.kind === 'picture'" :src="q.show.image" class="w-48 h-48 mr-8" alt="" />
          <span v-if="q.show.kind === 'missing'" class="text-8xl font-extrabold text-sky-700 mr-8">{{ q.show.before }}<span class="text-orange-400"> _ </span>{{ q.show.after }} {{ q.show.emoji }}</span>
          <button class="w-24 h-24 rounded-full bg-white text-5xl shadow" :aria-disabled="busy ? 'true' : null" @click="replay">👂</button>
        </template>
      </div>
      <div data-options :data-qi="qi" :data-answer="q.answer" :data-busy="busy ? 'true' : 'false'" class="grid grid-cols-3 gap-10">
        <button v-for="(o, i) in q.options" :key="qi + o.id" :data-option="o.id" :data-wrong="wrong.indexOf(o.id) >= 0 ? '' : null"
          :data-autofocus="i === 0 ? '' : null"
          :aria-disabled="busy || wrong.indexOf(o.id) >= 0 ? 'true' : null"
          class="w-48 h-36 rounded-3xl text-7xl font-extrabold shadow-lg"
          :class="[reveal && o.id === q.answer ? 'bg-green-400 text-white' : 'bg-white text-gray-800', shaking === o.id ? 'shake' : '']"
          @click="pick(o.id)">{{ o.label }}</button>
      </div>
    </div>

    <!-- Result: stop here. The kid goes back to the map on purpose; no auto-next. -->
    <div v-else data-result :data-stars="stars" class="flex-1 flex flex-col items-center justify-center">
      <template v-if="stars">
        <div class="stamp text-[10rem] leading-none mb-2">{{ level.sticker }}</div>
        <p class="text-6xl mb-2">{{ '⭐'.repeat(stars) }}<span class="text-gray-300">{{ '⭐'.repeat(3 - stars) }}</span></p>
        <p class="text-4xl font-bold text-orange-600 mb-6">太棒了!得到一张新贴纸</p>
        <button data-home data-autofocus class="px-8 py-4 rounded-full bg-sky-500 text-white text-3xl font-bold shadow-lg" @click="goBack">回地图 🗺️</button>
      </template>
      <template v-else>
        <div class="text-9xl mb-2">💪</div>
        <p class="text-4xl font-bold text-rose-600 mb-2">差一点点!</p>
        <p class="text-2xl text-gray-600 mb-6">答对 {{ firstTry }} 题,答对 6 题就能过关</p>
        <div class="flex">
          <button data-autofocus class="mr-6 px-8 py-4 rounded-full bg-orange-400 text-white text-3xl font-bold shadow-lg" @click="start">再来一次 🔁</button>
          <button data-home class="px-8 py-4 rounded-full bg-sky-500 text-white text-3xl font-bold shadow-lg" @click="goBack">回地图 🗺️</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue';
import LEVELS from '../data/levels.json';
import ALPHABET from '../data/alphabet.json';
import CVC from '../data/cvc.json';
import BackButton from '../components/BackButton.vue';
import { makeLevel, starsFor } from '../logic.js';
import { playSeq, beep } from '../audio.js';
import { focusMain } from '../tv.js';
import { goBack } from '../router/index.js';
import { useProgress } from '../composables/useProgress.js';

const props = defineProps({ id: { type: String, required: true } });
const level = LEVELS.filter((l) => l.id === props.id)[0]; // the route guard already checked it exists
const { saveResult } = useProgress();

const phase = ref('warmup');
const warmup = ref([]);
const questions = ref([]);
const ci = ref(0);
const qi = ref(0);
const firstTry = ref(0);
const wrong = ref([]);
const busy = ref(false); // question audio playing, or moving on: options don't take answers
const reveal = ref(false);
const shaking = ref(null);
const lit = ref(-1);
const stars = ref(0);
let alive = true;
onUnmounted(() => { alive = false; playSeq([]); });

const card = computed(() => warmup.value[ci.value]);
const q = computed(() => questions.value[qi.value]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const refocus = () => nextTick(focusMain);
const say = (paths) => playSeq(paths);
const phonics = (ch) => ALPHABET.filter((a) => a.id === ch.toUpperCase())[0].audio.phonics;

// Light each letter with its sound, then say the whole word and show the picture.
async function blend() {
  const w = card.value.word;
  const mine = ci.value;
  for (let i = 0; i < 3; i++) {
    lit.value = i;
    await playSeq([phonics(w.word[i])]);
    if (!alive || ci.value !== mine || phase.value !== 'warmup') return;
  }
  lit.value = 3;
  await playSeq([`/audio/cvc/${w.word}.mp3`]);
}

function showCard() {
  lit.value = -1;
  const c = card.value;
  if (c.kind === 'letter') say([c.letter.audio.name, c.letter.audio.word]);
  else blend();
}

function nextCard() {
  if (ci.value < warmup.value.length - 1) { ci.value++; showCard(); refocus(); } else startQuiz();
}

function start() {
  const made = makeLevel(level, ALPHABET, CVC);
  warmup.value = made.warmup;
  questions.value = made.questions;
  ci.value = 0; qi.value = 0; firstTry.value = 0;
  phase.value = 'warmup';
  showCard();
  refocus();
}

function startQuiz() {
  phase.value = 'quiz';
  ask();
}

async function ask() {
  wrong.value = []; reveal.value = false;
  refocus();
  await listen();
}

// Options stay focusable while busy (aria-disabled, not disabled) so focus never drops to <body>.
async function listen() {
  const mine = qi.value;
  busy.value = true;
  await playSeq(q.value.prompt);
  if (alive && qi.value === mine && !reveal.value) busy.value = false;
}

function replay() { if (!busy.value) listen(); }

async function pick(id) {
  if (busy.value || wrong.value.indexOf(id) >= 0) return;
  if (id === q.value.answer) {
    busy.value = true;
    beep('ok');
    if (!wrong.value.length) firstTry.value++;
    reveal.value = true;
    await wait(1000);
    return next();
  }
  beep('no');
  shaking.value = id;
  setTimeout(() => { shaking.value = null; }, 300);
  wrong.value = wrong.value.concat(id);
  if (wrong.value.length < 2) return listen(); // first miss: grey it out, hear the question again
  // Second miss: show and say the answer, then move on.
  busy.value = true;
  reveal.value = true;
  await playSeq(q.value.say);
  await wait(800);
  next();
}

function next() {
  if (!alive) return;
  if (qi.value < questions.value.length - 1) { qi.value++; ask(); return; }
  stars.value = starsFor(firstTry.value);
  saveResult(level.id, stars.value);
  phase.value = 'result';
  busy.value = false;
  if (stars.value) { beep('pop'); say(['/audio/prompts/great.mp3']); } else say(['/audio/prompts/again.mp3']);
  refocus();
}

start();
</script>
