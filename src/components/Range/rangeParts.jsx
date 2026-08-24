import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { Box, Typography, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * Leaf pieces every Range renderer shares.
 *
 * The board's rule, from src/data/domains.js: every stat must be measurable
 * from this repo or a write-up it links to, and `source` names where to check
 * it. That rule is only worth anything if it survives all four arrangements, so
 * the readout and its citation are built here as one pair rather than
 * re-assembled per renderer where one of them could quietly go missing.
 */

export const useOpenFlagship = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  return React.useCallback(
    (domain, flagship) => {
      posthog?.capture('range_flagship_clicked', { domain: domain.code, project_id: flagship.id });
      navigate(`/projects/${flagship.id}`);
    },
    [navigate, posthog]
  );
};

/**
 * A measured readout.
 *
 * `.range-stat` wraps the number alone, never the suffix: RangeBoard tweens the
 * element's textContent up from zero, and a suffix inside it would be counted
 * as part of the number and vanish. The real value is in the markup, so a
 * failed tween shows the truth rather than a zero.
 */
export const Stat = ({ domain, size, color = 'primary.main', font }) => {
  const theme = useTheme();

  return (
    <Typography
      component="span"
      sx={{
        fontFamily: font || theme.custom.displayFont,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span className="range-stat">{domain.stat.value}</span>
      {domain.stat.suffix || ''}
    </Typography>
  );
};

/** Where the number above it can be checked. Never optional. */
export const SourceLine = ({ domain, align = 'left' }) => {
  const theme = useTheme();

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: 'block',
        fontFamily: theme.custom.codeFont,
        letterSpacing: 0,
        textAlign: align,
        lineHeight: 1.5,
      }}
    >
      {domain.source}
    </Typography>
  );
};

/** The projects that substantiate a domain - the board's real navigation. */
export const FlagshipLinks = ({ domain, onFlagship, sx }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, ...sx }}>
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
  );
};
