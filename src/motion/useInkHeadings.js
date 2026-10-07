import { useEffect } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled } from '../utilities/gsapSetup';

/**
 * Ink headings: as a section comes into view its label is
 * typed out (a stepped wipe, rule first), its title rises line by line out of
 * its own slot, and the lede follows a beat later. Once per heading.
 *
 * SplitText splits the title and lede into lines (it keeps the original text
 * as the element's accessible name, and re-splits when the fonts land or the
 * width changes). It is fetched on demand, so a visitor with motion off
 * never downloads it.
 *
 * Call it from a page; it finds the headings in <main>. The pinned Four cases
 * stage, a case study's title (which the file opening flies into place) and the
 * panda page's own title animation are left alone.
 */
const useInkHeadings = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!gsapEnabled || prefersReducedMotion) return undefined;
    const main = document.getElementById('main');
    if (!main) return undefined;
    let cancelled = false;
    const ctx = gsap.context(() => {}, main);

    import('gsap/SplitText').then(({ SplitText }) => {
      if (cancelled) return;
      gsap.registerPlugin(SplitText);
      ctx.add(() => {
        const titles = gsap.utils
          .toArray('.sec-title, .pg-title', main)
          .filter((t) => !t.closest('.chapters') && !t.matches('.case-title, .panda-line'));
        titles.forEach((title) => {
          const head = title.parentElement;
          const trigger = { trigger: head, start: 'top 85%', once: true };
          const tab = head.querySelector(':scope > .sec-tab');
          const lede = head.querySelector(':scope > .lede');
          if (tab) {
            const chars = Math.max(8, tab.textContent.length);
            gsap.fromTo(
              tab,
              { clipPath: 'inset(0 100% 0 0)' },
              { clipPath: 'inset(0 0% 0 0)', duration: chars * 0.028, ease: `steps(${chars})`, scrollTrigger: trigger }
            );
          }
          SplitText.create(title, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'ink',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, { yPercent: 115, duration: 1, stagger: 0.12, ease: 'expo.out', delay: tab ? 0.18 : 0, scrollTrigger: trigger }),
          });
          if (lede) {
            SplitText.create(lede, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'ink',
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, { yPercent: 100, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', delay: 0.45, scrollTrigger: trigger }),
            });
          }
        });
      });
    });

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [prefersReducedMotion]);
};

export default useInkHeadings;
