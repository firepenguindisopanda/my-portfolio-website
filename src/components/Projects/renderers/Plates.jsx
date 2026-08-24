import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { ProjectActions, ProjectMedia, creditLine, useOpenProject } from '../projectParts';

/**
 * Exhibit - the work as objects on a wall.
 *
 * Two to a row with generous gutters, each plate at 4:3 and each followed by a
 * wall label: a brass hairline, the title, then a mono credit line. The credit
 * carries what a gallery label carries - what the thing is and what it is made
 * of - drawn from the project's real category and stack rather than invented
 * fields, because a label that lists a fabricated year is worse than no label.
 *
 * Deliberately no chips and no borders around the plate. On a wall, the object
 * is the object; a frame drawn in CSS would be a second frame.
 */
const Plate = ({ project, index, onOpen }) => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const reveal = theme.custom.motion;

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: reveal.distance },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: {
          duration: reveal.duration,
          delay: Math.min(index, 5) * reveal.stagger,
          ease: reveal.ease,
        },
      };

  return (
    <motion.div {...motionProps}>
      <Box
        component="button"
        type="button"
        onClick={() => onOpen(project)}
        sx={{
          display: 'block',
          width: '100%',
          background: 'none',
          border: 'none',
          p: 0,
          textAlign: 'left',
          cursor: project.markdown ? 'pointer' : 'default',
          color: 'inherit',
          font: 'inherit',
          '&:hover h3': { color: 'primary.main' },
        }}
      >
        <Box sx={{ bgcolor: 'background.paper' }}>
          <ProjectMedia project={project} ratio="4 / 3" position="50% 20%" />
        </Box>

        {/* The wall label. */}
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'secondary.main',
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{ fontSize: '1.25rem', mb: 0.75, transition: 'color 0.4s ease' }}
          >
            {project.title}
          </Typography>

          <Typography
            variant="caption"
            color="secondary.dark"
            sx={{
              display: 'block',
              fontFamily: theme.custom.codeFont,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            {creditLine(project)}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: `${theme.custom.layout.measure}ch` }}
          >
            {project.highlight}
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <ProjectActions project={project} onOpen={onOpen} />
      </Stack>
    </motion.div>
  );
};

const Plates = ({ projects }) => {
  const onOpen = useOpenProject();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        // Wider gutters than any other mode. The space between objects is what
        // makes them read as separate objects rather than a grid of tiles.
        columnGap: { md: 8 },
        rowGap: { xs: 7, md: 10 },
      }}
    >
      {projects.map((project, index) => (
        <Plate key={project.id} project={project} index={index} onOpen={onOpen} />
      ))}
    </Box>
  );
};

export default Plates;
