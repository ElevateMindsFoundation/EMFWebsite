import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allows the site to be reached through a temporary Cloudflare Tunnel
    // (trycloudflare.com) for sharing local dev previews. Not needed for
    // normal local development or production builds.
    allowedHosts: ['.trycloudflare.com'],
  },
})
