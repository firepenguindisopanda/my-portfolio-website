import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

/**
 * Whether the site animates, decided once for the whole page.
 *
 * The default is the visitor's system setting (prefers-reduced-motion). The
 * header's Motion switch overrides it, and the choice is remembered in this
 * browser. The switch exists because the preference is often set for reasons
 * that have nothing to do with a website - Windows turns it on whenever "Show
 * animations in Windows" is off - and a visitor who wants to see the scroll
 * stories should be able to, without changing their OS.
 *
 * The decision is published two ways:
 *   - `useMotion()` for components that start GSAP tweens;
 *   - `motion-on` / `motion-off` on <html>, which casefile.css and index.css
 *     key their CSS transitions and the reduced-motion override off.
 */

const QUERY = '(prefers-reduced-motion: reduce)';
const STORAGE_KEY = 'casefile-motion';

const media = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(QUERY) : null);

const subscribe = (callback) => {
  const m = media();
  if (!m?.addEventListener) return () => {};
  m.addEventListener('change', callback);
  return () => m.removeEventListener('change', callback);
};
const osReduces = () => Boolean(media()?.matches);

const readChoice = () => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    // Private windows and blocked storage: fall back to the system setting.
    return null;
  }
};
const writeChoice = (v) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // Not remembered; the switch still works for this visit.
  }
};

/** The chapter or section at the top of the screen, and where its top sits. */
const findAnchor = () => {
  const els = Array.from(document.querySelectorAll('main section[id], main .chapter'));
  let best = null;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.bottom > 110 && r.top < window.innerHeight) {
      const isChapter = el.classList.contains('chapter');
      if (!best || isChapter) best = { el, top: isChapter ? Math.max(r.top, 0) : r.top };
      if (isChapter) break;
    }
  }
  return best;
};
const restoreAnchor = ({ el, top }) => {
  if (!el.isConnected) return;
  const y = el.getBoundingClientRect().top + window.scrollY - top;
  window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
};

const MotionContext = createContext(null);

export const MotionProvider = ({ children }) => {
  const reduce = useSyncExternalStore(subscribe, osReduces, () => false);
  const [choice, setChoice] = useState(readChoice);
  const motionOn = choice ? choice === 'on' : !reduce;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('motion-on', motionOn);
    root.classList.toggle('motion-off', !motionOn);
  }, [motionOn]);

  const setMotion = useCallback((on) => {
    const v = on ? 'on' : 'off';
    // Pinned chapters add scroll length when motion is on and remove it when
    // off, so flipping the switch would throw the reader somewhere else on the
    // page. Note what they are reading and put it back where it was.
    const anchor = findAnchor();
    writeChoice(v);
    setChoice(v);
    if (anchor) requestAnimationFrame(() => requestAnimationFrame(() => restoreAnchor(anchor)));
  }, []);

  const value = useMemo(() => ({ motionOn, setMotion, osReduces: reduce }), [motionOn, setMotion, reduce]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
};

/**
 * `{ motionOn, setMotion, osReduces }`. Outside a provider (a component test
 * that renders one piece of the page) it answers from the system setting and
 * the switch does nothing.
 */
export const useMotion = () => {
  const ctx = useContext(MotionContext);
  const reduce = useSyncExternalStore(subscribe, osReduces, () => false);
  return ctx ?? { motionOn: !reduce, setMotion: () => {}, osReduces: reduce };
};

export default MotionProvider;
