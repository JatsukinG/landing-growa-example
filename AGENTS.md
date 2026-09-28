# GROWA — sitio web

## Sobre la empresa
GROWA fabrica torres verticales aeropónicas con sistemas de riego automatizado.
Cada torre se controla con una placa ESP32-C3 por Bluetooth Low Energy (BLE).

## Objetivo del proyecto
Rehacer la landing de la empresa (la anterior estaba en Next.js y tiene ~2 años) y agregar
una ruta `/control` para conectarse por BLE a la ESP32-C3 y manejar las torres.

## Decisiones tomadas
- Framework: **Astro**. La landing es contenido casi estático y la página de control ya
  existe como HTML + CSS + JS en un solo archivo, que puede pasar a `src/pages/control.astro`
  casi sin cambios. Se prefirió sobre Next.js para no reescribir la lógica BLE en React.
- Si en el futuro hay cuentas de usuario, base de datos o panel en la nube, reevaluar Next.js
  o usar islas de React / endpoints de servidor dentro de Astro.

## Estructura propuesta
```
src/
  components/
    LogoAnimado.astro   ← logo animado (ver abajo)
    Hero.astro
    ComoFunciona.astro
    Contacto.astro
  layouts/
    Base.astro
  pages/
    index.astro         ← landing
    control.astro       ← página BLE (meta robots noindex)
```

## Marca
- Verde: `#133912` · Crema: `#FAEDDD`
- Logo: planta con carita en una maceta + "GROWA" + lema "TORRES VERTICALES AEROPONICAS".
- Ya existe `growa-logo-animado.html`: SVG con los trazos originales del logo y una animación
  de ~3 s (maceta con rebote, gotas de nebulización, hojas que brotan, ojos/sonrisa, letras en
  cascada, lema letra por letra), vaivén y parpadeo en bucle, repetición al hacer clic y
  soporte de `prefers-reduced-motion`. Ya convertido en `src/components/LogoAnimado.astro` (sesión 2).

## Notas de Web Bluetooth (ruta /control)
- Solo funciona en navegadores Chromium (Chrome, Edge, Opera, Chrome Android).
  No funciona en Safari, en ningún navegador de iPhone ni en Firefox:
  detectar `navigator.bluetooth` y mostrar un aviso claro si no existe.
- Requiere HTTPS (o `localhost` en desarrollo).
- La conexión debe iniciarse con un gesto del usuario (botón "Conectar torre").

## Plan de trabajo
El plan por sesiones está en `PLAN.md`. Al empezar una sesión, leerlo y marcar el checklist al terminar.

## Sistema de diseño (implementado en sesión 1)
- Astro 7 + Tailwind v4 (`@tailwindcss/vite`, sin `tailwind.config`).
- Tokens de color, fuentes, radios y sombras en `@theme` dentro de `src/styles/global.css`.
  Usar utilidades (`bg-verde`, `text-crema`, `font-display`…) o `var(--color-verde)` en CSS propio.
- Clases de componentes: `.contenedor`, `.seccion`, `.eyebrow`, `.btn` + `.btn-primario|hoja|crema|contorno`, `.tarjeta`.
- Fuentes self-hosted con @fontsource: Fraunces (titulares, `SOFT 100`), Instrument Sans (texto), IBM Plex Mono (números de /control).
- Iconos: `astro-icon` con Phosphor (`<Icon name="ph:plant" />`).
- Isotipo: `<Isotipo class="h-8 text-verde" />` (usa `currentColor`). Assets de marca en `src/assets/brand/`.
- Logo animado: `<LogoAnimado class="w-96 text-crema" />` · props `conTexto`, `bucle`, `inicio="visible|carga"`.
- Fotos en `src/assets/fotos/` → usar `<Image />` de `astro:assets`. Modelo 3D en `public/models/htower.glb`.
- Datos de contacto y redes: SOLO en `src/data/contacto.ts` (marcadores con TODO). Menú: `src/data/navegacion.ts`.
- `/control` (`src/pages/control.astro`): el `<script is:inline>` BLE es copia exacta del original; no cambiar IDs/clases que usa.
- SEO/OG: configuración en `src/data/sitio.ts`, etiquetas + JSON-LD en `src/components/Seo.astro` (props de `Base`: `title`, `description`, `noindex`, `image`, `imageAlt`, `schema`). El JSON-LD solo incluye contacto/redes si `contacto.datosReales = true`.
- `site` en `astro.config.mjs` es un marcador hasta tener dominio (afecta canonical, og:image, sitemap, robots).
- Aparición al hacer scroll: atributo `data-revelar` (opcional `style="--retraso: 120ms"`), script en `Base.astro`.
- Criterio de diseño: moderno y limpio, sin saturar. Una imagen fuerte por sección, textos cortos, no repetir ideas entre secciones. No hace falta usar todas las fotos viejas.
- Archivos originales (logo animado, `index.html` de control, landing vieja) están en la carpeta padre `../`.

---

# Notas de Astro (generadas por create-astro)

### Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
