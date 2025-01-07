import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Expose env variables to the client
      'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
    },
    server: {
      host: 'localhost',
      port: 5173,
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
            'Origin': 'http://localhost:5173'
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
            'Origin': 'http://localhost:5173'
          }
        }
      },
    },
  };
});