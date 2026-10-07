import React, { useState } from 'react';
import { usePostHog } from '@posthog/react';

/**
 * Cookie consent for analytics.
 *
 * PostHog is initialised with `cookieless_mode: 'on_reject'` and
 * `opt_out_capturing_by_default: true` (utilities/posthogOptions.js), which
 * make the three states behave like this (the second setting is what makes
 * "pending" count: without it nothing is captured until the banner is
 * answered; __tests__/analytics.test.js checks all three):
 *
 *   pending  - treated as opted out, so nothing is written to cookies or local
 *              storage, but events still flow in cookieless mode. Identity is a
 *              privacy-preserving hash computed on PostHog's servers, so
 *              pageviews and visitor counts survive even if nobody ever answers
 *              the banner. Session replay does not run.
 *   accepted - the instance resets, cookies and local storage begin, and
 *              session replay starts.
 *   rejected - stays cookieless permanently.
 *
 * The consent answer itself is stored under `__ph_opt_in_out_<token>` in local
 * storage. That is "strictly necessary" storage under ePrivacy - remembering a
 * refusal is the one thing you are allowed to persist without asking first.
 *
 * Drawn as a slip of paper pinned to the corner of the page; it slides up when
 * motion is on (casefile's pages.css), and simply appears when it is off.
 */
const ConsentBanner = () => {
  const posthog = usePostHog();

  // posthog.init runs before render, so the consent status is already settled
  // here. No key means init was skipped and there is nothing to consent to.
  const [visible, setVisible] = useState(
    () =>
      Boolean(import.meta.env.VITE_PUBLIC_POSTHOG_KEY) &&
      posthog?.get_explicit_consent_status?.() === 'pending'
  );

  const accept = () => {
    posthog?.opt_in_capturing();
    setVisible(false);
  };

  const reject = () => {
    posthog?.opt_out_capturing();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section className="consent" aria-label="Cookie consent">
      <p className="consent-title">Cookies</p>
      <p className="consent-text">
        I use PostHog to see which projects people actually read. Accept and it can recognise you across visits and
        record how the pages are used. Decline and I still get anonymous page counts, with nothing stored on your
        device. Either way, nothing is sold or shared.{' '}
        <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
          PostHog&rsquo;s privacy policy<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
      <div className="consent-actions">
        <button type="button" className="btn btn-ghost" onClick={reject}>
          Decline
        </button>
        <button type="button" className="btn btn-primary" onClick={accept}>
          Accept
        </button>
      </div>
      <p className="consent-note">No ads, no third-party trackers.</p>
    </section>
  );
};

export default ConsentBanner;
