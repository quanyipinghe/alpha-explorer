import { ref, watch } from 'vue';

const LEARNED_LETTERS_KEY = 'alpha_explorer_learned_letters';

// Load initial data from localStorage
const learnedLetters = ref(JSON.parse(localStorage.getItem(LEARNED_LETTERS_KEY) || '[]'));

// Watch for changes and save to localStorage
watch(learnedLetters, (newValue) => {
  localStorage.setItem(LEARNED_LETTERS_KEY, JSON.stringify(newValue));
}, { deep: true });

export function useProgress() {
  const markAsLearned = (letterId) => {
    if (!learnedLetters.value.includes(letterId)) {
      learnedLetters.value.push(letterId);
    }
  };

  return {
    learnedLetters,
    markAsLearned,
  };
}
