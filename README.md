# GROWA — sitio web

Landing de GROWA (torres verticales aeropónicas) + panel `/control` para manejar la torre por Bluetooth (ESP32-C3).
Hecho con **Astro 7 + Tailwind CSS v4**. Plan y estado del proyecto: [`PLAN.md`](./PLAN.md).

## Comandos

| Comando           | Qué hace                                          |
| :---------------- | :------------------------------------------------ |
| `npm install`     | Instala dependencias                              |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:4321` |
| `npm run build`   | Genera el sitio estático en `dist/`               |
| `npm run preview` | Sirve `dist/` para revisarlo antes de publicar    |

## Qué editar y dónde

- **Datos de contacto y redes** (WhatsApp, correo, Instagram, ciudad, mensaje de reserva): `src/data/contacto.ts`.
- **SEO / Open Graph** (título, descripción, idioma/región, imagen para compartir, usuario de X): `src/data/sitio.ts`. Las metaetiquetas y el JSON-LD se generan en `src/components/Seo.astro`.
- **Dominio del sitio**: `site` en `astro.config.mjs` (canonical, imagen para compartir, sitemap y robots.txt).
- **Colores, fuentes, botones**: bloque `@theme` y componentes en `src/styles/global.css`.
- **Secciones de la landing**: `src/components/` (Hero, QueEs, ComoFunciona, Ventajas, Producto, Contacto, Footer).
- **Panel Bluetooth**: `src/pages/control.astro`. El script BLE es copia exacta del original; si se cambia el diseño, conservar los IDs y clases que usa.

## Al tener los datos reales

1. Completar `src/data/contacto.ts` y poner `datosReales: true` (así se publican en los datos estructurados para Google).
2. Poner el dominio en `site` (`astro.config.mjs`) y la región en `locale` (`src/data/sitio.ts`, p. ej. `es_CO`).
3. Tras publicar, revisar cómo se ve al compartir: [opengraph.xyz](https://www.opengraph.xyz), [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) y los datos estructurados en [Rich Results Test](https://search.google.com/test/rich-results). Dar de alta el sitemap (`/sitemap-index.xml`) en Google Search Console.

## Web Bluetooth (/control)

Funciona solo en Chrome/Edge/Opera (computador y Android), con HTTPS o en `localhost`.
No funciona en iPhone, Safari ni Firefox: la página lo detecta y muestra un aviso.
