<template>
  <router-link :to="{ name: 'LetterDetail', params: { id: letter.id } }">
    <div :class="['flex items-center justify-center w-24 h-24 rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-300 ease-in-out relative', isLearned ? 'bg-yellow-400' : 'bg-sky-400']">
      <span class="text-5xl font-bold text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
        {{ letter.letter.upper }}
      </span>
      <span v-if="isLearned" class="absolute -top-2 -right-2 text-4xl">⭐</span>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  letter: { type: Object, required: true },
  isLearned: { type: Boolean, default: false }, // Add prop
});
</script>
