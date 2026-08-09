import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, useTheme, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import ConstructionIcon from '@mui/icons-material/Construction';
import SpaIcon from '@mui/icons-material/Spa';
import PANDA from '../assets/panda-struggle.svg';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

const AboutPanda = () => {
  useDocumentMeta(routeMeta('/about-panda'));

  const navigate = useNavigate();
  const theme = useTheme();

  // Panda animation variants
  const pandaVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 1
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        },
        scale: {
          duration: 0.3
        }
      }
    }
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1 + (custom * 0.2),
        duration: 0.6
      }
    })
  };

  return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'rgba(149, 114, 220, 0.12)'
              : 'rgba(235, 230, 74, 0.12)',
            zIndex: 0
          }}
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'rgba(149, 114, 220, 0.12)'
              : 'rgba(235, 230, 74, 0.12)',
            zIndex: 0
          }}
          component={motion.div}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Content */}
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
            py: 8
          }}
        >
          {/* Animated Panda */}
          <motion.div
            variants={pandaVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            style={{ marginBottom: '2rem' }}
          >
            <motion.div
              animate={floatingAnimation}
            >
              <Avatar
                alt="Panda struggling"
                src={PANDA}
                sx={{
                  width: { xs: 200, md: 300 },
                  height: { xs: 200, md: 300 },
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                  cursor: 'pointer'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            variants={textVariants}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 2,
                color: 'text.primary'
              }}
            >
              About the Panda
            </Typography>
          </motion.div>

          {/* Quote */}
          <motion.div
            variants={textVariants}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: theme.palette.primary.main,
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: 3,
                mb: 3,
                fontWeight: 500,
                fontSize: { xs: '1rem', md: '1.3rem' },
                border: '1px solid', borderColor: 'divider',
                fontStyle: 'italic'
              }}
            >
              {'"Born to dilly dally, forced to lock in"'}{" "}
              <PetsIcon sx={{ verticalAlign: 'middle', fontSize: '1.2rem' }} />
            </Box>
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            variants={textVariants}
            custom={2}
            initial="hidden"
            animate="visible"
          >
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                mb: 3,
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid', borderColor: 'divider'
              }}
            >
              <ConstructionIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1.2rem' }} />
              Coming Soon
              <ConstructionIcon sx={{ verticalAlign: 'middle', ml: 0.5, fontSize: '1.2rem' }} />
            </Box>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={textVariants}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 600,
                lineHeight: 1.6
              }}
            >
              The story behind the panda, the philosophy, and the journey. Personal insights, life lessons, and the developer&apos;s journey - watch this space!
            </Typography>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            variants={textVariants}
            custom={4}
            initial="hidden"
            animate="visible"
          >
            <Box
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 3,
                p: 3,
                mb: 4,
                maxWidth: 500
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <SpaIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1.3rem' }} />
              Panda Philosophy
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'left' }}>
                • 99% bamboo, 1% coding<br />
                • Master procrastinator, amateur achiever<br />
                • Struggling gracefully since day one<br />
                • Debugging life, one error at a time
              </Typography>
            </Box>
          </motion.div>

          {/* Back Button */}
          <motion.div
            variants={textVariants}
            custom={5}
            initial="hidden"
            animate="visible"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                border: '1px solid', borderColor: 'divider',
                '&:hover': {
                  border: '1px solid', borderColor: 'divider',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </Button>
          </motion.div>
        </Container>
      </Box>
  );
};

export default AboutPanda;
