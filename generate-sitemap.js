import fs from 'fs';
import path from 'path';

// Define tus rutas estáticas y dinámicas aquí
const SITE_URL = (process.env.VITE_SITE_URL || 'https://esmioficio.com').replace(/\/+$/, '');

// Rutas estáticas
const staticRoutes = [
  '/',
  '/buscar',
  '/nosotros',
  '/privacidad',
  '/terminos',
  '/blog',
  '/proyectos'
];

const priorityMarkets = ['morelia', 'cdmx', 'guadalajara', 'monterrey', 'puebla', 'queretaro'];

// Categorías (las puedes extraer de constants.ts si usas ts-node o definirlas aquí)
const categories = [
  'plomeros',
  'electricistas',
  'carpinteros',
  'albaniles',
  'herreros',
  'pintores',
  'mecanicos',
  'cerrajeros',
  'jardineros',
  'tecnicos-en-refrigeracion'
];

// Artículos del blog
const blogPosts = [
  'como-elegir-un-plomero-en-morelia',
  'cuanto-cobra-un-albanil-en-morelia',
  'como-evitar-fraudes-al-contratar-oficios',
  'que-revisar-antes-de-contratar-un-carpintero',
  'mejores-practicas-para-contratar-servicios-en-casa'
];

const generateSitemap = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Añadir rutas estáticas
  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Añadir rutas de categorías
  categories.forEach(category => {
    priorityMarkets.forEach(market => {
      xml += `
  <url>
    <loc>${SITE_URL}/oficios/${category}-en-${market}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });
  });

  // Añadir rutas de blog
  blogPosts.forEach(post => {
    xml += `
  <url>
    <loc>${SITE_URL}/blog/${post}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  fs.writeFileSync(path.resolve('./public/sitemap.xml'), xml);
  console.log('✅ sitemap.xml generado exitosamente.');
};

const generateRobotsTxt = () => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /administracion
Disallow: /perfil
Disallow: /favoritos
Disallow: /update-password

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.resolve('./public/robots.txt'), robots);
  console.log('✅ robots.txt generado exitosamente.');
};

generateSitemap();
generateRobotsTxt();
