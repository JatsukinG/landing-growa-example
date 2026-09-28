# Plan — growa-landing (Astro)

Plan de trabajo por sesiones para rehacer la landing de GROWA en Astro y migrar el panel BLE a `/control`.
Cada sesión es independiente: al empezar una, leer `CLAUDE.md` + este archivo y marcar el checklist al terminar.

---

## Inventario (lo que ya existe)

| Recurso | Ubicación | Uso en el proyecto nuevo |
|---|---|---|
| Landing vieja (Next.js 14) | `growa-landing-main/` | Solo como fuente de **contenido** y **assets**. No se reutiliza código. |
| Logo completo (SVG) | `Logo GROWA 2.svg` | Fuente de verdad del logo. |
| Logo animado | `growa-logo-animado.html` | → `src/components/LogoAnimado.astro` |
| **Isotipo (nuevo)** | `growa-isotipo.svg` (usa `currentColor`), `growa-isotipo-verde.svg`, `growa-isotipo-crema.svg` | Navbar, favicon, footer, decoraciones. Extraído de los trazos originales del logo (planta + carita + maceta, sin letras). |
| Panel BLE | `index.html` | → `src/pages/control.astro` |
| Modelo 3D de la torre | `growa-landing-main/public/HTOWER.glb` | Sección Producto |
| Fotos | `growa-landing-main/public/images/` — `bg1/2/3.jpg`, `htower.jpeg/png/webp` | Hero, "Qué es", fondos |
| Plantas decorativas | `growa-landing-main/public/plant_top.png`, `plant_botton.png` | Opcional, decoración |

### Contenido a rescatar de la landing vieja

- **Lema hero:** "La forma más rápida, ecológica y económica de cultivar desde cualquier lugar." — CTA "Reservar ahora mismo".
- **¿Qué es Growa?** "Nuestro objetivo en Growa es producir alimentos limpios basados en los principios de sostenibilidad ambiental, optimización, innovación y aprovechamiento del espacio."
- **¿Qué son las Torres Growa?** "Un sistema de cultivo doméstico alternativo e innovador que busca concientizar a la gente y brindar alternativas de sostenibilidad." — pilares: Innovación · Optimización · Reutilización.
- **Ventajas (6):**
  1. Fácil de usar — no necesitas experiencia previa; el sistema es simple y automatizado.
  2. Ahorro de espacio — diseño vertical compacto, ideal incluso para apartamentos.
  3. Ecológico — consume menos agua gracias a la recirculación.
  4. Producción rápida — las plantas crecen más rápido con entrega directa de nutrientes.
  5. Decorativo — diseño elegante, toque moderno y natural.
  6. Alimentos frescos — verduras y hierbas en casa, sin químicos.
- **Producto:** "Nuestra torre aeropónica" con modelo 3D girando.
- Secciones nuevas que no existían: **Cómo funciona** (aeroponía + riego automático + control desde el celular) y **Contacto**.

---

## Dirección visual

**Concepto:** "huerto de estudio" — cálido, orgánico y tecnológico a la vez. Mucho crema, verde profundo, formas redondeadas como la maceta del logo, curvas tipo hoja, y detalles de agua/niebla (la aeroponía es nebulización) como acento.

### Tokens (se definen una vez en `src/styles/tokens.css` y los usa todo, incluido `/control`)

> Implementado en `src/styles/global.css` (bloque `@theme`). Valores finales ahí; esto es referencia.

```css
:root {
  /* Marca */
  --verde:        #133912;  /* primario, textos fuertes, fondos oscuros */
  --crema:        #FAEDDD;  /* fondo principal */
  /* Derivados (ajustar en sesión 1) */
  --verde-900:    #0B240B;  /* fondos muy oscuros (control, footer) */
  --verde-700:    #1F5220;
  --hoja:         #6FAF4A;  /* acento vivo: estados "encendido", highlights */
  --hoja-suave:   #DDE8C9;
  --crema-200:    #F3E0C8;  /* tarjetas sobre crema */
  --agua:         #4FB3D9;  /* niebla/riego, detalles puntuales */
  --tierra:       #B8764A;  /* acento cálido opcional (maceta) */
  --alerta:       #D9644F;
  --radio:        20px;
}
```

