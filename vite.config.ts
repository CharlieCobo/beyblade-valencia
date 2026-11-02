/// <reference types="vitest/config" />
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * GitHub Pages no tiene fallback para SPA: ante una ruta inexistente sirve 404.html.
 * Al copiar index.html como 404.html, abrir directamente una URL profunda (p. ej. /login) carga la app.
 */
function spaFallback404(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await copyFile(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiBase = (env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

  return {
    // En GitHub Pages la app se sirve desde /beyblade-valencia/
    base: mode === 'demo' ? '/beyblade-valencia/' : '/',
    plugins: [
      react(),
      mode === 'demo' && spaFallback404(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'Beyblade Valencia',
          short_name: 'LVB',
          description: 'Beyblade Valencia',
          lang: 'es',
          theme_color: '#dd6e2f',
          background_color: '#ffffff',
          display: 'standalone',
          // scope y start_url se toman de `base` (/ o /beyblade-valencia/)
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallback: 'index.html',
          // La API nunca pasa por la caché ni por el fallback de navegación
          navigateFallbackDenylist: [new RegExp(`^${escapeRegExp(apiBase)}(/|$)`)],
          cleanupOutdatedCaches: true,
          // 404.html es una copia de index.html solo para GitHub Pages: no hace falta precachearla
          globIgnores: ['**/404.html'],
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/mocks/**', 'src/main.tsx'],
      },
    },
  }
})
