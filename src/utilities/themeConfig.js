/**
 * Theme Configuration - 4 Presentation Modes, One Design System
 *
 * Each mode is a different editorial format for the same content, not a recolour:
 * it owns its palette, typefaces, density, radii, motion character and - from
 * phase 2 onward - its arrangement. See docs/theme-modes-spec.md.
 *
 * What still holds every mode together, now that the display face no longer does:
 *   - JetBrains Mono appears in all four doing exactly one job: labels, codes,
 *     and the line that says where a number can be checked. It is the site's
 *     voice of citation, and it is the through-line.
 *   - Same content, same section ids, same heading order, same accessible names.
 *     Nav, section spy, hash links, tests and generate-seo.mjs never fork.
 *   - Radii come from RADIUS_SCALE. Modes differ within that set, never outside it.
 *   - Elevation: surfaces are separated by a 1px border and a background step.
 *     Shadows are reserved for true overlays (menu, drawer, dialog).
 *   - No gradients. The accent is a solid colour.
 *   - Motion is short, single-shot, and disabled under prefers-reduced-motion.
 *   - `warning` is the signal colour and is reserved for uncertainty - flagged
 *     readings, degraded health, unverified claims. It never decorates, and it
 *     is never the same value as `secondary` (forest-canopy shipped that bug).
 *
 * The one rule that keeps this maintainable: **no component may branch on
 * `theme.id`.** Components read `custom.layout` and switch on one named value.
 * AboutMe.jsx records why - it carried four hand-written per-theme layouts once
 * already, and they drifted apart until they were removed.
 *
 * Modes (ids are load-bearing - localStorage and the PostHog `portfolio_theme`
 * super property resolve by them, so only labels ever change):
 *   1. technical-precision - Instrument, dark cold, modular grid   (default)
 *   2. ocean-mist          - Exhibit, light neutral, plates and wall labels
 *   3. forest-canopy       - Notebook, warm dark, column and margin rail
 *   4. corporate-clean     - Ledger, light cool, ruled rows
 */

//  Shared design tokens

/**
 * The only corner radii any mode may use. Modes differ - a ledger sheet and a
 * gallery plate are square, an instrument panel is not - but they differ within
 * this set, so a stray 13px cannot appear. Guarded by performance.test.js.
 */
export const RADIUS_SCALE = [0, 2, 4, 8];

/**
 * Width of Notebook's margin rail, in pixels, shared by Section (which reserves
 * it) and SectionHeading (which sets its eyebrow out into it). One constant, so
 * the annotation and the text it annotates cannot drift out of alignment.
 */
export const RAIL_WIDTH = 180;

/**
 * MUI resolves `borderRadius: n` as `n * shape.borderRadius`, so each theme
 * pins shape.borderRadius to its own control radius.
 *
 * Consequence worth knowing before you reach for the shorthand: in a mode whose
 * control radius is 0 (Ledger, Exhibit) the whole `borderRadius: n` family
 * multiplies to 0, so `borderRadius: 2` is not a container there. Every call
 * site in src/components reads `theme.custom.radius.container` explicitly for
 * exactly this reason - keep it that way.
 */
const buildShape = (radius) => ({ borderRadius: radius.control });

/**
 * Elevation policy. Index 0-3 are flat, so <Paper>/<Card> (elevation 1) carry
 * no shadow. 4+ resolve to a single overlay shadow, which is what Menu (8),
 * Drawer (16) and Dialog (24) reach for.
 */
const buildShadows = (overlay) => [
  'none',
  'none',
  'none',
  'none',
  ...Array(21).fill(overlay),
];

/**
 * The repeated section reveal, per mode.
 *
 * Two ease keys because the page runs two animation libraries: `ease` is the
 * cubic array framer-motion wants, `gsapEase` the named curve GSAP wants. They
 * describe the same curve and should be changed together.
 *
 * This is the reveal that fires once per section on scroll. The Hero's
 * orchestrated timeline is a one-off composition and deliberately does not read
 * these - it sets its own beats.
 */
