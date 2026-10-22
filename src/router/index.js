import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../views/MapView.vue';
import LevelView from '../views/LevelView.vue';
import StickerWallView from '../views/StickerWallView.vue';
import ParentView from '../views/ParentView.vue';
import LEVELS from '../data/levels.json';
import { isUnlocked } from '../logic.js';
import { useProgress } from '../composables/useProgress.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MapView },
    {
      path: '/level/:id',
      component: LevelView,
      props: true,
      // Unknown or still-locked level (typed URL, stale link): back to the map.
      beforeEnter: (to) => {
        const i = LEVELS.findIndex((l) => l.id === to.params.id);
        return i >= 0 && isUnlocked(LEVELS, useProgress().progress.value, i) ? true : '/';
      },
    },
    { path: '/stickers', component: StickerWallView },
    { path: '/parent', component: ParentView },
    { path: '/:rest(.*)', redirect: '/' },
  ],
});

// On-screen back = the remote's Back. Opened directly (no page of ours behind it)?
// Go to the map instead of leaving the app.
export function goBack() {
  if (window.history.state && window.history.state.back) router.back();
  else router.replace('/');
}

export default router;
