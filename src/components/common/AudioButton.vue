<template>
  <button @click="playAudio" class="p-4 bg-orange-400 hover:bg-orange-500 text-white rounded-full shadow-md transition-all duration-200 transform hover:scale-110">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.88 5.88a15.002 15.002 0 0116.24 0M8.464 15.536a5 5 0 01-7.072 0m9.9-2.828a9 9 0 01-12.728 0M12 6v.01M12 12v.01M12 18v.01" />
    </svg>
  </button>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const audio = ref(null);

const playAudio = () => {
  if (audio.value) {
    audio.value.pause();
    audio.value.currentTime = 0;
  }
  audio.value = new Audio(props.src);
  audio.value.play();
};
</script>
