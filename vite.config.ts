import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';

// Nombre del repositorio en GitHub Pages (makromediad/SaaS_Comercio_AQP).
// Si se despliega en un dominio propio, cambiar a '/'.
const REPO = 'SaaS_Comercio_AQP';

export default defineConfig(({command}) => {
  // En dev se sirve desde '/'; en producción (GitHub Pages project site) desde /REPO/.
  const base = command === 'serve' ? '/' : `/${REPO}/`;
  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
      assetsInlineLimit: 0,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