### Tipografía (propuesta, confirmar en sesión 1)

- **Titulares:** *Fraunces* (serif variable, suave y orgánica — encaja con la carita del logo).
- **Texto / UI:** *Instrument Sans* o *Manrope*.
- **Números del panel de control:** *IBM Plex Mono* (ya la usa `index.html`).
- Cargar vía `@fontsource` (self-hosted) en lugar de Google Fonts CDN.

### Principios

- Mobile-first; `prefers-reduced-motion` respetado en todas las animaciones.
- Animaciones de entrada suaves al hacer scroll (IntersectionObserver + CSS, sin librerías pesadas).
- Imágenes con `astro:assets` (`<Image />`) → WebP/AVIF y tamaños responsivos.
- Cero JS por defecto; JS solo en: logo animado, menú móvil, modelo 3D y `/control`.

---

## Stack

- **Astro 5** (estático), TypeScript.
- **CSS:** Tailwind v4 (`@tailwindcss/vite`) con los tokens de arriba en `@theme`, **o** CSS plano con variables. Recomendado: Tailwind v4 para ir rápido; `/control` puede conservar su CSS propio reescrito con los tokens.
- **3D:** `<model-viewer>` (web component de Google) para `HTOWER.glb` — sin React ni three.js manual.
- **Iconos:** `astro-icon` + set Lucide/Phosphor (reemplaza `react-icons`).
- **Deploy:** Vercel o Netlify (HTTPS incluido, necesario para Web Bluetooth).

### Estructura objetivo

```
growa-landing/
  public/
    favicon.svg            ← isotipo
    models/HTOWER.glb
  src/
    assets/                ← fotos (procesadas por astro:assets)
    styles/
      tokens.css
      global.css
    components/
      LogoAnimado.astro
      Isotipo.astro
      Navbar.astro
      Hero.astro
      QueEs.astro
      ComoFunciona.astro
      Ventajas.astro
      Producto.astro
      Contacto.astro
      Footer.astro
    layouts/
      Base.astro
    pages/
      index.astro
      control.astro        ← noindex
```

---

## Sesiones

### Sesión 0 — Assets ✅
- [x] Extraer isotipo (solo planta/maceta, sin letras) → `growa-isotipo*.svg`.

### Sesión 1 — Setup del proyecto y sistema de diseño ✅
- [x] Proyecto `growa-landing/` creado con Astro 7 (plantilla mínima, TS strict).
- [x] Tailwind v4, fuentes (`@fontsource-variable/fraunces`, `@fontsource-variable/instrument-sans`, `@fontsource/ibm-plex-mono`), `astro-icon` + Phosphor, `@astrojs/check`.
- [x] Tokens en `@theme` + base + clases de componentes → todo en `src/styles/global.css` (no hizo falta `tokens.css` aparte).
- [x] `Base.astro`: `lang="es"`, meta, OG, favicon (isotipo), `theme-color`, prop `noindex`.
- [x] `Isotipo.astro` (SVG importado como componente, `currentColor`).
- [x] Assets copiados: fotos → `src/assets/fotos/`, marca → `src/assets/brand/`, modelo 3D → `public/models/htower.glb` (3,8 MB, comprimir en sesión 7).
- [x] `index.astro` provisional = guía de estilo (paleta, tipografía, botones, tarjetas, imágenes). Revisada en desktop y móvil.
- [x] `CLAUDE.md` y `PLAN.md` dentro de `growa-landing/`.
- Pendiente de decidir: `site` en `astro.config.mjs` es un placeholder (`https://growa.example`) hasta tener dominio.

