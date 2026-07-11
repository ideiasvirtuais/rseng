import { defineConfig } from '@lovable.dev/vite-tanstack-config'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  tanstackStart: {
    // Route SSR through src/server.ts so catastrophic failures render our
    // branded fallback page instead of a raw h3 500 "didn't load" screen.
    server: { entry: 'server' },
    spa: { enabled: true },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      // Tailwind v4: precisa do plugin para processar @import "tailwindcss" source(none)
      // e @source "../src". Sem ele o CSS sai envolto em @media source(none){...} (invalido).
      tailwindcss(),
      viteReact(),
    ],
  },
})
