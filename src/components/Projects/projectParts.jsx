import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { Box, Button, Chip, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';

/**
 * Leaf pieces every project renderer shares.
 *
 * The four modes differ in how projects are arranged, not in what a project is.
 * Anything carrying behaviour - the analytics events, the scroll stash, the
 * link targets - lives here so a renderer cannot quietly drift from the others
 * on the parts that are supposed to be identical.
 */

/**
 * Opens a case study, stashing scroll position first.
 *
 * The stash is what lets the back button return the visitor to the card they
 * clicked instead of the top of the page - see useScrollRestore.
 */
export const useOpenProject = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  return React.useCallback(
    (project) => {
      if (!project.markdown) return;
      posthog?.capture('project_viewed', {
        project_id: project.id,
        project_title: project.title,
        category: project.category,
      });
      try {
        sessionStorage.setItem('projectsScrollY', String(globalThis.scrollY || 0));
      } catch {
        // Private browsing blocks sessionStorage; scroll restore is optional.
      }
      navigate(`/projects/${project.id}`);
    },
    [navigate, posthog]
  );
};

/**
 * A project screenshot at whatever aspect the mode frames it in.
 *
 * The zoom keys off `.project-media:hover` rather than a Card selector, because
 * only one of the four renderers puts these inside a Card.
 */
export const Thumb = ({ project, ratio = '16 / 9', position = '50% 25%' }) => (
  <Box className="project-media" sx={{ overflow: 'hidden', lineHeight: 0 }}>
    <Box
      component="img"
      src={project.screenshot}
      alt={`${project.title} screenshot`}
      loading="lazy"
      width={1200}
      height={675}
      sx={{
        width: '100%',
        // height:auto is load-bearing - without it the height attribute above
        // makes both dimensions definite and aspectRatio is ignored, stretching
        // the band into a portrait strip.
        height: 'auto',
        aspectRatio: ratio,
        objectFit: 'cover',
        // Slightly below the top edge, so thumbnails taller than the frame show
        // their middle instead of only their header.
        objectPosition: position,
        display: 'block',
        transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        '.project-media:hover &': { transform: 'scale(1.035)' },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '.project-media:hover &': { transform: 'none' },
        },
      }}
    />
  </Box>
);

/**
 * Stand-in for a project without a screenshot: its tech icons on a flat tinted
 * panel. Every project with a reachable live URL should get a real capture
 * instead - see src/assets/screenshots.
 */
export const IconPlaceholder = ({ techIcons, ratio = '16 / 9' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        aspectRatio: ratio,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
      }}
    >
      {techIcons.slice(0, 3).map(({ Icon, src, label }) => (
        <Box
          key={label || Icon?.name}
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {Icon ? <Icon style={{ width: 22, height: 22 }} /> : <img src={src} alt="" width="22" height="22" />}
        </Box>
      ))}
    </Box>
  );
};

/** Screenshot when there is one, icons when there is not. */
export const ProjectMedia = ({ project, ratio, position }) =>
  project.screenshot ? (
    <Thumb project={project} ratio={ratio} position={position} />
  ) : (
    <IconPlaceholder techIcons={project.techIcons} ratio={ratio} />
  );

export const TechChips = ({ labels, size = '0.7rem' }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
      {labels.map((tech) => (
        <Chip
          key={tech}
          label={tech}
          size="small"
          sx={{
            fontFamily: theme.custom.codeFont,
            fontSize: size,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
          }}
        />
      ))}
    </Stack>
  );
};

/**
 * Case study, live site, source. `stopPropagation` on the outward links because
 * in the card and entry renderers the whole surface is also a click target, and
 * without it opening the repo would navigate to the case study underneath.
 */
export const ProjectActions = ({ project, onOpen, size = 'small' }) => {
  const posthog = usePostHog();

  return (
    <>
      {project.markdown && (
        <Button size={size} variant="contained" onClick={() => onOpen(project)}>
          Case study
        </Button>
      )}
      {project.demoLink && (
        <Button
          size={size}
          variant="outlined"
          startIcon={<LaunchIcon />}
          href={project.demoLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            posthog?.capture('project_demo_clicked', { project_id: project.id });
          }}
        >
          Live
        </Button>
      )}
      {project.repoLink && (
        <Button
          size={size}
          startIcon={<GitHubIcon />}
          href={project.repoLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'text.secondary' }}
          onClick={(e) => {
            e.stopPropagation();
            posthog?.capture('project_github_clicked', { project_id: project.id });
          }}
        >
          Code
        </Button>
      )}
    </>
  );
};

/** The mono credit line a project carries where a mode labels rather than describes. */
export const creditLine = (project) =>
  [project.category, ...project.techLabels].filter(Boolean).join(' · ');

export default ProjectActions;
