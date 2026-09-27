# nicksmith.is-a.dev

Nicholas Smith's portfolio: a React single-page app designed as a case file.
The work is told as four scroll-driven case stories, three projects can be
tried on the page, and everything else is a filterable index with a case study
behind every row.

Live at https://nicksmith.is-a.dev

## Stack

- React 18, React Router 6, Vite 8
- Plain CSS for every page (`src/styles/`), with MUI 5 kept for the ML
  analysis blocks and drawn figures; `src/utilities/themeConfig.js` mirrors the
  CSS tokens so both paint alike
- GSAP with ScrollTrigger and Flip (pinned case stories, the index filter, the
  hover preview), behind a Motion switch that defaults to `prefers-reduced-motion`
- react-markdown for the case studies in `public/markdowns`, recharts for the
  interactive analysis on the data-science write-ups
- PostHog for analytics, behind a consent banner and cookieless by default
- Vitest and Testing Library; ESLint 9 flat config
- Firebase Hosting

## Design: Casefile

One design, an archive of case files: cool paper and ink, a highlighter for
what was verified and a stamp red for what was flagged, and a night stage where
the case stories play out. Instrument Serif carries the big moments, IBM Plex
Sans the reading, IBM Plex Mono every label and number.

The home page, in order:

- **Cover** - name, thesis and a file card, with three evidence rows that each
  open a case study.
- **Four cases** - on a desktop each chapter pins while its figure plays
  against the scroll; on phones each figure plays once as it arrives, and with
  motion off every figure is drawn in its finished state.
- **Try it** - the Chimp Test, Link Tracker's Q/R/D/X triage and the timetable
  drag, on example data. All three work by keyboard and touch.
- **Index** - every featured project, filterable, with a floating screenshot
  preview on the compact rows.
- **Experience, Skills, Recognition, Contact** - the contact form sends through
  EmailJS.

Motion follows the visitor's system setting until they use the header's Motion
switch, which is remembered. CSS transitions are keyed on `html.motion-on`, and
the reduced-motion override on `html.motion-off`, never on a global rule -
a global `transition-duration` corrupts GSAP's `from()` tweens.
`src/__tests__/performance.test.js` enforces this and the other design rules
(gradients and shadows only in `src/styles/`, lazy images below the fold,
three font families) against the source.

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
  styles/         casefile.css (tokens, header, home), pages.css, tryit.css
  data/           profile, projects, experience, skills, certificates,
                  background, routes, worked example, plot catalogue
  motion/         MotionProvider and the Motion switch's state
  utilities/      themeConfig (the MUI mirror of the tokens), gsapSetup
  hooks/          useSectionSpy, useDocumentMeta, useScrollRestore
  components/
    home/         the home page's sections; story/ and tryit/ hold the case
                  stories and the demos
    site/         header and footer
    ...           case-study pieces, the deep-dive layout, ML charts
  pages/          Home, ProjectDetail, the deep-dive pages, Background, NotFound
public/
  markdowns/      case-study write-ups
  portfolio_data/ metrics and plots for the interactive analyses
scripts/
  generate-seo.mjs
```
