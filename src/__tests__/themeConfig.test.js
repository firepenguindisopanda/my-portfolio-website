import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { casefileTheme, COLORS, FONTS, RADIUS_SCALE } from '../utilities/themeConfig';

/**
 * Casefile is the site's one design. Its tokens live twice - as custom
 * properties in styles/casefile.css, which paints the pages, and in the MUI
 * theme, which paints the ML analysis blocks and the drawn figures - so these
 * tests hold the two copies together and check the colour pairs the site
 * actually sets text in.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(SRC, 'styles/casefile.css'), 'utf8');

/** `--paper-hi: #F6F7F9;` from the :root block, keyed as `paperHi`. */
const cssTokens = Object.fromEntries(
  [...css.slice(0, css.indexOf('}')).matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)].map(([, name, hex]) => [
    name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()),
    hex.toUpperCase(),
  ])
);

const channel = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('Casefile tokens', () => {
  it('keeps the theme colours identical to casefile.css', () => {
    // COLORS.ink2 is --ink-2, COLORS.paperHi is --paper-hi, and so on.
    Object.entries(COLORS).forEach(([name, hex]) => {
      expect({ name, hex: hex.toUpperCase() }).toEqual({ name, hex: cssTokens[name] });
    });
  });

  it('names the same three faces as casefile.css', () => {
    ['serif', 'sans', 'mono'].forEach((face) => {
      const family = FONTS[face].split(',')[0].replace(/'/g, '');
      expect(css).toMatch(new RegExp(`--${face}:\\s*'${family}'`));
    });
  });
});

describe('text contrast', () => {
  const { palette } = casefileTheme;

  it('reads at AA on both paper grounds', () => {
    [palette.background.default, palette.background.paper].forEach((ground) => {
      expect(contrast(palette.text.primary, ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(palette.text.secondary, ground)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('reads at AA on the night stage', () => {
    [COLORS.night, COLORS.night2].forEach((ground) => {
      expect(contrast(COLORS.moon, ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(COLORS.moon2, ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(COLORS.hl, ground)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('keeps button text readable on its fill', () => {
    expect(contrast(palette.primary.contrastText, palette.primary.main)).toBeGreaterThanOrEqual(4.5);
    // The highlighter carries ink, never the other way round: yellow text on
    // paper is under 1.5:1.
    expect(contrast(palette.secondary.contrastText, palette.secondary.main)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(COLORS.hl, COLORS.paper)).toBeLessThan(3);
  });

  it('sets the stamp red dark enough to read as text on paper', () => {
    expect(contrast(COLORS.stampInk, COLORS.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(COLORS.stampInk, COLORS.paperHi)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('shape and depth', () => {
  it('draws every radius from the shared scale', () => {
    const { control, container } = casefileTheme.custom.radius;
    expect(RADIUS_SCALE).toContain(control);
    expect(RADIUS_SCALE).toContain(container);
    // MUI multiplies `borderRadius: n` by shape.borderRadius, so a drift here
    // would silently round every chip, button and input.
    expect(casefileTheme.shape.borderRadius).toBe(control);
  });

  it('keeps low elevations flat: surfaces are ruled, not shadowed', () => {
    expect(casefileTheme.shadows.slice(0, 4)).toEqual(['none', 'none', 'none', 'none']);
    expect(casefileTheme.shadows).toHaveLength(25);
  });

  it('sets labels in the mono face and display type in the serif', () => {
    const { typography } = casefileTheme;
    expect(typography.overline.fontFamily).toBe(FONTS.mono);
    expect(typography.h1.fontFamily).toBe(FONTS.serif);
    expect(typography.fontFamily).toBe(FONTS.sans);
    expect(casefileTheme.custom.codeFont).toBe(FONTS.mono);
  });
});
