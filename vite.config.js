import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // ponytail: react/router/query barely change, so pinning them to their
        // own chunk keeps them cached across deploys; lucide was splintering
        // into ~25 sub-KB chunks, which is 25 requests for 3 kB of icons.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('lucide-react')) return 'icons'
          if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler|@tanstack)[\\/]/.test(id)) return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://b1ubc4krn6.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
      },
    },
  },
})
  