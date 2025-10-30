import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set correct base for GitHub Pages project site: https://<user>.github.io/Calories/
  base: '/Calories/',
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // Try the next available port if 3000 is taken
  },
})

