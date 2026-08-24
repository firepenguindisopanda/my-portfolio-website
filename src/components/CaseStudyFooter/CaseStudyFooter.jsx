import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { usePostHog } from '@posthog/react';
import { projects } from '../../data/projects';

/**
 * Previous / next navigation at the foot of every case study, so a reader who
 * finishes one write-up is handed the next instead of a dead end. Order is the
 * projects data order, wrapping at both ends - there is always somewhere to go.
 */
const caseStudies = projects.filter((p) => p.markdown);

const NavPanel = ({ direction, project, onOpen }) => {
  const theme = useTheme();
  const isNext = direction === 'next';
  const Icon = isNext ? ArrowForwardIcon : ArrowBackIcon;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(direction, project)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isNext ? 'flex-end' : 'flex-start',
        textAlign: isNext ? 'right' : 'left',
        gap: 0.75,
        width: '100%',
        p: { xs: 2.5, md: 3 },
        bgcolor: 'background.default',
        border: 'none',
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        transition: 'background-color 0.2s ease',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
        '&:hover .case-nav-title': { color: 'primary.main' },
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          flexDirection: isNext ? 'row' : 'row-reverse',
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {isNext ? 'Next case study' : 'Previous case study'}
        </Typography>
        <Icon sx={{ fontSize: 14, color: 'text.secondary' }} />
      </Box>

      <Typography
        className="case-nav-title"
        variant="h3"
        component="span"
        sx={{
          fontSize: '1.0625rem',
          color: 'text.primary',
          transition: 'color 0.2s ease',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {project.title}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontFamily: theme.custom.codeFont }}
      >
        {project.category}
      </Typography>
    </Box>
  );
};

const CaseStudyFooter = ({ currentId }) => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const index = caseStudies.findIndex((p) => p.id === currentId);
  if (index === -1 || caseStudies.length < 2) return null;

  const count = caseStudies.length;
  const previous = caseStudies[(index - 1 + count) % count];
  const next = caseStudies[(index + 1) % count];

  const open = (direction, project) => {
    posthog?.capture('case_study_nav_clicked', {
      direction,
      from_project: currentId,
      to_project: project.id,
    });
    navigate(`/projects/${project.id}`);
  };

  return (
    <Box
      component="nav"
      aria-label="More case studies"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: '1px',
        bgcolor: 'divider',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: (theme) => `${theme.custom.radius.container}px`,
        overflow: 'hidden',
      }}
    >
      <NavPanel direction="previous" project={previous} onOpen={open} />
      <NavPanel direction="next" project={next} onOpen={open} />
    </Box>
  );
};

export default CaseStudyFooter;