const buildMotion = ({ duration, distance, stagger, ease, gsapEase }) => ({
  duration,
  distance,
  stagger,
  ease,
  gsapEase,
});

/** Instrument - snap. A readout appears; it does not drift into place. */
const INSTRUMENT_MOTION = {
  duration: 0.28,
  distance: 8,
  stagger: 0.05,
  ease: [0.2, 0, 0, 1],
  gsapEase: 'power3.out',
};

/**
 * Ledger - near-none. A printed sheet does not animate. Distance and stagger
 * are zero, so the reveal is a short opacity step and nothing moves.
 */
const LEDGER_MOTION = {
  duration: 0.18,
  distance: 0,
  stagger: 0,
  ease: [0.4, 0, 0.2, 1],
  gsapEase: 'power1.out',
};

/** Notebook - slow ink. Long, soft, barely any travel, like paper settling. */
const NOTEBOOK_MOTION = {
  duration: 0.6,
  distance: 2,
  stagger: 0.1,
  ease: [0.25, 0, 0.2, 1],
  gsapEase: 'power1.out',
};

/** Exhibit - slow reveal. The longest travel in the set; objects are unveiled. */
const EXHIBIT_MOTION = {
  duration: 0.7,
  distance: 16,
  stagger: 0.12,
  ease: [0.16, 0, 0.2, 1],
  gsapEase: 'power2.out',
};

/**
 * Fallback vertical rhythm, in pixels, for a mode that does not state its own.
 *
 * 48/72 is what the nine hardcoded `py: { xs: 6, md: 9 }` sites rendered before
 * <Section> took the job over. The dead token this replaced claimed 80/88/80/64
 * despite nothing having read it since it was written, so the refactor shipped
 * at the real values first and the modes diverged from there. Density is one of
 * the four things a mode varies, so in practice all four override this.
 */
const STANDARD_SPACING = { xs: 48, md: 72 };

/**
 * The utility face, and the one typographic constant across all four modes.
 *
 * It used to be the display face that held the set together. Once the modes
 * diverge their layouts, a shared display face is not enough of a through-line
 * and is too much of a constraint - so the job moves here. JetBrains Mono
 * carries `overline` in every mode, which on this site means labels, channel
 * codes, and the line under a number saying where to check it. Every mode
 * speaks the same language when it cites something.
 */
const CODE_FONT = "'JetBrains Mono','ui-monospace','monospace'";

//  The display and body faces, one pair per mode.
//
//  Space Grotesk is no longer shared: it belongs to Instrument, where its
//  engineered letterforms - the flat-sided 'o', the cut terminals - read as
//  drawn rather than defaulted. Giving it to all four made it a default.

const SPACE_GROTESK = "'Space Grotesk','Helvetica Neue',sans-serif";
const IBM_PLEX_SANS = "'IBM Plex Sans',sans-serif";
/** Drawn for IBM's dense technical materials; headings that give rows room. */
const IBM_PLEX_CONDENSED = "'IBM Plex Sans Condensed','IBM Plex Sans',sans-serif";
/** Drawn for government forms and tables, which is exactly Ledger's job. */
const PUBLIC_SANS = "'Public Sans','Helvetica Neue',sans-serif";
const LORA = "'Lora',Georgia,serif";
/** A true didone. Fragile below ~16px, so Exhibit gives it h1/h2 only. */
const BODONI = "'Bodoni Moda','Didot',Georgia,serif";
const INTER = "'Inter','Helvetica Neue',sans-serif";

/**
 * Type scale, per mode.
 *
 * Display, body, size and leading all change per mode - four themes sharing one
 * scale and two of them sharing a body face was the defect this replaces.
 *
 * The three display sizes stay fluid: they track the viewport between phone and
 * desktop instead of stepping at breakpoints, so the hero name reaches real
 * display size on a wide screen without overflowing a 320px one.
 *
 * Everything below h3 is derived from `bodySize` rather than restated, so a
 * mode's density is one number and its small type cannot drift out of step with
 * its body.
 */
