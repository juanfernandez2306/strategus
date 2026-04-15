import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  base: '/pwa/',
  assetsInclude: ['**/*.pbf'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'logo_header.png',
        'tiles/**/*.pbf'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,pbf,png,svg}']
      },
      manifest: {
        name: 'pwa',
        short_name: 'GeoApp',
        start_url: '/pwa/', // Ajustado para GitHub Pages
        scope: '/pwa/',      // Ajustado para GitHub Pages
        display: 'standalone',
        background_color: '#FFFCFB',
        theme_color: '#386641',
        icons: [
          {
            src: 'icons/icon_192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    visualizer({ open: true })
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separamos el motor pesado del escáner en su propio archivo
          if (id.includes('html5-qrcode')) {
            return 'vendor-scanner';
          }
          // Separamos MapLibre y Turf que también son grandes
          if (id.includes('maplibre-gl') || id.includes('@turf')) {
            return 'vendor-maps';
          }
          // Separamos Material UI para que el index.js sea mínimo
          if (id.includes('@mui')) {
            return 'vendor-ui';
          }
        }
      }
    }
  }
})