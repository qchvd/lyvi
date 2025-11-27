import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    svgr({
      include: "**/*.svg?react",
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
      format: {
        comments: false
      },
      mangle: {
        safari10: true
      }
    },
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'i18n': ['i18next', 'react-i18next', 'i18next-http-backend'],
          'forms': ['formik', 'yup'],
          'helmet': ['react-helmet-async'],
          'analytics': ['react-ga4']
        }
      }
    }
  },
  esbuild: {
    legalComments: 'none'
  }
})