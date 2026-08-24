import React from 'react';
import { Box, Typography } from '@mui/material';
import { RAIL_WIDTH } from '../../../utilities/themeConfig';
import { FlagshipLinks, SourceLine, Stat } from '../rangeParts';

/**
 * Notebook - six domains as annotated entries.
 *
 * The measurement and its citation sit out in the margin rail; the domain and
 * what it claims run in the column. That split is the mode's argument about
 * this content: the claim is the writing, the number is the note in the margin
 * that supports it, and a margin note that cited nothing would be conspicuous.
 */
const Annotated = ({ domains, onFlagship }) => (
  <Box>
    {domains.map((domain, index) => (
      <Box
        key={domain.code}
        className="range-item"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: `${RAIL_WIDTH}px minmax(0, 1fr)` },
          // Matches SectionHeading and the project entries, so one rail edge
          // runs the length of the page.
          ml: { md: `-${RAIL_WIDTH}px` },
          rowGap: 1.5,
          ...(index === domains.length - 1
            ? {}
            : {
                pb: { xs: 3.5, md: 4 },
                mb: { xs: 3.5, md: 4 },
                borderBottom: '1px solid',
                borderColor: 'divider',
              }),
        }}
      >
        {/* Margin: the measurement, and where to check it. */}
        <Box sx={{ pr: { md: 3 }, pt: { md: 0.5 } }}>
          <Typography variant="overline" color="secondary.main" sx={{ display: 'block', mb: 0.75 }}>
            {domain.code}
          </Typography>
          <Box sx={{ mb: 0.5 }}>
            <Stat domain={domain} size="2rem" />
          </Box>
          <Typography
            variant="caption"
            color="text.primary"
            sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
          >
            {domain.stat.label}
          </Typography>
          <SourceLine domain={domain} />
        </Box>

        {/* Column: what the domain is and what it claims. */}
        <Box>
          <Typography variant="h3" component="h3" sx={{ fontSize: '1.15rem', mb: 1 }}>
            {domain.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.7, maxWidth: (theme) => `${theme.custom.layout.measure}ch`, mb: 2 }}
          >
            {domain.claim}
          </Typography>
          <FlagshipLinks domain={domain} onFlagship={onFlagship} />
        </Box>
      </Box>
    ))}
  </Box>
);

export default Annotated;
