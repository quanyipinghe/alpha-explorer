<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4 sm:p-8 flex flex-col items-center justify-center">
    <div class="w-full max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl text-center">
      <h2 class="text-3xl font-bold text-indigo-700 mb-2">大小写配对</h2>
      <p class="text-gray-600 mb-8">把小写字母拖到对应的大写字母篮子里吧！</p>

      <!-- Drop Targets (Uppercase Baskets) -->
      <div class="flex flex-wrap justify-center gap-6 mb-12">
        <div v-for="letter in gameLetters" :key="letter.id" 
          @dragover.prevent @drop="onDrop($event, letter.id)"
          :class="['w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-bold transition-all', 
                   matchedPairs.includes(letter.id) ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400']">
          {{ letter.letter.upper }}
        </div>
      </div>

      <!-- Draggable Items (Lowercase Cards) -->
      <div class="flex flex-wrap justify-center gap-6 min-h-[100px]">
        <div v-for="letter in shuffledLowercase" :key="letter.id"
          :draggable="!matchedPairs.includes(letter.id)"
          @dragstart="onDragStart($event, letter.id)"
          :class="['w-24 h-24 rounded-2xl flex items-center justify-center bg-white shadow-lg text-5xl font-bold',
                   matchedPairs.includes(letter.id) ? 'opacity-0' : 'cursor-grab active:cursor-grabbing']">
          {{ letter.letter.lower }}
        </div>
      </div>

      <!-- Game Over Message -->
      <div v-if="isGameOver" class="mt-8">
        <p class="text-4xl font-bold text-yellow-500 animate-pulse">全部配对成功！你真棒！</p>
        <button @click="setupGame" class="mt-4 px-6 py-3 bg-indigo-500 text-white font-bold rounded-full shadow-lg hover:bg-indigo-600">
          再玩一次
        </button>
      </div>
    </div>
    <div class="text-center mt-12">
      <router-link to="/games" class="px-6 py-3 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600">
        返回游戏乐园
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import alphabet from '../../data/alphabet.json';

const gameLetters = ref([]);
const shuffledLowercase = ref([]);
const matchedPairs = ref([]);

const isGameOver = computed(() => matchedPairs.value.length === gameLetters.value.length && gameLetters.value.length > 0);

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const setupGame = () => {
  matchedPairs.value = [];
  const shuffledAlphabet = shuffleArray([...alphabet]);
  gameLetters.value = shuffledAlphabet.slice(0, 4);
  shuffledLowercase.value = shuffleArray([...gameLetters.value]);
};

const onDragStart = (event, letterId) => {
  event.dataTransfer.setData('text/plain', letterId);
};

const onDrop = (event, targetLetterId) => {
  const draggedLetterId = event.dataTransfer.getData('text/plain');
  if (draggedLetterId === targetLetterId) {
    if (!matchedPairs.value.includes(targetLetterId)) {
      matchedPairs.value.push(targetLetterId);
    }
  }
};

onMounted(setupGame);
</script>
