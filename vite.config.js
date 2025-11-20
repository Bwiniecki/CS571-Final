import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Last Resort: Use a relative path to force assets to load correctly
  base: './', 
  build: {
    outDir: 'docs'
  }
})