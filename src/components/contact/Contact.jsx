import React, { useRef, useState } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { BsWhatsapp } from 'react-icons/bs';
import {
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
  Link,
  useTheme,
} from '@mui/material';
import emailjs from '@emailjs/browser';
import { usePostHog } from '@posthog/react';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import { profile } from '../../data/profile';

const EMAILJS = {
  serviceId: 'service_wf5ex2f',
  templateId: 'template_0ouoimq',
  // EmailJS public keys are designed to be exposed in the browser.
  publicKey: 'Mbp02i3iokIucc48d',
};

const ChannelCard = ({ icon, label, value, href, onClick }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ color: theme.palette.primary.main, display: 'flex', fontSize: '1.25rem' }}>{icon}</Box>
          <Typography variant="h5" component="h3">
            {label}
          </Typography>
        </Stack>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          underline="hover"
          variant="body2"
          color="text.secondary"
          sx={{ '&:hover': { color: 'primary.main' } }}
        >
          {value}
        </Link>
      </CardContent>
    </Card>
  );
};

const Contact = () => {
  const form = useRef();
  const posthog = usePostHog();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [sending, setSending] = useState(false);

  const closeNotification = (_event, reason) => {
    if (reason === 'clickaway') return;
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const sendEmail = (e) => {
    e.preventDefault();
    const formEl = e.target;
    setSending(true);

    emailjs
      .sendForm(EMAILJS.serviceId, EMAILJS.templateId, form.current, EMAILJS.publicKey)
      .then(() => {
        setNotification({ open: true, message: 'Message sent. I usually reply within a day.', severity: 'success' });
        posthog?.capture('contact_form_submitted');
        // person_profiles defaults to 'identified_only', so anonymous visitors
        // never get a profile and their history cannot be looked up after the
        // fact. Promoting the one visitor in a thousand who actually writes in
        // is what makes "what did this person read before emailing me?"
        // answerable. Deliberately no name or email - the message itself
        // carries those, and they do not need to be in PostHog.
        posthog?.setPersonProperties({ contacted: true });
        formEl.reset();
      })
      .catch((err) => {
        setNotification({
          open: true,
          message: 'That did not go through. Email me directly and it will reach me.',
          severity: 'error',
        });
        posthog?.capture('contact_form_failed', { error: err?.text || String(err) });
        posthog?.captureException(err);
      })
      .finally(() => setSending(false));
  };

  return (
    <Section>
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        description="Open to software engineering, data and ML roles, and to interesting contract work. The fastest route is email."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <ChannelCard
              icon={<MdOutlineEmail />}
              label="Email"
              value={profile.email}
              href={`mailto:${profile.email}`}
              onClick={() => posthog?.capture('contact_channel_clicked', { channel: 'email' })}
            />
            <ChannelCard
              icon={<BsWhatsapp />}
              label="WhatsApp"
              value={profile.whatsapp.display}
              href={profile.whatsapp.href}
              onClick={() => posthog?.capture('contact_channel_clicked', { channel: 'whatsapp' })}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box
            component="form"
            ref={form}
            onSubmit={sendEmail}
            // Keeps the whole form out of session replays and autocapture.
            // Inputs are masked globally, but this also drops the labels and
            // any validation text a visitor's message might surface.
            className="ph-no-capture"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField fullWidth label="Your name" name="name" autoComplete="name" required />
            <TextField
              fullWidth
              label="Your email"
              name="email"
              // Was a plain text field, so typos sailed through to EmailJS and
              // there was no way to reply.
              type="email"
              autoComplete="email"
              required
            />
            <TextField fullWidth label="Your message" name="message" multiline rows={6} required />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={sending}
              sx={{ alignSelf: 'flex-start' }}
            >
              {sending ? 'Sending…' : 'Send message'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Section>
  );
};

export default Contact;
