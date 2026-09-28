// ------------------------------------------------------------------
// Configuración SEO / Open Graph de GROWA — editar aquí.
// El dominio NO va aquí: es `site` en astro.config.mjs.
// ------------------------------------------------------------------

export const sitio = {
  nombre: 'GROWA',
  /** Título de la home (y base del resto: "Página — GROWA") */
  titulo: 'GROWA — Torres verticales aeropónicas',
  /** 150–160 caracteres: es lo que muestra Google bajo el título */
  descripcion:
    'Cultiva alimentos frescos en casa con las torres verticales aeropónicas GROWA: riego automatizado, sin tierra, menos agua y control desde tu celular.',
  lema: 'Torres verticales aeropónicas',

  /** Idioma y región para Open Graph. Ej.: es_CO, es_MX, es_ES */
  locale: 'es_LA', // TODO: región real

  /** Imagen para compartir (1200×630, en /public) */
  imagen: '/og.png',
  imagenAlt: 'Logo de GROWA, torres verticales aeropónicas',

  /** Usuario de X/Twitter sin @ ('' si no hay) */
  twitter: '', // TODO: si existe

  colorTema: '#133912',
  colorFondo: '#FAEDDD',
};
