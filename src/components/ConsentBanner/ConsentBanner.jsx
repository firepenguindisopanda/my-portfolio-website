import React, { useState } from 'react';
import { Box, Button, Paper, Stack, Typography, Slide, Link } from '@mui/material';
import { usePostHog } from '@posthog/react';

/**
 * Cookie consent for analytics.
 *
 * PostHog is initialised with `cookieless_mode: 'on_reject'`, which makes the
 * three states behave like this:
 *
 *   pending  - treated as opted out, so nothing is written to cookies or local
 *              storage, but events still flow in cookieless mode. Identity is a
 *              privacy-preserving hash computed on PostHog's servers, so
 *              pageviews and visitor counts survive even if nobody ever answers
 *              the banner. Session replay does not run.
 *   accepted - the instance resets, cookies and local storage begin, and
 *              session replay starts.
 *   rejected - stays cookieless permanently.
 *
 * The consent answer itself is stored under `__ph_opt_in_out_<token>` in local
 * storage. That is "strictly necessary" storage under ePrivacy - remembering a
 * refusal is the one thing you are allowed to persist without asking first.
 */
const ConsentBanner = () => {
  const posthog = usePostHog();

  // posthog.init runs before render, so the consent status is already settled
  // here. No key means init was skipped and there is nothing to consent to.
  const [visible, setVisible] = useState(
    () =>
      Boolean(import.meta.env.VITE_PUBLIC_POSTHOG_KEY) &&
      posthog?.get_explicit_consent_status?.() === 'pending'
  );

  const accept = () => {
    posthog?.opt_in_capturing();
    setVisible(false);
  };

  const reject = () => {
    posthog?.opt_out_capturing();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        role="region"
        aria-label="Cookie consent"
        sx={{
          position: 'fixed',
          zIndex: (theme) => theme.zIndex.snackbar,
          bottom: { xs: 0, sm: 16 },
          left: { xs: 0, sm: 16 },
          right: { xs: 0, sm: 'auto' },
          maxWidth: { sm: 460 },
          p: { xs: 2, sm: 2.5 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 0, sm: 2 },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
          Cookies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          I use PostHog to see which projects people actually read. Accept and it
          can recognise you across visits and record how the pages are used.
          Decline and I still get anonymous page counts, with nothing stored on
          your device. Either way, nothing is sold or shared.{' '}
          <Link
            href="https://posthog.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            PostHog&rsquo;s privacy policy
          </Link>
        </Typography>
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1}>
          <Button onClick={reject} variant="outlined" size="small" fullWidth>
            Decline
          </Button>
          <Button onClick={accept} variant="contained" size="small" fullWidth>
            Accept
          </Button>
        </Stack>
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            No ads, no third-party trackers.
          </Typography>
        </Box>
      </Paper>
    </Slide>
  );
};

export default ConsentBanner;
