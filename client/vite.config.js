// vite.config.js
import { defineConfig } from "vite"
import react          from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward any /api/* calls to your backend on port 5001
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
