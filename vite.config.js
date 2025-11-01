import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // Try the next available port if 3000 is taken
  },
  // Build to `docs/` so GitHub Pages can serve from main/docs
  build: {
    outDir: 'docs',
  },
  // If deploying as a project page (username.github.io/REPO), set base to '/REPO/'
  // base: '/Calories/',
})

