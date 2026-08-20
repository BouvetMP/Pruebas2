// ¿Qué? Configuración de Vite con soporte para React, TypeScript y path aliases.
// ¿Para qué? Compilar el proyecto en desarrollo y resolver los imports con alias (@constants, @components, etc.).
// ¿Impacto? Resuelve las rutas de carpetas de forma compatible con módulos ES nativos.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@':           fileURLToPath(new URL('./src', import.meta.url)),
      '@api':        fileURLToPath(new URL('./src/api', import.meta.url)),
      '@assets':     fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@constants':  fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@context':    fileURLToPath(new URL('./src/context', import.meta.url)),
      '@hooks':      fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@i18n':       fileURLToPath(new URL('./src/i18n', import.meta.url)),
      '@pages':      fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@styles':     fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@app-types':  fileURLToPath(new URL('./src/types', import.meta.url)),
      '@utils':      fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
});