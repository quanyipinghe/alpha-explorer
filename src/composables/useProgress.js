import { ref, watch } from 'vue';
import { parseProgress, recordResult, emptyProgress } from '../logic.js';

const KEY = 'alpha_explorer_progress';
let saved = null;
try { saved = localStorage.getItem(KEY); } catch (e) { /* storage off: progress lives in memory */ }
const progress = ref(parseProgress(saved));

watch(progress, (v) => {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* full or disabled */ }
}, { deep: true });

export function useProgress() {
  return {
    progress,
    saveResult: (levelId, stars) => { progress.value = recordResult(progress.value, levelId, stars, Date.now()); },
    unlockAll: () => { progress.value = Object.assign({}, progress.value, { allUnlocked: true }); },
    reset: () => { progress.value = emptyProgress(); },
  };
}
