import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serve em /chama-app/; a imagem Docker (Railway) serve na raiz com VITE_BASE=/.
  base: process.env.VITE_BASE || '/chama-app/',
  plugins: [react()],
})
