import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://e-consultation-w60z.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://e-consultation-w60z.onrender.com',
        ws: true,
      },
      '/uploads': {
        target: 'https://e-consultation-w60z.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
