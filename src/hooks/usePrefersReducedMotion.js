import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const getMedia = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(QUERY) : null);

const subscribe = (callback) => {
  const media = getMedia();
  if (!media?.addEventListener) return () => {};
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

const getSnapshot = () => Boolean(getMedia()?.matches);
const getServerSnapshot = () => false;

/**
 * Whether the visitor has asked their system for less motion.
 *
 * This used to come from framer-motion's `useReducedMotion`. GSAP has no
 * equivalent, and once framer left the bundle the site needed one source of
 * truth for the question every animated component asks first. Live, not read
 * once: flipping the OS setting mid-visit takes effect on the next render.
 */
const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default usePrefersReducedMotion;
