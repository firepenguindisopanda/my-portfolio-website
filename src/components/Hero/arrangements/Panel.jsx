import React, { useRef } from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import { gsap, gsapEnabled, useGSAP } from '../../../utilities/gsapSetup';
import {
  CtaRow,
  EvidenceLedger,
  MaskedName,
  Portrait,
  SkillChips,
  SocialRow,
  StatusChips,
  profile,
} from '../heroParts';

/**
 * Instrument - copy left, portrait right, ledger beneath.
 *
 * The reference arrangement. One orchestrated timeline rather than uniform
 * per-element fades: overline, then the name unmasking word by word, then the
 * copy, with the portrait wiping in alongside. Every tween is a `from`, so
 * under prefers-reduced-motion nothing runs and the content is simply there.
 */
const Panel = ({ onSeeWork }) => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.from('.hero-overline', { autoAlpha: 0, y: 10, duration: 0.35 })
        .from('.hero-word', { yPercent: 110, duration: 0.55, stagger: 0.09, ease: 'power3.out' }, 0.08)
        .from('.hero-item', { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.07 }, 0.4)
        .fromTo(
          '.hero-portrait',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'power2.inOut' },
          0.25
        )
        .from('.hero-tick', { autoAlpha: 0, duration: 0.3, stagger: 0.04 }, 0.85)
        .from('.hero-ledger', { autoAlpha: 0, y: 12, duration: 0.45 }, 0.75);
    },
    // Each mode renders a different arrangement, so this one remounts rather
    // than re-running on a mode switch and cannot strand its own `from` state
    // the way SectionHeading could. `revertOnUpdate` is here so the whole
    // GSAP surface follows one rule, and so that stops being load-bearing.
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <Box ref={rootRef} component="section" sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' },
            gap: { xs: 4, md: 6 },
            alignItems: 'start',
          }}
        >
          <Box>
            <Typography className="hero-overline" variant="overline" color="primary.main" sx={{ display: 'block', mb: 2 }}>
              {profile.role} &middot; {profile.location}
            </Typography>

            <MaskedName sx={{ mb: 2.5 }} />

            <Box className="hero-item">
              <Typography
                sx={{
                  fontFamily: theme.custom.displayFont,
                  fontSize: 'clamp(1.125rem, 1rem + 0.6vw, 1.4375rem)',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  letterSpacing: '-0.015em',
                  color: 'text.primary',
                  maxWidth: 620,
                  mb: 2,
                }}
              >
                {profile.thesis}
              </Typography>
            </Box>

            <Box className="hero-item">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 620 }}>
                {profile.proof}
              </Typography>
            </Box>

            <Box className="hero-item" sx={{ mb: 3.5 }}>
              <SkillChips />
            </Box>

            <Box className="hero-item" sx={{ mb: 3 }}>
              <CtaRow onSeeWork={onSeeWork} />
            </Box>

            <Box className="hero-item" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <SocialRow />
              <Box sx={{ ml: { sm: 1 } }}>
                <StatusChips />
              </Box>
            </Box>
          </Box>

          <Portrait ticks sx={{ maxWidth: { xs: 240, md: 300 }, mx: { xs: 'auto', md: 0 } }} />
        </Box>

        <EvidenceLedger sx={{ mt: { xs: 4, md: 5 } }} />
      </Container>
    </Box>
  );
};

export default Panel;
