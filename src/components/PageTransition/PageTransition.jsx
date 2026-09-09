import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * Route transitions: a short rise-and-fade in. No scale - zooming the whole
 * page reads as an effect, where a rise reads as arrival.
 *
 * Enter only. The framer version this replaces also faded the old page out
 * first, which put 220ms between every click and the page it asked for and
 * was the last thing keeping a second animation library in the bundle.
 *
 * The animated element is the page's <main>. Every route renders inside this,
 * so it is the one place a main landmark can live without each page having
 * to remember it - and without it, a screen-reader user had no landmark to
 * jump to past the app bar.
 */
const PageTransition = ({ children }) => {
  const ref = useRef(null);
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          // A transform on <main> would make it the containing block for every
          // fixed descendant - the back-to-top control among them.
          clearProps: 'transform',
        }
      );
    },
    { scope: ref, dependencies: [location.pathname, prefersReducedMotion] }
  );

  return (
    <main key={location.pathname} ref={ref} style={{ width: '100%', minHeight: '100vh' }}>
      {children}
    </main>
  );
};

export default PageTransition;
