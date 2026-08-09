import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, IconButton, Divider, Stack } from '@mui/material';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import { SiCodewars, SiLeetcode, SiCodeforces } from 'react-icons/si';
import PANDA from '../../assets/panda-struggle.svg';
import { profile, portfolioPages } from '../../data/profile';

const socials = [
  { icon: FaGithub, label: 'GitHub', href: profile.links.github },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: profile.links.linkedin },
  { icon: HiOutlineMail, label: 'Email', href: `mailto:${profile.email}` },
  { icon: SiCodewars, label: 'Codewars', href: profile.links.codewars },
  { icon: SiLeetcode, label: 'LeetCode', href: profile.links.leetcode },
  { icon: SiCodeforces, label: 'Codeforces', href: profile.links.codeforces },
];

const SiteFooter = () => (
  <Box
    component="footer"
    sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 10, py: { xs: 5, md: 6 } }}
  >
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 4, md: 6 }}
        justifyContent="space-between"
      >
        <Box sx={{ maxWidth: 380 }}>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700, mb: 0.5 }}>
            {profile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {profile.role} · {profile.location}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {socials.map(({ icon: Icon, label, href }) => (
              <IconButton
                key={label}
                href={href}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={label}
                size="small"
                sx={{
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                }}
              >
                <Icon size={16} />
              </IconButton>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Deep dives
          </Typography>
          <Stack spacing={0.75}>
            {portfolioPages.map((item) => (
              <Link
                key={item.path}
                component={RouterLink}
                to={item.path}
                underline="hover"
                variant="body2"
                color="text.secondary"
                sx={{ '&:hover': { color: 'primary.main' } }}
              >
                {item.label}
              </Link>
            ))}
          </Stack>
        </Box>

        <Box sx={{ maxWidth: 260 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Get in touch
          </Typography>
          <Stack spacing={0.75}>
            <Link href={`mailto:${profile.email}`} underline="hover" variant="body2" color="text.secondary">
              {profile.email}
            </Link>
            <Link
              href={profile.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              variant="body2"
              color="text.secondary"
            >
              WhatsApp {profile.whatsapp.display}
            </Link>
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} {profile.name}. Built with React, Vite and MUI.
        </Typography>

        {/* The panda and the motto used to occupy the app bar, where the name
            belongs. They live here instead, for anyone who reads this far. */}
        <Link
          component={RouterLink}
          to="/about-panda"
          underline="none"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
        >
          <Box component="img" src={PANDA} alt="" width={22} height={22} sx={{ opacity: 0.8 }} />
          <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
            {`“${profile.personal.motto}”`}
          </Typography>
        </Link>
      </Stack>
    </Container>
  </Box>
);

export default SiteFooter;
