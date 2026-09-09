import React from 'react';
import { Container, Box } from '@mui/material';
import AcademicAchievements from '../components/AcademicAchievements/AcademicAchievements';
import ExtraCurricular from '../components/TechnicalSkills/ExtraCurricular';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

/**
 * Where the supporting record lives.
 *
 * Both of these were on the home page, between Credentials and Contact, and
 * together they were 2,026px - 21% of the scroll - of material that answers a
 * question nobody asks before they have decided they are interested. The home
 * page keeps the six credentials that speak to the work and hands off here.
 *
 * This is not an archive nobody visits: the full certificate index and the
 * mentoring record are both things a reader goes looking for on purpose, and
 * giving them a page means neither has to be compressed to earn its place. The
 * mentoring entries in particular were competing for room with a contact form.
 */
const Background = () => {
  useDocumentMeta(routeMeta('/background'));

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box component="section" id="credentials">
        <AcademicAchievements full />
      </Box>

      <Box component="section" id="community">
        <ExtraCurricular />
      </Box>
    </Container>
  );
};

export default Background;
