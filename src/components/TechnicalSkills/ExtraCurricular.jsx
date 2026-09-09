import React from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CCU_TECH_LEAD_CERTIFICATE from '../../assets/CCU_Tech_lead.pdf';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import Surface from '../Surface/Surface';
import Reveal from '../Reveal/Reveal';

/**
 * Mentoring and community work.
 *
 * This was the last section still wearing the old template: a @mui/lab
 * timeline of cards with 24px corners that scaled up on hover, a "View
 * Details" button per card hiding three bullet points, and a stat strip
 * underneath - "50+ students tutored", "1 award won" - that nothing on the
 * site could back up, and that contradicted the two datathon placings listed
 * a few lines above it. The card titles were also <h6>s directly under an
 * <h2>, which is the heading-order failure the audit reports.
 *
 * Now: one entry per programme on the mode's Surface, the bullets in the open,
 * and a link wherever there is a certificate to check. Every claim below is
 * the same claim the old cards made - only the packaging changed. No summary
 * numbers, because none can say where they come from.
 */
const entries = [
  {
    id: 'wids-mentor',
    role: 'Mentor, WiDS Datathon',
    organisation: 'UWI, Department of Computing and Information Technology',
    period: '2022 to present',
    points: [
      'Wrote the training content the other mentors work from.',
      'Mentored the team that placed 3rd in the 2024 local datathon, a team of four.',
    ],
    links: [
      {
        label: 'Certificate',
        href: 'https://www.linkedin.com/in/nicholas-smith-933125148/details/certifications/1711166446408/single-media-viewer/?profileId=ACoAACOdFPcBKISwS8FqrESmFMsZpo9GSQh6yk4',
      },
    ],
  },
  {
    id: 'ccu-tech-lead',
    role: 'Tech lead, Computer Connections Unit apprenticeship',
    organisation: 'UWI, Department of Computing and Information Technology',
    period: 'August to September 2024',
    points: [
      'Led the tech team on the My Advisor project.',
      'Ran a cross-functional team on an Agile cadence.',
      'Set up the GitHub project structure and wrote the development tasks.',
    ],
    links: [{ label: 'Certificate of achievement', href: CCU_TECH_LEAD_CERTIFICATE }],
  },
  {
    id: 'wids-lead-mentor',
    role: 'Lead mentor, WiDS Datathon 2022/23',
    organisation: 'UWI, Department of Computing and Information Technology',
    period: '2023',
    points: [
      'Delivered an interactive exploratory data analysis tutorial.',
      'Led the team to 2nd place in the local competition.',
    ],
    links: [
      {
        label: 'Certificate',
        href: 'https://www.linkedin.com/posts/nicholas-smith-933125148_certificate-of-participation-in-wids-2023-activity-7040796180926099457-wvrs?utm_source=share&utm_medium=member_desktop',
      },
    ],
  },
  {
    id: 'youth-speak-up',
    role: 'Digital literacy mentor, Youth Speak Up programme',
    organisation: 'St. Augustine Rotary Club and UWI',
    period: '2022',
    points: [
      'Google Docs training.',
      'Google Sheets data-management workshops.',
      'Google Slides presentation workshops.',
    ],
    links: [],
  },
  {
    id: 'robotics-bootcamp',
    role: 'Robotics mentor, DCIT Robotics Boot Camp',
    organisation: 'UWI, Department of Computing and Information Technology',
    // The source data recorded no year for this one, so none is claimed.
    period: null,
    points: [
      'Guided students through Python for autonomous robot navigation.',
      'Coached the team that won the maze-solving challenge.',
    ],
    links: [],
  },
];

const Entry = ({ entry, index }) => {
  const theme = useTheme();
  const credit = [entry.organisation, entry.period].filter(Boolean).join(' · ');

  return (
    <Reveal
      component="li"
      delay={Math.min(index, 4) * theme.custom.motion.stagger}
      sx={{ listStyle: 'none', minWidth: 0 }}
    >
      <Surface component="article" interactive={false}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
          {credit}
        </Typography>
        <Typography variant="h5" component="h3" sx={{ mb: 1.5 }}>
          {entry.role}
        </Typography>

        <Box component="ul" sx={{ m: 0, pl: 2.5, flexGrow: 1 }}>
          {entry.points.map((point) => (
            <Typography
              key={point}
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.75, '&:last-child': { mb: 0 } }}
            >
              {point}
            </Typography>
          ))}
        </Box>

        {entry.links.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {entry.links.map((link) => (
              <Button
                key={link.href}
                size="small"
                variant="outlined"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        )}
      </Surface>
    </Reveal>
  );
};

const ExtraCurricular = () => (
  <Section>
    <SectionHeading
      eyebrow="Beyond the day job"
      title="Mentorship & community"
      description="Leadership and mentoring across university programmes, datathons and bootcamps."
    />

    <Box
      component="ul"
      sx={{
        m: 0,
        p: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {entries.map((entry, index) => (
        <Entry key={entry.id} entry={entry} index={index} />
      ))}
    </Box>
  </Section>
);

export default ExtraCurricular;
