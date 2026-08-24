import React, { useRef } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * The one section heading used across the page.
 *
 * Previously nine consecutive sections each rendered their own centred, teal,
 * 700-weight, 2.5rem heading, so nothing signalled which section mattered.
 * These are left-aligned in the primary text colour with a small accent rule,
 * which reads as structure rather than decoration.
 *
 * The accent rule draws in the first time the heading enters the viewport -
 * the single motion cue every section shares, so the page has one signature
 * instead of scattered effects. Skipped under prefers-reduced-motion.
 */
const SectionHeading = ({ eyebrow, title, description, action, id }) => {
  const rootRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      gsap.from('.heading-copy', {
        autoAlpha: 0,
        y: 10,
        duration: 0.45,
        ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 88%', once: true },
      });
      gsap.from('.heading-rule', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.5,
        delay: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 88%', once: true },
      });
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <Box ref={rootRef} sx={{ mb: { xs: 3, md: 4 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        className="heading-copy"
      >
        <Box sx={{ maxWidth: 640 }}>
          {eyebrow && (
            <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 0.5 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h2" component="h2" id={id ? `${id}-heading` : undefined}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>

      <Box
        className="heading-rule"
        sx={{
          mt: 2,
          width: 48,
          height: 2,
          bgcolor: 'primary.main',
          borderRadius: 0,
        }}
      />
    </Box>
  );
};

export default SectionHeading;
