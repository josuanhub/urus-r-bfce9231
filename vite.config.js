import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom'],
          router:  ['react-router-dom'],
          icons:   ['lucide-react']
        }
      }
    }
  },
  define: {
    __APP_NAME__:    JSON.stringify('URUS Core'),
    __API_BASE__:    JSON.stringify('https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api'),
    __FACTORY_KEY__: JSON.stringify('factory2026')
  }
})