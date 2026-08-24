import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { RAIL_WIDTH } from '../../../utilities/themeConfig';
import { ProjectActions, ProjectMedia, useOpenProject } from '../projectParts';

/**
 * Notebook - the work as dated entries in one column.
 *
 * Each project is an entry, separated by a rule rather than boxed in a card,
 * because a bound notebook has no cards in it. The category and stack sit out
 * in the margin rail beside the entry the way an annotation does, and the
 * screenshot breaks left across the rail so a plate is wider than the text it
 * belongs to - which is what a photograph pasted into a notebook actually does.
 */
const Entry = ({ project, index, onOpen, isLast }) => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const reveal = theme.custom.motion;

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: reveal.distance },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: {
          duration: reveal.duration,
          delay: Math.min(index, 5) * reveal.stagger,
          ease: reveal.ease,
        },
      };

  return (
    <motion.div {...motionProps}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: `${RAIL_WIDTH}px minmax(0, 1fr)` },
          // Matches the negative margin SectionHeading uses, so the rail runs
          // as one straight edge from the heading down through every entry.
          ml: { md: `-${RAIL_WIDTH}px` },
          columnGap: { md: 0 },
          rowGap: 1.5,
          // The last entry draws no rule: a trailing hairline reads as the end
          // of the section rather than the end of an entry.
          ...(isLast
            ? {}
            : {
                pb: { xs: 4, md: 5 },
                mb: { xs: 4, md: 5 },
                borderBottom: '1px solid',
                borderColor: 'divider',
              }),
        }}
      >
        {/* Margin rail: what the entry is, not what it says. */}
        <Box sx={{ pr: { md: 3 }, pt: { md: 0.5 } }}>
          <Typography variant="overline" color="secondary.main" sx={{ display: 'block', mb: 1 }}>
            {project.category}
          </Typography>
          {project.topPick && (
            <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 1 }}>
              Top pick
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              fontFamily: theme.custom.codeFont,
              letterSpacing: 0,
              lineHeight: 1.7,
              // One technology per line, stacked down the margin like a list of
              // materials. Without pre-line the newlines collapse to spaces.
              whiteSpace: 'pre-line',
            }}
          >
            {project.techLabels.join('\n')}
          </Typography>
        </Box>

        {/* The entry itself, at the mode's measure. */}
        <Box>
          <Box
            component="button"
            type="button"
            onClick={() => onOpen(project)}
            sx={{
              display: 'block',
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
            <Typography
              variant="h3"
              component="h3"
              sx={{ fontSize: '1.15rem', mb: 1, transition: 'color 0.3s ease' }}
            >
              {project.title}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: `${theme.custom.layout.measure}ch`, mb: 2 }}
          >
            {project.highlight}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <ProjectActions project={project} onOpen={onOpen} />
          </Stack>
        </Box>

        {/*
          * Plate, breaking back across the rail so it starts left of the entry
          * it belongs to - a photograph pasted in past the margin line.
          *
          * Capped rather than full-bleed: at the container's full width this
          * runs about 490px tall and reads as a hero image, which inverts the
          * relationship. The note is the point; the plate illustrates it.
          */}
        {project.screenshot && (
          <Box
            sx={{
              gridColumn: { md: '1 / -1' },
              mt: { xs: 0.5, md: 2 },
              maxWidth: 600,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${theme.custom.radius.container}px`,
              overflow: 'hidden',
            }}
          >
            <ProjectMedia project={project} ratio="16 / 9" />
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

const Entries = ({ projects }) => {
  const onOpen = useOpenProject();

  return (
    <Box>
      {projects.map((project, index) => (
        <Entry
          key={project.id}
          project={project}
          index={index}
          onOpen={onOpen}
          isLast={index === projects.length - 1}
        />
      ))}
    </Box>
  );
};

export default Entries;
