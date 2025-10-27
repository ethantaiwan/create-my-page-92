// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 引入 path 模組來處理路徑

// https://vitejs.dev/config/
export default defineConfig({
  // 這裡設定您需要使用的外掛 (Plugins)
  plugins: [
    // 啟用 React 專用的 Vite 外掛，讓 Vite 可以解析 JSX/TSX 語法
    react(), 
  ],
  
  // 處理模組路徑別名 (例如：讓您可以寫 import MyComponent from '@/components/MyComponent')
  resolve: {
    alias: {
      // 假設您習慣將 '@/xxx' 設定為指向 src/ 資料夾
      '@': path.resolve(__dirname, './src'), 
    },
  },

  // 基礎設定，通常用於部署到非根目錄時（但 Render 通常不需要）
  // base: '/', 
  
  // 伺服器設定 (開發模式下使用)
  server: {
    // 您的開發埠號
    port: 3000, 
  },
  
  // 建構 (Build) 設定
  build: {
    // 輸出目錄
    outDir: 'dist',
  },
});
