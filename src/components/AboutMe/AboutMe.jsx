import React from 'react';
import { Box, Grid, Typography, Divider, IconButton, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';
import { SiCodewars, SiLeetcode, SiCodeforces } from 'react-icons/si';
import { LuHelpingHand } from 'react-icons/lu';
import { GiArtificialIntelligence } from 'react-icons/gi';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import Surface from '../Surface/Surface';
import { profile } from '../../data/profile';

/**
 * The bio used to be swapped by colour theme - one version for corporate-clean,
 * a shorter generic one for everything else. Content shouldn't change with a
 * palette, so the stronger version is now the only version.
 */
const bio = [
  `I've always been pulled toward the same question from two different directions: why do people and systems behave the way they do? On one side, that's led me into software engineering, machine learning, and AI, where the question becomes technical: how can you model reasoning, prediction, and decision-making in code? On the other, it's led me into sociology, anthropology, psychology, and philosophy, where the question stays human: how do people construct meaning, form communities, and make choices?`,
  `I don't see those as separate interests so much as one continuous investigation. It's what draws me to the psychology of interface design - not just whether something looks polished, but whether it matches how a real person's attention, memory, and expectations actually work as they move through a product.`,
  `I bring the same curiosity home in smaller, more hands-on ways, tinkering with Raspberry Pis and IoT devices, wiring up little systems just to watch software reach into the physical world. It's the same instinct as everything else I do: take something abstract, understand it deeply enough to rebuild it, and make it work.`,
];

const competitiveProfiles = [
  { Icon: SiCodewars, label: 'Codewars', href: profile.links.codewars },
  { Icon: SiLeetcode, label: 'LeetCode', href: profile.links.leetcode },
  { Icon: SiCodeforces, label: 'Codeforces', href: profile.links.codeforces },
];

const InfoCard = ({ icon, title, children }) => {
  const theme = useTheme();
  return (
    <Surface>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>{children}</Box>
    </Surface>
  );
};

/**
 * About section.
 *
 * This component previously carried four hand-written layouts - one per colour
 * theme - each with its own ambient glow, image treatment, rotating job title
 * and CTA row. The hero now owns the name, portrait and calls to action, so
 * what's left is the part that actually says something: the bio.
 */
const AboutMe = () => {
  const prefersReducedMotion = useReducedMotion();
  const { motion: revealMotion } = useTheme().custom;

  const reveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: revealMotion.distance },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: revealMotion.duration, ease: revealMotion.ease },
      };

  return (
    <Section>
      <SectionHeading eyebrow="Background" title="About" />

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <motion.div {...reveal}>
            <Stack spacing={2}>
              {bio.map((paragraph) => (
                <Typography key={paragraph.slice(0, 32)} variant="body1" color="text.secondary">
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={5}>
          <motion.div
            {...(prefersReducedMotion
              ? {}
              : { ...reveal, transition: { ...reveal.transition, delay: revealMotion.stagger } })}
          >
            <Stack spacing={2}>
              <InfoCard icon={<LuHelpingHand size={17} />} title="Mentoring">
                <Typography variant="body2" color="text.secondary">
                  I run mentorship sessions through UWI DCIT and the WiDS Datathon, covering version
                  control, design patterns and CI/CD with students working on their first real projects.
                </Typography>
              </InfoCard>

              <InfoCard icon={<GiArtificialIntelligence size={17} />} title="AI">
                <Typography variant="body2" color="text.secondary">
                  Awarded and completed a Udacity Nano-Degree Scholarship in AI Programming with Python.
                </Typography>
              </InfoCard>

              <InfoCard icon={<SiCodeforces size={15} />} title="Problem solving">
                <Stack direction="row" spacing={1}>
                  {competitiveProfiles.map(({ Icon, label, href }) => (
                    <IconButton
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
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
              </InfoCard>
            </Stack>
          </motion.div>
        </Grid>
      </Grid>
    </Section>
  );
};

export default AboutMe;