const buildTypography = ({
  display,
  body,
  h1,
  h2,
  h3,
  // Exhibit drops h3 to the body face: a didone at card-title size is fragile,
  // and a display face at 19px stops being expressive and starts being noise.
  h3Face = 'display',
  bodySize = 16,
  bodyLeading = 1.65,
}) => ({
  fontFamily: body,
  h1: { fontFamily: display, ...h1 },
  h2: { fontFamily: display, ...h2 },
  h3: { fontFamily: h3Face === 'display' ? display : body, ...h3 },
  h4: { fontFamily: body, fontSize: bodySize + 1, fontWeight: 600, lineHeight: 1.4 },
  h5: { fontFamily: body, fontSize: bodySize, fontWeight: 600, lineHeight: 1.5 },
  h6: { fontFamily: body, fontSize: bodySize - 2, fontWeight: 600, lineHeight: 1.5 },
  subtitle1: { fontFamily: body, fontSize: bodySize + 2, fontWeight: 400, lineHeight: 1.6 },
  subtitle2: { fontFamily: body, fontSize: bodySize - 2, fontWeight: 600, lineHeight: 1.5 },
  body1: { fontFamily: body, fontSize: bodySize, fontWeight: 400, lineHeight: bodyLeading },
  body2: { fontFamily: body, fontSize: bodySize - 2, fontWeight: 400, lineHeight: bodyLeading - 0.05 },
  button: { fontFamily: body, fontSize: bodySize - 2, fontWeight: 600, textTransform: 'none', lineHeight: 1.45 },
  caption: { fontFamily: body, fontSize: bodySize - 4, fontWeight: 400, lineHeight: 1.4 },
  overline: { fontFamily: CODE_FONT, fontSize: 11, fontWeight: 600, lineHeight: 1.45, letterSpacing: '0.12em', textTransform: 'uppercase' },
});

/**
 * Component overrides shared by every theme. Card and Paper are deliberately
 * flat: separation comes from the border, and hover changes the border colour
 * rather than lifting the card off the page.
 */
const buildComponents = ({ divider, hoverBorder, scrollThumb, hoverLift, radius, focusRing }) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: '0.5rem', height: '0.5rem' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: scrollThumb, borderRadius: radius.control },
      },
      // Never let a universal rule strip focus rings; make them explicit instead.
      //
      // The ring is the solid accent, not `hoverBorder`. Those are two jobs:
      // hoverBorder is a translucent tint for a card edge under the cursor, and
      // at 55-60% alpha it resolved to 2.86:1 on Exhibit and 2.97:1 on Notebook
      // - under the 3:1 that WCAG 1.4.11 requires of a focus indicator. A
      // keyboard user cannot see a ring tuned to be subtle.
      //
      // `body :focus-visible`, not `:focus-visible`. MUI's ButtonBase, Chip and
      // input styles each emit `outline: 0` on their own generated class, which
      // is specificity (0,1,0) - exactly what a bare pseudo-class scores. On a
      // tie the later stylesheet wins, and MUI's component styles are injected
      // after CssBaseline, so this rule lost on every button, chip and input on
      // the site. Adding the `body` type selector takes it to (0,1,1) and it
      // wins outright. Verified in a real browser: before this, tabbing to a nav
      // button computed `outline-style: none` while matching :focus-visible.
      'body :focus-visible': { outline: `2px solid ${focusRing}`, outlineOffset: 2 },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600, borderRadius: radius.control },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: radius.container,
        border: `1px solid ${divider}`,
        backgroundImage: 'none',
        boxShadow: 'none',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': { borderColor: hoverBorder, transform: hoverLift },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      rounded: { borderRadius: radius.container },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 600, borderRadius: radius.control },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: { root: { borderRadius: radius.control } },
  },
  MuiTab: {
    styleOverrides: { root: { textTransform: 'none', fontWeight: 500, minHeight: 48 } },
  },
  MuiDivider: {
    styleOverrides: { root: { borderColor: divider } },
  },
});

