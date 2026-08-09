import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

/**
 * The one section heading used across the page.
 *
 * Previously nine consecutive sections each rendered their own centred, teal,
 * 700-weight, 2.5rem heading, so nothing signalled which section mattered.
 * These are left-aligned in the primary text colour with a small accent rule,
 * which reads as structure rather than decoration.
 */
const SectionHeading = ({ eyebrow, title, description, action, id }) => (
  <Box sx={{ mb: { xs: 3, md: 4 } }}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
    >
      <Box sx={{ maxWidth: 640 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 0.5 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h2" component="h2" id={id ? `${id}-heading` : undefined}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>

    <Box
      sx={{
        mt: 2,
        width: 48,
        height: 2,
        bgcolor: 'primary.main',
        borderRadius: 0,
      }}
    />
  </Box>
);

export default SectionHeading;
