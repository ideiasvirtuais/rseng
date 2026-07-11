import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    // Tailwind v4: precisa do plugin para processar @import "tailwindcss" source(none)
    // e @source "../src". Sem ele o CSS sai envolto em @media source(none){...} (invalido).
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },
      pages: [
        { path: "/" },
        { path: "/obras/edificio-rosario" },
        { path: "/obras/edificio-iris" },
        { path: "/obras/edificio-jo-pena-duarte" },
        { path: "/obras/edificio-malbec" },
        { path: "/obras/edificio-santorini" },
      ],
    }),
    viteReact(),
  ],
})
