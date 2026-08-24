import React, { useRef } from 'react';
import { useTheme } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import useLayout from '../../hooks/useLayout';
import { domains } from '../../data/domains';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';
import { useOpenFlagship } from './rangeParts';
import Grid from './renderers/Grid';
import Table from './renderers/Table';
import Annotated from './renderers/Annotated';
import Strip from './renderers/Strip';

/**
 * The Range board: six practice domains, arranged four ways.
 *
 * The rule this section exists to demonstrate does not vary with the
 * arrangement - every readout is measured from a shipped project and every one
 * names where to check it. A renderer that dropped the source line would be
 * showing decoration, so the readout and its citation are built together in
 * rangeParts rather than assembled per renderer.
 */
const RENDERERS = {
  grid: Grid,
  table: Table,
  annotated: Annotated,
  strip: Strip,
};

const RangeBoard = () => {
  const prefersReducedMotion = useReducedMotion();
  const boardRef = useRef(null);
  const { range: renderer } = useLayout();
  const { motion } = useTheme().custom;
  const onFlagship = useOpenFlagship();

  const Renderer = RENDERERS[renderer] ?? Grid;

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const trigger = { trigger: boardRef.current, start: 'top 80%', once: true };

      // `.range-item` rather than a panel class: every renderer tags its own
      // repeating unit with it, so the entrance works the same whether that
      // unit is a grid cell, a table row, an entry or a column in the strip.
      gsap.from('.range-item', {
        autoAlpha: 0,
        y: motion.distance,
        duration: motion.duration,
        ease: motion.gsapEase,
        stagger: motion.stagger,
        scrollTrigger: trigger,
      });

      // Count each readout up from zero the first time the board scrolls into
      // view. The real value is in the markup, so a failed tween shows the
      // truth rather than a zero.
      gsap.utils.toArray('.range-stat').forEach((el) => {
        gsap.from(el, {
          textContent: 0,
          duration: 1.1,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: trigger,
        });
      });
    },
    // See SectionHeading: without this, a mode switch re-runs the hook without
    // reverting, so the previous mode's tweens and ScrollTriggers are left
    // behind on every switch.
    { scope: boardRef, dependencies: [prefersReducedMotion, motion, renderer], revertOnUpdate: true }
  );

  return (
    <Section ref={boardRef}>
      <SectionHeading
        eyebrow="Range"
        title="Six domains, one standard"
        description="Every number on this board is measured from a shipped project, and the line under it says where to check."
        count={`${domains.length} domains`}
      />

      <Renderer domains={domains} onFlagship={onFlagship} />
    </Section>
  );
};

export default RangeBoard;
