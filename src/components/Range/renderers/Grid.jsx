import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FlagshipLinks, SourceLine, Stat } from '../rangeParts';

/**
 * Instrument - six panels in one collapsed hairline grid.
 *
 * The reference renderer. Cells share single-pixel gaps over a divider-coloured
 * ground, so the grid reads as drawn lines rather than six separate cards -
 * which is the difference between an instrument panel and a dashboard.
 */
const RangePanel = ({ domain, onFlagship }) => {
  const theme = useTheme();

  return (
    <Box
      className="range-item"
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
        <Stat domain={domain} size={{ xs: '2.25rem', md: '2.75rem' }} />
        <Typography component="span" variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {domain.stat.label}
        </Typography>
      </Box>

      <SourceLine domain={domain} />

      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {domain.claim}
      </Typography>

      <FlagshipLinks domain={domain} onFlagship={onFlagship} sx={{ mt: 'auto', pt: 0.5 }} />
    </Box>
  );
};

const Grid = ({ domains, onFlagship }) => (
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
      <RangePanel key={domain.code} domain={domain} onFlagship={onFlagship} />
    ))}
  </Box>
);

export default Grid;
