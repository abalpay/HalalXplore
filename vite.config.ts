import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/places': {
        target: 'https://maps.googleapis.com/maps/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const searchParams = new URLSearchParams(path.split('?')[1]);
          return `/place/nearbysearch/json?${searchParams.toString()}`;
        },
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://localhost:5175'
        }
      },
      '/api/geocode': {
        target: 'https://maps.googleapis.com/maps/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const searchParams = new URLSearchParams(path.split('?')[1]);
          return `/geocode/json?${searchParams.toString()}`;
        },
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://localhost:5175'
        }
      }
    },
  },
});