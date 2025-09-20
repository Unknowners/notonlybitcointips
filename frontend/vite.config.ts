import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      ignored: [
        '**/test-results/**',
        '**/playwright-report/**',
        '**/test-results.json',
        '**/storageState.json'
      ]
    }
  },
  build: {
    outDir: 'dist'
  }
})
