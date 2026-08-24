import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { gsap, ScrollTrigger, useGSAP } from '../../utilities/gsapSetup';

/**
 * A 2px reading-progress hairline fixed above the app bar. On a page this long
 * it is an instrument, not an ornament: it only moves when the reader scrolls,
 * so it stays on under prefers-reduced-motion (nothing animates on its own).
 */
const ScrollProgress = () => {
  const theme = useTheme();
  const barRef = useRef(null);
  const location = useLocation();

  useGSAP(() => {
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: 'max',
        scrub: 0.3,
      },
    });
  });

  // Route changes swap the page under the trigger; re-measure once the new
  // content has painted.
  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <Box
      ref={barRef}
      aria-hidden
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        bgcolor: 'primary.main',
        transform: 'scaleX(0)',
        transformOrigin: 'left center',
        zIndex: theme.zIndex.appBar + 1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ScrollProgress;
