<template>
  <router-view />
</template>

<script setup>
import { nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { installRemote, focusMain } from './tv.js';

const router = useRouter();
onMounted(() => installRemote(document.body));
router.afterEach(() => nextTick(focusMain));
</script>
