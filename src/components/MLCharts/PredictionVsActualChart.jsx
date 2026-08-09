import React, { useEffect, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { Box, Typography, useTheme, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

const PredictionVsActualChart = ({ dataPath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (!dataPath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(new Error('No data path provided'));
      setLoading(false);
      return;
    }

    const url = `${dataPath.replace(/\/+$/, '')}/data/predictions_sample.json`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!d.samples || d.samples.length === 0) {
          throw new Error('No samples in prediction data');
        }
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PredictionVsActualChart: failed to load data', err.message);
        setError(err);
        setLoading(false);
      });
  }, [dataPath]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading predictions&hellip;
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Unable to load prediction data.
        </Typography>
      </Box>
    );
  }

  // No data
  if (!data || !data.samples) return null;

  const firstSample = data.samples[0];
  const isClassification = firstSample?.predicted_probability !== undefined;

  if (isClassification) {
    const fraudData = data.samples.filter((s) => s.actual === 1);
    const legitData = data.samples.filter((s) => s.actual === 0);
    const cm = data.confusion_matrix;

    // Handle datasets that use 'reward' instead of 'transaction_amount'
    // (e.g. Starbucks offer completion data)
    const yField =
      firstSample.transaction_amount !== undefined
        ? 'transaction_amount'
        : firstSample.reward !== undefined
          ? 'reward'
          : null;

    const yLabel = yField === 'reward' ? 'Reward' : 'Transaction Amount ($)';

    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Prediction Probability Distribution
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {data.model || 'Model'} predictions on {data.dataset || 'dataset'}{' '}
          ({data.sample_size} stratified samples). Fraudulent transactions
          (actual=1) shown in red, legitimate (actual=0) in blue.
        </Typography>

        {cm && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Confusion Matrix - {data.dataset || ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <ConfusionMatrixCell
                label="True Negatives"
                value={cm.tn}
                color={theme.palette.success.main}
              />
              <ConfusionMatrixCell
                label="False Positives"
                value={cm.fp}
                color={theme.palette.error.main}
              />
              <ConfusionMatrixCell
                label="False Negatives"
                value={cm.fn}
                color={theme.palette.error.main}
              />
              <ConfusionMatrixCell
                label="True Positives"
                value={cm.tp}
                color={theme.palette.success.main}
              />
            </Box>
          </Paper>
        )}

        {/* Chart container - explicit height is required by ResponsiveContainer */}
        <Box sx={{ width: '100%', height: 460 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 64, left: 64 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                type="number"
                dataKey="predicted_probability"
                name="Probability"
                stroke={theme.palette.text.secondary}
                domain={[0, 1]}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{
                  value: 'Predicted Fraud Probability',
                  position: 'bottom',
                  offset: 24,
                  fill: theme.palette.text.secondary,
                  style: { fontSize: 13 },
                }}
              />
              <YAxis
                type="number"
                dataKey={yField}
                name={yLabel}
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: 12 }}
                tickFormatter={
                  yField === 'transaction_amount'
                    ? (v) => `$${v.toFixed(0)}`
                    : (v) => v.toFixed(0)
                }
                label={{
                  value: yLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: -10,
                  fill: theme.palette.text.secondary,
                  style: { fontSize: 13 },
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 6,
                }}
                formatter={(value, name) => {
                  if (name === 'Probability') {
                    return [`${(value * 100).toFixed(1)}%`, name];
                  }
                  if (name === 'Transaction Amount ($)') {
                    return [`$${value.toFixed(2)}`, name];
                  }
                  if (name === 'Reward') {
                    return [value.toFixed(0), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <ReferenceLine
                x={0.5}
                stroke={theme.palette.error.main}
                strokeDasharray="5 5"
                label={{
                  value: 'Decision Boundary',
                  position: 'top',
                  fill: theme.palette.error.main,
                  fontSize: 11,
                }}
              />
              <Scatter
                name="Legitimate (actual=0)"
                data={legitData}
                fill={theme.palette.primary.main}
                opacity={0.4}
              />
              <Scatter
                name="Fraud (actual=1)"
                data={fraudData}
                fill={theme.palette.error.main}
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  }

  
  // Regression branch (temperature prediction)
  
  const scatterData = data.samples.map((s) => ({
    actual: s.actual,
    predicted: s.predicted,
    error: s.error,
    month: s.month,
  }));

  // Compute the ideal-line bounds from both actual AND predicted so the
  // diagonal spans the full extent of the data
  const allValues = scatterData.flatMap((d) => [d.actual, d.predicted]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  // Pad slightly so points at the edge are still visible
  const pad = (maxVal - minVal) * 0.05 || 1;
  const domainMin = minVal - pad;
  const domainMax = maxVal + pad;

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Predicted vs Actual Temperature
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sample of {data.sample_size} predictions. Points closer to the diagonal
        line indicate more accurate forecasts.
      </Typography>

      <Box sx={{ width: '100%', height: 520 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 64, left: 64 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              type="number"
              dataKey="actual"
              name="Actual"
              stroke={theme.palette.text.secondary}
              domain={[domainMin, domainMax]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v.toFixed(1)}°C`}
              label={{
                value: 'Actual Temperature (°C)',
                position: 'bottom',
                offset: 24,
                fill: theme.palette.text.secondary,
                style: { fontSize: 13 },
              }}
            />
            <YAxis
              type="number"
              dataKey="predicted"
              name="Predicted"
              stroke={theme.palette.text.secondary}
              domain={[domainMin, domainMax]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v.toFixed(1)}°C`}
              label={{
                value: 'Predicted Temperature (°C)',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                fill: theme.palette.text.secondary,
                style: { fontSize: 13 },
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 6,
              }}
              formatter={(value, name) => [`${value.toFixed(2)}°C`, name]}
            />
            <ReferenceLine
              segment={[
                { x: domainMin, y: domainMin },
                { x: domainMax, y: domainMax },
              ]}
              stroke={theme.palette.error.main}
              strokeDasharray="5 5"
              label={{
                value: 'Perfect Prediction',
                position: 'insideTopLeft',
                fill: theme.palette.error.main,
                fontSize: 11,
              }}
            />
            <Scatter
              name="Predictions"
              data={scatterData}
              fill={theme.palette.primary.main}
              opacity={0.5}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

/** Small helper to render a confusion-matrix cell with value + label. */
function ConfusionMatrixCell({ label, value, color }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color }}>
        {value?.toLocaleString() ?? '-'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default PredictionVsActualChart;
