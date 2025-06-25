<template>
  <div class="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 p-4 sm:p-8 flex flex-col items-center justify-center">
    <div class="w-full max-w-3xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl text-center">
      <h2 class="text-3xl font-bold text-green-700 mb-4">字母捉迷藏</h2>
      
      <div v-if="!gameStarted" class="text-center">
        <button @click="startGame" class="px-8 py-4 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 transition-colors text-2xl">
          开始游戏
        </button>
      </div>

      <div v-else>
        <div class="mb-6 h-16 flex items-center justify-center">
          <p v-if="!feedback" class="text-2xl text-gray-700">请找出字母 <span class="font-bold text-3xl text-rose-600">{{ targetLetter.letter.upper }}</span></p>
          <p v-if="feedback" :class="feedback.isCorrect ? 'text-green-600' : 'text-red-500'" class="text-3xl font-bold animate-bounce">
            {{ feedback.message }}
          </p>
        </div>

        <div class="flex flex-wrap justify-center items-center gap-6 min-h-[150px]">
          <div v-for="option in options" :key="option.id" @click="selectLetter(option)"
            class="w-28 h-28 flex items-center justify-center bg-purple-400 rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-transform duration-300 ease-in-out">
            <span class="text-6xl font-bold text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
              {{ option.letter.upper }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center mt-12">
      <router-link to="/games" class="px-6 py-3 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600 transition-colors duration-300">
        返回游戏乐园
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import alphabet from '../../data/alphabet.json';
import AudioButton from '../../components/common/AudioButton.vue'; // We'll use its logic, not its template

const gameStarted = ref(false);
const options = ref([]);
const targetLetter = ref(null);
const feedback = ref(null);

const playAudio = (src) => {
  new Audio(src).play();
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const startGame = () => {
  gameStarted.value = true;
  nextRound();
};

const nextRound = () => {
  feedback.value = null;
  
  // Select a random target letter
  const targetIndex = Math.floor(Math.random() * alphabet.length);
  targetLetter.value = alphabet[targetIndex];

  // Create options with the target and 3 distractors
  const distractors = [];
  const alphabetCopy = [...alphabet];
  alphabetCopy.splice(targetIndex, 1); // Remove target from copy

  shuffleArray(alphabetCopy);
  for (let i = 0; i < 3; i++) {
    distractors.push(alphabetCopy[i]);
  }

  const currentOptions = [targetLetter.value, ...distractors];
  shuffleArray(currentOptions);
  options.value = currentOptions;

  // Play the audio prompt
  setTimeout(() => {
    playAudio(targetLetter.value.audio.name);
  }, 300);
};

const selectLetter = (selected) => {
  if (feedback.value) return; // Prevent multiple clicks

  if (selected.id === targetLetter.value.id) {
    feedback.value = { isCorrect: true, message: '太棒了!' };
    setTimeout(nextRound, 1500);
  } else {
    feedback.value = { isCorrect: false, message: '再试一次' };
    setTimeout(() => {
      feedback.value = null;
    }, 1000);
  }
};
</script>
