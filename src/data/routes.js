/**
 * Route metadata, in one place.
 *
 * Two things consume this: `useDocumentMeta` at runtime, and
 * `scripts/generate-seo.mjs` at build time, which writes a real HTML file per
 * route with these values baked into the <head>. They have to agree - a link
 * preview showing one description while the page shows another is worse than
 * having neither - so neither is allowed its own copy.
 *
 * Project case-study routes are not listed here. They are derived from
 * src/data/projects.js, since a project and its route are the same fact.
 *
 * `priority` and `changefreq` feed the generated sitemap.
 */
export const SITE_URL = 'https://nicksportfolio.tech';

/** 1200x630 raster. SVG is rejected by every major link-preview crawler. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const staticRoutes = [
  {
    path: '/',
    title: 'Nicholas Smith',
    description:
      'Software engineer in Port of Spain working across full-stack web, mobile and machine learning. Projects, experience and contact details.',
    changefreq: 'monthly',
    priority: '1.0',
  },
  {
    path: '/fullstack',
    title: 'Full-Stack Web Development',
    description:
      'Full-stack projects across React, Next.js, FastAPI, NestJS and PostgreSQL - from multi-agent AI systems to cache-aware crawlers.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/ml',
    title: 'Machine Learning & Data Science',
    description:
      'Data science and machine learning work: forecasting, fraud detection, customer segmentation and speech recognition, with the analysis behind each result.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/desktop',
    title: 'Desktop Tools',
    description:
      'Native desktop applications built with Tauri, Rust and Angular - offline-first tools for work that should never leave the machine.',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/android',
    title: 'Android Development',
    description: 'Mobile application work built with modern Android technologies.',
    changefreq: 'yearly',
    priority: '0.4',
  },
  {
    path: '/about-panda',
    title: 'About the Panda',
    description: 'The story behind the panda.',
    changefreq: 'yearly',
    priority: '0.3',
  },
];

/** Look up a route's meta by path. Throws loudly rather than silently shipping a blank <title>. */
export const routeMeta = (path) => {
  const match = staticRoutes.find((route) => route.path === path);
  if (!match) throw new Error(`No route metadata registered for "${path}" - add it to src/data/routes.js`);
  return match;
};
