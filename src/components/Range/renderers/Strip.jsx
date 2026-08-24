import React from 'react';
import { Box, Typography } from '@mui/material';
import { FlagshipLinks, SourceLine, Stat } from '../rangeParts';

/**
 * Exhibit - the board as an index of the collection.
 *
 * One band, six oversized figures, each under a brass hairline with its label
 * and citation set small beneath. A gallery lists what is in the room before
 * you walk it; this is that list, and the figure is the thing worth reading at
 * a distance.
 *
 * Six across only on the widest screens. A didone at this size needs room, and
 * a source line squeezed into a sixth of a phone is a citation nobody reads -
 * which would leave the number unsupported, and an unsupported number is
 * decoration.
 */
const Strip = ({ domains, onFlagship }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        md: 'repeat(3, minmax(0, 1fr))',
        lg: 'repeat(6, minmax(0, 1fr))',
      },
      columnGap: { sm: 3, lg: 2.5 },
      rowGap: { xs: 4, sm: 5 },
    }}
  >
    {domains.map((domain) => (
      <Box
        key={domain.code}
        className="range-item"
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        <Box sx={{ borderTop: '1px solid', borderColor: 'secondary.main', pt: 1.5 }}>
          <Typography variant="overline" color="secondary.dark" sx={{ display: 'block', mb: 1 }}>
            {domain.code}
          </Typography>
          <Stat domain={domain} size={{ xs: '3rem', lg: '3.5rem' }} color="text.primary" />
        </Box>

        <Typography variant="h3" component="h3" sx={{ fontSize: '1rem' }}>
          {domain.name}
        </Typography>

        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
          {domain.stat.label}
        </Typography>

        <SourceLine domain={domain} />

        <FlagshipLinks
          domain={domain}
          onFlagship={onFlagship}
          sx={{ mt: 'auto', pt: 1, flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}
        />
      </Box>
    ))}
  </Box>
);

export default Strip;
