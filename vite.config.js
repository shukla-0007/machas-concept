import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Artwork lives in /public/art-local. The production build is served from
// GitHub Pages at /machas-concept/, so assets need that base path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/machas-concept/' : '/',
  plugins: [react()],
  server: { port: 5180 },
}))
