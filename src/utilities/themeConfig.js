/**
 * Theme Configuration - 4 Personalities, One Design System
 *
 * Each theme owns its palette and body typeface. Everything structural - the
 * display face, corner radii, elevation, motion, spacing - is shared, so the
 * four themes read as four moods of one product rather than four websites.
 *
 * Shared rules (do not diverge per theme):
 *   - Display face is Space Grotesk in every theme. It carries the identity;
 *     the body face carries the mood. A theme that changed both would be a
 *     different site wearing the same URL.
 *   - Radius: 4px for controls, 8px for containers, 50% for avatars. Nothing else.
 *   - Elevation: surfaces are separated by a 1px border and a background step.
 *     Shadows are reserved for true overlays (menu, drawer, dialog).
 *   - No gradients. The accent is a solid colour.
 *   - Motion: short, single-shot, and disabled under prefers-reduced-motion.
 *   - `warning` is the signal colour and is reserved for uncertainty - flagged
 *     readings, degraded health, unverified claims. It never decorates.
 *
 * Personalities:
 *   1. technical-precision - dark instrument ground, cold cyan   (default)
 *   2. ocean-mist          - light, cyan, airy
 *   3. forest-canopy       - warm dark, green and tan
 *   4. corporate-clean     - light, slate, dense
 */

//  Shared design tokens

/** The only two corner radii in the system. */
export const RADIUS = { control: 4, container: 8 };

/**
 * MUI resolves `borderRadius: n` as `n * shape.borderRadius`, so every theme
 * pins shape.borderRadius to RADIUS.control. That makes `borderRadius: 1` a
 * control (4px) and `borderRadius: 2` a container (8px) in every theme.
 */
const SHAPE = { borderRadius: RADIUS.control };

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

const MOTION = {
  duration: 0.35,
  easing: [0.4, 0, 0.2, 1],
  stagger: 0.06,
  distance: 8,
};

const CODE_FONT = "'JetBrains Mono','ui-monospace','monospace'";

/**
 * The display face, shared by every theme. Space Grotesk is a grotesque with
 * slightly engineered letterforms - the flat-sided 'o', the cut terminals - so
 * headings read as drawn rather than defaulted, without tipping into a novelty
 * face. It is used for h1-h3 only; below that the body face takes over, because
 * a display face at 17px stops being expressive and starts being noise.
 */
const DISPLAY_FONT = "'Space Grotesk','sans-serif'";

/**
 * Type scale shared by all themes. Only the body family changes per personality.
 * Three heading levels do real work: h1 page title, h2 section, h3 card.
 * Space Grotesk sets tight, so h1/h2 carry negative tracking.
 */
const buildTypography = ({ body, heading = DISPLAY_FONT, headingWeight = 600 }) => ({
  fontFamily: body,
  // The three display sizes are fluid: they track the viewport between phone
  // and desktop instead of stepping at breakpoints, so the hero name reaches
  // real display size on a wide screen without overflowing a 320px one.
  h1: {
    fontFamily: heading,
    fontSize: 'clamp(2.625rem, 1.9rem + 3.2vw, 4.25rem)',
    fontWeight: 700,
    lineHeight: 1.04,
    letterSpacing: '-0.035em',
  },
  h2: {
    fontFamily: heading,
    fontSize: 'clamp(1.75rem, 1.45rem + 1.3vw, 2.375rem)',
    fontWeight: headingWeight,
    lineHeight: 1.15,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontFamily: heading,
    fontSize: 'clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem)',
    fontWeight: headingWeight,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h4: { fontFamily: body, fontSize: 17, fontWeight: 600, lineHeight: 1.4 },
  h5: { fontFamily: body, fontSize: 16, fontWeight: 600, lineHeight: 1.5 },
  h6: { fontFamily: body, fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
  subtitle1: { fontFamily: body, fontSize: 18, fontWeight: 400, lineHeight: 1.6 },
  subtitle2: { fontFamily: body, fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
  body1: { fontFamily: body, fontSize: 16, fontWeight: 400, lineHeight: 1.65 },
  body2: { fontFamily: body, fontSize: 14, fontWeight: 400, lineHeight: 1.6 },
  button: { fontFamily: body, fontSize: 14, fontWeight: 600, textTransform: 'none', lineHeight: 1.45 },
  caption: { fontFamily: body, fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
  overline: { fontFamily: CODE_FONT, fontSize: 11, fontWeight: 600, lineHeight: 1.45, letterSpacing: '0.12em', textTransform: 'uppercase' },
});

/**
 * Component overrides shared by every theme. Card and Paper are deliberately
 * flat: separation comes from the border, and hover changes the border colour
 * rather than lifting the card off the page.
 */
const buildComponents = ({ divider, hoverBorder, scrollThumb, hoverLift }) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: '0.5rem', height: '0.5rem' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: scrollThumb, borderRadius: RADIUS.control },
      },
      // Never let a universal rule strip focus rings; make them explicit instead.
      ':focus-visible': { outline: `2px solid ${hoverBorder}`, outlineOffset: 2 },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600, borderRadius: RADIUS.control },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: RADIUS.container,
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
      rounded: { borderRadius: RADIUS.container },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 600, borderRadius: RADIUS.control },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: { root: { borderRadius: RADIUS.control } },
  },
  MuiTab: {
    styleOverrides: { root: { textTransform: 'none', fontWeight: 500, minHeight: 48 } },
  },
  MuiDivider: {
    styleOverrides: { root: { borderColor: divider } },
  },
});

