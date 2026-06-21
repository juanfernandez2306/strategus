import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from "rollup-plugin-visualizer";
import { 
  NOMBRE_CARPETA_DOMINIO,
  NOMBRE_APP,
  NOMBRE_CORTO
 } from './src/data/finca/appConfig';



export default defineConfig({
  base: `/${NOMBRE_CARPETA_DOMINIO}/`,
  assetsInclude: ['**/*.pbf'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'logo_header.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,pbf,png,svg}']
      },
      manifest: {
        name: NOMBRE_APP,
        short_name: NOMBRE_CORTO,
        start_url: `/${NOMBRE_CARPETA_DOMINIO}/`, // Ajustado para GitHub Pages
        scope: `/${NOMBRE_CARPETA_DOMINIO}/`,      // Ajustado para GitHub Pages
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
          if (id.includes('qr-scanner')) {
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