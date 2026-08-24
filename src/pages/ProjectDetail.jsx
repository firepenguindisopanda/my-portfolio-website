import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '../components/CodeBlock/CodeBlock';
import EvidenceLine from '../components/Evidence/EvidenceLine';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { projects } from '../data/projects';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import LazySpaceEmbed from '../components/SpacesEmbed/LazySpaceEmbed';
import CaseStudyFooter from '../components/CaseStudyFooter/CaseStudyFooter';
import { FeatureImportanceChart, PredictionVsActualChart, ModelMetricsCard, EDASummarySection, ClusterSummaryCard, CausalAtteChart } from '../components/MLCharts';

/** Heading id shared by the rendered h2 and the contents rail, so they cannot disagree. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

/** ReactMarkdown hands `children` as an array of nodes; the rail needs plain text. */
const nodeText = (children) =>
  React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : child?.props?.children ?? ''))
    .join('');

/** One line of the header spec table: mono label, free-form value. */
const SpecRow = ({ label, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '110px minmax(0, 1fr)' },
      gap: { xs: 0.75, sm: 3 },
      alignItems: 'baseline',
      py: 1.75,
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography variant="overline" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

/**
 * What a reader can actually do with this project right now, stated plainly.
 * "Private repository" is more useful than an absent row, which reads as an
 * oversight rather than a fact.
 */
const availabilityOf = (project) => {
  if (project.liveUrl) return 'Deployed and reachable';
  if (project.githubUrl) return 'Source on GitHub';
  return 'Private repository';
};

// Every figure gets a What / Key insight / Why triple so a reader who does not
// know the domain still takes something away. Numbers here are the ones the
// pipeline actually produced - see artifacts/metrics.json in the analysis repo.
const PLOT_INTERPRETATIONS = {
  'fraud-detection': {
    'target_distribution.webp': {
      what: 'Class balance for each of the three datasets, with the imbalance ratio annotated.',
      insight: 'Fraud is 0.13% to 1.10% of transactions - between 87 and 774 legitimate cases for every fraudulent one.',
      why: 'This is why accuracy is discarded. A model that predicts "never fraud" scores 99.83% accuracy on the Credit Card data and catches none of the 98 frauds. Average precision is used instead, because it summarises the precision-recall curve, which is the curve a fraud team actually operates on.',
    },
    'amount_by_class.webp': {
      what: 'Transaction amount distributions for fraud and legitimate cases, with a Kolmogorov-Smirnov test.',
      insight: 'Fraud does not live at unusually large amounts. Amount ranks well below the anonymised behavioural features on permutation importance.',
      why: 'It refutes the obvious intuition. Fraudsters deliberately use ordinary-looking amounts, so a rule based on transaction size alone would miss most of it. The signal is in the behavioural PCA components, not the dollar value.',
    },
    'correlation_heatmap.webp': {
      what: 'Correlation of each feature with the fraud label.',
      insight: 'No single feature correlates strongly with fraud; the strongest are the V14, V12 and V10 components.',
      why: 'Fraud detection here is inherently multivariate. That no feature is individually decisive is what makes the tree ensembles worth their complexity over a simple rule.',
    },
    'model_comparison_f1.webp': {
      what: 'F1 across all five models and all three datasets, including both dummy baselines.',
      insight: 'The dummy baselines score essentially zero F1 despite 99%+ accuracy; the tree ensembles lead on every dataset.',
      why: 'Including deliberately useless baselines is the cheapest way to show that a metric is doing its job. Any metric on which the dummy looks good is the wrong metric.',
    },
    'confusion_matrix_best.webp': {
      what: 'Confusion matrix for XGBoost on the Credit Card test split at the default 0.5 threshold.',
      insight: 'At 0.5 the model catches 82 of 98 frauds with 11 false alarms - 88% precision at 84% recall.',
      why: 'This is the starting point, not the recommendation. 0.5 is an arbitrary default that implicitly assumes a missed fraud and a false alarm cost the same, which they do not.',
    },
    'feature_importance_direction.webp': {
      what: 'Logistic regression odds ratios with 95% confidence intervals, on a log scale, from a separate unpenalised fit.',
      insight: 'V4 multiplies the fraud odds by about 3.3 per standard deviation; V10 and V14 cut them to roughly 0.41 and 0.56. Intervals crossing 1.0 mean the direction is not established.',
      why: 'Tree importance tells you a feature mattered but not which way. An odds ratio gives direction, magnitude and uncertainty in one number. The inference model is deliberately separate from the prediction model, because scikit-learn\'s penalised fit provides no valid standard errors.',
    },
    'feature_comparison.webp': {
      what: 'Importance from gini, gain and permutation, each normalised to sum to 1 so they are directly comparable.',
      insight: 'V14, V4, V12 and V10 top every method. Permutation importance on the held-out split ranks V14 first at 0.074.',
      why: 'Gini and gain are computed on training data and are biased toward high-cardinality continuous features. Permutation importance measures what accuracy actually loses on unseen data, so it is the defensible one. Where the methods disagree, the feature usually matters only in interaction.',
    },
    'roc_curves.webp': {
      what: 'ROC curves for every model on the Credit Card test split.',
      insight: 'Every model, including logistic regression at 0.971, looks excellent - even the one whose precision is 6%.',
      why: 'This chart is included as a caution. ROC-AUC is dominated by the true-negative mass at a 0.17% base rate, so it stays flattering for models that are not useful. Compare it with the precision-recall curve beside it.',
    },
    'pr_curves.webp': {
      what: 'Precision-recall curves, with the no-skill line drawn at the base rate rather than 0.5.',
      insight: 'XGBoost reaches an average precision of 0.876 (95% CI 0.811 to 0.931) against a chance baseline of 0.0017 - a 509x lift.',
      why: 'This is the honest picture of the same models the ROC chart flatters. The no-skill line sits at the fraud rate, so the gap between the curve and that line is the real measure of skill.',
    },
    'calibration_curve.webp': {
      what: 'Predicted probability against observed fraud rate, by decile.',
      insight: 'Class weighting distorts the probabilities: the Brier skill score for logistic regression is strongly negative even though its ranking is fine.',
      why: 'It matters because the cost-optimal threshold is only interpretable as a probability cutoff if the probabilities mean something. Rankings and odds ratios survive miscalibration; absolute probabilities do not.',
    },
    'cost_heatmap.webp': {
      what: 'Total cost across 99 thresholds and 7 false-negative to false-positive cost ratios.',
      insight: 'The optimal threshold slides from 0.97 at 1:1 down to 0.02 once a missed fraud costs 50x a false alarm.',
      why: 'There is no single correct threshold, only a correct threshold given a stated cost ratio. Publishing the whole surface hands the decision to whoever owns the losses instead of burying it in a default.',
    },
    'threshold_sensitivity.webp': {
      what: 'Precision, recall and F1 as the decision threshold moves from 0.01 to 0.99.',
      insight: 'Precision and recall trade off sharply below 0.1; the default 0.5 sits well away from the cost-optimal point.',
      why: 'It makes the trade-off legible. Choosing a threshold is a business decision about which error you would rather make, and this is the curve that decision is made on.',
    },
    'business_impact.webp': {
      what: 'Cost per model at the default threshold, decomposed into missed fraud and false alarms.',
      insight: 'At the cost-optimal 0.02 threshold, XGBoost catches 88 of 98 frauds for 83 false alarms: $1,083 against $9,800 for doing nothing, an 88.9% reduction.',
      why: 'It converts model metrics into the only units a stakeholder needs. The comparison that matters is not against another model but against having no model at all.',
    },
    'lift_gain.webp': {
      what: 'Cumulative fraud caught against the fraction of transactions reviewed.',
      insight: 'Reviewing the top 1% of scored transactions captures the large majority of fraud.',
      why: 'Fraud teams are staffed for a fixed number of reviews per day, so "we can look at 1% of volume" is usually a harder constraint than any metric. This chart answers the question in the units the operation runs on.',
    },
    'effect_size_vs_pvalue.webp': {
      what: 'Effect size against statistical significance for all 30 features.',
      insight: '28 of 30 features are significant after Benjamini-Hochberg correction, but only 15 reach a large effect size and 8 are negligible.',
      why: 'At n = 284,807 the p-value stops discriminating - a difference far too small to act on still clears any significance bar. This is the chart that argues for ranking by effect size, and it does it in one picture.',
    },
    'radar_chart.webp': {
      what: 'Precision, recall, F1 and ROC-AUC per model on one set of axes.',
      insight: 'XGBoost and Random Forest are close on every axis; logistic regression collapses on precision.',
      why: 'Useful for seeing shape rather than rank. Two models with similar summary scores can trade errors quite differently, which is why the differences are also tested formally rather than eyeballed here.',
    },
    'temporal_fraud.webp': {
      what: 'Fraud rate by hour over the two days the Credit Card data covers.',
      insight: 'The fraud rate varies by time of day, with elevated periods overnight.',
      why: 'It suggests time-derived features are worth engineering, and it is also the argument for evaluating on a forward-in-time split rather than a random one, since a deployed model always predicts forward.',
    },
    'online_fraud_by_type.webp': {
      what: 'Fraud rate by transaction type on the Online Payment data, with Wilson confidence intervals.',
      insight: 'Fraud concentrates almost entirely in TRANSFER and CASH_OUT; payments are effectively clean.',
      why: 'Wilson intervals rather than the normal approximation, because rates this close to zero produce negative lower bounds under the usual formula. A category-level rule captures much of the signal here without any model at all.',
    },
    'bank_account_effect_sizes.webp': {
      what: 'Effect size against significance for the Bank Account application data.',
      insight: '24 of 25 features are statistically significant and not one reaches a large effect size - the mirror image of the Credit Card chart.',
      why: 'This single chart is the diagnosis for the dataset that did not work. The signal is real but uniformly thin, spread across many weak features rather than concentrated in a few strong ones. No amount of tuning manufactures separation that is not in the features.',
    },
    'z_score_feature_separation_ranking.webp': {
      what: 'Features ranked by Cohen\'s d, the standardised difference between fraud and legitimate means.',
      insight: 'V17, V14, V12 and V10 separate the classes by several standard deviations; the weakest features barely move.',
      why: 'A z-score puts every feature on the same scale regardless of its units, which is what makes "how much does this feature separate fraud" a comparable question across 30 anonymised components.',
    },
    'z_score_multivariate_chi_distribution.webp': {
      what: 'Distribution of the summed squared z-score across all PCA components, for both classes.',
      insight: 'Fraud averages a chi-score of 667.6 against 26.9 for legitimate transactions - a 24.8x ratio - and 63.2% of fraud sits above the 99th percentile of normal.',
      why: 'It shows fraud is anomalous in aggregate even when no individual feature is extreme. That is the statistical justification for a multivariate model over a set of single-feature rules.',
    },
    'z_score_distribution_all_features.webp': {
      what: 'Per-feature z-score distributions for both classes, ordered by effect size.',
      insight: 'The strongest features show clearly displaced fraud distributions; the weakest overlap almost completely.',
      why: 'It makes the ranking visual rather than numeric, and shows that the separation is a genuine shift in the distribution rather than a handful of outliers dragging a mean.',
    },
    'z_score_amount_time_scatter.webp': {
      what: 'Amount z-score against Time z-score, fraud in red, with reference lines at plus and minus two standard deviations.',
      insight: 'Most fraud sits near z = 0 on Amount - perfectly ordinary transaction sizes.',
      why: 'The clearest refutation of the "fraud means big transactions" intuition. Fraudulent amounts are deliberately unremarkable, which is exactly why the anonymised behavioural features carry the signal instead.',
    },
  },
};

const PROJECT_PLOTS = {
  // Ordered as a narrative: what the data looks like, how the models compare,
  // what the operating point costs, and what actually drives a prediction.
  'fraud-detection': [
    { file: 'target_distribution.webp', label: 'Class distribution across all three datasets - fraud is 0.13% to 1.10% of transactions' },
    { file: 'amount_by_class.webp', label: 'Amount by class - fraud does not sit at unusually large amounts, which rules out the obvious heuristic' },
    { file: 'correlation_heatmap.webp', label: 'Feature correlation with the fraud label - no single feature is decisive, so the problem is inherently multivariate' },
    { file: 'model_comparison_f1.webp', label: 'Model comparison including both dummy baselines, which score near-zero F1 despite 99%+ accuracy' },
    { file: 'pr_curves.webp', label: 'Precision-recall curves - XGBoost reaches 0.876 average precision against a 0.0017 chance baseline, a 509x lift' },
    { file: 'roc_curves.webp', label: 'ROC curves - included as a caution: every model looks excellent here, including one with 6% precision' },
    { file: 'confusion_matrix_best.webp', label: 'XGBoost confusion matrix at the default 0.5 threshold - 82 of 98 frauds caught, 11 false alarms' },
    { file: 'calibration_curve.webp', label: 'Calibration - class weighting distorts the probabilities even where the ranking stays sound' },
    { file: 'cost_heatmap.webp', label: 'Cost surface - the optimal threshold slides from 0.97 at equal costs to 0.02 once a missed fraud costs 50x a false alarm' },
    { file: 'threshold_sensitivity.webp', label: 'Precision, recall and F1 across the threshold range - the 0.5 default sits far from the cost optimum' },
    { file: 'business_impact.webp', label: 'Business impact - at threshold 0.02, $1,083 of loss against $9,800 for doing nothing, an 88.9% reduction' },
    { file: 'lift_gain.webp', label: 'Cumulative gain - how much fraud is caught per unit of analyst review effort' },
    { file: 'feature_importance_direction.webp', label: 'Odds ratios with 95% confidence intervals - V4 multiplies fraud odds by 3.3 per standard deviation, V10 cuts them to 0.41' },
    { file: 'feature_comparison.webp', label: 'Importance across gini, gain and permutation, each normalised so the methods are directly comparable' },
    { file: 'effect_size_vs_pvalue.webp', label: 'Effect size vs significance - 28 of 30 features are significant, but only 15 have a large effect' },
    { file: 'radar_chart.webp', label: 'Model shape across precision, recall, F1 and ROC-AUC' },
    { file: 'temporal_fraud.webp', label: 'Fraud rate by hour - the argument for time features and for forward-in-time evaluation' },
    { file: 'online_fraud_by_type.webp', label: 'Online Payment fraud rate by transaction type, with Wilson confidence intervals' },
    { file: 'bank_account_effect_sizes.webp', label: 'Bank Account effect sizes - 24 of 25 features significant, none with a large effect: the diagnosis for the dataset that failed' },
    { file: 'z_score_feature_separation_ranking.webp', label: 'Features ranked by Cohen\'s d - V17, V14, V12 and V10 separate the classes by several standard deviations' },
    { file: 'z_score_multivariate_chi_distribution.webp', label: 'Multivariate chi-score - fraud averages 667.6 against 26.9 for legitimate, a 24.8x ratio' },
    { file: 'z_score_distribution_all_features.webp', label: 'Per-feature z-score distributions for both classes, ordered by effect size' },
    { file: 'z_score_amount_time_scatter.webp', label: 'Amount vs Time z-scores - most fraud uses perfectly ordinary amounts' },
  ],
  'wids-temp-forecasting': [
    { file: 'target_distribution.webp', label: 'Target Distribution' },
    { file: 'spatial_temperature_map.webp', label: 'Spatial Temperature Map' },
    { file: 'correlation_heatmap.webp', label: 'Correlation Heatmap' },
    { file: 'model_residuals.webp', label: 'Model Residuals' },
  ],
  'starbucks-offer-analysis': [
    { file: 'demographic_distributions.webp', label: 'Customer Demographics - Age, Income & Gender Distribution' },
    { file: 'offer_funnel.webp', label: 'Offer Engagement Funnel - Received to Viewed to Completed' },
    { file: 'offer_characteristics_boxplots.webp', label: 'Offer Characteristics - Duration, Difficulty & Reward vs Completion' },
    { file: 'transaction_behavior.webp', label: 'Transaction Behavior - Responders vs Non-Responders' },
    { file: 'cluster_pca_scatter.webp', label: 'PCA Visualization of 4 Customer Segments' },
    { file: 'cluster_sizes.webp', label: 'Segment Size Distribution' },
    { file: 'cluster_boxplots.webp', label: 'Feature Distributions Across Segments' },
    { file: 'model_comparison.webp', label: 'Model Comparison - 4 Algorithms Benchmarked' },
    { file: 'best_model_performance.webp', label: 'XGBoost Confusion Matrix & Performance' },
    { file: 'feature_importance.webp', label: 'Top Predictive Features for Offer Completion' },
    { file: 'shap_summary_bar.webp', label: 'SHAP Feature Importance Summary' },
    { file: 'ate_by_offer_type.webp', label: 'Causal ATE - Impact of Offers on Transaction Spend' },
    { file: 'recommendation_performance.webp', label: 'Recommendation System Lift vs Random Targeting' },
  ],
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const project = projects.find(p => p.id === projectId);

  // These 20-odd pages are the deepest content on the site and, until this was
  // added, every one of them inherited whichever title the previous route had
  // set - or the generic index.html title on a direct visit.
  useDocumentMeta({
    title: project?.title,
    description: project?.shortDescription,
    path: project ? `/projects/${project.id}` : undefined,
    type: 'article',
  });

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (_e) {
      window.scrollTo(0, 0);
    }
  }, [projectId]);

  useEffect(() => {
    if (project?.markdown) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetch(project.markdown)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load project details');
          }
          return response.text();
        })
        .then(text => {
          // The page header already states the title, so the write-up's own
          // leading H1 would render it twice, one line apart.
          const withoutTitle = text.replace(/^\s*#\s+.*\n/, '');
          setMarkdownContent(withoutTitle);
          setLoading(false);
          setError(null);
        })
        .catch(error => {
          console.error('Error loading markdown:', error);
          setError('Failed to load project details. Please try again later.');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No detailed writeup available for this project yet.');
    }
  }, [project]);

  /*
   * These write-ups run to a couple of thousand words, which is the length at
   * which a reader needs to see the shape before committing to the scroll.
   * Only h2s are listed - h3 depth would turn the rail into a second document.
   * Fenced code blocks are stripped first so a `## ` inside one is not indexed.
   */
  const headings = useMemo(() => {
    const withoutFences = markdownContent.replace(/```[\s\S]*?```/g, '');
    return [...withoutFences.matchAll(/^##\s+(.+)$/gm)].map((match) => {
      const raw = match[1].trim();
      return {
        // Inline code in a heading arrives as literal backticks here, where the
        // rendered heading shows none. Strip them so the rail reads as prose.
        text: raw.replace(/`/g, ''),
        id: slugify(raw),
      };
    });
  }, [markdownContent]);

  if (!project) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Project not found
          </Typography>
          <Button
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Container>
    );
  }

  const projectPlots = PROJECT_PLOTS[project.id] || PROJECT_PLOTS['wids-temp-forecasting'];
  const isStarbucks = project.id === 'starbucks-offer-analysis';
  const isFraud = project.id === 'fraud-detection';

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/*
        * Spec-sheet header. This was previously a solid primary-colour band with
        * white text and a row of translucent chips - a treatment that read as a
        * template banner, fought all four themes, and pushed the actual writing
        * a full screen down. The metadata now sits in a mono spec table, which
        * is quieter and carries strictly more information.
        */}
      <Box component="header" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              size="small"
              sx={{ mb: 3, ml: -1, color: 'text.secondary' }}
            >
              Back
            </Button>

            <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 1.5 }}>
              Case study &middot; {project.category}
            </Typography>

            <Typography
              variant="h1"
              component="h1"
              sx={{ mb: 2, maxWidth: 900, fontSize: { xs: '2.125rem', sm: '2.5rem', md: '3rem' } }}
            >
              {project.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 3.5 }}>
              {project.shortDescription}
            </Typography>

            {project.evidence && (
              <Box sx={{ maxWidth: 720, mb: 4 }}>
                <EvidenceLine text={project.evidence} />
              </Box>
            )}

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', maxWidth: 900 }}>
              <SpecRow label="Stack">
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {project.technologies.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        fontFamily: theme.custom.codeFont,
                        fontSize: '0.6875rem',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                      }}
                    />
                  ))}
                </Stack>
              </SpecRow>

              <SpecRow label="Availability">
                <Typography variant="body2" color="text.secondary">
                  {availabilityOf(project)}
                </Typography>
              </SpecRow>

              {(project.githubUrl || project.liveUrl || isFraud) && (
                <SpecRow label="Links">
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {project.liveUrl && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<LaunchIcon />}
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open the live site
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GitHubIcon />}
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Source
                      </Button>
                    )}
                    {isFraud && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AssessmentIcon />}
                        href="/reports/fraud_analysis_report.html"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Full report
                      </Button>
                    )}
                  </Stack>
                </SpecRow>
              )}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {project.id === 'idea-sprint' && (
        <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
          <LazySpaceEmbed src="https://ai-robotix-nick-multi-agent-system.hf.space" height={450} />
        </Container>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            // The rail is a fixed 240px so the prose column keeps a readable
            // measure instead of stretching to whatever is left over.
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 240px' },
            gap: { xs: 0, md: 6 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              className="markdown-content"
              sx={{
                /*
                 * Markdown is authored elsewhere, so nothing here can assume the
                 * content fits: headings, prose and list items all have to be able
                 * to break. Without this a single long word or URL widened the whole
                 * document, and because the AppBar is fixed to the viewport it then
                 * ended mid-screen as soon as you scrolled sideways.
                 */
                // A readable measure. Without this the prose stretches to the
                // full grid column and runs past 110 characters a line.
                maxWidth: 760,
                '& h1, & h2, & h3, & h4, & p, & li': {
                  overflowWrap: 'break-word'
                },
                '& h1, & h2, & h3': {
                  fontFamily: theme.custom.displayFont,
                  letterSpacing: '-0.02em',
                  color: theme.palette.text.primary
                },
                '& h1': {
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  fontWeight: 700,
                  mt: 6,
                  mb: 2.5,
                  lineHeight: 1.15
                },
                '& h2': {
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  fontWeight: 600,
                  mt: 6,
                  mb: 2,
                  pt: 3,
                  lineHeight: 1.2,
                  // Clears the fixed app bar when a contents-rail link jumps here.
                  scrollMarginTop: 88,
                  borderTop: `1px solid ${theme.palette.divider}`
                },
                '& h2:first-of-type': {
                  mt: 0,
                  pt: 0,
                  borderTop: 'none'
                },
                // Several write-ups already separate sections with `---`. Where
                // one does, the rule it produces and the heading's own top rule
                // would stack into a visible double line.
                '& hr + h2': {
                  mt: 0,
                  pt: 0,
                  borderTop: 'none'
                },
                '& h3': {
                  fontSize: { xs: '1.15rem', sm: '1.3rem' },
                  fontWeight: 600,
                  mt: 4,
                  mb: 1.5
                },
                '& h4': {
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  fontWeight: 600,
                  mt: 3,
                  mb: 1.25,
                  color: theme.palette.text.primary
                },
                '& p': {
                  lineHeight: 1.75,
                  mb: 2.5,
                  fontSize: '1rem',
                  color: theme.palette.text.secondary
                },
                '& ul, & ol': {
                  mb: 3,
                  pl: { xs: 3, sm: 4 },
                  '& li': {
                    mb: 1.5,
                    lineHeight: 1.7,
                    color: theme.palette.text.secondary
                  }
                },
                '& code': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.9em',
                  fontFamily: '"Fira Code", "Courier New", monospace',
                  fontWeight: 500,
                  // File paths and shell commands have no spaces to break on.
                  // `anywhere` rather than `break-word` because only `anywhere`
                  // shrinks min-content width, which is what table cells size to.
                  overflowWrap: 'anywhere'
                },
                '& pre': {
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid', borderColor: 'divider'
                },
                '& blockquote': {
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  pl: 3,
                  ml: 0,
                  my: 3,
                  fontStyle: 'italic',
                  color: theme.palette.text.secondary,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  py: 2,
                  pr: 2,
                  borderRadius: '0 6px 6px 0'
                },
                '& hr': {
                  my: 5,
                  border: 'none',
                  height: '2px',
                  bgcolor: theme.palette.divider
                },
                '& a': {
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  // Bare repo URLs are a single unbreakable token otherwise.
                  overflowWrap: 'anywhere',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  my: 3,
                  border: '1px solid', borderColor: 'divider'
                },
                /*
                 * A table wider than the screen scrolls inside its own wrapper
                 * (see the `table` renderer below) instead of stretching the
                 * document. `width: 100%` still lets narrow tables fill the
                 * column; wide ones grow past it and the wrapper takes the scroll.
                 */
                '& .markdown-table-scroll': {
                  width: '100%',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  mb: 3
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    p: { xs: 1.25, sm: 2 },
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    textAlign: 'left'
                  },
                  '& td': {
                    p: { xs: 1.25, sm: 2 },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary
                  },
                  '& tr:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }
                },
                '& strong': {
                  fontWeight: 700,
                  color: theme.palette.text.primary
                }
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Ids come from the same slugify the contents rail uses, so a
                  // rail link can never point at a heading that is not there.
                  h2({ node: _node, children, ...props }) {
                    return (
                      <h2 id={slugify(nodeText(children))} {...props}>
                        {children}
                      </h2>
                    );
                  },
                  table({ node: _node, children, ...props }) {
                    return (
                      <Box className="markdown-table-scroll">
                        <table {...props}>{children}</table>
                      </Box>
                    );
                  },
                  code({ node: _node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '8px',
                          fontSize: '0.95rem'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </Box>
          </motion.div>
        )}
          </Box>

          {/*
            * Contents rail. Hidden below md rather than collapsed into an
            * accordion: on a phone the heading list is the same scroll distance
            * as the headings themselves, so it would cost space and earn nothing.
            */}
          {headings.length > 2 && (
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                // The grid sets alignItems:'start', which shrink-wraps this
                // column to its own height and leaves the sticky child nothing
                // to travel within. Stretching the column back to the full row
                // height is what makes the rail actually stick.
                alignSelf: 'stretch',
              }}
            >
              <Box
                component="nav"
                aria-label="On this page"
                sx={{
                  position: 'sticky',
                  top: 88,
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  pl: 2.5,
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  On this page
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {headings.map((heading) => (
                    <Box component="li" key={heading.id} sx={{ mb: 1 }}>
                      <Box
                        component="a"
                        href={`#${heading.id}`}
                        sx={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          lineHeight: 1.45,
                          color: 'text.secondary',
                          textDecoration: 'none',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {heading.text}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      {project.portfolioData && (
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Divider sx={{ mb: 6 }} />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            {isFraud ? 'Interactive Fraud Analysis' : isStarbucks ? 'Interactive Analysis & Business Insights' : 'Interactive Analysis'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isFraud
              ? 'Explore model performance across three fraud datasets with interactive visualizations of precision, recall, confusion matrices, and feature importance.'
              : isStarbucks
                ? "Explore customer segments, model performance, causal inference results, and feature importance through interactive visualizations powered by the improved analysis pipeline (May 2026)."
                : "Explore the model's performance and feature importance through interactive visualizations."}
          </Typography>

          <EDASummarySection dataPath={project.portfolioData} />
          <ModelMetricsCard dataPath={project.portfolioData} />
          {isStarbucks && <ClusterSummaryCard dataPath={project.portfolioData} />}
          {isStarbucks && <CausalAtteChart dataPath={project.portfolioData} />}
          <FeatureImportanceChart dataPath={project.portfolioData} />
          <PredictionVsActualChart dataPath={project.portfolioData} />

          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              {isStarbucks ? 'Exploratory Data Analysis Visualizations' : 'EDA Visualizations'}
            </Typography>
            <Grid container spacing={4}>
              {projectPlots.map((plot, i) => {
                const interp = isFraud && PLOT_INTERPRETATIONS['fraud-detection']?.[plot.file];
                return (
                  <Grid item xs={12} md={6} key={i}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                        {plot.label}
                      </Typography>
                      <img
                        src={`${project.portfolioData}plots/${plot.file}`}
                        alt={plot.label}
                        style={{ width: '100%', borderRadius: 6 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {interp && (
                        <Paper sx={{ mt: 2, p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                            <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>What it shows: </Typography>
                            {interp.what}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                            <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.success.main }}>Key insight: </Typography>
                            {interp.insight}
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>Why it matters: </Typography>
                            {interp.why}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Container>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 8 }}>
        <CaseStudyFooter currentId={project.id} />

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            onClick={() => navigate('/', { state: { scrollTo: 'projects' } })}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="large"
          >
            Back to all projects
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectDetail;
