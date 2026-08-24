import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// The eager set is exactly Instrument's pair plus the utility face: Space
// Grotesk (its display), IBM Plex Sans (its body) and JetBrains Mono, which
// carries labels and evidence lines in every mode and so can never be deferred.
// Instrument is the default, so this is the fonts one visitor needs and no more
// - the other three modes pull their own pair on demand in useThemeFonts below.
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Toolbar } from '@mui/material';
import { getThemePersonality } from './utilities/themeConfig';
import PageTransition from './components/PageTransition/PageTransition';
import DrawerAppBar from './components/DrawerAppBar/DrawerAppBar';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
import SiteFooter from './components/SiteFooter/SiteFooter';
import ConsentBanner from './components/ConsentBanner/ConsentBanner';
import { MotionConfig } from 'framer-motion';
import { usePostHog } from '@posthog/react';

// Lazy load pages for code splitting - reduces initial bundle size
const Home = lazy(() => import('./pages/Home'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const FullstackPortfolio = lazy(() => import('./pages/FullstackPortfolio'));
const DesktopPortfolio = lazy(() => import('./pages/DesktopPortfolio'));
const AndroidPortfolio = lazy(() => import('./pages/AndroidPortfolio'));
const MLPortfolio = lazy(() => import('./pages/MLPortfolio'));
const AboutPanda = lazy(() => import('./pages/AboutPanda'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

// Context to share theme switching
const ThemeContext = React.createContext({
  current: 'technical-precision',
  setTheme: (_name, _origin) => { },
});

export const useAppTheme = () => React.useContext(ThemeContext);

/**
 * Loads the font families a theme needs, once, the first time it is selected.
 * Keeps the initial payload to one family instead of the six that were
 * previously imported up front.
 */
const THEME_FONTS = {
  // Exhibit: Bodoni Moda for h1/h2, Inter for everything else.
  'ocean-mist': () => Promise.all([
    import('@fontsource/bodoni-moda/700.css'),
    import('@fontsource/inter/400.css'),
    import('@fontsource/inter/500.css'),
  ]),
  // Notebook: Lora only - its display face is JetBrains Mono, already eager.
  'forest-canopy': () => Promise.all([
    import('@fontsource/lora/400.css'),
    import('@fontsource/lora/600.css'),
  ]),
  // Ledger: no longer shares Instrument's body face, so it has its own pair.
  'corporate-clean': () => Promise.all([
    import('@fontsource/ibm-plex-sans-condensed/600.css'),
    import('@fontsource/public-sans/400.css'),
    import('@fontsource/public-sans/600.css'),
  ]),
};

// Per weight, not per family: `import('@fontsource/inter')` pulled every weight
// the family ships, which for a mode that uses two of them is most of a
// megabyte spent on faces nothing renders.
const loadedFonts = new Set(['technical-precision']);

const useThemeFonts = (themeKey) => {
  useEffect(() => {
    if (loadedFonts.has(themeKey)) return;
    const load = THEME_FONTS[themeKey];
    if (!load) return;
    loadedFonts.add(themeKey);
    load().catch(() => loadedFonts.delete(themeKey));
  }, [themeKey]);
};

/**
 * Registers the active theme as a super property, so every event PostHog sends
 * carries the personality the visitor was actually looking at. Without it there
 * is no way to tell whether the people who reach the case studies came through
 * one theme more than another - only that the switcher got used.
 */
const useThemeSuperProperty = (themeKey) => {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.register({ portfolio_theme: themeKey });
  }, [themeKey, posthog]);
};

/** Chrome shared by every route: one app bar, the page, then the footer. */
const PageShell = ({ children }) => (
  <>
    <ScrollProgress />
    <DrawerAppBar />
    <Toolbar />
    <PageTransition>{children}</PageTransition>
    <SiteFooter />
  </>
);

const ToggleThemeProvider = () => {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'technical-precision';
  });

  useEffect(() => {
    localStorage.setItem('portfolio-theme', themeKey);
  }, [themeKey]);

  useThemeFonts(themeKey);
  useThemeSuperProperty(themeKey);

  /**
   * Theme changes sweep in as an expanding circle from the control that asked
   * for them, via the View Transitions API. The browser snapshots the old
   * theme, the new one renders underneath, and the clip circle grown over the
   * snapshot is what the visitor sees - no gradient, no fade, one wipe.
   *
   * Falls back to an instant switch when the API is missing (jsdom, older
   * Firefox/Safari) or the visitor prefers reduced motion.
   */
  const setTheme = useCallback((name, origin) => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduceMotion) {
      setThemeKey(name);
      return;
    }

    const x = origin?.x ?? window.innerWidth - 48;
    const y = origin?.y ?? 32;
    // Radius to the farthest viewport corner, so the circle always covers it.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => setThemeKey(name));
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => {
        // Snapshot can fail mid-navigation; the theme has still switched.
      });
  }, []);

  const personality = React.useMemo(() => getThemePersonality(themeKey), [themeKey]);
  const theme = React.useMemo(() => createTheme(personality), [personality]);

  const contextValue = React.useMemo(
    () => ({ current: themeKey, setTheme }),
    [themeKey, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {/*
          * One reduced-motion policy for every framer-motion animation on the
          * site, rather than a guard each component has to remember. The four
          * modes carry four motion characters and the slowest travels 16px over
          * 0.7s, so anyone who asked their system for less motion has to get it
          * everywhere - including in components nobody has touched in months.
          *
          * `user` disables transform and layout animations and leaves opacity
          * alone, which is the right trade: what people ask to be rid of is
          * movement. It does NOT cover height or size animations, so an
          * expanding panel still needs its own check - see experienceParts.
          */}
        <MotionConfig reducedMotion="user">
        <CssBaseline />
        <ConsentBanner />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* Pageviews are captured by PostHog itself via capture_pageview:
              'history_change' in index.jsx - it hooks the history API, so
              react-router navigations are picked up without a tracker here. */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<PageShell><Home /></PageShell>} />
              <Route path="/about" element={<Navigate to="/" replace />} />
              <Route path="/projects/:projectId" element={<PageShell><ProjectDetail /></PageShell>} />
              <Route path="/fullstack" element={<PageShell><FullstackPortfolio /></PageShell>} />
              <Route path="/desktop" element={<PageShell><DesktopPortfolio /></PageShell>} />
              <Route path="/android" element={<PageShell><AndroidPortfolio /></PageShell>} />
              <Route path="/ml" element={<PageShell><MLPortfolio /></PageShell>} />
              <Route path="/about-panda" element={<PageShell><AboutPanda /></PageShell>} />
              <Route path="*" element={<PageShell><NotFound /></PageShell>} />
            </Routes>
          </Suspense>
        </Router>
        </MotionConfig>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ToggleThemeProvider;
