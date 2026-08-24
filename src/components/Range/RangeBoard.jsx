import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha } from '@mui/material/styles';
import { useReducedMotion } from 'framer-motion';
import { usePostHog } from '@posthog/react';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import { domains } from '../../data/domains';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * The Range board: six practice domains as one collapsed hairline grid.
 *
 * Each panel carries a measured readout, and the line under the number names
 * where that number can be checked - the same rule the hero thesis states.
 * A stat that cited nothing would be decoration; these are navigation.
 */
const RangePanel = ({ domain, onFlagship }) => {
  const theme = useTheme();

  return (
    <Box
      className="range-panel"
      sx={{
        p: { xs: 2.5, md: 3 },
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        transition: 'background-color 0.2s ease',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
        '&:hover .range-code': { color: 'primary.main' },
      }}
    >
      <Typography
        className="range-code"
        variant="overline"
        color="text.secondary"
        sx={{ transition: 'color 0.2s ease' }}
      >
        {domain.code}
      </Typography>

      <Typography variant="h3" component="h3" sx={{ fontSize: '1.125rem' }}>
        {domain.name}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, flexWrap: 'wrap' }}>
        <Typography
          component="span"
          sx={{
            fontFamily: theme.custom.displayFont,
            fontSize: { xs: '2.25rem', md: '2.75rem' },
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'primary.main',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span className="range-stat">{domain.stat.value}</span>
          {domain.stat.suffix || ''}
        </Typography>
        <Typography component="span" variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {domain.stat.label}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontFamily: theme.custom.codeFont, letterSpacing: 0 }}
      >
        {domain.source}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {domain.claim}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 'auto', pt: 0.5 }}>
        {domain.flagships.map((flagship) => (
          <Box
            key={flagship.id}
            component="button"
            type="button"
            onClick={() => onFlagship(domain, flagship)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              background: 'none',
              border: 'none',
              p: 0,
              cursor: 'pointer',
              fontFamily: theme.custom.codeFont,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
              transition: 'color 0.2s ease, border-color 0.2s ease',
              '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
            }}
          >
            {flagship.name}
            <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const RangeBoard = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const prefersReducedMotion = useReducedMotion();
  const boardRef = useRef(null);

  const openFlagship = (domain, flagship) => {
    posthog?.capture('range_flagship_clicked', { domain: domain.code, project_id: flagship.id });
    navigate(`/projects/${flagship.id}`);
  };

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      gsap.from('.range-panel', {
        autoAlpha: 0,
        y: 14,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: { trigger: boardRef.current, start: 'top 80%', once: true },
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
          scrollTrigger: { trigger: boardRef.current, start: 'top 80%', once: true },
        });
      });
    },
    { scope: boardRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <Section ref={boardRef}>
      <SectionHeading
        eyebrow="Range"
        title="Six domains, one standard"
        description="Every number on this board is measured from a shipped project, and the line under it says where to check."
        count={`${domains.length} domains`}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: '1px',
          bgcolor: 'divider',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: (theme) => `${theme.custom.radius.container}px`,
          overflow: 'hidden',
        }}
      >
        {domains.map((domain) => (
          <RangePanel key={domain.code} domain={domain} onFlagship={openFlagship} />
        ))}
      </Box>
    </Section>
  );
};

export default RangeBoard;
