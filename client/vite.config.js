// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [react()],
  server: {
    proxy: {
      // your existing API proxy
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req,res) => {
            if(req.body && req.headers["content-type"]?.includes("multipart/form-data")) {
              delete req.headers["content-length"]
            }
          })
        }
      },
      // NEW: proxy static uploads too
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