### Sesión 2 — Logo animado ✅
- [x] `growa-logo-animado.html` → `src/components/LogoAnimado.astro`: SVG inline con los trazos originales, estilos con scope y un custom element `<growa-logo>` (se puede usar varias veces en la misma página; IDs de clipPath únicos por instancia).
- [x] Props: `conTexto` (false = solo isotipo animado), `bucle` (vaivén + parpadeo), `inicio` (`visible` | `carga`), `class` (color con `text-crema` / `text-verde`, tamaño con `w-*`), `label`.
- [x] Se repite con clic, Enter o Espacio. `prefers-reduced-motion` → se muestra estático. Sin JS (`<noscript>`) → también visible.
- [x] `Isotipo.astro` estático también con IDs únicos por instancia.
- [x] Probado en la guía de estilo (hero con isotipo animado + sección "Logo animado" con variantes).

### Sesión 3 — Navbar + Hero ✅
- [x] `Navbar.astro`: barra flotante; transparente con texto crema sobre la portada y "píldora" crema translúcida con blur al hacer scroll. Marca (isotipo + letras GROWA originales), enlaces a las secciones con punto verde en el enlace activo (IntersectionObserver) y botón "Controlar mi torre" → `/control`.
- [x] Menú móvil accesible: `aria-expanded`, se cierra con Esc, al tocar un enlace, al tocar fuera y al pasar a escritorio.
- [x] `Marca.astro` + `src/assets/brand/growa-letras.svg` (letras "GROWA" extraídas del logo).
- [x] `Hero.astro`: "Tu huerta, en vertical.", lema original, CTAs (Reservar → `#contacto`, Cómo funciona → `#como-funciona`), 3 destacados con iconos; torre dentro de un arco con gotas de niebla, tarjetas flotantes (isotipo animado "¡Hola!" y "Riego activo"); ola hacia la sección crema.
- [x] `htower-torre.webp`: copia de `htower.webp` sin la hora "9:33 p.m." que tenía pegada sobre la tapa.
- [x] Guía de estilo movida a `/estilos` (noindex). `index.astro` = landing real con marcadores para las secciones 4–8.
- Nota: `/control` da 404 hasta la sesión 9.
- Pendiente de verificar en navegador: línea de 1px bajo la ola (se aumentó el solape del SVG a 4px; la extensión de Chrome se desconectó antes de confirmarlo).

### Sesión 4 — ¿Qué es GROWA? ✅
- [x] `QueEs.astro`: una sola foto (`bg1.jpg`, torres en invernadero) con esquinas orgánicas + sello giratorio "Torres verticales · aeropónicas" con el isotipo.
- [x] Título "Alimentos limpios, cultivados donde vives.", propósito (texto original, resumido) y tarjeta "¿Qué son las torres GROWA?" con explicación breve de la aeroponía.
- [x] Pilares Innovación · Optimización · Reutilización como etiquetas compactas (el detalle va en Ventajas, para no repetir).
- [x] Utilidad global `data-revelar` (+ `--retraso`) para aparición al hacer scroll; solo oculta si hay JS y respeta `prefers-reduced-motion`.
- [x] Verificado: desktop y móvil 390px (Chrome headless). Confirmado que ya no aparece la línea bajo la ola del hero.

> **Criterio acordado (aplica a todas las secciones):** diseño moderno y limpio, sin saturar. No hace falta usar todas las fotos de la landing vieja; una imagen fuerte por sección, textos cortos y sin repetir ideas entre secciones.

### Sesión 5 — Cómo funciona ✅
- [x] `ComoFunciona.astro` sobre fondo verde: "Cultivar nunca fue tan sencillo." + 4 pasos generales (sin cifras):
  1. Prepara el agua (tanque + nutrientes) · 2. Siembra y conecta (a la corriente, sin tierra) · 3. Se riega sola (bomba, ciclos automáticos) · 4. Ajusta desde tu celular (Bluetooth, tiempos de riego) + enlace a `/control`.
- [x] Diagrama SVG propio de la torre (tanque con agua, bomba y tubo con flujo animado, niebla, macetas con plantas, enchufe, celular con señal Bluetooth).
- [x] Escritorio: el diagrama queda fijo (sticky) y resalta la parte del paso que pasa por el centro de la pantalla (o al pasar el mouse). Móvil: diagrama completo arriba y el paso activo se resalta en la lista.
- [x] `Ola.astro`: transición reutilizable entre secciones (`arriba`, `abajo`, `invertir`), sin línea en la unión.
- [x] Verificado en escritorio y móvil (Chrome headless).
- Cuando GROWA tenga cifras reales (ahorro de agua, días a cosecha…) se pueden añadir aquí como dato destacado.

