import React, { useState } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ProjectActions, ProjectMedia, useOpenProject } from '../projectParts';

/**
 * Ledger - the work as an audit sheet.
 *
 * Every project is a row and every row can be opened to show what backs it up.
 * No cards and no decorative imagery: a screenshot appears only inside an
 * expanded row, because in this mode a picture is evidence produced on request
 * rather than something the page leads with.
 *
 * Real table elements, not a div grid. A mode whose entire argument is "these
 * are auditable rows" has to announce as a table to anyone using a screen
 * reader, or the argument only works for people who can see it.
 */
const HEAD_CELL = {
  textAlign: 'left',
  py: 1,
  px: 1.5,
  borderBottom: '2px solid',
  borderColor: 'text.primary',
  whiteSpace: 'nowrap',
};

const CELL = {
  py: 1.25,
  px: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'top',
};

const ProjectRow = ({ project, onOpen }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const detailId = `project-detail-${project.id}`;

  return (
    <>
      <Box
        component="tr"
        sx={{
          transition: 'background-color 0.18s ease',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
        }}
      >
        <Box component="th" scope="row" sx={{ ...CELL, fontWeight: 400 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              background: 'none',
              border: 'none',
              p: 0,
              cursor: 'pointer',
              textAlign: 'left',
              color: 'inherit',
              font: 'inherit',
              '&:hover h3': { color: 'primary.main' },
            }}
          >
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 16,
                flexShrink: 0,
                color: 'text.secondary',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.18s ease',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            />
            <Typography
              variant="h3"
              component="h3"
              sx={{ fontSize: '1rem', transition: 'color 0.18s ease' }}
            >
              {project.title}
            </Typography>
          </Box>
          {project.topPick && (
            <Typography variant="overline" color="primary.main" sx={{ display: 'block', pl: 2.75 }}>
              Top pick
            </Typography>
          )}
        </Box>

        <Box component="td" sx={CELL}>
          <Typography variant="body2" color="text.secondary">
            {project.category}
          </Typography>
        </Box>

        <Box component="td" sx={CELL}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: theme.custom.codeFont, letterSpacing: 0 }}
          >
            {project.techLabels.join(' · ')}
          </Typography>
        </Box>

        <Box component="td" sx={{ ...CELL, whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ProjectActions project={project} onOpen={onOpen} />
          </Stack>
        </Box>
      </Box>

      {open && (
        <Box component="tr" id={detailId}>
          <Box component="td" colSpan={4} sx={{ ...CELL, bgcolor: 'background.paper', pt: 2, pb: 2.5 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              alignItems="flex-start"
            >
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, maxWidth: '60ch' }}>
                {project.highlight}
              </Typography>
              <Box
                sx={{
                  width: { xs: '100%', md: 280 },
                  flexShrink: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ProjectMedia project={project} />
              </Box>
            </Stack>
          </Box>
        </Box>
      )}
    </>
  );
};

const Table = ({ projects }) => {
  const onOpen = useOpenProject();

  return (
    // The sheet scrolls inside its own container rather than widening the page,
    // which on a phone is the difference between a scrollable table and a site
    // that pans sideways.
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}
      >
        <Box component="caption" sx={{ textAlign: 'left', pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Open a row to read what the project claims and see it running.
          </Typography>
        </Box>
        <Box component="thead">
          <Box component="tr">
            <Box component="th" scope="col" sx={HEAD_CELL}>
              <Typography variant="overline" color="text.secondary">Project</Typography>
            </Box>
            <Box component="th" scope="col" sx={HEAD_CELL}>
              <Typography variant="overline" color="text.secondary">Category</Typography>
            </Box>
            <Box component="th" scope="col" sx={HEAD_CELL}>
              <Typography variant="overline" color="text.secondary">Stack</Typography>
            </Box>
            <Box component="th" scope="col" sx={HEAD_CELL}>
              <Typography variant="overline" color="text.secondary">Links</Typography>
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} onOpen={onOpen} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Table;
