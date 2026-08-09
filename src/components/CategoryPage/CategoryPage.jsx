import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import { usePostHog } from '@posthog/react';
import { projects as allProjects } from '../../data/projects';
import EvidenceLine from '../Evidence/EvidenceLine';

/**
 * One layout for every deep-dive route.
 *
 * /fullstack and /desktop previously rendered a VS Code pastiche whose detail
 * pane was a thinner copy of the /projects/:id case study, while /ml used a
 * third layout again - three category pages in three design languages, and one
 * of them duplicating the page it linked to. This component is the single
 * treatment they now share, and it never shows detail: every row hands off to
 * the case study, which is the only place depth lives.
 *
 * Rows are deliberately not numbered and not alternated left/right. Neither
 * order nor side carries information here, and a zigzag costs scanning speed
 * for decoration.
 */

/** Projects with a live URL are labelled as such - it is the strongest signal a row can carry. */
const StatusChip = ({ project }) => {
  if (!project.liveUrl) return null;
  return (
    <Chip
      label="Live"
      size="small"
      color="success"
      variant="outlined"
      sx={{ height: 20, fontSize: '0.65rem', letterSpacing: '0.04em' }}
    />
  );
};

const MediaPanel = ({ project }) => {
  const theme = useTheme();
  const image = project.screenshot || project.thumbnail;

  if (image) {
    return (
      <Box
        component="img"
        src={image}
        alt={`${project.title} screenshot`}
        loading="lazy"
        sx={{
          width: '100%',
          height: 'auto',
          aspectRatio: '16 / 10',
          objectFit: 'cover',
          objectPosition: '50% 20%',
          display: 'block',
          borderRadius: `${theme.custom.radius.control}px`,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
    );
  }

  const icons = project.techIcons || [];

  // No capture yet. Tech marks if the project has them, and otherwise the stack
  // set in mono - anything rather than an empty tinted rectangle, which reads
  // as a broken image rather than as a project without a screenshot.
  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '16 / 10',
        display: 'flex',
        flexDirection: icons.length ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: icons.length ? 2 : 0.75,
        px: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        borderRadius: `${theme.custom.radius.control}px`,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {icons.length > 0
        ? icons.slice(0, 3).map(({ Icon, src, label }) => (
            <Box
              key={label || Icon?.name}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {Icon ? <Icon style={{ width: 20, height: 20 }} /> : <img src={src} alt="" width="20" height="20" />}
            </Box>
          ))
        : (project.primaryTech || project.technologies || []).slice(0, 4).map((tech) => (
            <Typography
              key={tech}
              sx={{
                fontFamily: theme.custom.codeFont,
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: alpha(theme.palette.primary.main, 0.75),
              }}
            >
              {tech}
            </Typography>
          ))}
    </Box>
  );
};

const ProjectRow = ({ project, index, surface }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const prefersReducedMotion = useReducedMotion();

  const openCaseStudy = () => {
    if (!project.markdown) return;
    posthog?.capture('project_viewed', {
      project_id: project.id,
      project_title: project.title,
      category: project.category,
      surface,
    });
    navigate(`/projects/${project.id}`);
  };

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.4, delay: Math.min(index, 4) * 0.05, ease: [0.4, 0, 0.2, 1] },
      };

  const techLabels = (project.primaryTech || project.technologies || []).slice(0, 5);

  return (
    <motion.div {...motionProps}>
      <Card
        component="article"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: { xs: 3, md: 4 },
          cursor: project.markdown ? 'pointer' : 'default',
        }}
        onClick={openCaseStudy}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 280px) minmax(0, 1fr)' },
            gap: { xs: 2.5, md: 4 },
            alignItems: 'start',
          }}
        >
          <MediaPanel project={project} />

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="overline" color="text.secondary">
                {project.category}
              </Typography>
              <StatusChip project={project} />
            </Stack>

            <Typography variant="h3" component="h2" sx={{ mb: 1.25 }}>
              {project.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {project.highlight || project.shortDescription}
            </Typography>

            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: project.evidence ? 2.5 : 2 }}>
              {techLabels.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  sx={{
                    fontFamily: theme.custom.codeFont,
                    fontSize: '0.6875rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                  }}
                />
              ))}
            </Stack>

            {project.evidence && (
              <Box sx={{ mb: 2.5 }}>
                <EvidenceLine text={project.evidence} compact />
              </Box>
            )}

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {project.markdown && (
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={openCaseStudy}
                >
                  Case study
                </Button>
              )}
              {project.liveUrl && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<LaunchIcon />}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    posthog?.capture('project_demo_clicked', { project_id: project.id, surface });
                  }}
                >
                  Live
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  size="small"
                  startIcon={<GitHubIcon />}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'text.secondary' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    posthog?.capture('project_github_clicked', { project_id: project.id, surface });
                  }}
                >
                  Code
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

/**
 * @param {string}   eyebrow      mono kicker above the title
 * @param {string}   title        page heading
 * @param {string}   description  one sentence on what this collection is
 * @param {string[]} categories   project categories to include, in data order
 * @param {string}   surface      analytics label for this route
 * @param {string}   emptyMessage shown when no project matches yet
 */
const CategoryPage = ({ eyebrow, title, description, categories, surface, emptyMessage }) => {
  const navigate = useNavigate();

  const projects = useMemo(
    () => allProjects.filter((p) => categories.includes(p.category)),
    [categories],
  );

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 8 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        size="small"
        sx={{ mb: 4, ml: -1, color: 'text.secondary' }}
      >
        All work
      </Button>

      <Box sx={{ mb: { xs: 5, md: 7 }, maxWidth: 720 }}>
        <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 1 }}>
          {eyebrow}
        </Typography>
        <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: { xs: '2.25rem', md: '2.75rem' } }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="overline" color="text.secondary">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </Typography>
        </Box>
      </Box>

      {projects.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 4, md: 6 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" component="p" sx={{ mb: 1.5 }}>
            Nothing here yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>
            {emptyMessage}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')} endIcon={<ArrowForwardIcon />}>
            See the shipped work
          </Button>
        </Box>
      ) : (
        projects.map((project, index) => (
          <ProjectRow key={project.id} project={project} index={index} surface={surface} />
        ))
      )}
    </Container>
  );
};

export default CategoryPage;
