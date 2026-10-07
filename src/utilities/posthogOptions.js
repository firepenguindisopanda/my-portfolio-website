/**
 * PostHog's settings, kept apart from index.jsx so a test can run the real
 * client with exactly these and check who gets counted, and how
 * (__tests__/analytics.test.js).
 *
 * Who is counted, by what they did with the cookie banner:
 *   - not answered yet, or never: counted anonymously, nothing stored on
 *     their device (cookieless; PostHog identifies them with a privacy-
 *     preserving hash on its servers);
 *   - declined: the same;
 *   - accepted: cookies and local storage as usual, and session replay.
 *
 * NOTE: cookieless mode must also be enabled in the PostHog project settings,
 * or the anonymous events are discarded on ingest.
 */
const posthogOptions = (apiHost) => ({
  api_host: apiHost || 'https://us.i.posthog.com',
  // Also flags localhost traffic as internal (internal_or_test_user_hostname),
  // so local development does not pollute the production numbers.
  defaults: '2026-01-30',

  // 'history_change' covers the SPA: PostHog captures the initial view on
  // init and every react-router navigation after it, via the history API.
  // Setting this to false previously also suppressed $pageleave, which is
  // what time-on-page is derived from.
  capture_pageview: 'history_change',
  capture_pageleave: true,

  // Core Web Vitals reported against real visitors rather than a lab run.
  capture_performance: { web_vitals: true },

  // Drives the consent banner. A visitor who declines is counted without
  // cookies. On its own, 'on_reject' counts nobody until the banner is
  // answered, so a visitor who ignored it and left was never seen.
  // opt_out_capturing_by_default treats "not answered" like "declined" until
  // they answer: counted, with nothing written to their device. The banner
  // still asks (their answer stays "pending"), and Accept switches on cookies
  // and session replay as before.
  cookieless_mode: 'on_reject',
  opt_out_capturing_by_default: true,

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

export default posthogOptions;
