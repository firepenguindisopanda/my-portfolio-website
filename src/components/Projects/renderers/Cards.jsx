import React from 'react';
import { Box, Card, CardActions, CardContent, Chip, Grid, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Reveal from '../../Reveal/Reveal';
import { ProjectActions, ProjectMedia, TechChips, useOpenProject } from '../projectParts';

/**
 * Instrument - a modular card grid.
 *
 * The reference renderer, and the one the default mode uses: its markup is what
 * Projects.test.jsx asserts against, so changes here are changes to the
 * contract, not just to the look.
 */
const ProjectCard = ({ project, index, onOpen }) => {
  const theme = useTheme();

  return (
    // Capped at six steps: past that the last card in a long grid arrives late
    // enough to read as broken rather than staggered.
    <Reveal delay={Math.min(index, 5) * theme.custom.motion.stagger} sx={{ height: '100%' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: project.markdown ? 'pointer' : 'default',
          ...(project.topPick && { borderColor: alpha(theme.palette.primary.main, 0.5) }),
        }}
        onClick={() => onOpen(project)}
      >
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <ProjectMedia project={project} />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.25, p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="overline" color="text.secondary">
              {project.category}
            </Typography>
            {project.topPick && (
              <Chip
                label="Top pick"
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.65rem', letterSpacing: '0.04em' }}
              />
            )}
          </Stack>

          <Typography variant="h3" component="h3" sx={{ fontSize: '1.125rem' }}>
            {project.title}
          </Typography>

          {/* No line clamp: the highlight is written short enough to fit. */}
          <Typography variant="body2" color="text.secondary">
            {project.highlight}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1 }}>
            <TechChips labels={project.techLabels} />
          </Box>
        </CardContent>

        <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1 }}>
          <ProjectActions project={project} onOpen={onOpen} />
        </CardActions>
      </Card>
    </Reveal>
  );
};

const Cards = ({ projects }) => {
  const onOpen = useOpenProject();

  return (
    <Grid container spacing={3}>
      {projects.map((project, index) => (
        <Grid item xs={12} sm={6} lg={4} key={project.id}>
          <ProjectCard project={project} index={index} onOpen={onOpen} />
        </Grid>
      ))}
    </Grid>
  );
};

export default Cards;