/**
 * How a mode arranges information, as data.
 *
 * This is the contract phases 2-6 build against, and the reason none of them
 * needs to know which theme is active: a component switches on one named value
 * here, never on `theme.id`. AboutMe.jsx records what happens otherwise - it
 * carried four hand-written per-theme layouts once already, and they were
 * removed because they drifted apart.
 *
 * The arrangement keys below carry their final values now so the contract is
 * stable, but nothing reads them yet. Wiring them up is phases 2-6.
 */
const buildLayout = ({
  id,
  sectionSpacing = STANDARD_SPACING,
  measure,
  gutter,
  surface,
  // `heading.align` and `heading.eyebrow` were in the phase 0 contract and came
  // out again: all four modes set them to 'left' and 'mono', so they were dead
  // keys describing a decision nothing acted on. The mono eyebrow is not a
  // per-mode choice anyway - it is the through-line, enforced by `overline` in
  // buildTypography.
  heading,
  hero,
  range,
  projects,
  experience,
  container = 'lg',
}) => ({
  id,
  container,
  sectionSpacing,
  // Body column width in `ch`. Denser modes run wider lines because their type
  // is smaller; airier modes run narrower ones because their type is not.
  measure,
  gutter,
  surface,
  // `heading.align` and `heading.eyebrow` were in the phase 0 contract and came
  // out again: all four modes set them to 'left' and 'mono', so they were dead
  // keys describing a decision nothing acted on. The mono eyebrow is not a
  // per-mode choice anyway - it is the through-line, enforced by `overline` in
  // buildTypography.
  heading,
  hero,
  range,
  projects,
  experience,
});

/** Tokens components read instead of re-declaring per-theme design maps. */
const buildCustom = ({ divider, hoverBorder, hoverLift, radius, motion, layout, displayFont, focusRing }) => ({
  radius,
  focusRing,
  card: {
    border: `1px solid ${divider}`,
    borderColor: divider,
    hoverBorderColor: hoverBorder,
    hoverTransform: hoverLift,
    boxShadow: 'none',
  },
  motion,
  layout,
  // The mode's display face, for the few places that set type outside the
  // heading scale - the hero lead line, the Range readouts. `headingFont` and
  // `bodyFont` used to sit here as bare family names and were read by nothing.
  displayFont,
  codeFont: CODE_FONT,
});

//  Theme 1: Technical Precision - the instrument ground (default)
//
//  Ground is a deep, desaturated blue-green black rather than the usual
//  blue-slate: it reads as a measuring instrument's screen, which is the
//  through-line of the work this site presents. The accent is a cold cyan for
//  what has been verified, and amber (`warning`) is held back exclusively for
//  what has not.

const TP = {
  // 0.22 resolved to roughly #252C33 over the ground, which against #101922
  // paper was a line the Range grid depends on and could barely show.
  divider: 'rgba(139,156,168,0.26)',
  hoverBorder: 'rgba(76,194,224,0.55)',
  focusRing: '#4CC2E0',
  overlay: '0 8px 24px rgba(0,0,0,0.55)',
  radius: { control: 4, container: 8 },
  motion: buildMotion(INSTRUMENT_MOTION),
  layout: buildLayout({
    id: 'instrument',
    sectionSpacing: { xs: 48, md: 80 },
    measure: 72,
    // A mono channel code runs down the left of each section, so the page reads
    // as numbered channels rather than stacked bands.
    gutter: 'channel',
    surface: 'card',
    heading: { rule: 'bar', count: false },
    hero: 'panel',
    range: 'grid',
    projects: 'cards',
    experience: 'timeline',
  }),
};

