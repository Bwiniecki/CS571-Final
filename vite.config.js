import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // CORRECT BASE PATH: Needs the repository name (CS571-Final) before the project subdirectory (p0)
  base: '/CS571-Final/',
  build: {
    outDir: 'docs'
  }
})