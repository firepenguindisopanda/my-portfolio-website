/**
 * Who PostHog counts, under the site's own settings, for each answer to the
 * cookie banner. This runs the real posthog-js client: its consent rules have
 * changed between versions before, and the cost of getting them wrong is
 * silent (visitors simply never show up).
 *
 * Nothing leaves the test: every event is caught in `before_send`, which
 * drops it, and the client loads no remote scripts or flags.
 */
import { PostHog } from 'posthog-js';
import posthogOptions from '../utilities/posthogOptions';

let n = 0;
const start = (options = posthogOptions()) => {
  const events = [];
  const token = `phc_test_${++n}`;
  // init with a name returns that named client; the bare one stays uninitialised.
  const ph = new PostHog().init(
    token,
    {
      ...options,
      api_host: 'http://127.0.0.1:9',
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      // jsdom runs on localhost, which the defaults would mark as internal traffic.
      internal_or_test_user_hostname: null,
      // jsdom's user agent says "jsdom", which the client drops as a bot.
      opt_out_useragent_filter: true,
      before_send: (event) => {
        events.push(event);
        return null;
      },
    },
    `test${n}`
  );
  return { ph, events, token };
};

const stored = (token) => ({
  cookies: document.cookie.split(';').filter((c) => c.includes(token)).length,
  localStorage: Object.keys(localStorage).filter((k) => k.includes(token)),
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(';').forEach((c) => {
    document.cookie = `${c.split('=')[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
});

describe('who PostHog counts', () => {
  it('counts a visitor who never answers the banner, anonymously and storing nothing', () => {
    const { ph, events, token } = start();
    expect(ph.get_explicit_consent_status()).toBe('pending');
    ph.capture('test_event');
    const event = events.find((e) => e.event === 'test_event');
    expect(event).toBeDefined();
    expect(event.properties.$cookieless_mode).toBe(true);
    expect(stored(token)).toEqual({ cookies: 0, localStorage: [] });
  });

  it('counts a visitor who declines, anonymously', () => {
    const { ph, events } = start();
    ph.opt_out_capturing();
    expect(ph.get_explicit_consent_status()).toBe('denied');
    ph.capture('test_event');
    expect(events.find((e) => e.event === 'test_event')?.properties.$cookieless_mode).toBe(true);
  });

  it('tracks a visitor who accepts with cookies, as usual', () => {
    const { ph, events, token } = start();
    ph.opt_in_capturing();
    expect(ph.get_explicit_consent_status()).toBe('granted');
    ph.capture('test_event');
    const event = events.find((e) => e.event === 'test_event');
    expect(event).toBeDefined();
    expect(event.properties.$cookieless_mode).toBeUndefined();
    const s = stored(token);
    expect(s.cookies + s.localStorage.length).toBeGreaterThan(0);
  });

  it('would count nobody before an answer without opt_out_capturing_by_default (why it is set)', () => {
    const { ph, events } = start({ ...posthogOptions(), opt_out_capturing_by_default: false });
    ph.capture('test_event');
    expect(events.find((e) => e.event === 'test_event')).toBeUndefined();
  });
});
