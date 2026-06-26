import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://b1ubc4krn6.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
      },
    },
  },
})
  