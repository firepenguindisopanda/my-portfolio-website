import { useEffect, useState } from 'react';

/**
 * Reports which of the given section ids is currently in view.
 *
 * Replaces a scroll listener that ran `getElementById` + `offsetTop` +
 * `offsetHeight` for every section on every scroll event, forcing a layout
 * recalculation each time. IntersectionObserver does the same job off the
 * main thread.
 *
 * @param {string[]} sectionIds - element ids to watch, in document order
 * @returns {string} the id of the section nearest the top of the viewport
 */
const useSectionSpy = (sectionIds) => {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');
  // sectionIds is usually a fresh array each render; a stable key avoids
  // tearing the observer down and rebuilding it on every parent render.
  const key = sectionIds.join('|');

  useEffect(() => {
    const ids = key ? key.split('|') : [];
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return undefined;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (elements.length === 0) return undefined;

    const visible = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size === 0) return;
        // Follow document order so that when several sections are on screen the
        // topmost one wins, which is what a reader perceives as "current".
        const current = ids.find((id) => visible.has(id));
        if (current) setActiveId(current);
      },
      {
        // Bias the band towards the upper half of the viewport so a section
        // becomes active as it reaches reading position, not when it first peeks in.
        rootMargin: '-72px 0px -55% 0px',
        threshold: [0, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return activeId;
};

export default useSectionSpy;
