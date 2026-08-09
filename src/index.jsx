import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ToggleThemeProvider from './App';

import posthog from 'posthog-js';
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react';

/**
 * Analytics.
 *
 * The key is inlined at build time by Vite, so a build run without a .env (CI,
 * a fresh clone) produces a bundle with no token. posthog.init would then fail
 * silently and the site would look fine while collecting nothing, so the guard
 * below skips init and says so in the console instead.
 *
 * `defaults: '2026-01-30'` also flags localhost traffic as internal
 * (internal_or_test_user_hostname), so local development does not pollute the
 * production numbers.
 */
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-01-30',

    // 'history_change' covers the SPA: PostHog captures the initial view on
    // init and every react-router navigation after it, via the history API.
    // Setting this to false previously also suppressed $pageleave, which is
    // what time-on-page is derived from.
    capture_pageview: 'history_change',
    capture_pageleave: true,

    // Core Web Vitals reported against real visitors rather than a lab run.
    capture_performance: { web_vitals: true },

    // Drives the consent banner. Until a visitor answers - and permanently if
    // they decline - PostHog writes nothing to their device and identifies them
    // with a server-side hash instead, so declining costs a page count rather
    // than the whole visit. Accepting switches on cookies and session replay.
    // NOTE: cookieless mode must also be enabled in the PostHog project
    // settings, or cookieless events are discarded on ingest.
    cookieless_mode: 'on_reject',

    // Autocapture is what makes heatmaps and the dead-click report work. On a
    // site whose whole job is getting people to the case studies and the
    // resume, that is the most useful signal available for zero code.
    autocapture: true,

    disable_session_recording: false,
    session_recording: {
      // A user-supplied session_recording object replaces the date-gated
      // default wholesale rather than merging, so strictMinimumDuration - which
      // `defaults: '2026-01-30'` would otherwise switch on - is repeated here.
      strictMinimumDuration: true,
      // The contact form is the only place a visitor types anything. Inputs are
      // masked, and .ph-no-capture on an element blocks its whole subtree.
      maskAllInputs: true,
      blockClass: 'ph-no-capture',
    },
  });
} else if (import.meta.env.DEV) {
  console.warn(
    '[posthog] VITE_PUBLIC_POSTHOG_KEY is not set - analytics are disabled for this build. ' +
      'Copy .env.example to .env to enable them locally.'
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary>
      <ToggleThemeProvider />
    </PostHogErrorBoundary>
  </PostHogProvider>
);
