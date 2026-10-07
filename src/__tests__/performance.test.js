/**
 * Guardrails against the performance and correctness regressions this codebase
 * has actually hit.
 *
 * The previous version of this file asserted hardcoded `true` literals
 * (`const appUsesLazyLoading = true; expect(appUsesLazyLoading).toBe(true)`),
 * so it passed no matter what the source did. These read the source instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (relative) => fs.readFileSync(path.join(SRC, relative), 'utf8');

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === '__mocks__') continue;
      walk(full, files);
    } else if (/\.(jsx?|css)$/.test(entry.name) && !/\.test\.jsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

// Forward slashes on every platform. The assertions below compare against
// POSIX-style paths ('utilities/', 'components/Projects'), and on Windows
// path.relative returns backslashes, which failed three guards there while
// they passed in CI.
const sourceText = walk(SRC).map((f) => ({
  file: path.relative(SRC, f).split(path.sep).join('/'),
  text: fs.readFileSync(f, 'utf8'),
}));

/**
 * The source files a module brings with it through static imports and
 * re-exports - what ships in its chunk. `import()` is deliberately not
 * followed: a dynamic import is a separate chunk loaded on demand.
 */
const staticGraph = (entry) => {
  const seen = new Set();
  const resolve = (from, spec) => {
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
    return [base, `${base}.js`, `${base}.jsx`, `${base}/index.js`, `${base}/index.jsx`].find((f) => {
      const full = path.join(SRC, f);
      return /\.jsx?$/.test(f) && fs.existsSync(full) && fs.statSync(full).isFile();
    });
  };
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const text = read(file);
    for (const [, spec] of text.matchAll(/^\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/gm)) {
      const hit = resolve(file, spec);
      if (hit) visit(hit);
    }
  };
  visit(entry);
  return [...seen];
};

