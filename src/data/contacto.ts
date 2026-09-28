// ------------------------------------------------------------------
// Datos de contacto de GROWA — ÚNICO lugar donde se editan.
// Todo lo marcado con TODO es un marcador: reemplazar por el dato real.
// Si un canal no se usa, dejarlo en '' (vacío) y no se mostrará.
// ------------------------------------------------------------------

export const contacto = {
  /**
   * Cambiar a `true` cuando todos los datos de abajo sean reales.
   * Mientras sea `false`, no se publican en los datos estructurados (JSON-LD) para Google.
   */
  datosReales: false, // TODO

  /** WhatsApp con código de país, solo dígitos. Ej.: '573001234567' */
  whatsapp: '000000000000', // TODO: número real
  /** Número como se muestra en pantalla */
  whatsappVisible: '+00 000 000 0000', // TODO: número real
  /** Mensaje con el que se abre el chat al tocar "Reservar" */
  mensajeReserva: 'Hola GROWA, quiero reservar una torre aeropónica 🌱',

  email: 'hola@growa.example', // TODO: correo real

  instagram: 'growa', // TODO: usuario real, sin @ ('' para ocultar)
  facebook: '', // TODO: usuario o página ('' para ocultar)
  tiktok: '', // TODO: usuario sin @ ('' para ocultar)

  ciudad: 'Tu ciudad, País', // TODO: ubicación real ('' para ocultar)
};

// --- Enlaces derivados (no hace falta editarlos) ---

export const enlaceWhatsapp = (mensaje = contacto.mensajeReserva) =>
  `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;

export const enlaceEmail = `mailto:${contacto.email}?subject=${encodeURIComponent('Quiero una torre GROWA')}`;

export const redes = [
  contacto.instagram && {
    nombre: 'Instagram',
    icono: 'ph:instagram-logo',
    url: `https://instagram.com/${contacto.instagram}`,
    usuario: `@${contacto.instagram}`,
  },
  contacto.facebook && {
    nombre: 'Facebook',
    icono: 'ph:facebook-logo',
    url: `https://facebook.com/${contacto.facebook}`,
    usuario: contacto.facebook,
  },
  contacto.tiktok && {
    nombre: 'TikTok',
    icono: 'ph:tiktok-logo',
    url: `https://tiktok.com/@${contacto.tiktok}`,
    usuario: `@${contacto.tiktok}`,
  },
].filter((r): r is { nombre: string; icono: string; url: string; usuario: string } => Boolean(r));
