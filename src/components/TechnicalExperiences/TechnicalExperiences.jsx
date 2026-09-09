import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, Grid, ButtonBase, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import techIcons from '../../data/techIcons';

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

/**
 * A tablist is a single tab stop whose selection moves with the arrow keys.
 *
 * The markup already claimed `role="tablist"`/`role="tab"`/`role="tabpanel"`,
 * which is a promise to a screen-reader user about how the control behaves -
 * but nothing implemented it: every tab was its own tab stop, arrow keys did
 * nothing, and no tab was associated with the panel it controls. Either the
 * roles come off or the behaviour goes on, and the behaviour is the smaller
 * change.
 */
const useTabListKeys = (count, activeIndex, setActiveIndex) => {
  const refs = React.useRef([]);

  const onKeyDown = (event) => {
    const moves = {
      ArrowDown: (i) => (i + 1) % count,
      ArrowRight: (i) => (i + 1) % count,
      ArrowUp: (i) => (i - 1 + count) % count,
      ArrowLeft: (i) => (i - 1 + count) % count,
      Home: () => 0,
      End: () => count - 1,
    };
    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    const next = move(activeIndex);
    setActiveIndex(next);
    refs.current[next]?.focus();
  };

  return { refs, onKeyDown };
};

const TechnicalExperiences = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const active = skillCategories[activeIndex];
  const { refs, onKeyDown } = useTabListKeys(skillCategories.length, activeIndex, setActiveIndex);

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
          <Stack role="tablist" aria-label="Skill categories" onKeyDown={onKeyDown}>
            {skillCategories.map((category, index) => {
              const isActive = index === activeIndex;
              return (
                <ButtonBase
                  key={category.id}
                  ref={(node) => {
                    refs.current[index] = node;
                  }}
                  role="tab"
                  id={`skills-tab-${category.id}`}
                  aria-controls="skills-panel"
                  aria-selected={isActive}
                  // One tab stop for the whole list: Tab reaches the selected
                  // category, the arrow keys move between them.
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 2,
                    width: '100%',
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
                  <Box sx={{ minWidth: 0 }}>
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
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: theme.custom.codeFont, flexShrink: 0 }}
                  >
                    {category.skills.length}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box
            role="tabpanel"
            id="skills-panel"
            aria-labelledby={`skills-tab-${active.id}`}
            sx={{ p: { xs: 3, md: 4 } }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {active.description}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {active.skills.map((skill) => {
                const Mark = techIcons[skill];
                return (
                  <Chip
                    key={skill}
                    icon={
                      Mark ? (
                        <Mark
                          size={14}
                          aria-hidden="true"
                          focusable="false"
                          // The mark is the entry's identity, not a second
                          // colour: `currentColor` keeps forty vendor palettes
                          // out of one panel.
                          style={{ color: 'inherit' }}
                        />
                      ) : undefined
                    }
                    label={skill}
                    sx={{
                      fontFamily: theme.custom.codeFont,
                      fontSize: '0.75rem',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: 'text.primary',
                      '& .MuiChip-icon': { color: 'primary.main', ml: 1, mr: -0.25 },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Section>
  );
};

export default TechnicalExperiences;
