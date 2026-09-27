import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/casefile.css';
import './styles/pages.css';

// Casefile's three faces, bundled rather than fetched from Google: Instrument
// Serif for display, IBM Plex Sans to read, IBM Plex Mono for every label and
// number. Only the weights the design uses.
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';

// No MUI here, on purpose: every page is plain CSS, and a provider at the
// root would put MUI and emotion in the bundle every visitor downloads. The
// two things MUI still draws - the ML analysis blocks - bring their own theme
// (components/MLCharts/InteractiveAnalysis.jsx), inside a lazily loaded chunk.
// The base styles CssBaseline used to inject are in styles/casefile.css.
import { usePostHog } from '@posthog/react';
import { MotionProvider, useMotion } from './motion/Motion';
import PageTransition from './components/PageTransition/PageTransition';
import SiteHeader from './components/site/SiteHeader';
import SiteFooter from './components/site/SiteFooter';
import ConsentBanner from './components/ConsentBanner/ConsentBanner';

// Every route is code-split; the home page is the only one most visitors load.
const Home = lazy(() => import('./pages/Home'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const FullstackPortfolio = lazy(() => import('./pages/FullstackPortfolio'));
const DesktopPortfolio = lazy(() => import('./pages/DesktopPortfolio'));
const AndroidPortfolio = lazy(() => import('./pages/AndroidPortfolio'));
const MLPortfolio = lazy(() => import('./pages/MLPortfolio'));
const Background = lazy(() => import('./pages/Background'));
const AboutPanda = lazy(() => import('./pages/AboutPanda'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <div role="status" aria-live="polite" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
    <span className="mono" style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--graphite)' }}>
      Opening the file…
    </span>
  </div>
);

/**
 * Tags every PostHog event with the design the visitor saw and whether motion
 * was on, so the redesign can be compared with what came before it and the
 * scroll stories with the still version.
 */
const useDesignSuperProperties = () => {
  const posthog = usePostHog();
  const { motionOn } = useMotion();
  useEffect(() => {
    posthog?.register({ portfolio_design: 'casefile', motion_on: motionOn });
  }, [posthog, motionOn]);
};

/** Chrome shared by every route: skip link, header, the page, footer. */
const PageShell = ({ children }) => {
  useDesignSuperProperties();
  return (
    <>
      <div id="top" />
      <a className="skip" href="#main">Skip to content</a>
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
};

const page = (el) => <PageShell>{el}</PageShell>;

const App = () => (
  <MotionProvider>
    <ConsentBanner />
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Pageviews are captured by PostHog itself via capture_pageview:
          'history_change' in index.jsx. */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={page(<Home />)} />
          {/* The About narrative lives on /background now. */}
          <Route path="/about" element={<Navigate to="/background" replace />} />
          <Route path="/projects/:projectId" element={page(<ProjectDetail />)} />
          <Route path="/fullstack" element={page(<FullstackPortfolio />)} />
          <Route path="/desktop" element={page(<DesktopPortfolio />)} />
          <Route path="/android" element={page(<AndroidPortfolio />)} />
          <Route path="/ml" element={page(<MLPortfolio />)} />
          <Route path="/background" element={page(<Background />)} />
          <Route path="/about-panda" element={page(<AboutPanda />)} />
          <Route path="*" element={page(<NotFound />)} />
        </Routes>
      </Suspense>
    </Router>
  </MotionProvider>
);

export default App;
