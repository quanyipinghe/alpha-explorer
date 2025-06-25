<template>
  <div class="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 p-4 sm:p-8 flex flex-col items-center">
    <h1 class="text-4xl sm:text-5xl font-bold text-center text-green-800 mb-12" style="font-family: 'Varela Round', sans-serif;">
      游戏乐园
    </h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Game 1: Find The Letter -->
      <router-link to="/games/find-the-letter" class="p-8 bg-white/80 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
        <h2 class="text-3xl font-bold text-rose-600">字母捉迷藏</h2>
        <p class="mt-2 text-gray-600">听发音，找出正确的字母！</p>
      </router-link>

      <!-- Game 2: Case Match -->
      <router-link to="/games/case-match" class="p-8 bg-white/80 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform">
        <h2 class="text-3xl font-bold text-indigo-600">大小写配对</h2>
        <p class="mt-2 text-gray-600">拖动字母，完成配对！</p>
      </router-link>
    </div>
    
    <div class="text-center mt-16">
      <router-link to="/" class="px-6 py-3 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600 transition-colors duration-300">
        返回字母岛
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>
