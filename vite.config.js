import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    viteMockServe({
      mockPath: 'mock', // mock文件夹路径
      enable: command === 'serve' // 只有开发环境才开启mock
    }),
  ],
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url))
    },
  },
}))