### Sesión 6 — Ventajas ✅
- [x] `Ventajas.astro`: "¿Por qué una torre GROWA?" + las 6 ventajas originales con textos cortos, en cuadrícula tipo bento (4 columnas en escritorio, 2 en tablet, 1 en móvil).
- [x] Una sola foto (tarjeta grande "Alimentos frescos", `bg2.jpg`); el resto son tarjetas de color (verde, hoja suave, crema, crema 200) con icono y decoración sutil (isotipo de fondo, flechas girando).
- [x] Aparición escalonada al hacer scroll (`data-revelar`).
- [x] Verificado en escritorio, tablet y móvil (Chrome headless).

### Sesión 7 — Producto (modelo 3D) ✅
- [x] `Producto.astro`: "Nuestra torre aeropónica." + texto breve y CTAs; a la derecha un escenario verde con el modelo 3D girando (arrastrable, sin zoom, `touch-action: pan-y` para no bloquear el scroll en móvil).
- [x] `htower.glb` optimizado: la textura "ILUSTRACION TORRE GROWA" (PNG 2851×4725) → 1024 px WebP. **3,83 MB → 182 KB**, misma geometría. Original intacto en `growa-landing-main/public/HTOWER.glb`.
- [x] `@google/model-viewer` con carga diferida: solo se descarga (≈286 KB gzip) cuando la sección está a 400 px de la pantalla. JS inicial de la sección: 1,5 KB. Mientras carga se muestra el isotipo pulsando.
- [x] `optimizeDeps.include` para model-viewer en `astro.config.mjs` (evita recarga en dev) y `chunkSizeWarningLimit` documentado.
- [x] Verificado en build de producción (escritorio y móvil): el modelo carga y queda bien encuadrado.
- Sin especificaciones técnicas por ahora (no hay datos). Cuando existan: añadir una lista corta al lado del modelo.
- Nota: la foto de la portada (torre hexagonal blanca) y el modelo 3D (torre cilíndrica con ilustración) parecen modelos distintos. Confirmar con GROWA cuál es el producto actual.

### Sesión 8 — Contacto + Footer ✅
- [x] **Todos los datos de contacto en `src/data/contacto.ts`** (WhatsApp, mensaje de reserva, correo, Instagram/Facebook/TikTok, ciudad). Valores actuales = marcadores con `TODO`. Un canal con `''` se oculta solo.
- [x] "Reservar" = abre WhatsApp con un mensaje ya escrito (`enlaceWhatsapp()`); los botones "Reservar mi torre" de la portada y Producto llevan a `#contacto`.
- [x] `Contacto.astro`: panel verde "¿Listo para cultivar en casa?" + botones WhatsApp / correo + lista de canales.
- [x] `Footer.astro`: marca, lema, redes, menú, acceso a `/control`, © año automático, "Volver arriba".
- [x] Menú compartido en `src/data/navegacion.ts` (Navbar y Footer).

### Sesión 9 — Migrar `/control` ✅
- [x] `src/pages/control.astro` con `Base` (`noindex`, `theme-color` verde oscuro).
- [x] **Script BLE copiado sin cambios** (`<script is:inline>`; verificado idéntico al de `../index.html`). Se conservaron todos los IDs y clases que usa (18 IDs verificados en el HTML generado).
- [x] Re-estilizado con la marca: fondo verde oscuro, tarjetas verdes, anillo/estado en `hoja`, marcador del ciclo en `agua`, aviso de límite en `ambar` (token nuevo), Fraunces en títulos, Plex Mono en lecturas, botones redondeados.
- [x] Encabezado con la marca + "Volver al sitio". Consejo al pie.
- [x] **Aviso de compatibilidad al cargar**: si no existe `navigator.bluetooth` se muestra un banner (Chrome/Edge en computador o Android; no iPhone/Safari/Firefox), se desactiva "Conectar" y se explica si falta HTTPS.
- [x] Verificado visualmente: estado inicial, estado "conectado" simulado con `applyStatus()` (mismo JSON que envía la ESP32) y navegador sin Bluetooth.
- [ ] **Pendiente (requiere hardware): probar con la ESP32-C3 real** en Chrome de computador y Chrome Android (en `localhost` o en el sitio publicado con HTTPS).

