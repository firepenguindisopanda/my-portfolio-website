import React from 'react';
import { Box, Typography, Link, Stack, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import Surface from '../Surface/Surface';
import CredlyBadge from '../EmbededBadges/CredlyBadge';

/**
 * Credly badge IDs. Previously eight near-identical components each embedded
 * one of these and appended its own copy of Credly's embed.js to <body> - so
 * eight copies of the script raced each other and left every iframe at 0x0.
 */
const badges = [
  { id: '0e31be95-09a7-4724-a81a-e938672dee4c', title: 'Deep Learning', issuer: 'DeepLearning.AI' },
  { id: 'ec8c93a7-6ea7-482d-b8bc-6b53a9d87e20', title: 'Google Advanced Data Analytics', issuer: 'Google' },
  { id: '55f2feeb-4633-4408-b34e-7d87c918b9b7', title: 'Google Data Analytics', issuer: 'Google' },
  { id: '8392ba7c-bf25-4d4b-a61f-5cb2bceeb5af', title: 'Google Business Intelligence', issuer: 'Google' },
  { id: '18e220fc-558f-4a77-91ff-bb39749ac000', title: 'IBM DevOps & Software Engineering', issuer: 'IBM' },
  { id: 'a734660f-1ece-4783-9e12-ca49d2933513', title: 'Google IT Support', issuer: 'Google' },
  { id: '0b73e2c3-3795-4343-a1fa-260e040bdc0a', title: 'Google IT Automation', issuer: 'Google' },
  { id: '6ecaf500-de88-4a52-86e4-e9c6bff401aa', title: 'IT Manager', issuer: 'CertNexus' },
];

const BADGE_URL = 'https://www.credly.com/badges';

const OnlineLearningBadges = () => {
  const theme = useTheme();

  return (
    <Section>
      <SectionHeading
        eyebrow="Verified"
        title="Credly badges"
        description="Digital credentials issued directly by the awarding organisation - each one links back to its verification page."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2.5,
        }}
      >
        {badges.map((badge) => (
          <Surface key={badge.id} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                // Reserve the iframe's box so the grid doesn't reflow on load.
                minHeight: 162,
              }}
            >
              <CredlyBadge badgeId={badge.id} title={badge.title} />
            </Box>

            <Stack spacing={0.25} sx={{ mt: 1.5, textAlign: 'center', width: '100%' }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontFamily: theme.custom.codeFont, lineHeight: 1.3 }}
              >
                {badge.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {badge.issuer}
              </Typography>
              <Link
                href={`${BADGE_URL}/${badge.id}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                underline="hover"
                sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, mt: 0.5 }}
              >
                Verify
                <ArrowForwardIcon sx={{ fontSize: 12 }} />
              </Link>
            </Stack>
          </Surface>
        ))}
      </Box>
    </Section>
  );
};

export default OnlineLearningBadges;
