import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL for GitHub Pages deployment
  // Using '/' for user site (tarunsaib1997.github.io)
  base: '/',
  build: {
    // Generate source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation': ['framer-motion'],
        },
      },
    },
    // Minification settings
    minify: 'esbuild',
    // Target modern browsers
    target: 'esnext',
  },
  // Security headers for development
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
});
