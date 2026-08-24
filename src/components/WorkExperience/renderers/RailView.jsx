import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { RAIL_WIDTH } from '../../../utilities/themeConfig';
import { DetailsToggle, ExperienceChips, ExperienceDetails } from '../experienceParts';

/**
 * Notebook - dates written in the margin.
 *
 * The most natural fit in the set: a dated record keeps its dates in the margin
 * and its account in the column, which is exactly what a work history is. No
 * cards, no timeline rail drawn in - the margin itself is the timeline.
 */
const RailView = ({ experiences, expanded, onToggle }) => {
  const theme = useTheme();

  return (
    <Box>
      {experiences.map((experience, index) => {
        const isOpen = expanded.has(experience.id);
        const isLast = index === experiences.length - 1;

        return (
          <Box
            key={experience.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: `${RAIL_WIDTH}px minmax(0, 1fr)` },
              ml: { md: `-${RAIL_WIDTH}px` },
              rowGap: 1,
              ...(isLast
                ? {}
                : {
                    pb: { xs: 3, md: 3.5 },
                    mb: { xs: 3, md: 3.5 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }),
            }}
          >
            <Box sx={{ pr: { md: 3 }, pt: { md: 0.5 } }}>
              <Typography
                variant="caption"
                color="secondary.main"
                sx={{
                  display: 'block',
                  fontFamily: theme.custom.codeFont,
                  letterSpacing: 0,
                  lineHeight: 1.6,
                }}
              >
                {experience.period}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3" component="h3" sx={{ fontSize: '1.15rem', mb: 0.5 }}>
                {experience.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {experience.organization}
              </Typography>
              <ExperienceChips achievements={experience.achievements} />
              <DetailsToggle
                experience={experience}
                expanded={isOpen}
                onToggle={onToggle}
                sx={{ ml: -1, mt: 0.5 }}
              />
              <ExperienceDetails
                experience={experience}
                expanded={isOpen}
                sx={{ maxWidth: `${theme.custom.layout.measure}ch` }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default RailView;
