import React from 'react';
import { Box, Container, Divider, Grid, Paper, Typography, useTheme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { casefileTheme } from '../../utilities/themeConfig';
import { PLOT_INTERPRETATIONS, PROJECT_PLOTS } from '../../data/projectPlots';
import EDASummarySection from './EDASummarySection';
import ModelMetricsCard from './ModelMetricsCard';
import ClusterSummaryCard from './ClusterSummaryCard';
import CausalAtteChart from './CausalAtteChart';
import FeatureImportanceChart from './FeatureImportanceChart';
import PredictionVsActualChart from './PredictionVsActualChart';

const COPY = {
  'fraud-detection': {
    title: 'Interactive fraud analysis',
    intro:
      'Model performance across three fraud datasets: precision, recall, confusion matrices and feature importance, with the plots that shaped each decision.',
    plotsTitle: 'EDA visualisations',
  },
  'starbucks-offer-analysis': {
    title: 'Interactive analysis and business insights',
    intro:
      'Customer segments, the send-time model scored on customers it never saw, causal inference results and which features the model relies on.',
    plotsTitle: 'Exploratory data analysis',
  },
};

const DEFAULT_COPY = {
  title: 'Interactive analysis',
  intro: "The model's performance and feature importance, as interactive charts.",
  plotsTitle: 'EDA visualisations',
};

/** The bold lead-in on an interpretation row. One tone, not three: warning is the site's uncertainty colour and does not decorate. */
const Lead = ({ children }) => (
  <Typography component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
    {children}{' '}
  </Typography>
);

/**
 * The interactive analysis block under a data-science case study.
 *
 * This is the only part of the site that needs recharts, so it is loaded on
 * demand by pages/ProjectDetail.jsx rather than bundled into every write-up.
 * The heading is an h2 because it sits beside the write-up's own h2s; the
 * plot labels are paragraphs, not the h6 that `subtitle2` renders by default.
 */
const Analysis = ({ project }) => {
  const theme = useTheme();
  const { radius } = theme.custom;
  const copy = COPY[project.id] ?? DEFAULT_COPY;
  const plots = PROJECT_PLOTS[project.id] || PROJECT_PLOTS['wids-temp-forecasting'];
  const interpretations = PLOT_INTERPRETATIONS[project.id];
  const isStarbucks = project.id === 'starbucks-offer-analysis';

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 8 }}>
      <Divider sx={{ mb: 6 }} />
      <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
        {copy.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 760 }}>
        {copy.intro}
      </Typography>

      <EDASummarySection dataPath={project.portfolioData} />
      <ModelMetricsCard dataPath={project.portfolioData} />
      {isStarbucks && <ClusterSummaryCard dataPath={project.portfolioData} />}
      {isStarbucks && <CausalAtteChart dataPath={project.portfolioData} />}
      <FeatureImportanceChart dataPath={project.portfolioData} />
      <PredictionVsActualChart dataPath={project.portfolioData} />

      <Box sx={{ mt: 6 }}>
        <Typography variant="h3" component="h3" sx={{ mb: 3 }}>
          {copy.plotsTitle}
        </Typography>
        <Grid container spacing={4}>
          {plots.map((plot) => {
            const interp = interpretations?.[plot.file];
            return (
              <Grid item xs={12} md={6} key={plot.file}>
                <Typography variant="subtitle2" component="p" color="text.secondary" sx={{ mb: 1 }}>
                  {plot.label}
                </Typography>
                <Box
                  component="img"
                  src={`${project.portfolioData}plots/${plot.file}`}
                  alt={plot.label}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    display: 'block',
                    borderRadius: `${radius.container}px`,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {interp && (
                  <Paper sx={{ mt: 2, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                      <Lead>What it shows:</Lead>
                      {interp.what}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                      <Lead>Key insight:</Lead>
                      {interp.insight}
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                      <Lead>Why it matters:</Lead>
                      {interp.why}
                    </Typography>
                  </Paper>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

/*
 * It is also the only part of the site MUI still draws, so the Casefile theme
 * is provided here rather than at the root of the app: MUI, emotion and the
 * theme arrive with this lazily loaded chunk, on the three pages that use it.
 */
const theme = createTheme(casefileTheme);

const InteractiveAnalysis = (props) => (
  <ThemeProvider theme={theme}>
    <Analysis {...props} />
  </ThemeProvider>
);

export default InteractiveAnalysis;
