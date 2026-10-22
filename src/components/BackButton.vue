<template>
  <button data-back class="px-5 py-2 rounded-full bg-white/80 text-sky-800 text-xl font-bold shadow" @click="goBack">⬅ 返回</button>
</template>

<script setup>
import { goBack } from '../router/index.js';
</script>