### Sesión 10 — Pulido y publicación (parcial ✅)
- [x] Imagen para compartir `public/og.png` (1200×630, logo real sobre verde) + `og:image`, `twitter:card`.
- [x] `apple-touch-icon.png` (180×180) generado desde el favicon.
- [x] `@astrojs/sitemap` (solo la home; excluye `/control` y `/estilos`) y `robots.txt` generado desde `site` (bloquea `/control` y `/estilos`).
- [x] Página 404 ("Esta página no ha brotado").
- [x] Enlace "Saltar al contenido" (teclado) y `<main id="contenido">`.
- [x] Contrastes corregidos en textos pequeños.
- [x] Fraunces cambiada a variante `soft` + cursiva real (antes la cursiva era sintética) y precarga de la fuente de títulos.
- [x] Portada: la animación de entrada ya no parte de `opacity: 0` (Chrome no detectaba el LCP).
- [x] **Lighthouse (móvil, build de producción):** Rendimiento 93 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 (LCP 2,4 s · TBT 0 ms · CLS 0). `/control`: Accesibilidad 100 · Buenas prácticas 100.
  - El rendimiento no llega a 95 por el *speed index* (animaciones de entrada de la portada). Si se quiere subir: acortar/eliminar la animación del logo en la tarjeta "¡Hola!" o las tarjetas flotantes.
- [x] **SEO / Open Graph completo**: `src/data/sitio.ts` (título, descripción de 149 caracteres, `og:locale`, imagen, X) + `src/components/Seo.astro`:
  - `title`, `description`, `robots` (index + `max-image-preview:large` / noindex), canonical, sitemap.
  - Open Graph completo (`og:locale`, `og:image` absoluta con tipo, tamaño y alt) y Twitter/X (`summary_large_image`).
  - Cada página puede sobrescribir título, descripción e imagen desde `Base`.
  - JSON-LD en la home: `Organization` + `WebSite` + `Product` (sin precio). Contacto/redes solo con `contacto.datosReales = true`.
  - `site.webmanifest` + `icon-192.png` / `icon-512.png` (maskable) con acceso directo a "Controlar mi torre".
- [ ] `og:locale` es `es_LA` como marcador: poner la región real (p. ej. `es_CO`).
- [ ] Al tener precio: agregar `offers` al `Product` del JSON-LD (TODO en `Seo.astro`).
- [ ] **Dominio**: reemplazar `site` en `astro.config.mjs` (canonical, og:image, sitemap y robots dependen de él).
- [ ] **Deploy** en Vercel o Netlify (HTTPS incluido, necesario para Web Bluetooth). Comando de build: `npm run build`, carpeta: `dist/`.
- [ ] Opcional: borrar `/estilos` (guía de estilo interna de la sesión 1) antes de publicar.

---

## Pendientes para GROWA (contenido que falta)

- [ ] Datos de contacto (WhatsApp, correo, redes, ciudad). → editar solo `src/data/contacto.ts`.
- [x] ¿Qué hace el CTA "Reservar"? → por ahora abre WhatsApp con mensaje. Cambiable en `src/data/contacto.ts`.
- [ ] Especificaciones de la torre y precio (si se quiere mostrar).
- [ ] Confirmar cuál es el producto actual: la foto de la portada (torre hexagonal blanca) y el modelo 3D (torre cilíndrica con ilustración) parecen distintos.
- [ ] Cifras de impacto (ahorro de agua, tiempo de cosecha, nº de plantas). *(Por ahora no hay; las secciones están escritas sin números.)*
- [ ] Fotos recientes del producto / clientes (las actuales son de 2024).
- [ ] Dominio y dónde se va a desplegar.
