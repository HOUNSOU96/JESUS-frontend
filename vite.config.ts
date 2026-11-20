import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',

      includeAssets: [
        'pwa-icon-192.png',
        'pwa-icon-512.png',
        'apple-touch-icon.png'
      ],

      manifest: {
        name: 'Confrérie Saint Enfant Jésus Miraculeux de Prague',
        short_name: 'SAINT ENFANT JÉSUS',
        description: 'Application officielle de la Confrérie Saint Enfant Jésus.',
        lang: 'fr',
        theme_color: '#17130b',
        background_color: '#090909',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'
        ],

        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,

        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',

        navigateFallbackDenylist: [
          /^\/api\//
        ],

        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/sounds\/[^/]+\.mp3$/i.test(url.pathname),

            handler: 'CacheFirst',

            options: {
              cacheName: 'jesus-musiques-v2',

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 90
              },

              cacheableResponse: {
                statuses: [200]
              },

              rangeRequests: true
            }
          },

          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/audios\/prieres\/.+\.mp3$/i.test(url.pathname),

            handler: 'CacheFirst',

            options: {
              cacheName: 'jesus-prieres-v2',

              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 180
              },

              cacheableResponse: {
                statuses: [200]
              },

              rangeRequests: true
            }
          },

          {
            urlPattern: ({ url }) =>
              /^\/api\//.test(url.pathname),

            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    fs: {
      strict: true,
    },
  },
})
