import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.dirname(fileURLToPath(import.meta.url)), 'VITE_')
  const certPath = env.VITE_HTTPS_CERT
  const keyPath = env.VITE_HTTPS_KEY

  if (Boolean(certPath) !== Boolean(keyPath)) {
    throw new Error('HTTPS üçün VITE_HTTPS_CERT və VITE_HTTPS_KEY birlikdə verilməlidir.')
  }

  return {
    plugins: [react()],
    server: {
      ...(certPath && keyPath ? { https: { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } } : {}),
      proxy: {
        '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5099', changeOrigin: true },
      },
    },
  }
})
