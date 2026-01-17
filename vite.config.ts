import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfill Node.js modules for browser
      "node:module": "module",
      "node:fs": "fs",
      "node:path": "path",
    },
  },
  optimizeDeps: {

    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    host: true, // Esto habilita la escucha en 0.0.0.0
    port: 5173, // Aseguramos el puerto
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ReactFlow - split into core and plugins
          if (id.includes('node_modules/reactflow')) {
            return 'reactflow';
          }



          // PDF.js - only loaded in admin knowledge base
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }

          // Monaco Editor - lazy loaded with automation
          if (id.includes('@monaco-editor/react') || id.includes('monaco-editor')) {
            return 'monaco';
          }

          // Charts - lazy loaded with settings/usage
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }

          // Animation library - used throughout but can be chunked
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }

          // Supabase client
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }

          // Markdown rendering (used in chat and docs)
          if (id.includes('react-markdown') || id.includes('remark-gfm')) {
            return 'markdown';
          }

          // Syntax Highlighting (Heavy)
          if (id.includes('react-syntax-highlighter')) {
            return 'syntax-highlighter';
          }

          // YouTube transcript (only in admin)
          if (id.includes('youtube-transcript')) {
            return 'youtube';
          }
        }
      }
    },
    // Lower threshold to catch bundle bloat early
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (can disable for smaller builds)
    sourcemap: false,
  }
});
