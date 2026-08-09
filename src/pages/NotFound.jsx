import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack, Link } from '@mui/material';
import { sections } from '../data/profile';
import useDocumentMeta from '../hooks/useDocumentMeta';

/**
 * Catch-all route. Firebase Hosting rewrites every unknown path to index.html,
 * so without this a typo'd or stale URL rendered a blank page.
 */
const NotFound = () => {
  useDocumentMeta({
    title: 'Page not found',
    description: "That page doesn't exist. Everything worth seeing is on the home page.",
  });

  return (
  <Container maxWidth="sm" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
    <Typography variant="overline" color="text.secondary">
      Error 404
    </Typography>
    <Typography variant="h1" component="h1" sx={{ mt: 1, mb: 2 }}>
      This page doesn&apos;t exist
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
      The link may be out of date, or the page may have moved. Everything worth seeing is on the
      home page.
    </Typography>

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
      <Button component={RouterLink} to="/" variant="contained" size="large">
        Back to home
      </Button>
      <Button component={RouterLink} to="/#projects" variant="outlined" size="large">
        See the projects
      </Button>
    </Stack>

    <Box sx={{ mt: 6 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Or jump straight to:
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
        {sections.map((section) => (
          <Link
            key={section.id}
            component={RouterLink}
            to={`/#${section.id}`}
            variant="body2"
            underline="hover"
          >
            {section.label}
          </Link>
        ))}
      </Stack>
    </Box>
  </Container>
  );
};

export default NotFound;
