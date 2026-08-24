import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ScrollTop from '../components/BackToTop/BackToTop';
import Hero from '../components/Hero/Hero';
import RangeBoard from '../components/Range/RangeBoard';
import AboutMe from '../components/AboutMe/AboutMe';
import Projects from '../components/Projects/Projects';
import WorkExperience from '../components/WorkExperience/WorkExperience';
import TechnicalExperiences from '../components/TechnicalExperiences/TechnicalExperiences';
import IconCarousel from '../components/iconcarousel/IconCarousel';
import AcademicAchievements from '../components/AcademicAchievements/AcademicAchievements';
import OnlineLearningBadges from '../components/OnlineLearningBadges/OnlineLearningBadges';
import ExtraCurricular from '../components/TechnicalSkills/ExtraCurricular';
import Contact from '../components/contact/Contact';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

const SECTION_OFFSET = 72;

/**
 * Section order answers the two questions an employer opens a portfolio with -
 * what have you built, and where have you worked - before anything else.
 * Projects and experience used to sit 3rd and 9th, behind ~7,000px of
 * certificates and values cards.
 */
const Home = () => {
  useDocumentMeta(routeMeta('/'));

  const location = useLocation();
  const projectsRef = useRef(null);

  const scrollToProjects = useCallback(() => {
    const el = document.getElementById('projects');
    if (!el) return;
    globalThis.scrollTo({
      top: el.getBoundingClientRect().top + globalThis.scrollY - SECTION_OFFSET,
      behavior: 'smooth',
    });
  }, []);

  // Honour ?#section links and cross-page navigation from the app bar.
  useEffect(() => {
    const target = location.state?.scrollTo || location.hash?.slice(1);
    if (!target) return;
    // Wait a frame so lazily-rendered sections have laid out.
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(target);
      if (!el) return;
      globalThis.scrollTo({
        top: el.getBoundingClientRect().top + globalThis.scrollY - SECTION_OFFSET,
        behavior: 'smooth',
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [location]);

  return (
    <>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box id="back-to-top-anchor" />

        <Hero onSeeWork={scrollToProjects} />

        <Box component="section" id="range" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <RangeBoard />
        </Box>

        <Box component="section" id="projects" ref={projectsRef} sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <Projects />
        </Box>

        <Box component="section" id="experience" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <WorkExperience />
        </Box>

        <Box component="section" id="about" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <AboutMe />
        </Box>

        <Box component="section" id="skills" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <TechnicalExperiences />
          <IconCarousel />
        </Box>

        <Box component="section" id="credentials" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <AcademicAchievements />
          <OnlineLearningBadges />
        </Box>

        <Box component="section" id="community" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <ExtraCurricular />
        </Box>

        <Box component="section" id="contact" sx={{ scrollMarginTop: SECTION_OFFSET }}>
          <Contact />
        </Box>
      </Container>

      <ScrollTop>
        <Fab size="small" aria-label="Scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  );
};

export default Home;
