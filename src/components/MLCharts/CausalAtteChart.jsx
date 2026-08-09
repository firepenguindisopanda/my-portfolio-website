import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine
} from 'recharts';
import { Box, Typography, useTheme, Chip, Paper, Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Science as ScienceIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';

const CustomTooltip = ({ active, payload, label: _label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{d.offer_type}</Typography>
      <Typography variant="body2">ATE: <strong>${d.ate_dollars.toFixed(2)}</strong> ({d.ate_percent.toFixed(1)}%)</Typography>
      <Typography variant="body2">95% CI: [${d.ci_lower.toFixed(2)}, ${d.ci_upper.toFixed(2)}]</Typography>
      <Typography variant="body2">Cohen&apos;s d: {d.cohens_d.toFixed(4)} ({d.effect_size_label})</Typography>
      <Typography variant="body2">p-value: {d.p_value.toFixed(4)}</Typography>
      <Typography variant="body2">
        {d.significant
          ? <strong style={{ color: '#2e7d32', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircleIcon fontSize="inherit" /> Statistically significant</strong>
          : <strong style={{ color: '#d32f2f', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CancelIcon fontSize="inherit" /> Not significant</strong>}
      </Typography>
    </Paper>
  );
};

const CausalAtteChart = ({ dataPath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetch(`${dataPath}data/causal_ate.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dataPath]);

  if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!data) return null;

  const chartData = data.ate_results.map(d => ({
    ...d,
    fill: d.significant
      ? (d.ate_dollars >= 0 ? theme.palette.success.main : theme.palette.error.main)
      : theme.palette.grey[400],
  }));

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Causal Inference: Average Treatment Effect (ATE)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Bootstrapped ATE estimates (1,000 resamples) measuring the causal impact of each offer type on transaction spend. Error bars show 95% confidence intervals. All effect sizes are negligible (Cohen&apos;s d &lt; 0.02).
      </Typography>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="offer_type" stroke={theme.palette.text.secondary} />
          <YAxis
            stroke={theme.palette.text.secondary}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            label={{ value: 'ATE ($)', angle: -90, position: 'insideLeft', style: { fill: theme.palette.text.secondary } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={theme.palette.divider} strokeDasharray="4 4" />
          <Bar dataKey="ate_dollars" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.04) }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceIcon color="info" /> Propensity Score Matching (PSM)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              After adjusting for selection bias via logistic regression PSM on age, income, gender, and tenure:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={`BOGO: $${data.propensity_score_matching.bogo_matched_ate.toFixed(2)}`} size="small" variant="outlined" color="primary" />
              <Chip label={`Discount: $${data.propensity_score_matching.discount_matched_ate.toFixed(2)}`} size="small" variant="outlined" color="secondary" />
              <Chip label={`Info: $${data.propensity_score_matching.informational_matched_ate.toFixed(2)}`} size="small" variant="outlined" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              A/B Test Simulation Framework
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.ab_test_simulation.feasible
                ? `Feasible with ${data.ab_test_simulation.required_sample_per_group.toLocaleString()} customers per group (${(data.ab_test_simulation.empirical_power * 100).toFixed(0)}% power).`
                : 'A/B test not feasible with current customer base.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={`Lift: +${data.ab_test_simulation.lift_percent}%`} size="small" color="success" sx={{ fontWeight: 600 }} />
              <Chip label={`n/group: ${data.ab_test_simulation.required_sample_per_group.toLocaleString()}`} size="small" variant="outlined" />
              <Chip label={`Power: ${(data.ab_test_simulation.empirical_power * 100).toFixed(0)}%`} size="small" variant="outlined" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CausalAtteChart;
