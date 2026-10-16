import path from 'node:path'
import { defineConfig } from 'vite'
import vueRouter from 'vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { cloudflare } from '@cloudflare/vite-plugin'

const isBuild = process.env.npm_lifecycle_event?.startsWith('build')

export default defineConfig(() => ({
  plugins: [vueRouter(), vue(), tailwindcss(), !isBuild && cloudflare()],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  server: {
    port: 5678,
    host: '0.0.0.0',
  },
}))
