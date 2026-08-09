/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    }),
  ],
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: [
      'react-markdown',
      'remark-gfm',
      'react-syntax-highlighter',
      'swiper/react',
      'swiper',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.jsx',
    css: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
