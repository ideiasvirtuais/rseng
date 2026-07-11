import { defineConfig } from '@lovable.dev/vite-tanstack-config'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  tanstackStart: {
    spa: { enabled: true },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    environments: {
      server: {
        build: {
          rollupOptions: {
            input: path.resolve(__dirname, './src/server.ts'),
          },
        },
      },
    },
    plugins: [
      tailwindcss(),
      viteReact(),
    ],
  },
})
