import type { APIRoute } from 'astro';

// robots.txt generado a partir de `site` (astro.config.mjs)
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site);
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /control\nDisallow: /estilos\n\nSitemap: ${sitemap.href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
