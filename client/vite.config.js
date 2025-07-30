import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 1) <-- this makes your production build look for files under /Lesson-App/
  base: '/Lesson-App/',
  plugins: [react()],
  
  // 2) <-- this only applies to `npm run dev` for local development
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:5001',  // or whatever port your Express server runs on
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
