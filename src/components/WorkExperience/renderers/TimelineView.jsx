import React from 'react';
import { Box, Card, CardActions, CardContent, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import Reveal from '../../Reveal/Reveal';
import { DetailsToggle, ExperienceChips, ExperienceDetails } from '../experienceParts';

/**
 * Instrument - a dated timeline of cards.
 *
 * The reference renderer. Below `md` the dots and connectors would take a third
 * of the width to say what the periods already say, so the rail drops away and
 * the cards stack.
 */
const ExperienceCard = ({ experience, expanded, onToggle }) => {
  const theme = useTheme();

  return (
    <Reveal sx={{ width: '100%' }}>
      <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ px: 2, py: 1.5 }}>
        <Typography variant="h3" component="h3" sx={{ fontSize: '1.05rem' }}>
          {experience.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {experience.organization}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.custom.codeFont }}>
          {experience.period}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <ExperienceChips achievements={experience.achievements} />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pt: 0, pb: 1 }}>
        <DetailsToggle experience={experience} expanded={expanded} onToggle={onToggle} />
      </CardActions>

      <Box sx={{ px: 2, pb: expanded ? 1.5 : 0 }}>
        <ExperienceDetails experience={experience} expanded={expanded} />
      </Box>
      </Card>
    </Reveal>
  );
};

const TimelineView = ({ experiences, expanded, onToggle }) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  if (isCompact) {
    return (
      <Stack spacing={3}>
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            expanded={expanded.has(experience.id)}
            onToggle={onToggle}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Timeline position="right" sx={{ p: 0, maxWidth: 860 }}>
      {experiences.map((experience, idx) => (
        // The card carries the organisation and period, so the opposite-content
        // column would just repeat them. ::before is MUI Lab's spacer for it.
        <TimelineItem key={experience.id} sx={{ '&::before': { display: 'none' } }}>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: 'primary.main',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                m: 0,
              }}
            >
              <experience.icon sx={{ color: 'primary.main', fontSize: 18 }} />
            </TimelineDot>
            {idx < experiences.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <ExperienceCard
              experience={experience}
              expanded={expanded.has(experience.id)}
              onToggle={onToggle}
            />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default TimelineView;
