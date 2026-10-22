<template>
  <div class="min-h-screen bg-slate-100 px-8 py-4 text-slate-800">
    <div class="flex items-center justify-between mb-4">
      <BackButton :data-autofocus="open ? '' : null" />
      <h1 class="text-3xl font-bold">家长设置</h1>
      <span class="w-24"></span>
    </div>

    <!-- Gate: two right answers in a row; a wrong one locks it for a minute. -->
    <div v-if="!open" class="text-center">
      <p class="text-2xl mb-2">请家长算一算(连续答对 2 题)</p>
      <p class="text-6xl font-bold mb-6">{{ gate.q }} = ?</p>
      <div data-gate-options :data-answer="gate.answer" class="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
        <button v-for="(o, i) in gate.options" :key="o" :data-gate="o" :data-autofocus="i === 0 ? '' : null"
          :aria-disabled="locked ? 'true' : null"
          class="py-4 rounded-2xl bg-white text-4xl font-bold shadow" @click="answer(o)">{{ o }}</button>
      </div>
      <p class="mt-6 text-xl h-8">{{ locked ? `答错了,${left} 秒后再试` : streak ? '再答对 1 题' : '' }}</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-2 gap-x-10 text-lg mb-6">
        <div v-for="l in LEVELS" :key="l.id" class="flex justify-between border-b border-slate-300 py-0.5">
          <span>{{ l.sticker }} {{ l.id }} {{ NAMES[l.type] }}</span>
          <span>{{ rec(l.id) ? '⭐'.repeat(rec(l.id).stars) + ' ' + day(rec(l.id).at) : '—' }}</span>
        </div>
      </div>
      <div class="text-center">
        <button class="mr-6 px-6 py-3 rounded-full bg-sky-500 text-white text-xl font-bold" @click="unlockAll">
          {{ progress.allUnlocked ? '已解锁全部关卡' : '解锁全部关卡' }}</button>
        <button class="px-6 py-3 rounded-full text-white text-xl font-bold" :class="confirming ? 'bg-red-600' : 'bg-rose-400'" @click="clear">
          {{ confirming ? '再按一次确认清空' : '清空进度' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted } from 'vue';
import LEVELS from '../data/levels.json';
import BackButton from '../components/BackButton.vue';
import { mathGate, cooldown } from '../logic.js';
import { focusMain } from '../tv.js';
import { useProgress } from '../composables/useProgress.js';

const { progress, unlockAll, reset } = useProgress();
const NAMES = {
  'find-upper': '听音找大写', 'find-lower': '听音找小写', 'case-match': '大小写配对', 'next-letter': '字母排队',
  'sound-letter': '听发音选字母', 'first-letter': '首字母', 'word-picture': '听词选图', 'missing-vowel': '补元音',
};
const rec = (id) => progress.value.levels[id];
const day = (t) => new Date(t).toLocaleDateString();

const open = ref(false);
const gate = ref(mathGate());
const streak = ref(0);
const locked = ref(false);
const left = ref(0);
const cd = cooldown(60000);
let timer = null;
const tick = () => {
  left.value = Math.ceil(cd.left() / 1000);
  if (cd.ready()) { locked.value = false; clearInterval(timer); }
};
onUnmounted(() => clearInterval(timer));

function answer(o) {
  if (!cd.ready()) return;
  if (o === gate.value.answer) {
    streak.value++;
    if (streak.value >= 2) { open.value = true; nextTick(focusMain); return; }
  } else {
    streak.value = 0;
    cd.fail();
    locked.value = true;
    tick();
    timer = setInterval(tick, 1000);
  }
  gate.value = mathGate();
  nextTick(focusMain); // the old buttons are gone; don't leave focus on <body>
}

const confirming = ref(false);
function clear() {
  if (!confirming.value) { confirming.value = true; return; }
  reset();
  confirming.value = false;
}
</script>
