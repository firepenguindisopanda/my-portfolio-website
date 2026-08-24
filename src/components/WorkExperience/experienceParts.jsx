import React from 'react';
import { Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
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
 * Height-animated on open. Under prefers-reduced-motion framer-motion resolves
 * these to their end state immediately, so the list is simply there.
 */
export const ExperienceDetails = ({ experience, expanded, sx }) => {
  const theme = useTheme();

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          id={`experience-detail-${experience.id}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: theme.custom.motion.duration }}
          style={{ overflow: 'hidden' }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
