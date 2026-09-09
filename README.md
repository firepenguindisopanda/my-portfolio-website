# nicksmith.is-a.dev

Nicholas Smith's portfolio: a React single-page app that presents the same
projects, experience and credentials in four editorial formats, switchable from
the app bar.

Live at https://nicksmith.is-a.dev

## Stack

- React 18, React Router 6, Vite 8
- MUI 5 for components; one theme definition per presentation mode in
  `src/utilities/themeConfig.js`
- GSAP (hero timeline, section rules, scroll progress) and framer-motion
  (section reveals, route transitions), both guarded by `prefers-reduced-motion`
- react-markdown for the case studies in `public/markdowns`, recharts for the
  interactive analysis on the data-science write-ups
- PostHog for analytics, behind a consent banner and cookieless by default
- Vitest and Testing Library; ESLint 9 flat config
- Firebase Hosting

## Presentation modes

The four "themes" are four layouts of the same content, not four palettes.
Each mode owns its typefaces, density, radii, motion character and section
arrangement:

| Mode | Format | Display / body |
|---|---|---|
| Instrument (default) | Instrument panel on a dark ground, modular grid | Space Grotesk / IBM Plex Sans |
| Ledger | Audit sheet, ruled rows, no cards | IBM Plex Sans Condensed / Public Sans |
| Notebook | Engineering notebook, one column and a margin rail | JetBrains Mono / Lora |
| Exhibit | Gallery plates with wall labels | Bodoni Moda / Inter |

The rule that keeps this maintainable: no component branches on the theme id.
Layout is a token (`theme.custom.layout`), each section switches once on it,
and the renderers are siblings fed by shared data hooks. Radii come from a
four-value scale, surfaces are separated by hairlines rather than shadows, and
there are no gradients. `src/__tests__/performance.test.js` enforces most of
this against the source.

## Running it

Requires Node 22.12 or newer.

```sh
npm ci
cp .env.example .env   # optional: PostHog key for local analytics
npm start              # http://localhost:5173
```

```sh
npm test               # vitest, one run
npm run test:watch
npm run lint
npm run build          # writes build/, then runs scripts/generate-seo.mjs
npm run preview        # serves build/
npm run analyze        # bundle breakdown by source map
```

## Build and SEO

The site is client-rendered behind a catch-all rewrite, so the post-build
script writes a real `index.html` per route with that route's title,
description, Open Graph tags and JSON-LD baked in, plus a `sitemap.xml`. Link
previews on LinkedIn, Slack and the rest do not run JavaScript, and this is
what gives each case study its own card. Route metadata lives in
`src/data/routes.js`; case-study routes derive from `src/data/projects.js`.

Vite inlines `VITE_`-prefixed variables at build time, so the PostHog key has
to be present wherever `npm run build` runs. CI reads it from a repository
secret and fails the build if the key is missing from the output.

## Deploying

```sh
npm run build
npx firebase deploy
```

`firebase.json` serves `build/` with clean URLs and rewrites unknown paths to
`index.html`, where the router renders the 404 page.

## Layout of the source

```
src/
  data/           profile, projects, routes, certificates, domains, plot catalogue
  utilities/      themeConfig (the four modes), gsapSetup
  hooks/          useLayout, useSectionSpy, useDocumentMeta, useScrollRestore
  components/     one folder per section; multi-renderer sections keep a
                  renderers/ folder and a shared *Parts.jsx
  pages/          Home, ProjectDetail, the deep-dive category pages, NotFound
public/
  markdowns/      case-study write-ups
  portfolio_data/ metrics and plots for the interactive analyses
scripts/
  generate-seo.mjs
```
