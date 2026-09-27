/**
 * The MUI theme: Casefile, the site's one design.
 *
 * Every page is plain CSS (styles/casefile.css, pages.css, tryit.css). What
 * MUI still draws - the ML analysis blocks on three case studies - has to look
 * like the same site, so this theme mirrors casefile.css's tokens. Change a
 * colour in both places; themeConfig.test.js fails if they drift.
 *
 * The theme is provided by components/MLCharts/InteractiveAnalysis.jsx, not at
 * the app's root, so MUI stays out of the bundle every visitor downloads.
 * COLORS and FONTS are plain values: the drawn figures import them directly.
 *
 * The site used to ship four switchable presentation modes. They were replaced
 * by this single design; the last version of them is kept in git at
 * refs/backup/pre-casefile-redesign.
 *
 * The rules this theme encodes:
 *   - Paper, ink, and two marks: highlighter yellow for what was verified,
 *     stamp red for what was flagged or uncertain. Neither decorates.
 *   - Instrument Serif for display, IBM Plex Sans to read, IBM Plex Mono for
 *     every label, file name and number (the `overline` variant).
 *   - Square corners and ruled lines. A surface is marked by a border, not a
 *     shadow; shadows are for true overlays (menus, drawers, dialogs).
 */

export const COLORS = {
  paper: '#E9ECEF',
  paperHi: '#F6F7F9',
  paperLo: '#DCE1E7',
  rule: '#C3CAD2',
  ink: '#0F1720',
  ink2: '#26344A',
  graphite: '#4A5563',
  stamp: '#D7263D',
  stampInk: '#B01E33',
  hl: '#FFD23F',
  night: '#0B1220',
  night2: '#131C2E',
  nightRule: '#27334A',
  moon: '#E6EAF0',
  moon2: '#A3AEBF',
  white: '#F7F9FB',
};

export const FONTS = {
  serif: "'Instrument Serif','Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif",
  sans: "'IBM Plex Sans','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
  mono: "'IBM Plex Mono',ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace",
};

/** The only corner radii the site uses. Square, with a slight softening for inputs. */
export const RADIUS_SCALE = [0, 2];
const RADIUS = { control: 0, container: 0 };

const overlayShadow = '0 18px 40px -22px rgba(15,23,32,0.5)';

export const casefileTheme = {
  palette: {
    mode: 'light',
    primary: { main: COLORS.ink, light: COLORS.ink2, dark: '#070B10', contrastText: COLORS.white },
    // The highlighter: verified, done, the one thing to look at.
    secondary: { main: COLORS.hl, light: '#FFE07A', dark: '#E0B41F', contrastText: COLORS.ink },
    background: { default: COLORS.paper, paper: COLORS.paperHi },
    text: { primary: COLORS.ink, secondary: COLORS.graphite, disabled: '#8A94A3' },
    divider: COLORS.rule,
    // The stamp: flagged, uncertain, failed.
    error: { main: COLORS.stamp, dark: COLORS.stampInk },
    warning: { main: '#A15C00' },
    info: { main: COLORS.ink2 },
    success: { main: '#1E7A4A' },
  },
  typography: {
    fontFamily: FONTS.sans,
    h1: { fontFamily: FONTS.serif, fontWeight: 400, fontSize: 'clamp(2.75rem, 1.8rem + 4.4vw, 5.5rem)', lineHeight: 0.95, letterSpacing: '-0.01em' },
    h2: { fontFamily: FONTS.serif, fontWeight: 400, fontSize: 'clamp(2rem, 1.5rem + 2.4vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.005em' },
    h3: { fontFamily: FONTS.serif, fontWeight: 400, fontSize: 'clamp(1.5rem, 1.3rem + 0.9vw, 2rem)', lineHeight: 1.1 },
    h4: { fontFamily: FONTS.sans, fontSize: 19, fontWeight: 600, lineHeight: 1.35 },
    h5: { fontFamily: FONTS.sans, fontSize: 17, fontWeight: 600, lineHeight: 1.45 },
    h6: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.45 },
    subtitle1: { fontSize: 19, lineHeight: 1.55 },
    subtitle2: { fontSize: 15, fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: 17, lineHeight: 1.6 },
    body2: { fontSize: 15, lineHeight: 1.55 },
    button: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: 500, textTransform: 'none', lineHeight: 1.4 },
    caption: { fontSize: 13, lineHeight: 1.45 },
    overline: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },
  shape: { borderRadius: RADIUS.control },
  shadows: ['none', 'none', 'none', 'none', ...Array(21).fill(overlayShadow)],
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: { borderRadius: 0, minHeight: 44, paddingInline: 18 },
        contained: { backgroundColor: COLORS.ink, color: COLORS.white, '&:hover': { backgroundColor: COLORS.ink2 } },
        outlined: { border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, '&:hover': { border: `1.5px solid ${COLORS.ink}`, backgroundColor: 'rgba(15,23,32,0.07)' } },
        text: { color: COLORS.ink, textDecoration: 'underline', textUnderlineOffset: 4, '&:hover': { backgroundColor: 'transparent', textDecorationThickness: 2 } },
      },
    },
    MuiIconButton: { defaultProps: { disableRipple: true }, styleOverrides: { root: { borderRadius: 0 } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { borderRadius: 0, border: `1px solid ${COLORS.rule}`, backgroundColor: COLORS.paperHi, backgroundImage: 'none' } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: 0 } } },
    MuiChip: {
      styleOverrides: {
        // A finding longer than a phone is wide wraps onto a second line
        // instead of ending in an ellipsis.
        root: { borderRadius: 0, fontFamily: FONTS.mono, fontWeight: 500, fontSize: 12.5, letterSpacing: '0.02em', maxWidth: '100%', height: 'auto', minHeight: 32, '&.MuiChip-sizeSmall': { minHeight: 24 } },
        label: { whiteSpace: 'normal', overflowWrap: 'anywhere', paddingTop: 3, paddingBottom: 3 },
        filled: { backgroundColor: COLORS.ink, color: COLORS.white },
        outlined: { borderColor: COLORS.rule, backgroundColor: COLORS.paper },
      },
    },
    MuiLink: { styleOverrides: { root: { color: COLORS.ink, textUnderlineOffset: 4 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, minHeight: 44 } } },
    MuiDivider: { styleOverrides: { root: { borderColor: COLORS.rule } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 0 } } },
  },
  /*
   * Tokens the MUI-built pages read directly. `codeFont` and `displayFont`
   * name the mono and serif faces; `radius` is kept as an object because the
   * case-study page styles markdown with it.
   */
  custom: {
    colors: COLORS,
    fonts: FONTS,
    codeFont: FONTS.mono,
    displayFont: FONTS.serif,
    radius: RADIUS,
    // A figure's recessive series - the option nobody chose.
    chart: { baseline: '#8A94A3' },
    motion: { duration: 0.45, distance: 14, stagger: 0.06, gsapEase: 'power2.out' },
  },
};

export default casefileTheme;