describe('bundle and loading', () => {
  it('code-splits every route with React.lazy', () => {
    const app = read('App.jsx');
    const lazyCount = (app.match(/lazy\(\(\) => import\(/g) || []).length;
    expect(lazyCount).toBeGreaterThanOrEqual(6);
    expect(app).toMatch(/<Suspense/);
  });

  it('loads exactly the three Casefile faces', () => {
    const app = read('App.jsx');
    const eager = app.match(/^import '@fontsource\/([a-z-]+)/gm) || [];
    const families = new Set(eager.map((line) => line.split('/')[1]));
    // Instrument Serif for display, IBM Plex Sans to read, IBM Plex Mono for
    // labels. A fourth family is a face nothing is designed around, and every
    // visitor pays for it.
    expect([...families].sort()).toEqual(['ibm-plex-mono', 'ibm-plex-sans', 'instrument-serif']);
  });

  it('ships no font package the site does not load', () => {
    const deps = Object.keys(JSON.parse(fs.readFileSync(path.join(SRC, '..', 'package.json'), 'utf8')).dependencies);
    const loaded = new Set(read('App.jsx').match(/@fontsource\/[a-z-]+/g) || []);
    expect(deps.filter((d) => d.startsWith('@fontsource/') && !loaded.has(d))).toEqual([]);
  });

  it('keeps MUI off every page, so only the ML analysis chunk carries it', () => {
    // MUI and emotion were ~40% of the eager bundle while a provider sat at the
    // root. Everything is plain CSS now; the analysis blocks are the one MUI
    // user and are reached only through lazy(), which this walk does not follow.
    const entries = ['index.jsx', ...fs.readdirSync(path.join(SRC, 'pages')).filter((f) => /\.jsx$/.test(f) && !/\.test\./.test(f)).map((f) => `pages/${f}`)];
    entries.forEach((entry) => {
      const offenders = staticGraph(entry).filter((file) => /from '@(mui|emotion)\//.test(read(file)));
      expect({ entry, offenders }).toEqual({ entry, offenders: [] });
    });
    // Not vacuous: the walk does reach the pages' own components.
    expect(staticGraph('pages/ProjectDetail.jsx')).toContain('components/ProjectVisuals/LinkTrackerVisual.jsx');
  });

  it('keeps the panda off the first load: its scenes arrive in their own chunk', () => {
    // The scenes are decorative, so no page waits for them. Pages reach only
    // the lazy wrappers and the tiny event bus the sections report to.
    const allowed = new Set(['components/panda/LazyScenes.jsx', 'components/panda/pandaBus.js']);
    ['index.jsx', 'pages/Home.jsx'].forEach((entry) => {
      const panda = staticGraph(entry).filter((file) => file.startsWith('components/panda/') && !allowed.has(file));
      expect({ entry, panda }).toEqual({ entry, panda: [] });
    });
    // Not vacuous: the home page does reach the wrappers.
    expect(staticGraph('pages/Home.jsx')).toContain('components/panda/LazyScenes.jsx');
  });

  it('fetches SplitText only when a heading is about to animate', () => {
    // The ink headings split text with GSAP's SplitText. A visitor with motion
    // off never needs it, so it is reached only through import(), which keeps
    // it out of the eager bundle.
    const staticImports = sourceText.filter(({ text }) => /from 'gsap\/SplitText'/.test(text)).map((f) => f.file);
    expect(staticImports).toEqual([]);
    // Not vacuous: the headings do load it, on demand.
    expect(read('motion/useInkHeadings.js')).toMatch(/import\('gsap\/SplitText'\)/);
  });

  it('does not import whole icon libraries', () => {
    sourceText.forEach(({ file, text }) => {
      const importsNamespace = /import \* as \w+ from '@mui\/icons-material'/.test(text);
      expect({ file, importsNamespace }).toEqual({ file, importsNamespace: false });
    });
  });
});

describe('rendering cost', () => {
  it('uses IntersectionObserver rather than a scroll handler for section spying', () => {
    const hook = read('hooks/useSectionSpy.js');
    expect(hook).toMatch(/IntersectionObserver/);
    expect(hook).not.toMatch(/addEventListener\('scroll'/);
  });

  it('keeps scroll-driven layout reads out of the header', () => {
    const header = read('components/site/SiteHeader.jsx');
    expect(header).not.toMatch(/addEventListener\('scroll'/);
    expect(header).not.toMatch(/offsetTop/);
  });

  it('lazy-loads images that are not above the fold', () => {
    // Every file that renders a below-the-fold image has to opt into lazy
    // loading. The hero's portrait, a case study's cover screenshot and the
    // panda are the first thing on their pages, so they load eagerly.
    const aboveTheFold = new Set(['components/home/Hero.jsx', 'pages/ProjectDetail.jsx', 'pages/AboutPanda.jsx']);
    const files = sourceText.filter(({ file, text }) => !aboveTheFold.has(file) && /<img\b/.test(text));

    // Not vacuous: the index, the deep dives and the story's screenshot all render images.
    expect(files.map((f) => f.file)).toEqual(
      expect.arrayContaining([
        'components/home/ProjectIndex.jsx',
        'components/CategoryPage/CategoryPage.jsx',
        'components/home/story/storyFigures.js',
      ])
    );
    files.forEach(({ file, text }) => {
      expect({ file, lazy: /loading="lazy"/.test(text) }).toEqual({ file, lazy: true });
    });
  });
});

describe('design system constraints', () => {
  it('keeps gradients in the stylesheets', () => {
    // Casefile uses them for drawn things only - the highlighter stroke, ruled
    // paper, graph-paper dots, a clash's hatching - all defined in styles/. A
    // gradient anywhere else is decoration creeping into a component.
    const offenders = sourceText.filter(
      ({ file, text }) => /(linear|radial|conic)-gradient/.test(text) && !file.startsWith('styles/')
    );
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  it('keeps box-shadow usage in the stylesheets and the theme, not scattered through components', () => {
    const offenders = sourceText.filter(
      ({ file, text }) => /boxShadow:|box-shadow:/.test(text) && !file.startsWith('utilities/') && !file.startsWith('styles/')
    );
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  it('ships one animation library', () => {
    // framer-motion and GSAP each cost ~110kB of the eager bundle, for a site
    // whose reveals, timelines and scroll effects all fit one of them. GSAP
    // stayed: the hero timelines, count-ups and scroll scrub are native to it.
    const offenders = sourceText.filter(({ text }) => /from 'framer-motion'/.test(text));
    expect(offenders.map((o) => o.file)).toEqual([]);
    expect(JSON.parse(fs.readFileSync(path.join(SRC, '..', 'package.json'), 'utf8')).dependencies).not.toHaveProperty(
      'framer-motion'
    );
  });

  it('guards every tween against prefers-reduced-motion', () => {
    // There is no global switch: each file that starts a GSAP tween checks the
    // visitor's preference (or gsapEnabled, which implies the check) first.
    const needsOwnGuard = /gsap\.(timeline|from|fromTo|to)\(/;
    const guards = /prefersReducedMotion|gsapEnabled/;

    const unguarded = sourceText
      .filter(({ text }) => needsOwnGuard.test(text) && !guards.test(text))
      .map((o) => o.file);

    expect(unguarded).toEqual([]);
  });
});

describe('global CSS', () => {
  it('does not set font-family or outline on the universal selector', () => {
    // Strip comments first: this file documents the rule in prose, and `/* ... */`
    // blocks start with `*` so they otherwise match the selector pattern.
    const css = read('index.css').replace(/\/\*[\s\S]*?\*\//g, '');
    const universalBlocks = css.match(/\*[^{]*\{[^}]*\}/g) || [];
    universalBlocks.forEach((block) => {
      // A universal font-family overrides theme typography on every unstyled
      // element; `outline: 0` strips keyboard focus rings.
      expect(block).not.toMatch(/font-family/);
      expect(block).not.toMatch(/outline:\s*(0|none)/);
    });
  });

  it('honours prefers-reduced-motion', () => {
    expect(read('index.css')).toMatch(/prefers-reduced-motion/);
  });

  it('keys the reduced-motion override on html.motion-off, never on a bare global rule', () => {
    // A global `transition-duration: 0.01ms` while GSAP runs turns every GSAP
    // style write into a CSS transition that GSAP reads back mid-flight, and
    // delayed from() tweens then record their hidden start as their end. The
    // hero once stayed invisible that way. The override may only apply when
    // motion is off, which is exactly when GSAP does not run.
    const css = read('index.css').replace(/\/\*[\s\S]*?\*\//g, '');
    const blocks = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(([, , body]) => /(transition|animation)-duration/.test(body));
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach(([, selector]) => {
      selector
        .split(',')
        .map((sel) => sel.trim())
        .forEach((sel) => expect(sel).toMatch(/^html\.motion-off\b/));
    });
  });

  it('keys CSS transitions and animations in the stylesheets on html.motion-on', () => {
    // So turning motion off stops them without the global override above.
    sourceText
      .filter(({ file }) => file.startsWith('styles/'))
      .forEach(({ file, text }) => {
        const css = text
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, '');
        const moving = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(([, , body]) =>
          /(^|;)\s*(transition|animation)\s*:/.test(body)
        );
        moving.forEach(([, selector]) => {
          selector
            .split(',')
            .map((sel) => sel.trim().replace(/^@media[^{]*/, ''))
            .forEach((sel) => expect({ file, sel }).toEqual({ file, sel: expect.stringMatching(/^html\.motion-on\b/) }));
        });
      });
  });
});

describe('third-party embeds', () => {
  it('does not inject the Credly script per badge', () => {
    sourceText.forEach(({ file, text }) => {
      const injectsScript = /cdn\.credly\.com\/assets\/utilities\/embed\.js/.test(text);
      expect({ file, injectsScript }).toEqual({ file, injectsScript: false });
    });
  });

  // The Credly badge wall is gone: seven of its eight iframes embedded a
  // credential the certificate index already lists, so the section was the
  // same content twice and eight third-party frames to say it. The script
  // guard above stays - it is what stopped the embed being reintroduced the
  // wrong way the first time.
  it('embeds no third-party iframes on the home page', () => {
    sourceText.forEach(({ file, text }) => {
      const embedsCredly = /credly\.com\/embedded_badge/.test(text);
      expect({ file, embedsCredly }).toEqual({ file, embedsCredly: false });
    });
  });
});
