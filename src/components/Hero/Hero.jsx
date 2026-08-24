import React, { useRef, useState } from 'react';
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
import { useReducedMotion } from 'framer-motion';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { usePostHog } from '@posthog/react';
import PROFILE from '../../assets/Nicholas_Smith_profile_pic.webp';
import { profile } from '../../data/profile';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

const socials = [
  { icon: FaGithub, label: 'GitHub', href: profile.links.github },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: profile.links.linkedin },
  { icon: HiOutlineMail, label: 'Email', href: `mailto:${profile.email}` },
];

/**
 * Calibration marks on the portrait corners: the one photograph on the page,
 * framed the way the rest of the site frames its measurements. Two hairline
 * strokes per corner, accent coloured, nothing else.
 */
const CornerTick = ({ corner }) => {
  const offsets = {
    tl: { top: -7, left: -7, borderTop: '2px solid', borderLeft: '2px solid' },
    tr: { top: -7, right: -7, borderTop: '2px solid', borderRight: '2px solid' },
    bl: { bottom: -7, left: -7, borderBottom: '2px solid', borderLeft: '2px solid' },
    br: { bottom: -7, right: -7, borderBottom: '2px solid', borderRight: '2px solid' },
  };
  return (
    <Box
      className="hero-tick"
      aria-hidden
      sx={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderColor: 'primary.main',
        ...offsets[corner],
      }}
    />
  );
};

/**
 * The three-row ledger under the hero copy.
 *
 * This is the page's thesis rather than an ornament: the claim above it is
 * "systems that check their own work", and these are three named instances of
 * that, each linking to the case study that substantiates it.
 */
const EvidenceLedger = ({ items, label, onNavigate }) => {
  const theme = useTheme();

  return (
    <Box className="hero-ledger" sx={{ mt: { xs: 4, md: 5 } }}>
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
 * Page hero. One orchestrated GSAP timeline instead of uniform per-element
 * fades: overline, then the name unmasking word by word, then the copy, with
 * the portrait wiping in alongside. Under prefers-reduced-motion nothing runs
 * and the content is simply there, because every tween is a `from`.
 */
const Hero = ({ onSeeWork }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const prefersReducedMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.from('.hero-overline', { autoAlpha: 0, y: 10, duration: 0.35 })
        .from(
          '.hero-word',
          { yPercent: 110, duration: 0.55, stagger: 0.09, ease: 'power3.out' },
          0.08
        )
        .from(
          '.hero-item',
          { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.07 },
          0.4
        )
        .fromTo(
          '.hero-portrait',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'power2.inOut' },
          0.25
        )
        .from('.hero-tick', { autoAlpha: 0, duration: 0.3, stagger: 0.04 }, 0.85)
        .from('.hero-ledger', { autoAlpha: 0, y: 12, duration: 0.45 }, 0.75);
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] }
  );

  const openLedgerItem = (item) => {
    posthog?.capture('hero_ledger_clicked', { project_id: item.id });
    navigate(`/projects/${item.id}`);
  };

  return (
    <Box ref={rootRef} component="section" sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 2, md: 3 } }}>
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
            <Typography
              className="hero-overline"
              variant="overline"
              color="primary.main"
              sx={{ display: 'block', mb: 2 }}
            >
              {profile.role} &middot; {profile.location}
            </Typography>

            <Typography variant="h1" component="h1" sx={{ mb: 2.5 }}>
              {/* Each word in its own overflow-hidden line so the timeline can
                  unmask them; screen readers still get one plain string. */}
              {profile.name.split(' ').map((word, i) => (
                <React.Fragment key={word}>
                  {/* A real space text node between the masks, so copy-paste
                      and screen readers still get "Nicholas Smith". */}
                  {i > 0 && ' '}
                  <Box
                    component="span"
                    sx={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
                  >
                    <Box component="span" className="hero-word" sx={{ display: 'inline-block' }}>
                      {word}
                    </Box>
                  </Box>
                </React.Fragment>
              ))}
            </Typography>

            <Box className="hero-item">
              <Typography
                sx={{
                  fontFamily: theme.custom.displayFont,
                  fontSize: 'clamp(1.125rem, 1rem + 0.6vw, 1.4375rem)',
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
            </Box>

            <Box className="hero-item">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 620 }}>
                {profile.proof}
              </Typography>
            </Box>

            {/*
              * These duplicate what the projects below already demonstrate, and
              * are kept for the readers who are not reading: recruiter keyword
              * scanners and ATS-style tooling match on the plain skill names.
              */}
            <Box className="hero-item">
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
            </Box>

            <Box className="hero-item">
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
            </Box>

            <Box className="hero-item">
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
            </Box>
          </Box>

          {/* Portrait */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: { xs: 240, md: 300 },
              mx: { xs: 'auto', md: 0 },
            }}
          >
            <Box
              className="hero-portrait"
              sx={{
                width: '100%',
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
            <CornerTick corner="tl" />
            <CornerTick corner="tr" />
            <CornerTick corner="bl" />
            <CornerTick corner="br" />
          </Box>
        </Box>

        <EvidenceLedger
          items={profile.heroLedger}
          label={profile.heroLedgerLabel}
          onNavigate={openLedgerItem}
        />
      </Container>
    </Box>
  );
};

export default Hero;
