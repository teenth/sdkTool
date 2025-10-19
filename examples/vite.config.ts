import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // 监听所有网络接口
    open: true,
    strictPort: false // 如果端口被占用，尝试下一个可用端口
  }
})