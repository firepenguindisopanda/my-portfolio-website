/**
 * Guardrails on the four presentation modes.
 *
 * Each block below corresponds to a defect the modes actually shipped with, so
 * these fail against the old palettes rather than merely restating the new ones:
 *   - forest-canopy's `warning` and `secondary` were both #D4A373, so the signal
 *     colour was indistinguishable from decoration.
 *   - corporate-clean had paper lighter than nothing and darker than its ground,
 *     inverting the elevation logic the other three use.
 *   - three of the four accents sat in the cyan-to-green arc, so the picker
 *     showed one mood four times.
 */
import { themePersonalities, themeOrder, themeLabels } from '../utilities/themeConfig';

/** WCAG 2.1 relative luminance. */
const channel = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
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

/** Hue angle in degrees, or null for a grey. */
const hue = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return null;

  let sextant;
  if (max === r) sextant = ((g - b) / delta) % 6;
  else if (max === g) sextant = (b - r) / delta + 2;
  else sextant = (r - g) / delta + 4;

  return (sextant * 60 + 360) % 360;
};

/** Shortest distance between two hues, so 350 and 10 are 20 apart, not 340. */
const hueGap = (a, b) => {
  const diff = Math.abs(hue(a) - hue(b));
  return Math.min(diff, 360 - diff);
};

const modes = themeOrder.map((key) => [key, themePersonalities[key]]);

describe('presentation modes', () => {
  it.each(modes)('%s exposes every token components read', (_key, theme) => {
    const { layout, radius, motion, displayFont, codeFont, focusRing } = theme.custom;

    expect(Object.keys(layout).sort()).toEqual(
      [
        'container', 'experience', 'gutter', 'heading', 'hero',
        'id', 'measure', 'projects', 'range', 'sectionSpacing', 'surface',
      ].sort()
    );
    expect(layout.sectionSpacing).toEqual({ xs: expect.any(Number), md: expect.any(Number) });
    expect(Object.keys(motion).sort()).toEqual(
      ['distance', 'duration', 'ease', 'gsapEase', 'stagger'].sort()
    );
    expect(radius).toEqual({ control: expect.any(Number), container: expect.any(Number) });
    expect(displayFont).toEqual(expect.any(String));
    expect(focusRing).toEqual(expect.any(String));
    expect(codeFont).toContain('JetBrains Mono');
  });

  it.each(modes)('%s keeps its signal colour distinct from its decoration', (_key, theme) => {
    // forest-canopy shipped these as the same hex. The theme file's own rule is
    // that `warning` is reserved for uncertainty and never decorates - which is
    // unenforceable if it is also the decorative secondary.
    expect(theme.palette.warning.main).not.toBe(theme.palette.secondary.main);
    expect(theme.palette.warning.main).not.toBe(theme.palette.primary.main);
  });

  it.each(modes)('%s separates paper from ground in the right direction', (_key, theme) => {
    const { mode, background } = theme.palette;
    const ground = luminance(background.default);
    const paper = luminance(background.paper);

    // Dark modes raise paper toward the light, light modes toward white. Either
    // way paper must read as the nearer surface, which corporate-clean inverted.
    expect(paper).toBeGreaterThan(ground);
    expect(mode === 'dark' ? paper < 0.5 : paper > 0.5).toBe(true);
  });

  it.each(modes)('%s clears AA for body and secondary text on both surfaces', (_key, theme) => {
    const { text, background } = theme.palette;

    [background.default, background.paper].forEach((surface) => {
      expect(contrast(text.primary, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text.secondary, surface)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it.each(modes)('%s puts readable text on its own accent', (_key, theme) => {
    const { primary } = theme.palette;
    expect(contrast(primary.contrastText, primary.main)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(modes)('%s draws a focus ring a keyboard user can see', (_key, theme) => {
    // WCAG 1.4.11 wants 3:1 for a focus indicator. This ring used to reuse
    // `hoverBorder`, a 55-60% translucent tint meant for a card edge under the
    // cursor, which resolved to 2.86:1 on Exhibit and 2.97:1 on Notebook. Two
    // different jobs had been sharing one token.
    const { focusRing } = theme.custom;
    const { background } = theme.palette;

    expect(focusRing).toMatch(/^#[0-9A-F]{6}$/i);
    [background.default, background.paper].forEach((surface) => {
      expect(contrast(focusRing, surface)).toBeGreaterThanOrEqual(3);
    });
  });

  it('gives every mode an accent in its own region of the wheel', () => {
    // Measured as hue separation, not contrast ratio. Contrast compares
    // lightness, and two accents can be equally dark while being obviously
    // different colours - plum and indigo sit 1.13:1 apart and no one would
    // confuse them. Hue is the property the picker actually trades on.
    //
    // This is what the old palette got wrong: #4CC2E0 and #0E7490 were 1 degree
    // apart, with #40916C not far behind, so three of the four swatches showed
    // one mood. The four now land near 152, 193, 242 and 317 degrees.
    const accents = themeOrder.map((key) => themeLabels[key].swatch);
    expect(new Set(accents).size).toBe(themeOrder.length);

    const gaps = accents.flatMap((a, i) =>
      accents.slice(i + 1).map((b) => ({ a, b, gap: Math.round(hueGap(a, b)) }))
    );

    gaps.forEach((pair) => {
      expect(pair).toEqual({ a: pair.a, b: pair.b, gap: expect.any(Number) });
      expect(pair.gap).toBeGreaterThanOrEqual(30);
    });
  });

  it('keeps the swatch in step with the palette it advertises', () => {
    // A picker showing a colour the mode does not actually use is a lie the
    // visitor only discovers after switching.
    themeOrder.forEach((key) => {
      expect({ key, swatch: themeLabels[key].swatch }).toEqual({
        key,
        swatch: themePersonalities[key].palette.primary.main,
      });
    });
  });

  it('keeps mode ids stable, because storage and analytics resolve by them', () => {
    // localStorage['portfolio-theme'] and the PostHog `portfolio_theme` super
    // property both key off these. Renaming one silently resets every returning
    // visitor's preference and splits the analytics series.
    expect(themeOrder).toEqual([
      'technical-precision',
      'ocean-mist',
      'forest-canopy',
      'corporate-clean',
    ]);
    expect(Object.keys(themeLabels).sort()).toEqual([...themeOrder].sort());
  });

  it('gives every mode its own display and body face', () => {
    // Two modes shared IBM Plex Sans outright, and all four shared one display
    // face, so "each theme has its own typography" was about 40% true.
    const displays = modes.map(([, theme]) => theme.typography.h1.fontFamily);
    const bodies = modes.map(([, theme]) => theme.typography.body1.fontFamily);

    expect(new Set(displays).size).toBe(modes.length);
    expect(new Set(bodies).size).toBe(modes.length);
  });

  it('varies density, so the modes differ by more than colour', () => {
    const spacings = modes.map(([, theme]) => theme.custom.layout.sectionSpacing.md);
    const bodySizes = modes.map(([, theme]) => theme.typography.body1.fontSize);

    expect(new Set(spacings).size).toBe(modes.length);
    expect(new Set(bodySizes).size).toBeGreaterThan(1);
  });
});
