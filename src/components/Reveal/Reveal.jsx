import React, { useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * The section reveal: a block fades and rises into place the first time it
 * scrolls into view, in the active mode's motion character.
 *
 * Seven components used to carry their own copy of this as a framer-motion
 * `whileInView` block, which was the only reason the site shipped two
 * animation libraries. This is the one implementation, on GSAP's ScrollTrigger
 * like every other scroll-driven effect on the page.
 *
 * `opacity`, never `autoAlpha`: a hidden heading is out of the accessibility
 * tree, and these blocks usually contain one. Under prefers-reduced-motion,
 * and under Vitest where there is no frame loop, nothing runs and the block
 * simply renders in place.
 *
 * @param {number} delay  seconds, for staggering siblings - cap it at the call site
 */
const Reveal = ({ children, delay = 0, component = 'div', sx, ...rest }) => {
  const ref = useRef(null);
  const theme = useTheme();
  const { motion } = theme.custom;
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      gsap.from(ref.current, {
        opacity: 0,
        y: motion.distance,
        duration: motion.duration,
        delay,
        ease: motion.gsapEase,
        // Transforms create a containing block for fixed descendants, so the
        // translate is removed once the block has landed.
        clearProps: 'transform',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      });
    },
    // See SectionHeading: a mode switch changes `motion`, and without a revert
    // the previous tween's inline styles become the new tween's destination.
    { scope: ref, dependencies: [motion, prefersReducedMotion, delay], revertOnUpdate: true }
  );

  return (
    <Box ref={ref} component={component} sx={sx} {...rest}>
      {children}
    </Box>
  );
};

export default Reveal;
