<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-200 via-red-200 to-pink-200 p-4 flex flex-col items-center justify-center">
    <div v-if="letterData" class="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 text-center mb-8">
      
      <!-- 字母展示 -->
      <div class="mb-6">
        <span class="text-8xl sm:text-9xl font-bold text-gray-800" style="font-family: 'Nunito', sans-serif;">{{ letterData.letter.upper }}</span>
        <span class="text-7xl sm:text-8xl font-bold text-gray-600" style="font-family: 'Nunito', sans-serif;">{{ letterData.letter.lower }}</span>
      </div>

      <!-- 发音按钮 -->
      <div class="flex justify-center space-x-4 mb-8">
        <AudioButton :src="letterData.audio.name" />
        <AudioButton :src="letterData.audio.phonics" />
        <AudioButton :src="letterData.audio.word" />
      </div>

      <!-- 关联图片和单词 -->
      <div class="flex flex-col items-center">
        <img :src="letterData.image" :alt="letterData.word.text" class="w-48 h-48 sm:w-64 sm:h-64 object-contain mb-4">
        <p class="text-4xl font-semibold text-gray-700">{{ letterData.word.text }}</p>
        <p class="text-xl text-gray-500">{{ letterData.word.translation }}</p>
      </div>
    </div>

    <!-- 笔顺描红 -->
    <div v-if="letterData" class="w-full max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-orange-700 mb-4">跟我写</h2>
      <TracingCanvas :letter="letterData.letter.upper" />
    </div>
    
    <!-- 返回按钮 -->
    <div class="mt-8">
      <router-link to="/" class="px-6 py-3 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600 transition-colors duration-300">
        返回字母岛
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'; // Add onMounted
import alphabet from '../data/alphabet.json';
import AudioButton from '../components/common/AudioButton.vue';
import TracingCanvas from '../components/AlphabetIsland/TracingCanvas.vue';
import { useProgress } from '../composables/useProgress'; // Import progress composable

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const { markAsLearned } = useProgress();

const letterData = computed(() => {
  return alphabet.find(letter => letter.id === props.id);
});

// Mark letter as learned when the component is mounted
onMounted(() => {
  if (props.id) {
    markAsLearned(props.id);
  }
});
</script>
