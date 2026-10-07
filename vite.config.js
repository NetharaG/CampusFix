import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        report: resolve(__dirname, 'report.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        details: resolve(__dirname, 'details.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
});
