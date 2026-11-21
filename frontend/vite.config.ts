import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Parkinson-s-Disease/',
  server: { port: 5173 },
})
