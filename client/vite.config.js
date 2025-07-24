import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to Express on 5001
      '/api': {
        target:   'http://localhost:5001',
        changeOrigin: true,
        secure:   false
      }
    }
  }
})
