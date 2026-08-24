import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DetailsToggle, ExperienceChips, ExperienceDetails } from '../experienceParts';

/**
 * Ledger - the history as a filing.
 *
 * Period, role, organisation, focus. A CV is a table of dated claims before it
 * is anything else, and this is the mode that says so out loud.
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
  py: 1.25,
  px: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'top',
};

const TableView = ({ experiences, expanded, onToggle }) => {
  const theme = useTheme();

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr">
            {['Period', 'Role', 'Organisation', 'Focus'].map((label) => (
              <Box key={label} component="th" scope="col" sx={HEAD_CELL}>
                <Typography variant="overline" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="tbody">
          {experiences.map((experience) => {
            const isOpen = expanded.has(experience.id);
            return (
              <React.Fragment key={experience.id}>
                <Box
                  component="tr"
                  sx={{
                    transition: 'background-color 0.18s ease',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <Box component="th" scope="row" sx={{ ...CELL, fontWeight: 400, whiteSpace: 'nowrap' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: theme.custom.codeFont, letterSpacing: 0 }}
                    >
                      {experience.period}
                    </Typography>
                  </Box>

                  <Box component="td" sx={CELL}>
                    <Typography variant="h3" component="h3" sx={{ fontSize: '1rem' }}>
                      {experience.title}
                    </Typography>
                    <DetailsToggle
                      experience={experience}
                      expanded={isOpen}
                      onToggle={onToggle}
                      sx={{ ml: -1, mt: 0.25 }}
                    />
                  </Box>

                  <Box component="td" sx={CELL}>
                    <Typography variant="body2" color="text.secondary">
                      {experience.organization}
                    </Typography>
                  </Box>

                  <Box component="td" sx={CELL}>
                    <ExperienceChips achievements={experience.achievements} />
                  </Box>
                </Box>

                {isOpen && (
                  <Box component="tr">
                    <Box component="td" colSpan={4} sx={{ ...CELL, bgcolor: 'background.paper' }}>
                      <ExperienceDetails experience={experience} expanded sx={{ maxWidth: '80ch' }} />
                    </Box>
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TableView;
