import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, useTheme, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  People as PeopleIcon, AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon, EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const SegmentMetricCard = ({ icon, label, value, color }) => (
  <Box sx={{ textAlign: 'center', px: 1 }}>
    <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{label}</Typography>
    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{value}</Typography>
  </Box>
);

const ClusterSummaryCard = ({ dataPath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetch(`${dataPath}data/cluster_summary.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dataPath]);

  if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!data) return null;

  const colors = [
    theme.palette.grey[500],
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
  ];

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Customer Segments & Business KPIs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        4 segments identified via K-Means clustering with stability analysis (ARI=0.85). Segments are validated against business metrics - revenue, CLV proxy, and offer ROI.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {data.segments.map((seg, i) => (
          <Grid item xs={12} sm={6} md={3} key={seg.id}>
            <Paper
              sx={{
                p: 2.5, borderRadius: 2, height: '100%',
                borderLeft: `4px solid ${colors[i]}`,
                bgcolor: alpha(colors[i], 0.04),
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: colors[i] }}>
                {seg.name}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <SegmentMetricCard
                    icon={<PeopleIcon fontSize="small" />}
                    label="Size"
                    value={`${seg.size_pct}% (${seg.customer_count.toLocaleString()})`}
                    color={colors[i]}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SegmentMetricCard
                    icon={<MoneyIcon fontSize="small" />}
                    label="30-Day Spend"
                    value={`$${seg.avg_spend_30d.toFixed(0)}`}
                    color={colors[i]}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SegmentMetricCard
                    icon={<TrendingUpIcon fontSize="small" />}
                    label="Annual CLV"
                    value={`$${seg.clv_proxy_annual.toLocaleString()}`}
                    color={colors[i]}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SegmentMetricCard
                    icon={<TrophyIcon fontSize="small" />}
                    label="Offer ROI"
                    value={seg.offer_roi ? `${seg.offer_roi}x` : 'N/A'}
                    color={colors[i]}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <Chip
                  label={`Send: ${seg.primary_offer}`}
                  size="small"
                  sx={{
                    fontWeight: 600, fontSize: '0.7rem',
                    bgcolor: alpha(colors[i], 0.15),
                    color: colors[i],
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 700 }}>Segment</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Size %</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue/Customer</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>CLV (Annual)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Offer ROI</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Completion</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Primary Offer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.segments.map((seg, i) => (
              <TableRow key={seg.id} sx={{ '&:hover': { bgcolor: alpha(colors[i], 0.04) } }}>
                <TableCell sx={{ fontWeight: 600, color: colors[i] }}>{seg.name}</TableCell>
                <TableCell align="right">{seg.size_pct}%</TableCell>
                <TableCell align="right">${seg.avg_spend_30d.toFixed(2)}</TableCell>
                <TableCell align="right">${seg.clv_proxy_annual.toLocaleString()}</TableCell>
                <TableCell align="right">{seg.offer_roi ? `${seg.offer_roi.toFixed(1)}x` : '-'}</TableCell>
                <TableCell align="right">{seg.completion_rate}%</TableCell>
                <TableCell>
                  <Chip label={seg.primary_offer} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<TrendingUpIcon />}
          label={`53.3% of customers generate 85.6% of revenue`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          icon={<MoneyIcon />}
          label={`Est. Annual Revenue: $${(data.kpi_summary.estimated_annual_revenue / 1e6).toFixed(1)}M`}
          color="success"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          icon={<TrophyIcon />}
          label={`Rec. System Lift: +${data.kpi_summary.recommendation_lift_pct}%`}
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>
    </Box>
  );
};

export default ClusterSummaryCard;
