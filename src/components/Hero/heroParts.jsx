import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { usePostHog } from '@posthog/react';
import PROFILE from '../../assets/Nicholas_Smith_profile_pic.webp';
import { profile } from '../../data/profile';

/**
 * Leaf pieces every hero arrangement shares.
 *
 * Four arrangements of the first thing anyone sees, so the parts that must not
 * vary live here: the name is an h1 in all four, "See my work" is spelled the
 * same way in all four, and every ledger row still links to the case study that
 * substantiates it. An arrangement decides where those go, never what they are.
 */

const socials = [
  { icon: FaGithub, label: 'GitHub', href: profile.links.github },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: profile.links.linkedin },
  { icon: HiOutlineMail, label: 'Email', href: `mailto:${profile.email}` },
];

/**
 * The name, split into per-word masks so a timeline can unmask it.
 *
 * Each word sits in its own overflow-hidden box with a real space text node
 * between them, so copy-paste and screen readers still get "Nicholas Smith"
 * rather than two run-together fragments.
 */
export const MaskedName = ({ sx }) => (
  <Typography variant="h1" component="h1" sx={sx}>
    {profile.name.split(' ').map((word, i) => (
      <React.Fragment key={word}>
        {i > 0 && ' '}
        <Box component="span" sx={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <Box component="span" className="hero-word" sx={{ display: 'inline-block' }}>
            {word}
          </Box>
        </Box>
      </React.Fragment>
    ))}
  </Typography>
);

/**
 * Calibration marks on the portrait corners: two hairline strokes per corner,
 * accent coloured, nothing else. Instrument frames the one photograph on the
 * page the way the rest of that mode frames a measurement.
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
      sx={{ position: 'absolute', width: 16, height: 16, borderColor: 'primary.main', ...offsets[corner] }}
    />
  );
};

export const Portrait = ({ ratio = '3 / 4', radius, ticks = false, bordered = true, sx }) => {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);

  return (
    <Box sx={{ position: 'relative', width: '100%', ...sx }}>
      <Box
        className="hero-portrait"
        sx={{
          width: '100%',
          aspectRatio: ratio,
          borderRadius: `${radius ?? theme.custom.radius.container}px`,
          overflow: 'hidden',
          ...(bordered && { border: '1px solid', borderColor: 'divider' }),
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
      {ticks && ['tl', 'tr', 'bl', 'br'].map((corner) => <CornerTick key={corner} corner={corner} />)}
    </Box>
  );
};

export const SocialRow = ({ size = 18 }) => (
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
        <Icon size={size} />
      </IconButton>
    ))}
  </Stack>
);

export const StatusChips = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Chip icon={<LocationOnIcon />} label="Port of Spain" size="small" variant="outlined" sx={{ color: 'text.secondary' }} />
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
  );
};

/**
 * These duplicate what the projects below already demonstrate, and are kept for
 * the readers who are not reading: recruiter keyword scanners and ATS-style
 * tooling match on the plain skill names.
 */
export const SkillChips = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
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
  );
};

export const CtaRow = ({ onSeeWork, size = 'large' }) => {
  const posthog = usePostHog();

  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
      <Button
        variant="contained"
        size={size}
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
        size={size}
        onClick={() => posthog?.capture('resume_downloaded', { source: 'hero' })}
      >
        Resume
      </Button>
    </Stack>
  );
};

/** Opens a ledger row's case study. */
export const useOpenLedgerItem = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  return React.useCallback(
    (item) => {
      posthog?.capture('hero_ledger_clicked', { project_id: item.id });
      navigate(`/projects/${item.id}`);
    },
    [navigate, posthog]
  );
};

/**
 * The evidence ledger.
 *
 * This is the page's thesis rather than an ornament: the claim above it is
 * "systems that check their own work", and these are three named instances of
 * that, each linking to the case study that substantiates it. Every arrangement
 * shows all three - the hero's boldest element is also its most useful
 * navigation, and dropping it would leave the thesis unsupported.
 */
export const EvidenceLedger = ({ variant = 'rows', sx }) => {
  const theme = useTheme();
  const onOpen = useOpenLedgerItem();
  const labels = variant === 'labels';

  return (
    <Box className="hero-ledger" sx={sx}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {profile.heroLedgerLabel}
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          ...(labels
            ? {
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: { xs: 3, sm: 4 },
              }
            : { borderTop: '1px solid', borderColor: 'divider' }),
        }}
      >
        {profile.heroLedger.map((item) => (
          <Box
            component="li"
            key={item.id}
            sx={labels ? {} : { borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => onOpen(item)}
              sx={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                font: 'inherit',
                transition: 'background-color 0.2s ease',
                '&:hover .ledger-name': { color: 'primary.main' },
                ...(labels
                  ? {
                      p: 0,
                      display: 'block',
                      borderTop: '1px solid',
                      borderColor: 'secondary.main',
                      pt: 1.5,
                    }
                  : {
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(140px, 200px) 1fr' },
                      gap: { xs: 0.5, sm: 3 },
                      alignItems: 'baseline',
                      px: 0,
                      py: { xs: 1.5, sm: 1.75 },
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    }),
              }}
            >
              <Typography
                className="ledger-name"
                component="span"
                sx={{
                  display: 'block',
                  fontFamily: theme.custom.codeFont,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  transition: 'color 0.2s ease',
                  ...(labels && { mb: 0.75 }),
                }}
              >
                {item.name}
              </Typography>
              <Typography component="span" variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {item.claim}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { profile };
