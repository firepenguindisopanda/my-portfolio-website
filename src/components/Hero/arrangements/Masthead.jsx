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
  profile,
} from '../heroParts';

/**
 * Ledger - a masthead over a field table.
 *
 * The top of an audit sheet: who filed it, from where, since when. The facts
 * that are elsewhere scattered through prose are set here as labelled fields,
 * because a field left blank is visible in a way a sentence never written is
 * not. The thesis then runs full width beneath as the note on the filing.
 *
 * Almost no motion, matching the mode: a short opacity step and nothing moves.
 * A printed sheet does not animate.
 */
const FIELD_LABEL = { display: 'block', mb: 0.25 };

const Field = ({ label, children }) => (
  <Box
    className="hero-item"
    sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Typography variant="overline" color="text.secondary" sx={FIELD_LABEL}>
      {label}
    </Typography>
    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  </Box>
);

const Masthead = ({ onSeeWork }) => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const { duration, gsapEase } = theme.custom.motion;
      gsap
        .timeline({ defaults: { ease: gsapEase } })
        .from('.hero-word', { autoAlpha: 0, duration })
        .from('.hero-item', { autoAlpha: 0, duration, stagger: 0.03 }, 0.05)
        .from('.hero-ledger', { autoAlpha: 0, duration }, 0.12);
    },
    // Each mode renders a different arrangement, so this one remounts rather
    // than re-running on a mode switch and cannot strand its own `from` state
    // the way SectionHeading could. `revertOnUpdate` is here so the whole
    // GSAP surface follows one rule, and so that stops being load-bearing.
    { scope: rootRef, dependencies: [prefersReducedMotion, theme.custom.motion], revertOnUpdate: true }
  );

  return (
    <Box ref={rootRef} component="section" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        {/* Masthead: name, then the portrait as a small square stamp. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 96px' },
            gap: 3,
            alignItems: 'start',
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'text.primary',
          }}
        >
          <Box>
            <Typography
              className="hero-item"
              variant="overline"
              color="primary.main"
              sx={{ display: 'block', mb: 1 }}
            >
              {profile.role}
            </Typography>
            <MaskedName sx={{ textTransform: 'uppercase', letterSpacing: '-0.01em' }} />
          </Box>
          <Portrait ratio="1 / 1" sx={{ maxWidth: 96, justifySelf: { sm: 'end' } }} />
        </Box>

        {/* Field table. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            columnGap: 4,
            mt: 2,
          }}
        >
          <Field label="Location">{profile.location}</Field>
          <Field label="Available">{profile.available ? 'Yes, for roles and contract work' : 'Not currently'}</Field>
          <Field label="Working since">{profile.since}</Field>
          <Field label="Focus">Full-stack, ML, desktop</Field>
        </Box>

        {/* The note on the filing. */}
        <Box className="hero-item" sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontFamily: theme.custom.displayFont,
              fontSize: 'clamp(1.0625rem, 0.95rem + 0.5vw, 1.3125rem)',
              fontWeight: 600,
              lineHeight: 1.4,
              color: 'text.primary',
              maxWidth: '68ch',
              mb: 1.5,
            }}
          >
            {profile.thesis}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '78ch' }}>
            {profile.proof}
          </Typography>
        </Box>

        <Box className="hero-item" sx={{ mt: 2.5 }}>
          <SkillChips />
        </Box>

        <Box
          className="hero-item"
          sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
        >
          <CtaRow onSeeWork={onSeeWork} size="medium" />
          <SocialRow size={16} />
        </Box>

        <EvidenceLedger sx={{ mt: { xs: 4, md: 4.5 } }} />
      </Container>
    </Box>
  );
};

export default Masthead;
