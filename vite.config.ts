import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal performance
        manualChunks: {
          // React core (always needed)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries (used across the app)
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-toast'],

          // Charts library (heavy, only needed on Analysis/History pages)
          'charts': ['recharts'],

          // Query/API library
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // Increase chunk size warning limit (charts are heavy)
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying for SSE
      },
    },
  },
})
