import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/background.ts'),
      name: 'background',
      fileName: () => 'background.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        // Since we are building for a browser extension, we don't want to hash the filenames
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
