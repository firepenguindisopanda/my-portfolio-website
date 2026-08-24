import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Surface from '../../Surface/Surface';
import { DetailsToggle, ExperienceChips, ExperienceDetails } from '../experienceParts';

/**
 * Exhibit - one role per band, with air between.
 *
 * A gallery does not hang its objects on a timeline, and it does not crowd
 * them. Each role gets a brass hairline, the title at size, and the room to be
 * read on its own rather than compared against the one above it.
 */
const StackView = ({ experiences, expanded, onToggle }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 5 } }}>
      {experiences.map((experience) => {
        const isOpen = expanded.has(experience.id);

        return (
          <Surface key={experience.id} interactive={false} sx={{ height: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 220px' },
                gap: { xs: 1.5, md: 4 },
                alignItems: 'start',
              }}
            >
              <Box>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.3rem', mb: 0.75 }}>
                  {experience.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {experience.organization}
                </Typography>
                <ExperienceChips achievements={experience.achievements} />
              </Box>

              <Typography
                variant="caption"
                color="secondary.dark"
                sx={{
                  fontFamily: theme.custom.codeFont,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  justifySelf: { md: 'end' },
                  textAlign: { md: 'right' },
                }}
              >
                {experience.period}
              </Typography>
            </Box>

            <DetailsToggle
              experience={experience}
              expanded={isOpen}
              onToggle={onToggle}
              sx={{ ml: -1, mt: 1, alignSelf: 'flex-start' }}
            />
            <ExperienceDetails
              experience={experience}
              expanded={isOpen}
              sx={{ maxWidth: `${theme.custom.layout.measure}ch` }}
            />
          </Surface>
        );
      })}
    </Box>
  );
};

export default StackView;
