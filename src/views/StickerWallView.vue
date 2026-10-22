<template>
  <div class="min-h-screen bg-gradient-to-b from-yellow-200 to-orange-300 px-8 py-4">
    <div class="flex items-center justify-between mb-4">
      <BackButton data-autofocus />
      <h1 class="text-4xl font-extrabold text-orange-800">🌟 我的贴纸 {{ progress.stickers.length }} / {{ LEVELS.length }}</h1>
      <span class="w-24"></span>
    </div>
    <div class="grid grid-cols-8 gap-4 justify-items-center">
      <div v-for="l in LEVELS" :key="l.id" class="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow"
        :class="has(l.id) ? 'bg-white' : 'bg-white/40 text-gray-400'">{{ has(l.id) ? l.sticker : '?' }}</div>
    </div>
  </div>
</template>

<script setup>
import LEVELS from '../data/levels.json';
import BackButton from '../components/BackButton.vue';
import { useProgress } from '../composables/useProgress.js';

const { progress } = useProgress();
const has = (id) => progress.value.stickers.indexOf(id) >= 0;
</script>
