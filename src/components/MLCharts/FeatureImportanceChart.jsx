import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const FeatureImportanceChart = ({ dataPath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetch(`${dataPath}data/feature_importance.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dataPath]);

  if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!data) return null;

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Feature Importance (Top 20)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {data.model_type} feature importance scores showing which variables most influence {data.dataset ? data.dataset.toLowerCase() : 'predictions'}.
      </Typography>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data.features}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis type="number" stroke={theme.palette.text.secondary} />
          <YAxis
            dataKey="name"
            type="category"
            width={110}
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 6,
            }}
          />
          <Bar dataKey="importance">
            {data.features.map((_, i) => (
              <Cell key={i} fill={i < 5 ? theme.palette.primary.main : theme.palette.secondary.main} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default FeatureImportanceChart;
