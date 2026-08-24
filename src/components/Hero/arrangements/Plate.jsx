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
 * Exhibit - the portrait as the first object in the room.
 *
 * A tall plate on the left with the name set large beside it, then the thesis
 * as a single opening line. The ledger becomes three wall labels rather than
 * ruled rows, so the first screen already shows the mode's whole vocabulary:
 * object, name, label.
 *
 * The plate is square-cornered and unbordered - on a wall the object is the
 * object, and a frame drawn in CSS would be a second frame.
 */
const Plate = ({ onSeeWork }) => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const { duration, gsapEase, stagger, distance } = theme.custom.motion;

      gsap
        .timeline({ defaults: { ease: gsapEase } })
        .fromTo(
          '.hero-portrait',
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: duration * 1.1, ease: 'power2.inOut' }
        )
        .from('.hero-word', { yPercent: 108, duration, stagger: stagger * 1.5, ease: 'power3.out' }, 0.15)
        .from('.hero-item', { autoAlpha: 0, y: distance, duration, stagger }, 0.35)
        .from('.hero-ledger', { autoAlpha: 0, y: distance, duration }, 0.55);
    },
    // Each mode renders a different arrangement, so this one remounts rather
    // than re-running on a mode switch and cannot strand its own `from` state
    // the way SectionHeading could. `revertOnUpdate` is here so the whole
    // GSAP surface follows one rule, and so that stops being load-bearing.
    { scope: rootRef, dependencies: [prefersReducedMotion, theme.custom.motion], revertOnUpdate: true }
  );

  return (
    <Box ref={rootRef} component="section" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '320px minmax(0, 1fr)' },
            gap: { xs: 4, md: 7 },
            alignItems: 'center',
          }}
        >
          <Portrait
            ratio="4 / 5"
            radius={0}
            bordered={false}
            sx={{ maxWidth: { xs: 260, md: 320 }, mx: { xs: 'auto', md: 0 } }}
          />

          <Box>
            <Typography
              className="hero-item"
              variant="overline"
              color="secondary.dark"
              sx={{ display: 'block', mb: 2 }}
            >
              {profile.role} &middot; {profile.location}
            </Typography>

            <MaskedName sx={{ mb: 3 }} />

            <Box className="hero-item">
              <Typography
                sx={{
                  fontSize: 'clamp(1.1875rem, 1.05rem + 0.65vw, 1.5625rem)',
                  fontWeight: 400,
                  lineHeight: 1.55,
                  color: 'text.primary',
                  maxWidth: `${theme.custom.layout.measure}ch`,
                  mb: 3,
                }}
              >
                {profile.thesis}
              </Typography>
            </Box>

            <Box className="hero-item" sx={{ mb: 3 }}>
              <CtaRow onSeeWork={onSeeWork} />
            </Box>

            <Box className="hero-item" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              <SocialRow />
              <StatusChips />
            </Box>
          </Box>
        </Box>

        <Box className="hero-item" sx={{ mt: { xs: 4, md: 6 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '76ch', mb: 2.5 }}>
            {profile.proof}
          </Typography>
          <SkillChips />
        </Box>

        <EvidenceLedger variant="labels" sx={{ mt: { xs: 5, md: 7 } }} />
      </Container>
    </Box>
  );
};

export default Plate;
