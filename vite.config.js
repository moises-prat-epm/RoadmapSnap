import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // config.js is loaded in index.html as a classic script (no type="module") and is
      // not imported by app.js, so Vite does not bundle it; it remains a separate file.
      output: {
        manualChunks(id) {
          // Single chunk for Phase 1
          return 'app';
        },
      },
    },
  },
});
