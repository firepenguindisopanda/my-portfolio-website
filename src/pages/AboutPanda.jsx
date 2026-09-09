import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, useTheme, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import ConstructionIcon from '@mui/icons-material/Construction';
import SpaIcon from '@mui/icons-material/Spa';
import PANDA from '../assets/panda-struggle.svg';
import useDocumentMeta from '../hooks/useDocumentMeta';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../utilities/gsapSetup';
import { routeMeta } from '../data/routes';

/**
 * The panda's page.
 *
 * The one place on the site that is allowed to be playful, and the choreography
 * from the framer-motion version is kept: the panda springs in and then floats,
 * the two background discs breathe, the copy steps in line by line, and a
 * hover makes the panda wiggle. All of it now runs on GSAP, and none of it
 * runs for a visitor who asked for less motion - they get the page settled.
 */
const AboutPanda = () => {
  useDocumentMeta(routeMeta('/about-panda'));

  const navigate = useNavigate();
  const theme = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const root = useRef(null);
  const pandaRef = useRef(null);
  const wiggle = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      // Entrance, then the idle loops start where the entrance leaves off.
      const tl = gsap.timeline();
      tl.from('.panda-figure', { scale: 0, rotation: -180, duration: 1, ease: 'back.out(1.4)' })
        .from('.panda-line', { opacity: 0, y: 20, duration: 0.6, stagger: 0.2, ease: 'power2.out' }, 0.6)
        .add(() => {
          gsap.to('.panda-figure', { y: -20, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        }, 1);

      gsap.to('.panda-disc-a', { scale: 1.2, opacity: 0.5, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.panda-disc-b', { scale: 1.3, opacity: 0.4, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 });
    },
    { scope: root, dependencies: [prefersReducedMotion] }
  );

  const startWiggle = () => {
    if (!gsapEnabled || prefersReducedMotion || wiggle.current) return;
    wiggle.current = gsap.to(pandaRef.current, {
      keyframes: { rotation: [0, -10, 10, -10, 0] },
      scale: 1.1,
      duration: 2,
      repeat: -1,
      ease: 'sine.inOut',
    });
  };

  const stopWiggle = () => {
    wiggle.current?.kill();
    wiggle.current = null;
    if (gsapEnabled) gsap.to(pandaRef.current, { rotation: 0, scale: 1, duration: 0.3 });
  };

  const disc = (extra) => ({
    position: 'absolute',
    borderRadius: '50%',
    bgcolor: alpha(theme.palette.primary.main, 0.12),
    opacity: 0.3,
    zIndex: 0,
    ...extra,
  });

  return (
    <Box
      ref={root}
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box className="panda-disc-a" aria-hidden sx={disc({ top: '10%', right: '10%', width: 200, height: 200 })} />
      <Box className="panda-disc-b" aria-hidden sx={disc({ bottom: '20%', left: '5%', width: 150, height: 150, opacity: 0.2 })} />

      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          py: 8,
        }}
      >
        <Box
          className="panda-figure"
          ref={pandaRef}
          onMouseEnter={startWiggle}
          onMouseLeave={stopWiggle}
          sx={{ mb: 4 }}
        >
          <Avatar
            alt="Panda struggling"
            src={PANDA}
            sx={{ width: { xs: 200, md: 300 }, height: { xs: 200, md: 300 } }}
          />
        </Box>

        <Typography
          className="panda-line"
          variant="h1"
          sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '4rem' }, mb: 2, color: 'text.primary' }}
        >
          About the Panda
        </Typography>

        <Box
          className="panda-line"
          sx={{
            display: 'inline-block',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 4,
            py: 2,
            borderRadius: `${theme.custom.radius.container}px`,
            mb: 3,
            fontWeight: 500,
            fontSize: { xs: '1rem', md: '1.3rem' },
            fontStyle: 'italic',
          }}
        >
          {'"Born to dilly dally, forced to lock in"'}{' '}
          <PetsIcon sx={{ verticalAlign: 'middle', fontSize: '1.2rem' }} />
        </Box>

        <Box
          className="panda-line"
          sx={{
            display: 'inline-block',
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            px: 3,
            py: 1,
            borderRadius: `${theme.custom.radius.control}px`,
            mb: 3,
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          <ConstructionIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1.2rem' }} />
          Coming Soon
          <ConstructionIcon sx={{ verticalAlign: 'middle', ml: 0.5, fontSize: '1.2rem' }} />
        </Box>

        <Typography
          className="panda-line"
          variant="h5"
          component="p"
          sx={{ color: 'text.secondary', mb: 4, maxWidth: 600, lineHeight: 1.6 }}
        >
          The story behind the panda, the philosophy, and the journey. Personal insights, life lessons,
          and the developer&apos;s journey - watch this space!
        </Typography>

        <Box
          className="panda-line"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: `${theme.custom.radius.container}px`,
            p: 3,
            mb: 4,
            maxWidth: 500,
            textAlign: 'left',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            <SpaIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1.3rem' }} />
            Panda Philosophy
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
            <li>99% bamboo, 1% coding</li>
            <li>Master procrastinator, amateur achiever</li>
            <li>Struggling gracefully since day one</li>
            <li>Debugging life, one error at a time</li>
          </Box>
        </Box>

        <Box className="panda-line">
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPanda;
