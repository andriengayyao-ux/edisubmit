import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Tailwind CSS v4 is configured through its Vite plugin (no tailwind.config.js needed).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Only pure utility tests live here (no browser needed).
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@supabase/') || id.includes('/node_modules/iceberg-js/')) {
            return 'supabase-vendor';
          }
          if (id.includes('/node_modules/react-router/') || id.includes('/node_modules/react-router-dom/')) {
            return 'router-vendor';
          }
          if (id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react/') || id.includes('/node_modules/scheduler/')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
