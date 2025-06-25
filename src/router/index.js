import { createRouter, createWebHistory } from 'vue-router';
import AlphabetIslandView from '../views/AlphabetIslandView.vue';
import LetterDetailView from '../views/LetterDetailView.vue';
import GameParkView from '../views/GameParkView.vue';
import FindTheLetterView from '../views/games/FindTheLetterView.vue';
import CaseMatchView from '../views/games/CaseMatchView.vue';
import AchievementWallView from '../views/AchievementWallView.vue'; // 导入新视图

const routes = [
  {
    path: '/',
    name: 'AlphabetIsland',
    component: AlphabetIslandView,
  },
  {
    path: '/letter/:id',
    name: 'LetterDetail',
    component: LetterDetailView,
    props: true,
  },
  {
    path: '/games',
    name: 'GamePark',
    component: GameParkView,
  },
  {
    path: '/games/find-the-letter',
    name: 'FindTheLetter',
    component: FindTheLetterView,
  },
  { path: '/games/case-match', name: 'CaseMatch', component: CaseMatchView },
  { path: '/achievements', name: 'AchievementWall', component: AchievementWallView }, // 添加新路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
