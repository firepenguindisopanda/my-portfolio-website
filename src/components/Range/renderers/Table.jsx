import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FlagshipLinks, SourceLine, Stat } from '../rangeParts';

/**
 * Ledger - the board as a spec table.
 *
 * Code, domain, measure, source, flagships. Figures are right-aligned and
 * tabular so the column reads down as a column of numbers, which is the only
 * arrangement where six unrelated measurements can be compared at a glance.
 *
 * Source gets its own column here rather than a line under the figure. In every
 * other mode the citation hangs off the number it backs; on a sheet, a column
 * every row has to fill is the stronger form of the same rule - an empty cell
 * would be visible in a way a missing caption is not.
 */
const HEAD_CELL = {
  textAlign: 'left',
  py: 1,
  px: 1.5,
  borderBottom: '2px solid',
  borderColor: 'text.primary',
  whiteSpace: 'nowrap',
};

const CELL = {
  py: 1.5,
  px: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'top',
};

const Table = ({ domains, onFlagship }) => {
  const theme = useTheme();

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
        <Box component="caption" sx={{ textAlign: 'left', pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Every measure is taken from a shipped project; the source column names where to check it.
          </Typography>
        </Box>

        <Box component="thead">
          <Box component="tr">
            {['Code', 'Domain', 'Measure', 'Source', 'Flagships'].map((label, i) => (
              <Box
                key={label}
                component="th"
                scope="col"
                sx={{ ...HEAD_CELL, ...(i === 2 && { textAlign: 'right' }) }}
              >
                <Typography variant="overline" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="tbody">
          {domains.map((domain) => (
            <Box
              key={domain.code}
              component="tr"
              className="range-item"
              sx={{
                transition: 'background-color 0.18s ease',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              <Box component="th" scope="row" sx={{ ...CELL, fontWeight: 400 }}>
                <Typography variant="overline" color="primary.main">
                  {domain.code}
                </Typography>
              </Box>

              <Box component="td" sx={CELL}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1rem', mb: 0.5 }}>
                  {domain.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.55, maxWidth: '46ch' }}
                >
                  {domain.claim}
                </Typography>
              </Box>

              <Box component="td" sx={{ ...CELL, textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Stat domain={domain} size="1.75rem" color="text.primary" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.25 }}
                >
                  {domain.stat.label}
                </Typography>
              </Box>

              <Box component="td" sx={{ ...CELL, maxWidth: 220 }}>
                <SourceLine domain={domain} />
              </Box>

              <Box component="td" sx={CELL}>
                <FlagshipLinks domain={domain} onFlagship={onFlagship} sx={{ gap: 1 }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Table;
