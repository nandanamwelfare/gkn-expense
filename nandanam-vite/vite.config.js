import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Increase chunk size warning limit since our app is large
    chunkSizeWarningLimit: 1000,
  }
})
