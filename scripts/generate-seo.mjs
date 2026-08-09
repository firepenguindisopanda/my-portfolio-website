/**
 * Post-build SEO generation.
 *
 * The site is a client-rendered SPA behind a catch-all rewrite, so every URL
 * used to return the same index.html: the same <title>, the same description,
 * the same Open Graph card. Googlebot runs JavaScript and eventually sees the
 * real page, but the crawlers that matter most for a portfolio - LinkedIn,
 * Slack, X, WhatsApp, Discord, Facebook - do not run JavaScript at all. Sharing
 * a case-study link anywhere showed the home page's card.
 *
 * This writes a real HTML file per route, each a copy of the built index.html
 * with that route's metadata baked into the <head>, plus a <noscript> summary
 * so there is indexable text without JavaScript. Firebase Hosting serves a
 * matching static file in preference to the rewrite, so /projects/uwi-scraper
 * gets build/projects/uwi-scraper/index.html and the SPA takes over from there.
 *
 * It also generates sitemap.xml, which previously listed six URLs and none of
 * the case studies.
 *
 * Runs automatically after `npm run build` via the postbuild script.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = path.join(ROOT, 'build');

/**
 * Loads an ES module from src/ in plain Node.
 *
 * These modules import images and components that Node cannot resolve, and the
 * package is not type:module, so a direct import fails either way. Stubbing the
 * import statements out leaves the data intact - every field this script reads
 * is a string or an array of strings.
 */
const loadDataModule = async (relativePath) => {
  const source = await readFile(path.join(ROOT, relativePath), 'utf8');

  const stubbed = source.replace(
    /^import\s+([\s\S]*?)\s+from\s+['"][^'"]*['"];?/gm,
    (_match, clause) => {
      const named = clause.match(/\{([\s\S]*?)\}/);
      const names = named
        ? named[1]
            .split(',')
            .map((entry) => entry.split(/\s+as\s+/).pop().trim())
            .filter(Boolean)
        : [clause.trim()];
      return names.map((name) => `const ${name} = null;`).join(' ');
    },
  );

  const encoded = Buffer.from(stubbed, 'utf8').toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Replaces a tag's attribute in the built HTML.
 *
 * Anchored on the tag's identifying attribute rather than on its full text, so
 * reformatting index.html does not silently stop the replacement from matching.
 */
const setAttr = (html, tagPattern, attr, value) => {
  const re = new RegExp(`(<${tagPattern}[^>]*\\s${attr}=")[^"]*(")`, 'i');
  if (!re.test(html)) {
    throw new Error(`SEO: could not find ${attr} on <${tagPattern}> in index.html`);
  }
  return html.replace(re, `$1${escapeHtml(value)}$2`);
};

const buildPage = (template, { title, description, url, type, jsonLd, noscript }) => {
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = setAttr(html, 'meta[^>]*name="description"', 'content', description);
  html = setAttr(html, 'link[^>]*rel="canonical"', 'href', url);
  html = setAttr(html, 'meta[^>]*property="og:type"', 'content', type);
  html = setAttr(html, 'meta[^>]*property="og:url"', 'content', url);
  html = setAttr(html, 'meta[^>]*property="og:title"', 'content', title);
  html = setAttr(html, 'meta[^>]*property="og:description"', 'content', description);
  html = setAttr(html, 'meta[^>]*name="twitter:url"', 'content', url);
  html = setAttr(html, 'meta[^>]*name="twitter:title"', 'content', title);
  html = setAttr(html, 'meta[^>]*name="twitter:description"', 'content', description);

  if (jsonLd) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n</head>`,
    );
  }

  // React clears #root on mount, so this is only ever seen by a client that did
  // not run the bundle. It restates what the page renders - never more.
  html = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/i,
    `<noscript>\n      <h1>${escapeHtml(noscript.heading)}</h1>\n      <p>${escapeHtml(noscript.body)}</p>\n      ${noscript.extra ? `<p>${escapeHtml(noscript.extra)}</p>\n      ` : ''}<p><a href="/">Nicholas Smith - all work</a></p>\n    </noscript>`,
  );

  return html;
};

const writePage = async (routePath, html) => {
  const dir = routePath === '/' ? BUILD_DIR : path.join(BUILD_DIR, routePath.replace(/^\//, ''));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf8');
};

const run = async () => {
  if (!existsSync(path.join(BUILD_DIR, 'index.html'))) {
    throw new Error('SEO: build/index.html not found - run `npm run build` first');
  }

  const template = await readFile(path.join(BUILD_DIR, 'index.html'), 'utf8');

  const { staticRoutes, SITE_URL, DEFAULT_OG_IMAGE } = await loadDataModule('src/data/routes.js');
  const { projects } = await loadDataModule('src/data/projects.js');
  const { profile } = await loadDataModule('src/data/profile.js');

  // A silently-empty parse would ship a sitemap with six URLs and no warning,
  // which is exactly the failure this script exists to fix.
  if (!Array.isArray(projects) || projects.length < 10) {
    throw new Error(`SEO: parsed only ${projects?.length ?? 0} projects from src/data/projects.js`);
  }

  const caseStudies = projects.filter((project) => project.markdown);
  const suffix = profile.name;
  const titleFor = (title) => (title === suffix ? title : `${title} - ${suffix}`);

  const written = [];

  for (const route of staticRoutes) {
    const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
    const html = buildPage(template, {
      title: titleFor(route.title),
      description: route.description,
      url,
      type: 'website',
      noscript: { heading: route.title, body: route.description },
    });
    await writePage(route.path, html);
    written.push({ url, changefreq: route.changefreq, priority: route.priority });
  }

  for (const project of caseStudies) {
    const routePath = `/projects/${project.id}`;
    const url = `${SITE_URL}${routePath}`;

    /*
     * SoftwareSourceCode rather than Article: the page is a write-up, but the
     * thing it describes is a piece of software, and that is what a search
     * engine should be able to surface. `about` carries the verification
     * mechanism, which is the claim the whole site is organised around.
     */
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: project.title,
      description: project.shortDescription || project.highlight,
      url,
      author: { '@type': 'Person', name: profile.name, url: `${SITE_URL}/` },
      programmingLanguage: (project.technologies || []).slice(0, 8),
      applicationCategory: project.category,
      image: DEFAULT_OG_IMAGE,
      ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
      ...(project.liveUrl ? { sameAs: [project.liveUrl] } : {}),
      ...(project.evidence ? { about: project.evidence } : {}),
    };

    const html = buildPage(template, {
      title: titleFor(project.title),
      description: project.shortDescription || project.highlight,
      url,
      type: 'article',
      jsonLd,
      noscript: {
        heading: project.title,
        body: project.shortDescription || project.highlight,
        extra: project.evidence ? `How it knows: ${project.evidence}` : undefined,
      },
    });

    await writePage(routePath, html);
    written.push({ url, changefreq: 'monthly', priority: project.topPick ? '0.9' : '0.7' });
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...written.map(
      ({ url, changefreq, priority }) =>
        `  <url>\n    <loc>${url}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(path.join(BUILD_DIR, 'sitemap.xml'), sitemap, 'utf8');

  console.log(
    `SEO: ${staticRoutes.length} static routes + ${caseStudies.length} case studies written, sitemap has ${written.length} URLs`,
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