/** Tokens components read instead of re-declaring per-theme design maps. */
const buildCustom = ({ divider, hoverBorder, hoverLift, sectionSpacing, headingFont, bodyFont }) => ({
  radius: RADIUS,
  card: {
    border: `1px solid ${divider}`,
    borderColor: divider,
    hoverBorderColor: hoverBorder,
    hoverTransform: hoverLift,
    boxShadow: 'none',
  },
  motion: MOTION,
  sectionSpacing,
  headingFont,
  bodyFont,
  displayFont: DISPLAY_FONT,
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
  divider: 'rgba(139,156,168,0.22)',
  hoverBorder: 'rgba(76,194,224,0.55)',
  overlay: '0 8px 24px rgba(0,0,0,0.55)',
};

const technicalPrecision = {
  id: 'technical-precision',
  label: 'Technical Precision',
  mode: 'dark',
  palette: {
    mode: 'dark',
    primary: { main: '#4CC2E0', light: '#7BD6EC', dark: '#2A9CBA', contrastText: '#04161C' },
    secondary: { main: '#8FB8C9', light: '#B0CEDA', dark: '#65909F', contrastText: '#04161C' },
    // A step darker than before: the deeper ground makes the cyan readouts
    // and the hairline dividers register as drawn lines rather than tints.
    background: { default: '#080D12', paper: '#101922' },
    text: { primary: '#E6EDF3', secondary: '#8B9CA8', disabled: '#5A6874' },
    divider: TP.divider,
    error: { main: '#E5584B' },
    warning: { main: '#E8A33D' },
    info: { main: '#4CC2E0' },
    success: { main: '#3FBF87' },
  },
  typography: buildTypography({ body: "'IBM Plex Sans','sans-serif'" }),
  shape: SHAPE,
  shadows: buildShadows(TP.overlay),
  components: buildComponents({ ...TP, scrollThumb: '#2A3947', hoverLift: 'translateY(-2px)' }),
  custom: buildCustom({
    ...TP,
    hoverLift: 'translateY(-2px)',
    sectionSpacing: 80,
    headingFont: 'Space Grotesk',
    bodyFont: 'IBM Plex Sans',
  }),
};

//  Theme 2: Ocean Mist - fluid, modern, light

const OM = {
  divider: 'rgba(15,23,42,0.10)',
  hoverBorder: 'rgba(8,145,178,0.55)',
  overlay: '0 8px 24px rgba(15,23,42,0.12)',
};

const oceanMist = {
  id: 'ocean-mist',
  label: 'Ocean Mist',
  mode: 'light',
  palette: {
    mode: 'light',
    primary: { main: '#0E7490', light: '#0891B2', dark: '#155E75', contrastText: '#FFFFFF' },
    secondary: { main: '#0F766E', light: '#0D9488', dark: '#115E59', contrastText: '#FFFFFF' },
    // A touch cooler and dimmer than the paper, so white cards read as raised
    // surfaces without needing a shadow to say so.
    background: { default: '#F1F6F8', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569', disabled: '#94A3B8' },
    divider: OM.divider,
    error: { main: '#DC2626' },
    warning: { main: '#B45309' },
    info: { main: '#2563EB' },
    success: { main: '#15803D' },
  },
  typography: buildTypography({ body: "'Inter','sans-serif'" }),
  shape: SHAPE,
  shadows: buildShadows(OM.overlay),
  components: buildComponents({ ...OM, scrollThumb: '#CBD5E1', hoverLift: 'translateY(-2px)' }),
  custom: buildCustom({
    ...OM,
    hoverLift: 'translateY(-2px)',
    sectionSpacing: 88,
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
  }),
};

//  Theme 3: Forest Canopy - grounded, organic, warm dark ground

const FC = {
  divider: 'rgba(212,163,115,0.20)',
  hoverBorder: 'rgba(64,145,108,0.60)',
  overlay: '0 8px 24px rgba(0,0,0,0.5)',
};

const forestCanopy = {
  id: 'forest-canopy',
  label: 'Forest Canopy',
  mode: 'dark',
  palette: {
    mode: 'dark',
    primary: { main: '#40916C', light: '#52B788', dark: '#2D6A4F', contrastText: '#08170F' },
    secondary: { main: '#D4A373', light: '#E9C46A', dark: '#BC6C25', contrastText: '#1A1A1A' },
    background: { default: '#12100D', paper: '#1D1A15' },
    text: { primary: '#EDEBE7', secondary: '#A69F94', disabled: '#736E66' },
    divider: FC.divider,
    error: { main: '#EF4444' },
    warning: { main: '#D4A373' },
    info: { main: '#60A5FA' },
    success: { main: '#4ADE80' },
  },
  typography: buildTypography({ body: "'Source Sans Pro','sans-serif'" }),
  shape: SHAPE,
  shadows: buildShadows(FC.overlay),
  components: buildComponents({ ...FC, scrollThumb: '#4A443C', hoverLift: 'translateY(-2px)' }),
  custom: buildCustom({
    ...FC,
    hoverLift: 'translateY(-2px)',
    sectionSpacing: 80,
    headingFont: 'Space Grotesk',
    bodyFont: 'Source Sans Pro',
  }),
};

//  Theme 4: Corporate Clean - clean, efficient, dense

const CC = {
  divider: '#E2E8F0',
  hoverBorder: '#94A3B8',
  overlay: '0 8px 24px rgba(15,23,42,0.10)',
};

const corporateClean = {
  id: 'corporate-clean',
  label: 'Corporate Clean',
  mode: 'light',
  palette: {
    mode: 'light',
    primary: { main: '#334155', light: '#475569', dark: '#1E293B', contrastText: '#FFFFFF' },
    secondary: { main: '#4F46E5', light: '#6366F1', dark: '#4338CA', contrastText: '#FFFFFF' },
    background: { default: '#FFFFFF', paper: '#F8FAFC' },
    text: { primary: '#0F172A', secondary: '#475569', disabled: '#94A3B8' },
    divider: CC.divider,
    error: { main: '#DC2626' },
    warning: { main: '#B45309' },
    info: { main: '#2563EB' },
    success: { main: '#15803D' },
  },
  typography: buildTypography({ body: "'IBM Plex Sans','sans-serif'" }),
  shape: SHAPE,
  shadows: buildShadows(CC.overlay),
  // Corporate Clean is the dense, static personality: no hover lift.
  components: buildComponents({ ...CC, scrollThumb: '#CBD5E1', hoverLift: 'none' }),
  custom: buildCustom({
    ...CC,
    hoverLift: 'none',
    sectionSpacing: 64,
    headingFont: 'Space Grotesk',
    bodyFont: 'IBM Plex Sans',
  }),
};

//  Theme Registry

export const themePersonalities = {
  'technical-precision': technicalPrecision,
  'ocean-mist': oceanMist,
  'forest-canopy': forestCanopy,
  'corporate-clean': corporateClean,
};

export const themeLabels = {
  'technical-precision': { label: 'Technical Precision', mode: 'dark', swatch: '#4CC2E0' },
  'ocean-mist': { label: 'Ocean Mist', mode: 'light', swatch: '#0E7490' },
  'forest-canopy': { label: 'Forest Canopy', mode: 'dark', swatch: '#40916C' },
  'corporate-clean': { label: 'Corporate Clean', mode: 'light', swatch: '#334155' },
};

export const getThemePersonality = (key) => themePersonalities[key] || technicalPrecision;

export const themeOrder = [
  'technical-precision',
  'ocean-mist',
  'forest-canopy',
  'corporate-clean',
];
