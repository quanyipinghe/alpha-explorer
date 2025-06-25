<template>
  <div class="min-h-screen bg-gradient-to-b from-yellow-200 to-orange-300 p-4 sm:p-8">
    <h1 class="text-4xl sm:text-5xl font-bold text-center text-orange-800 mb-8" style="font-family: 'Varela Round', sans-serif;">
      我的成就墙
    </h1>
    <div class="w-full max-w-4xl mx-auto p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl">
      <h2 class="text-3xl font-bold text-center text-yellow-700 mb-6">字母勋章</h2>
      <div class="flex flex-wrap justify-center gap-4">
        <div v-for="letter in allLetters" :key="letter.id"
          :class="['w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold shadow-md',
                   isLearned(letter.id) ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400']">
          {{ letter.letter.upper }}
        </div>
      </div>
    </div>
    
    <div class="text-center mt-12">
      <router-link to="/" class="px-6 py-3 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600 transition-colors duration-300">
        返回字母岛
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useProgress } from '../composables/useProgress';
import allLetters from '../data/alphabet.json';

const { learnedLetters } = useProgress();

const isLearned = (letterId) => {
  return learnedLetters.value.includes(letterId);
};
</script>
