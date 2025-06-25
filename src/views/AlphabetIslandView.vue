<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 p-4 sm:p-8">
    <h1 class="text-4xl sm:text-5xl font-bold text-center text-sky-800 mb-4" style="font-family: 'Varela Round', sans-serif;">
      字母探险家
    </h1>
    
    <div class="text-center mb-8 flex justify-center items-center space-x-4">
      <router-link to="/games" class="px-8 py-3 bg-amber-500 text-white font-bold rounded-full shadow-lg hover:bg-amber-600 transition-colors duration-300 text-xl">
        去游戏乐园!
      </router-link>
      <router-link to="/achievements" class="px-8 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 transition-colors duration-300 text-xl">
        我的成就
      </router-link>
    </div>
    
    <div class="flex flex-wrap justify-center items-center gap-6 sm:gap-8 max-w-4xl mx-auto">
      <Island
          v-for="letterData in alphabet"
          :key="letterData.id"
          :letter="letterData"
          :is-learned="isLearned(letterData.id)"
        />
    </div>
  </div>
</template>

<script setup>
import Island from '../components/AlphabetIsland/Island.vue';
import alphabet from '../data/alphabet.json';
import { useProgress } from '../composables/useProgress'; // Import

const { learnedLetters } = useProgress(); // Use
const isLearned = (id) => learnedLetters.value.includes(id); // Helper
</script>
