// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: reemplazar por el dominio real. Se usa en canonical, og:image, sitemap y robots.txt.
  site: 'https://growa.example',
  integrations: [
    icon(),
    // Solo páginas públicas: /control y /estilos no deben indexarse
    sitemap({ filter: (url) => !/\/(control|estilos)\/?$/.test(new URL(url).pathname) }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Preprocesar model-viewer al arrancar el servidor de desarrollo; si no, Vite lo
      // descubre al importarlo bajo demanda y recarga la página (el modelo no aparece).
      include: ['@google/model-viewer'],
    },
    build: {
      // model-viewer (incluye three.js) pesa ~1 MB sin comprimir, pero se carga
      // bajo demanda solo cuando la sección Producto se acerca a la pantalla.
      chunkSizeWarningLimit: 1100,
    },
  },
});