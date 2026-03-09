import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'AeroSense.ai Pro',
        short_name: 'AeroSense',
        description: 'Real-time Air Quality & Health Monitoring',
        theme_color: '#10b981',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  build: { outDir: 'dist' },
  base: './',
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
})
