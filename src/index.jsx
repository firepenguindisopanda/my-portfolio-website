import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import posthog from 'posthog-js';
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react';
import posthogOptions from './utilities/posthogOptions';

/**
 * Analytics.
 *
 * The key is inlined at build time by Vite, so a build run without a .env (CI,
 * a fresh clone) produces a bundle with no token. posthog.init would then fail
 * silently and the site would look fine while collecting nothing, so the guard
 * below skips init and says so in the console instead.
 *
 * The settings, and who is counted under each answer to the cookie banner,
 * are in utilities/posthogOptions.js.
 */
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, posthogOptions(import.meta.env.VITE_PUBLIC_POSTHOG_HOST));
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
      <App />
    </PostHogErrorBoundary>
  </PostHogProvider>
);
