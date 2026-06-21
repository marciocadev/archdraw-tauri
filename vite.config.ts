import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: [
        '**/src-tauri/**',
        '**/cdk.out/**',
        '**/node_modules/**',
        (path: string) => {
          if (path.includes('/src/') || path.endsWith('/src')) {
            return false
          }

          return /(^|[\\/])cdk\.json$/.test(path)
            || /(^|[\\/])(main|sns|variables|outputs)\.tf$/.test(path)
            || /(^|[\\/])lib[\\/][^\\/]+-stack\.ts$/.test(path)
            || /(^|[\\/])bin[\\/][^\\/]+\.ts$/.test(path)
        },
      ],
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target:
      process.env.TAURI_ENV_PLATFORM === 'windows'
        ? 'chrome105'
        : 'es2020',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
})
