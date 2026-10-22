import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The OPPO TV WebView is Chrome 66: lower syntax and CSS for it.
export default defineConfig({
  plugins: [vue()],
  build: { target: 'chrome66', cssTarget: 'chrome66' },
})