const technicalPrecision = {
  id: 'technical-precision',
  label: 'Technical Precision',
  mode: 'dark',
  palette: {
    mode: 'dark',
    primary: { main: '#4CC2E0', light: '#7BD6EC', dark: '#2A9CBA', contrastText: '#04161C' },
    // Steel, not a washed-out cyan. This is the second chart series and the
    // de-emphasised action - it has a job, rather than being a tint of primary
    // that nothing ever reaches for.
    secondary: { main: '#7C8FA3', light: '#9DABBB', dark: '#5B6B7C', contrastText: '#04161C' },
    // The deep ground makes the cyan readouts and the hairline dividers
    // register as drawn lines rather than tints.
    background: { default: '#080D12', paper: '#101922' },
    text: { primary: '#E6EDF3', secondary: '#8B9CA8', disabled: '#5A6874' },
    divider: TP.divider,
    error: { main: '#E5584B' },
    warning: { main: '#E8A33D' },
    info: { main: '#4CC2E0' },
    success: { main: '#3FBF87' },
  },
  typography: buildTypography({
    display: SPACE_GROTESK,
    body: IBM_PLEX_SANS,
    h1: { fontSize: 'clamp(2.5rem, 1.9rem + 3vw, 4rem)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.035em' },
    h2: { fontSize: 'clamp(1.75rem, 1.45rem + 1.3vw, 2.375rem)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.025em' },
    h3: { fontSize: 'clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem)', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.015em' },
    bodySize: 16,
    bodyLeading: 1.65,
  }),
  shape: buildShape(TP.radius),
  shadows: buildShadows(TP.overlay),
  components: buildComponents({ ...TP, scrollThumb: '#2A3947', hoverLift: 'translateY(-2px)' }),
  custom: buildCustom({ ...TP, hoverLift: 'translateY(-2px)', displayFont: SPACE_GROTESK }),
};

//  Theme 2: Ocean Mist - fluid, modern, light

const OM = {
  divider: '#DEDEDA',
  hoverBorder: 'rgba(107,45,92,0.55)',
  focusRing: '#6B2D5C',
  overlay: '0 8px 24px rgba(22,22,26,0.12)',
  // Plates are square. A gallery does not round the corners of what it hangs.
  radius: { control: 0, container: 0 },
  motion: buildMotion(EXHIBIT_MOTION),
  layout: buildLayout({
    id: 'exhibit',
    // Airiest of the four. The space between objects is the mode.
    sectionSpacing: { xs: 72, md: 128 },
    // Narrowest measure of the four: this mode's body runs at 17px with a lot
    // of air, and a wide line at that size stops being readable.
    measure: 62,
    gutter: 'none',
    surface: 'plate',
    // No rule under the heading. The air after it is the separator.
    heading: { rule: 'none', count: false },
    hero: 'plate',
    range: 'strip',
    projects: 'plates',
    experience: 'stack',
  }),
};

const oceanMist = {
  id: 'ocean-mist',
  label: 'Ocean Mist',
  mode: 'light',
  palette: {
    mode: 'light',
    // Plum takes the one hue region the other three modes leave open. Cyan,
    // indigo and green were spoken for, and three of the four swatches used to
    // sit in the cyan-to-green arc, so the picker showed one mood four times.
    primary: { main: '#6B2D5C', light: '#8A4077', dark: '#4E1F43', contrastText: '#FFFFFF' },
    // Brass, for the hairline above a wall-label credit line. #A8763E is 3.49:1
    // on the ground - rules and large labels only. `dark` is the small-text
    // variant at 4.94:1; reach for it anywhere brass carries running text.
    secondary: { main: '#A8763E', light: '#C08F55', dark: '#8A5F2E', contrastText: '#FFFFFF' },
    // Gallery grey, not white: the wall recedes so the plates read as objects
    // hung on it.
    background: { default: '#F1F1EF', paper: '#FFFFFF' },
    text: { primary: '#16161A', secondary: '#5A5A63', disabled: '#9A9AA3' },
    divider: OM.divider,
    error: { main: '#B3261E' },
    warning: { main: '#9A5B12' },
    info: { main: '#6B2D5C' },
    success: { main: '#2E6B3E' },
  },
  typography: buildTypography({
    display: BODONI,
    body: INTER,
    // A didone needs size to work. This is the largest h1 in the set by a wide
    // margin, and the tightest leading, because that is the point of the mode.
    h1: { fontSize: 'clamp(3rem, 2.2rem + 4vw, 5.25rem)', fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.02em' },
    h2: { fontSize: 'clamp(1.875rem, 1.5rem + 1.9vw, 2.875rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' },
    h3: { fontSize: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em' },
    h3Face: 'body',
    bodySize: 17,
    bodyLeading: 1.75,
  }),
  shape: buildShape(OM.radius),
  shadows: buildShadows(OM.overlay),
  components: buildComponents({ ...OM, scrollThumb: '#C4C4BE', hoverLift: 'translateY(-2px)' }),
  custom: buildCustom({ ...OM, hoverLift: 'translateY(-2px)', displayFont: BODONI }),
};

//  Theme 3: Forest Canopy - grounded, organic, warm dark ground

const FC = {
  divider: 'rgba(201,146,107,0.26)',
  hoverBorder: 'rgba(75,164,123,0.60)',
  focusRing: '#4BA47B',
  overlay: '0 8px 24px rgba(0,0,0,0.5)',
  radius: { control: 2, container: 4 },
  motion: buildMotion(NOTEBOOK_MOTION),
  layout: buildLayout({
    id: 'notebook',
    sectionSpacing: { xs: 56, md: 96 },
    measure: 66,
    // A margin rail carries dates, citations and annotations beside the column,
    // which is what makes this mode a record rather than a page.
    gutter: 'rail',
    surface: 'card',
    heading: { rule: 'rail', count: false },
    hero: 'cover',
    range: 'annotated',
    projects: 'entries',
    experience: 'rail',
  }),
};

const forestCanopy = {
  id: 'forest-canopy',
  label: 'Forest Canopy',
  mode: 'dark',
  palette: {
    mode: 'dark',
    primary: { main: '#4BA47B', light: '#6BBF97', dark: '#2D6A4F', contrastText: '#08170F' },
    // Tan is decorative: the margin rail, the rules, the annotation marks.
    secondary: { main: '#C9926B', light: '#DCAC89', dark: '#A5734F', contrastText: '#1A1A1A' },
    background: { default: '#12100D', paper: '#1C1915' },
    text: { primary: '#EDEBE7', secondary: '#A69F94', disabled: '#736E66' },
    divider: FC.divider,
    error: { main: '#E4574C' },
    // This used to be #D4A373 - the exact same value as `secondary`, in the one
    // theme whose secondary is used decoratively. The signal colour and the
    // decoration were indistinguishable, so a flagged reading looked like trim.
    // Saturated amber cannot be mistaken for the tan at a glance.
    warning: { main: '#F2B705' },
    info: { main: '#7FB3D5' },
    success: { main: '#4BA47B' },
  },
  typography: buildTypography({
    // The site's constant utility face, promoted to display. A lab notebook has
    // stamped headers over written body; this is that, inverted onto a serif.
    display: CODE_FONT,
    body: LORA,
    h1: { fontSize: 'clamp(1.9rem, 1.6rem + 1.2vw, 2.6rem)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '0.01em' },
    h2: { fontSize: 'clamp(1.3rem, 1.15rem + 0.65vw, 1.65rem)', fontWeight: 600, lineHeight: 1.25, letterSpacing: '0.01em' },
    h3: { fontSize: 'clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)', fontWeight: 600, lineHeight: 1.35, letterSpacing: '0.01em' },
    bodySize: 17,
    bodyLeading: 1.75,
  }),
  shape: buildShape(FC.radius),
  shadows: buildShadows(FC.overlay),
  components: buildComponents({ ...FC, scrollThumb: '#4A443C', hoverLift: 'translateY(-2px)' }),
  custom: buildCustom({ ...FC, hoverLift: 'translateY(-2px)', displayFont: CODE_FONT }),
};

//  Theme 4: Corporate Clean - clean, efficient, dense

const CC = {
  divider: '#D8DCE3',
  hoverBorder: '#3B37B8',
  focusRing: '#3B37B8',
  overlay: '0 8px 24px rgba(20,27,38,0.10)',
  // Documents are square.
  radius: { control: 0, container: 0 },
  motion: buildMotion(LEDGER_MOTION),
  layout: buildLayout({
    id: 'ledger',
    sectionSpacing: { xs: 40, md: 56 },
    // Widest measure of the four, because the body runs smallest here. Density
    // is the mode's whole argument.
    measure: 78,
    gutter: 'none',
    // Ruled rows, not cards. The only mode where a bordered box is wrong.
    surface: 'rule',
    heading: { rule: 'full', count: true },
    hero: 'masthead',
    range: 'table',
    projects: 'table',
    experience: 'table',
  }),
};

const corporateClean = {
  id: 'corporate-clean',
  label: 'Corporate Clean',
  mode: 'light',
  palette: {
    mode: 'light',
    // Stamp indigo - the ink an audited sheet gets marked with. The old primary
    // was slate and the old secondary an indigo that nothing ever rendered.
    primary: { main: '#3B37B8', light: '#524ECC', dark: '#2B2890', contrastText: '#FFFFFF' },
    secondary: { main: '#2E3440', light: '#49505F', dark: '#1B2029', contrastText: '#FFFFFF' },
    // Desk under sheet. This used to be `default: #FFFFFF, paper: #F8FAFC`,
    // which made paper darker than the ground - so cards read as recessed here
    // while the other three modes read them as raised, and the Range board
    // painted its panels white on off-white.
    background: { default: '#F4F5F7', paper: '#FFFFFF' },
    text: { primary: '#141B26', secondary: '#4A5568', disabled: '#8A94A6' },
    divider: CC.divider,
    error: { main: '#C0332B' },
    warning: { main: '#B45309' },
    info: { main: '#3B37B8' },
    success: { main: '#15803D' },
  },
  typography: buildTypography({
    display: IBM_PLEX_CONDENSED,
    body: PUBLIC_SANS,
    // The smallest scale in the set. Density is this mode's whole argument, and
    // a condensed display face is what lets dense rows keep their air.
    h1: { fontSize: 'clamp(2rem, 1.6rem + 1.6vw, 2.75rem)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.02em' },
    h2: { fontSize: 'clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.015em' },
    h3: { fontSize: 'clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    bodySize: 15,
    bodyLeading: 1.55,
  }),
  shape: buildShape(CC.radius),
  shadows: buildShadows(CC.overlay),
  // Ledger is the dense, static mode: no hover lift.
  components: buildComponents({ ...CC, scrollThumb: '#B6BDC8', hoverLift: 'none' }),
  custom: buildCustom({ ...CC, hoverLift: 'none', displayFont: IBM_PLEX_CONDENSED }),
};

//  Theme Registry

export const themePersonalities = {
  'technical-precision': technicalPrecision,
  'ocean-mist': oceanMist,
  'forest-canopy': forestCanopy,
  'corporate-clean': corporateClean,
};

/**
 * What the picker shows. The keys are the load-bearing part - localStorage and
 * the PostHog `portfolio_theme` super property resolve by them, so they never
 * change; labels do.
 *
 * These used to be paint-catalogue names. "Ocean Mist" describes a colour, and
 * once the modes carry their own layouts it would be pointing at the wrong
 * thing entirely. Each name now says what format the visitor is about to get.
 *
 * `descriptor` is unused until phase 7 adds it to the mode menu.
 */
export const themeLabels = {
  'technical-precision': {
    label: 'Instrument',
    mode: 'dark',
    swatch: '#4CC2E0',
    descriptor: 'Dense readouts on a dark ground',
  },
  'ocean-mist': {
    label: 'Exhibit',
    mode: 'light',
    swatch: '#6B2D5C',
    descriptor: 'Work hung as objects, with wall labels',
  },
  'forest-canopy': {
    label: 'Notebook',
    mode: 'dark',
    swatch: '#4BA47B',
    descriptor: 'One measured column and a margin rail',
  },
  'corporate-clean': {
    label: 'Ledger',
    mode: 'light',
    swatch: '#3B37B8',
    descriptor: 'Every claim as an audited row',
  },
};

export const getThemePersonality = (key) => themePersonalities[key] || technicalPrecision;

export const themeOrder = [
  'technical-precision',
  'ocean-mist',
  'forest-canopy',
  'corporate-clean',
];
