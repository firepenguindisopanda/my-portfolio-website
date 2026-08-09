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

const sourceText = walk(SRC).map((f) => ({
  file: path.relative(SRC, f),
  text: fs.readFileSync(f, 'utf8'),
}));

describe('bundle and loading', () => {
  it('code-splits every route with React.lazy', () => {
    const app = read('App.jsx');
    const lazyCount = (app.match(/lazy\(\(\) => import\(/g) || []).length;
    expect(lazyCount).toBeGreaterThanOrEqual(6);
    expect(app).toMatch(/<Suspense/);
  });

  it('does not eagerly import every font family', () => {
    const app = read('App.jsx');
    const eager = app.match(/^import '@fontsource\/([a-z-]+)/gm) || [];
    const families = new Set(eager.map((line) => line.split('/')[1]));
    // Space Grotesk (display face in every theme), IBM Plex Sans (default
    // theme's body face, reused by Corporate Clean) and JetBrains Mono
    // (labels and evidence lines everywhere). The other two body faces load
    // on demand. Three is the ceiling; a fourth means a theme's body font
    // has leaked into the eager set.
    expect(families.size).toBeLessThanOrEqual(3);
  });

  it('loads non-default theme fonts on demand', () => {
    expect(read('App.jsx')).toMatch(/THEME_FONTS/);
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

  it('keeps scroll-driven layout reads out of the app bar', () => {
    const appBar = read('components/DrawerAppBar/DrawerAppBar.jsx');
    expect(appBar).not.toMatch(/addEventListener\('scroll'/);
    expect(appBar).not.toMatch(/offsetTop/);
  });

  it('lazy-loads images that are not above the fold', () => {
    ['components/Projects/Projects.jsx', 'components/AcademicAchievements/AcademicAchievements.jsx'].forEach(
      (file) => {
        expect({ file, lazy: /loading="lazy"/.test(read(file)) }).toEqual({ file, lazy: true });
      }
    );
  });
});

describe('design system constraints', () => {
  it('contains no gradients', () => {
    const offenders = sourceText.filter(({ text }) => /(linear|radial|conic)-gradient/.test(text));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  it('keeps box-shadow usage in the theme, not scattered through components', () => {
    const offenders = sourceText.filter(
      ({ file, text }) => /boxShadow:|box-shadow:/.test(text) && !file.startsWith('utilities/')
    );
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  it('pins every theme to the shared 4px/8px radius scale', async () => {
    const { themePersonalities, RADIUS } = await import('../utilities/themeConfig');
    Object.values(themePersonalities).forEach((theme) => {
      expect(theme.shape.borderRadius).toBe(RADIUS.control);
    });
    expect(RADIUS).toEqual({ control: 4, container: 8 });
  });

  it('keeps low elevations flat in every theme', async () => {
    const { themePersonalities } = await import('../utilities/themeConfig');
    Object.values(themePersonalities).forEach((theme) => {
      expect(theme.shadows.slice(0, 4)).toEqual(['none', 'none', 'none', 'none']);
    });
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
});

describe('third-party embeds', () => {
  it('does not inject the Credly script per badge', () => {
    sourceText.forEach(({ file, text }) => {
      const injectsScript = /cdn\.credly\.com\/assets\/utilities\/embed\.js/.test(text);
      expect({ file, injectsScript }).toEqual({ file, injectsScript: false });
    });
  });

  it('gives the Credly iframe explicit dimensions', () => {
    const badge = read('components/EmbededBadges/CredlyBadge.jsx');
    expect(badge).toMatch(/width=\{width\}/);
    expect(badge).toMatch(/height=\{height\}/);
    expect(badge).toMatch(/loading="lazy"/);
  });
});
