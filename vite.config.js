import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('react-dom') || id.includes('react/')) {
            return 'vendor';
          }
        }
      }
    }
  }
})