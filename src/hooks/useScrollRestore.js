import { useEffect } from 'react';

/**
 * Restores a scroll offset stashed in sessionStorage, then clears it.
 *
 * Used so that returning from a project detail page lands the visitor back on
 * the card they clicked. Replaces ~40 lines of nested try/catch that juggled
 * history.state, location.state and sessionStorage in parallel; sessionStorage
 * alone survives the navigation and is the only one of the three that was
 * actually being read.
 *
 * @param {string} key - sessionStorage key holding the offset
 */
const useScrollRestore = (key) => {
  useEffect(() => {
    let stored;
    try {
      stored = sessionStorage.getItem(key);
      if (stored !== null) sessionStorage.removeItem(key);
    } catch {
      return undefined; // sessionStorage unavailable (private mode, blocked cookies)
    }

    const offset = Number(stored);
    if (stored === null || Number.isNaN(offset)) return undefined;

    // Wait a frame so the restored content has laid out before scrolling.
    const raf = requestAnimationFrame(() => {
      globalThis.scrollTo({ top: offset, left: 0, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(raf);
  }, [key]);
};

export default useScrollRestore;
