<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 px-8 py-4">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-4xl font-extrabold text-sky-800">🦊 字母探险家</h1>
      <router-link to="/stickers" class="px-5 py-2 rounded-full bg-amber-400 text-white text-2xl font-bold shadow-lg">🌟 贴纸墙 {{ progress.stickers.length }}</router-link>
    </div>

    <section v-for="stage in stages" :key="stage.n" class="mb-3">
      <h2 class="text-2xl font-bold mb-1" :class="stage.color">{{ stage.title }}</h2>
      <div class="flex flex-wrap items-start">
        <div v-for="lv in stage.levels" :key="lv.id" class="mr-3 mb-1 flex flex-col items-center">
          <button
            :data-level="lv.id"
            :disabled="!lv.open"
            :data-autofocus="lv.id === current ? '' : null"
            class="w-16 h-16 rounded-full text-3xl font-extrabold shadow-lg flex items-center justify-center"
            :class="lv.stars ? 'bg-yellow-300' : lv.open ? stage.bg + ' text-white' : 'bg-gray-300 text-gray-500'"
            @click="router.push('/level/' + lv.id)"
          >{{ lv.stars ? lv.sticker : lv.open ? lv.n : '🔒' }}</button>
          <span class="text-base leading-tight h-5">{{ lv.stars ? '⭐'.repeat(lv.stars) : '' }}</span>
        </div>
      </div>
    </section>

    <button data-parent class="fixed left-3 bottom-3 px-3 py-1 rounded-full bg-white/60 text-gray-500 text-sm" @click="router.push('/parent')">家长</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import LEVELS from '../data/levels.json';
import { isUnlocked } from '../logic.js';
import { useProgress } from '../composables/useProgress.js';

const { progress } = useProgress();
const router = useRouter();

const levels = computed(() => LEVELS.map((l, i) => {
  const rec = progress.value.levels[l.id];
  return {
    id: l.id, stage: l.stage, sticker: l.sticker,
    n: LEVELS.filter((x, j) => j <= i && x.stage === l.stage).length,
    open: isUnlocked(LEVELS, progress.value, i),
    stars: rec ? rec.stars : 0,
  };
}));
// Focus lands on the next level to play; when everything is done, on the last one.
const current = computed(() => {
  const next = levels.value.filter((l) => l.open && !l.stars)[0];
  return next ? next.id : LEVELS[LEVELS.length - 1].id;
});
const META = {
  1: { title: '🏝️ 字母岛 · 认字母', color: 'text-sky-800', bg: 'bg-sky-500' },
  2: { title: '🔊 发音谷 · 听声音', color: 'text-rose-700', bg: 'bg-rose-500' },
  3: { title: '🧩 拼读山 · 拼单词', color: 'text-green-800', bg: 'bg-green-600' },
};
const stages = computed(() => [1, 2, 3].map((n) => Object.assign({ n, levels: levels.value.filter((l) => l.stage === n) }, META[n])));
</script>
