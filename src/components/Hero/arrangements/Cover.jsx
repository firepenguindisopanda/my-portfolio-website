import React, { useRef } from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import { RAIL_WIDTH } from '../../../utilities/themeConfig';
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
 * Notebook - the cover page of the record.
 *
 * The portrait sits in the margin rail at rail width, the way a photograph is
 * fixed inside a front cover, and everything written runs in the column beside
 * it. No negative margin here: the Hero is not wrapped in Section, so this grid
 * establishes the same rail from the container edge that Section reserves for
 * every section below - which is what keeps one rail edge running down the page.
 *
 * The thesis is set in the body serif, not the display face. This mode's
 * display face is JetBrains Mono, and three lines of mono at 23px read as a
 * terminal transcript rather than a written opening - the headers are stamped
 * in this mode, the prose is not.
 */
const Cover = ({ onSeeWork }) => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const { duration, gsapEase, stagger } = theme.custom.motion;

      gsap
        .timeline({ defaults: { ease: gsapEase } })
        .from('.hero-overline', { autoAlpha: 0, duration })
        // Slower and shorter than Instrument's unmask: this mode's motion is
        // ink settling, not a readout snapping into place.
        .from('.hero-word', { autoAlpha: 0, y: 6, duration, stagger }, 0.05)
        .fromTo(
          '.hero-portrait',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: duration * 1.2, ease: 'power1.inOut' },
          0.1
        )
        .from('.hero-item', { autoAlpha: 0, y: 4, duration, stagger }, 0.2)
        .from('.hero-ledger', { autoAlpha: 0, duration }, 0.4);
    },
    // Each mode renders a different arrangement, so this one remounts rather
    // than re-running on a mode switch and cannot strand its own `from` state
    // the way SectionHeading could. `revertOnUpdate` is here so the whole
    // GSAP surface follows one rule, and so that stops being load-bearing.
    { scope: rootRef, dependencies: [prefersReducedMotion, theme.custom.motion], revertOnUpdate: true }
  );

  return (
    <Box ref={rootRef} component="section" sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: `${RAIL_WIDTH}px minmax(0, 1fr)` },
            columnGap: { md: 0 },
            rowGap: 3,
            alignItems: 'start',
          }}
        >
          {/* Margin: the photograph, then who and where. */}
          <Box sx={{ pr: { md: 3 } }}>
            <Portrait
              ratio="3 / 4"
              sx={{ maxWidth: { xs: 200, md: RAIL_WIDTH - 24 }, mb: 2 }}
            />
            <Typography
              className="hero-overline"
              variant="overline"
              color="secondary.main"
              sx={{ display: 'block', lineHeight: 1.6 }}
            >
              {profile.role}
              <br />
              {profile.location}
            </Typography>
          </Box>

          {/* Column: everything written. */}
          <Box>
            <MaskedName sx={{ mb: 3 }} />

            <Box className="hero-item">
              <Typography
                sx={{
                  fontSize: 'clamp(1.1875rem, 1.05rem + 0.6vw, 1.5rem)',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'text.primary',
                  maxWidth: `${theme.custom.layout.measure}ch`,
                  mb: 2.5,
                }}
              >
                {profile.thesis}
              </Typography>
            </Box>

            <Box className="hero-item">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: `${theme.custom.layout.measure}ch`, mb: 3 }}
              >
                {profile.proof}
              </Typography>
            </Box>

            <Box className="hero-item" sx={{ mb: 3 }}>
              <SkillChips />
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

        <Box sx={{ pl: { md: `${RAIL_WIDTH}px` } }}>
          <EvidenceLedger sx={{ mt: { xs: 4, md: 5 } }} />
        </Box>
      </Container>
    </Box>
  );
};

export default Cover;
