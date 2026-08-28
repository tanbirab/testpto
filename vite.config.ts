import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // '/' works for Cloudflare Pages, a custom domain, or a GitHub Pages
    // user/org site (username.github.io). If you ever deploy this as a
    // GitHub Pages *project* site (username.github.io/repo-name), change
    // this to '/repo-name/' instead.
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
