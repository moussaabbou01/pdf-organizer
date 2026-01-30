import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@main': path.resolve(__dirname, 'src/main'),
    }
  },
  build: {
    lib: {
      entry: 'src/main/index.ts',
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: [
        'electron',
        // Node.js built-in modules
        'path', 'fs', 'fs/promises', 'crypto', 'os', 'url', 'util', 'assert', 'events',
        'stream', 'buffer', 'http', 'https', 'net', 'tls', 'child_process'
      ]
    },
    minify: false,
    target: 'node18',
    commonjsOptions: {
      ignoreDynamicRequires: true
    }
  }
});
