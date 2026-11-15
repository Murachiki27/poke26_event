import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/poke26/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'editor.html'),
      },
    },
  },
  server: {
    proxy: {
      // '/api' で始まるリクエストをバックエンドサーバーへ転送する
      '/api': {
        target: 'http://192.168.11.32', // 実際のAPIサーバーのURLに変更してください
        changeOrigin: true,
      },
    },
  },
});