import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 导入路由

createApp(App).use(router).mount('#app') // 使用路由
