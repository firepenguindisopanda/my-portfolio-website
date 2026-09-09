import React from 'react';
import { Box, Button, Chip, Collapse, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/** Leaf pieces every experience renderer shares. */

export const ExperienceChips = ({ achievements }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {achievements.slice(0, 3).map((achievement) => (
        <Chip
          key={achievement}
          label={achievement}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      ))}
    </Stack>
  );
};

export const DetailsToggle = ({ experience, expanded, onToggle, sx }) => (
  <Button
    size="small"
    onClick={() => onToggle(experience.id)}
    startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    aria-expanded={expanded}
    aria-controls={`experience-detail-${experience.id}`}
    sx={{ color: 'primary.main', ...sx }}
  >
    {expanded ? 'Less details' : 'View details'}
  </Button>
);

/**
 * The task list behind an entry.
 *
 * MUI's Collapse rather than a framer height tween: it rides the transition
 * library MUI already ships, and a height animation is the one kind no
 * reduced-motion policy catches on its own, so the timeout is zeroed here.
 * `unmountOnExit` keeps the closed panel out of the tab order and the
 * accessibility tree, which is what `aria-expanded` on the toggle promises.
 */
export const ExperienceDetails = ({ experience, expanded, sx }) => {
  const theme = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Collapse
      id={`experience-detail-${experience.id}`}
      in={expanded}
      timeout={prefersReducedMotion ? 0 : theme.custom.motion.duration * 1000}
      unmountOnExit
    >
          <Stack spacing={1.5} sx={{ pt: 1.5, ...sx }}>
            {experience.items.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 0.75,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderRadius: `${theme.custom.radius.control}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 28,
                    height: 28,
                    mt: 0.25,
                    flexShrink: 0,
                  }}
                >
                  <item.icon sx={{ fontSize: 15, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
    </Collapse>
  );
};
