// vite.config.js
import { defineConfig } from "vite"
import react          from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request to /api/* will be forwarded to your backend
      "/api": {
        target: "http://localhost:5001",  // ← your Express port
        changeOrigin: true,
        secure: false
      }
    }
  }
})
