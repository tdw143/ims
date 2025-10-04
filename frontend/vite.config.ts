import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 支持@/xxx路径导入
    },
  },
  server: {
    port: 5173, // 前端默认端口（避免与后端3000冲突）
    proxy: {
      // 跨域代理：解决前端调用后端接口的跨域问题
      '/api': {
        target: 'http://localhost:3000', // 后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉/api前缀
      },
    },
  },
});