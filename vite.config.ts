import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/wakatime': {
        target: 'https://wakatime.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wakatime/, ''),
      },
    },
  },
  build: {
    // 跳过类型检查，因为我们有一些类型错误
    minify: true,
    sourcemap: false,
  },
});
