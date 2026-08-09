import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { usePostHog } from '@posthog/react';
import PROFILE from '../../assets/Nicholas_Smith_profile_pic.webp';
import { profile } from '../../data/profile';

const socials = [
  { icon: FaGithub, label: 'GitHub', href: profile.links.github },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: profile.links.linkedin },
  { icon: HiOutlineMail, label: 'Email', href: `mailto:${profile.email}` },
];

/**
 * The three-row ledger under the hero copy.
 *
 * This is the page's thesis rather than an ornament: the claim above it is
 * "systems that check their own work", and these are three named instances of
 * that, each linking to the case study that substantiates it. It replaced a row
 * of React / Node / Python / AI-ML chips, which said nothing the projects below
 * do not already say better.
 */
const EvidenceLedger = ({ items, label, onNavigate }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: { xs: 4, md: 5 } }}>
      {/* Ties the rows to the framing line above them, so they do not read as
          an unexplained list of project names. */}
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {label}
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {items.map((item) => (
          <Box
            component="li"
            key={item.id}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => onNavigate(item)}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(140px, 200px) 1fr' },
                gap: { xs: 0.5, sm: 3 },
                alignItems: 'baseline',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                px: 0,
                py: { xs: 1.5, sm: 1.75 },
                color: 'inherit',
                font: 'inherit',
                transition: 'background-color 0.2s ease',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                '&:hover .ledger-name': { color: 'primary.main' },
              }}
            >
              <Typography
                className="ledger-name"
                component="span"
                sx={{
                  fontFamily: theme.custom.codeFont,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.name}
              </Typography>
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.55 }}
              >
                {item.claim}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/**
 * Page hero. This was previously a standalone "business card" route at `/`,
 * which meant the front door showed a name and two buttons and nothing else.
 * It is now the top of the main page, so a visitor can scroll straight from
 * here into the work.
 */
const Hero = ({ onSeeWork }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const prefersReducedMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  const rise = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
      };

  const stagger = (index) =>
    prefersReducedMotion ? {} : { ...rise, transition: { ...rise.transition, delay: index * 0.06 } };

  const openLedgerItem = (item) => {
    posthog?.capture('hero_ledger_clicked', { project_id: item.id });
    navigate(`/projects/${item.id}`);
  };

  return (
    <Box component="section" sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' },
            gap: { xs: 4, md: 6 },
            alignItems: 'start',
          }}
        >
          {/* Copy */}
          <Box>
            <motion.div {...stagger(0)}>
              <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 2 }}>
                {profile.role} &middot; {profile.location}
              </Typography>
            </motion.div>

            <motion.div {...stagger(1)}>
              <Typography
                variant="h1"
                component="h1"
                sx={{ mb: 2.5, fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }}
              >
                {profile.name}
              </Typography>
            </motion.div>

            <motion.div {...stagger(2)}>
              <Typography
                sx={{
                  fontFamily: theme.custom.displayFont,
                  fontSize: { xs: '1.125rem', md: '1.3125rem' },
                  fontWeight: 500,
                  lineHeight: 1.4,
                  letterSpacing: '-0.015em',
                  color: 'text.primary',
                  maxWidth: 620,
                  mb: 2,
                }}
              >
                {profile.thesis}
              </Typography>
            </motion.div>

            <motion.div {...stagger(3)}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 620 }}>
                {profile.proof}
              </Typography>
            </motion.div>

            {/*
              * These duplicate what the projects below already demonstrate, and
              * are kept for the readers who are not reading: recruiter keyword
              * scanners and ATS-style tooling match on the plain skill names.
              */}
            <motion.div {...stagger(4)}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3.5 }}>
                {profile.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    sx={{
                      fontFamily: theme.custom.codeFont,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    }}
                  />
                ))}
              </Stack>
            </motion.div>

            <motion.div {...stagger(5)}>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowDownwardIcon />}
                  onClick={() => {
                    posthog?.capture('hero_see_work_clicked');
                    onSeeWork?.();
                  }}
                >
                  See my work
                </Button>
                <Button
                  component="a"
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="large"
                  onClick={() => posthog?.capture('resume_downloaded', { source: 'hero' })}
                >
                  Resume
                </Button>
              </Stack>
            </motion.div>

            <motion.div {...stagger(6)}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {socials.map(({ icon: Icon, label, href }) => (
                  <IconButton
                    key={label}
                    href={href}
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={label}
                    sx={{
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                    }}
                  >
                    <Icon size={18} />
                  </IconButton>
                ))}

                <Box sx={{ display: 'flex', gap: 1, ml: { sm: 1 } }}>
                  <Chip
                    icon={<LocationOnIcon />}
                    label="Port of Spain"
                    size="small"
                    variant="outlined"
                    sx={{ color: 'text.secondary' }}
                  />
                  {profile.available && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Available"
                      size="small"
                      variant="outlined"
                      sx={{
                        color: 'success.main',
                        borderColor: alpha(theme.palette.success.main, 0.4),
                        '& .MuiChip-icon': { color: 'success.main' },
                      }}
                    />
                  )}
                </Box>
              </Stack>
            </motion.div>
          </Box>

          {/* Portrait */}
          <motion.div
            {...(prefersReducedMotion ? {} : { ...rise, transition: { ...rise.transition, delay: 0.12 } })}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: 240, md: 300 },
                mx: { xs: 'auto', md: 0 },
                aspectRatio: '3 / 4',
                borderRadius: `${theme.custom.radius.container}px`,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {imgError ? (
                <Typography sx={{ fontSize: '3rem' }} role="img" aria-label="Panda">
                  🐼
                </Typography>
              ) : (
                <Box
                  component="img"
                  src={PROFILE}
                  alt={`${profile.name}, ${profile.role}`}
                  width={300}
                  height={400}
                  onError={() => setImgError(true)}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </Box>
          </motion.div>
        </Box>

        <motion.div {...(prefersReducedMotion ? {} : { ...rise, transition: { ...rise.transition, delay: 0.3 } })}>
          <EvidenceLedger
            items={profile.heroLedger}
            label={profile.heroLedgerLabel}
            onNavigate={openLedgerItem}
          />
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
