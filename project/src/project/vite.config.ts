import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'page-professeur',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => { if (req.url && /^\/professeur\/?(\?.*)?$/.test(req.url)) req.url = '/professeur.html'; next(); });
      },
    },
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, open: true, host: true, proxy: { '/api': 'http://localhost:8787', '/ressources': 'http://localhost:8787' } },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), professeur: fileURLToPath(new URL('./professeur.html', import.meta.url)) },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
