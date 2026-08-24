import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, Grid, ButtonBase, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';

/**
 * Skills, trimmed from 54 to 26.
 *
 * The old list mixed PyTorch and Kubernetes with jQuery, Vim, Trello, AJAX and
 * four competitive-programming sites, which made none of it mean anything. Each
 * entry here is something worth defending in an interview and traceable to a
 * project or role elsewhere on this page.
 *
 * The previous data also carried a `level: 90`-style self-rating per skill that
 * was never rendered. Self-assessed percentages read as noise, so they are gone.
 */
const skillCategories = [
  {
    id: 'frontend',
    title: 'Frontend',
    caption: 'Interfaces & interaction',
    description:
      'Component-driven UIs with an eye on accessibility, responsive behaviour and render performance.',
    skills: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Angular', 'Flutter', 'React Native', '.NET MAUI', 'Jetpack Compose', 'Tailwind CSS', 'Material UI', 'HTML & CSS'],
  },
  {
    id: 'backend',
    title: 'Backend and Databases',
    caption: 'Services & data',
    description:
      'REST and realtime services, relational and document data modelling, background jobs and caching.',
    skills: ['Node.js (Express, NestJS)', 'Python (FastAPI, Flask)', 'Java (Spring Boot)', 'PostgreSQL', 'MongoDB', 'SQLite', 'Neo4j', 'Redis', 'Supabase', 'NeonDB', 'Firebase'],
  },
  {
    id: 'platform',
    title: 'Platform & DevOps',
    caption: 'Build, ship, run',
    description:
      'Containerised services, automated pipelines and cloud deployment, with the observability to know it worked.',
    skills: ['Docker', 'Git & GitHub', 'GitHub Actions', 'Jenkins', 'AWS', 'Google Cloud', 'Cloudflare', 'Vercel', 'Render', 'FastAPI Cloud', 'Firebase Hosting', 'HuggingFace Spaces', 'Nginx'],
  },
  {
    id: 'ml',
    title: 'Data & ML',
    caption: 'Models & analysis',
    description:
      'End-to-end modelling: feature work, training and evaluation, then the analysis that explains the result.',
    skills: ['PyTorch', 'TensorFlow', 'scikit-learn', 'XGBoost & LightGBM', 'Pandas & NumPy', 'LangChain & LangGraph'],
  },
];

const TechnicalExperiences = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const active = skillCategories[activeIndex];

  return (
    <Section>
      <SectionHeading
        eyebrow="Toolkit"
        title="Skills"
        description="What I reach for, grouped by where it sits in the stack."
      />

      <Grid
        container
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${theme.custom.radius.container}px`,
          overflow: 'hidden',
        }}
      >
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            borderRight: { md: '1px solid' },
            borderBottom: { xs: '1px solid', md: 'none' },
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack role="tablist" aria-label="Skill categories">
            {skillCategories.map((category, index) => {
              const isActive = index === activeIndex;
              return (
                <ButtonBase
                  key={category.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(index)}
                  sx={{
                    display: 'block',
                    textAlign: 'left',
                    px: 3,
                    py: 2.25,
                    borderLeft: '2px solid',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <Typography
                    variant="h5"
                    component="span"
                    sx={{ display: 'block', color: isActive ? 'primary.main' : 'text.primary' }}
                  >
                    {category.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.caption}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box role="tabpanel" sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {active.description}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {active.skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  sx={{
                    fontFamily: theme.custom.codeFont,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'text.primary',
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Section>
  );
};

export default TechnicalExperiences;
