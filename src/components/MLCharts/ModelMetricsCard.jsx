import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, useTheme, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TrendingUp as TrendingUpIcon, Speed as SpeedIcon, Assessment as AssessmentIcon, Security as SecurityIcon } from '@mui/icons-material';

const MetricCard = ({ icon, label, value, subtext, color }) => {
  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        background: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ color, mb: 1 }}>{icon}</Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
      {subtext && (
        <Typography variant="caption" color="text.secondary">{subtext}</Typography>
      )}
    </Paper>
  );
};

const ModelMetricsCard = ({ dataPath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetch(`${dataPath}data/model_metrics.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dataPath]);

  if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!data) return null;

  const isFraud = data.baseline_dummy !== undefined;
  const isWids = data.lightgbm !== undefined;

  if (isFraud) {
    // `best` rather than a hardcoded algorithm: the winning model is decided by
    // average precision in the pipeline and is not always the same one.
    const best = data.best || data.random_forest;
    const dummy = data.baseline_dummy;
    const ci = data.average_precision_ci;
    const costModel = data.cost_model;

    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Model Performance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {data.best_model} on the Credit Card dataset ({data.training_samples.toLocaleString()} training rows,
          {' '}{data.n_positive_test} fraud cases in the held-out split). Imbalance {data.imbalance_ratio} ({data.fraud_pct}% fraud).
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
          Average precision is the headline metric, not accuracy: below a 1% base rate a model that
          never predicts fraud still scores {(dummy.accuracy * 100).toFixed(2)}% accuracy and catches none of it.
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <MetricCard
              icon={<AssessmentIcon fontSize="large" />}
              label="Average Precision"
              value={best.average_precision.toFixed(3)}
              subtext={ci ? `95% CI ${ci[0].toFixed(3)}-${ci[1].toFixed(3)}` : `Chance: ${data.ap_baseline}`}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MetricCard
              icon={<TrendingUpIcon fontSize="large" />}
              label="Lift vs Chance"
              value={`${Math.round(data.ap_lift)}x`}
              subtext={`Random ranker: ${data.ap_baseline}`}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MetricCard
              icon={<SpeedIcon fontSize="large" />}
              label="Precision"
              value={best.precision.toFixed(3)}
              subtext={`Recall: ${best.recall.toFixed(3)}`}
              color={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MetricCard
              icon={<SecurityIcon fontSize="large" />}
              label="ROC-AUC"
              value={best.roc_auc.toFixed(3)}
              subtext={`Accuracy: ${(best.accuracy * 100).toFixed(2)}%`}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            label={`${Math.round(data.ap_lift)}x better than random ranking`}
            color="success"
            sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
          />
          {data.cv_average_precision_mean != null && (
            <Chip
              label={`${data.cv_folds}-fold CV AP: ${data.cv_average_precision_mean.toFixed(3)}`}
              color="info"
              sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
            />
          )}
          <Chip
            label={`Datasets: ${data.datasets_trained}`}
            color="info"
            sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
          />
        </Box>

        {data.best_per_dataset && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Cost-optimised operating points
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {costModel ? costModel.description : 'Z = $100 x false negative + $1 x false alarm'}.
              {' '}The 0.5 default is only optimal when a missed fraud costs the same as a false alarm.
            </Typography>
            <Grid container spacing={2}>
              {Object.values(data.best_per_dataset).map((d) => (
                <Grid item xs={12} md={4} key={d.dataset_label}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.dataset_label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {d.model} - AP {d.average_precision.toFixed(3)} ({Math.round(d.ap_lift)}x chance)
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="body2">
                        Threshold <strong>{d.threshold}</strong> catches <strong>{d.fraud_caught_pct}%</strong> of fraud
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {d.cost_optimized_fp.toLocaleString()} false alarms - <strong>{d.cost_reduction_pct}%</strong> lower loss than doing nothing
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    );
  }

  if (isWids) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Model Performance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          LightGBM vs NMME ensemble baseline on {data.training_samples.toLocaleString()} training samples ({data.cv_folds}-fold CV).
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <MetricCard
              icon={<SpeedIcon fontSize="large" />}
              label="RMSE"
              value={data.lightgbm.rmse.toFixed(3)}
              subtext={`Baseline: ${data.baseline_nmme_mean.rmse.toFixed(3)}`}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MetricCard
              icon={<AssessmentIcon fontSize="large" />}
              label="MAE"
              value={data.lightgbm.mae.toFixed(3)}
              subtext={`Baseline: ${data.baseline_nmme_mean.mae.toFixed(3)}`}
              color={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MetricCard
              icon={<TrendingUpIcon fontSize="large" />}
              label="R² Score"
              value={data.lightgbm.r2.toFixed(4)}
              subtext={`Baseline: ${data.baseline_nmme_mean.r2.toFixed(4)}`}
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            label={`RMSE Improvement: ${data.improvement.rmse_reduction_pct}%`}
            color="success"
            sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
          />
          <Chip
            label={`MAE Improvement: ${data.improvement.mae_reduction_pct}%`}
            color="success"
            sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
          />
        </Box>
      </Box>
    );
  }

  const best = data.xgboost;
  const baseline = data.baseline;
  const hasCV = data.cross_validation !== undefined;
  const hasThreshold = data.threshold_optimization !== undefined;
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Model Performance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {data.best_model} vs baseline on {data.training_samples.toLocaleString()} training samples ({data.test_samples.toLocaleString()} test). Imbalance ratio: {data.imbalance_ratio} ({data.positive_pct}% positive).
        {hasCV ? ` 5-fold CV AUC-ROC: ${data.cross_validation.cv_auc_mean.toFixed(3)} ± ${data.cross_validation.cv_auc_std.toFixed(3)}.` : ''}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <MetricCard
            icon={<AssessmentIcon fontSize="large" />}
            label="AUC-ROC"
            value={best.auc_roc.toFixed(3)}
            subtext={`Baseline: ${baseline.auc_roc.toFixed(3)}`}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <MetricCard
            icon={<SpeedIcon fontSize="large" />}
            label="Precision"
            value={best.precision.toFixed(3)}
            subtext={`Baseline: ${baseline.precision.toFixed(3)}`}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <MetricCard
            icon={<TrendingUpIcon fontSize="large" />}
            label="Recall"
            value={best.recall.toFixed(3)}
            subtext={`Baseline: ${baseline.recall.toFixed(3)}`}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <MetricCard
            icon={<SecurityIcon fontSize="large" />}
            label="F1 Score"
            value={best.f1.toFixed(3)}
            subtext={`Baseline: ${baseline.f1.toFixed(3)}`}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip
          label={`AUC-ROC vs Baseline: +${data.improvement.auc_roc_over_baseline_pct}%`}
          color="success"
          sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
        />
        <Chip
          label={`Recall Gain: ${data.improvement.recall_gain_pct}%`}
          color="success"
          sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
        />
        <Chip
          label={`Models: ${data.models_trained}`}
          color="info"
          sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2 }}
        />
        {hasThreshold && (
          <Chip
            label={`Threshold: ${data.threshold_optimization.optimal_threshold} (F1=${data.threshold_optimization.f1_at_optimal.toFixed(3)})`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.85rem' }}
          />
        )}
        {hasThreshold && (
          <Chip
            label={`Brier: ${data.threshold_optimization.brier_score.toFixed(3)}`}
            color="info"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.85rem' }}
          />
        )}
        {hasCV && (
          <Chip
            label={`5-Fold CV: ${data.cross_validation.cv_auc_mean.toFixed(3)} ± ${data.cross_validation.cv_auc_std.toFixed(3)}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.85rem' }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ModelMetricsCard;
