import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        academics: resolve(__dirname, 'academics.html'),
        menu: resolve(__dirname, 'menu.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
  },
});
