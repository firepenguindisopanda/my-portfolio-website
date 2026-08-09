import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, useTheme, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Storage as StorageIcon, AccountBalance as AccountBalanceIcon, Assessment as AssessmentIcon, Science as ScienceIcon } from '@mui/icons-material';

const StatItem = ({ icon, label, value }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
      <Box sx={{ color: theme.palette.primary.main }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{value}</Typography>
      </Box>
    </Box>
  );
};

const EDASummarySection = ({ dataPath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetch(`${dataPath}data/eda_stats.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dataPath]);

  if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!data) return null;

  const isFraud = data.dataset.credit_card_rows !== undefined;
  const isWids = data.dataset.train_rows !== undefined;

  if (isFraud) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Dataset Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dataset Statistics
              </Typography>
              <StatItem icon={<StorageIcon />} label="Total Transactions" value={data.dataset.total_rows.toLocaleString()} />
              <StatItem icon={<AccountBalanceIcon />} label="Credit Card" value={`${data.dataset.credit_card_rows.toLocaleString()} rows, ${data.dataset.credit_card_features} features`} />
              <StatItem icon={<AccountBalanceIcon />} label="Online Payment" value={`${data.dataset.online_payment_rows.toLocaleString()} rows, ${data.dataset.online_payment_features} features`} />
              <StatItem icon={<AccountBalanceIcon />} label="Bank Account" value={`${data.dataset.bank_account_rows.toLocaleString()} rows, ${data.dataset.bank_account_features} features`} />
              <StatItem icon={<AssessmentIcon />} label="Features After Encoding" value={data.dataset.total_features_after_encoding} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Algorithms Compared</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {data.algorithms.map(a => (
                  <Box key={a} sx={{
                    px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem',
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}>
                    {a}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Class Imbalance Analysis
              </Typography>
              <StatItem icon={<ScienceIcon />} label="Total Fraud Cases" value={data.target.total_fraud_cases.toLocaleString()} />
              <StatItem icon={<ScienceIcon />} label="Total Legitimate" value={data.target.total_legit_cases.toLocaleString()} />
              <StatItem icon={<ScienceIcon />} label="Credit Card Fraud Rate" value={`${data.target.credit_fraud_rate_pct}% (${data.target.credit_imbalance_ratio})`} />
              <StatItem icon={<ScienceIcon />} label="Online Payment Fraud Rate" value={`${data.target.online_fraud_rate_pct}% (${data.target.online_imbalance_ratio})`} />
              <StatItem icon={<ScienceIcon />} label="Bank Account Fraud Rate" value={`${data.target.bank_fraud_rate_pct}% (${data.target.bank_imbalance_ratio})`} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Methodology</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {Object.values(data.methodology).map((m, i) => (
                  <Box key={i} sx={{
                    px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem',
                    background: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                  }}>
                    {m}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isWids) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Dataset Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dataset Statistics
              </Typography>
              <StatItem icon={<StorageIcon />} label="Training Samples" value={data.dataset.train_rows.toLocaleString()} />
              <StatItem icon={<StorageIcon />} label="Total Features" value={data.dataset.total_features} />
              <StatItem icon={<AccountBalanceIcon />} label="US Locations" value={data.dataset.unique_locations} />
              <StatItem icon={<AssessmentIcon />} label="Date Range" value={data.dataset.date_range} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Climate Regions</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {data.climate_regions.map(r => (
                  <Box key={r} sx={{
                    px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem',
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}>
                    {r}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Target Variable (Temperature °C)
              </Typography>
              <StatItem icon={<ScienceIcon />} label="Mean" value={data.target.mean.toFixed(1)} />
              <StatItem icon={<ScienceIcon />} label="Std Dev" value={data.target.std.toFixed(1)} />
              <StatItem icon={<ScienceIcon />} label="Range" value={`${data.target.min.toFixed(1)} to ${data.target.max.toFixed(1)}`} />
              <StatItem icon={<ScienceIcon />} label="Median" value={data.target.median.toFixed(1)} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Seasonal Patterns</Typography>
              {Object.entries(data.seasonal_patterns).map(([season, temp]) => (
                <StatItem key={season} icon={<ScienceIcon />} label={season.charAt(0).toUpperCase() + season.slice(1)} value={`${temp.toFixed(1)}°C`} />
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  const isStarbucks = data.dataset.customer_features !== undefined && data.dataset.credit_card_rows === undefined && data.dataset.train_rows === undefined;

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Dataset Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dataset Statistics
            </Typography>
            <StatItem icon={<StorageIcon />} label="Total Customers" value={data.dataset.total_customers.toLocaleString()} />
            <StatItem icon={<StorageIcon />} label="Total Offers" value={data.dataset.total_offers} />
            <StatItem icon={<AccountBalanceIcon />} label="Total Events" value={data.dataset.total_events.toLocaleString()} />
            <StatItem icon={<AccountBalanceIcon />} label="Total Transactions" value={data.dataset.total_transactions.toLocaleString()} />
            <StatItem icon={<AssessmentIcon />} label="Date Range" value={`${data.dataset.date_range_days} days`} />
            <StatItem icon={<AssessmentIcon />} label="Customer Features" value={`${data.dataset.customer_features}`} />
            {data.dataset.interaction_features && (
              <StatItem icon={<AssessmentIcon />} label="Interaction Features" value={`${data.dataset.interaction_features}`} />
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Algorithms Compared</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {data.algorithms.map(a => (
                <Box key={a} sx={{
                  px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem',
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}>
                  {a}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Demographics & Target
            </Typography>
            <StatItem icon={<ScienceIcon />} label="Mean Age" value={data.demographics.age_mean.toFixed(1)} />
            <StatItem icon={<ScienceIcon />} label="Median Income" value={`$${data.demographics.income_median.toLocaleString()}`} />
            <StatItem icon={<ScienceIcon />} label="Offer Completion Rate" value={`${data.target.positive_pct}%`} />
            <StatItem icon={<ScienceIcon />} label="Imbalance Ratio" value={data.target.imbalance_ratio} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Methodology</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.values(data.methodology).map((m, i) => (
                <Box key={i} sx={{
                  px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem',
                  background: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                }}>
                  {m}
                </Box>
              ))}
            </Box>
            {isStarbucks && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Statistical Rigor</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {['Hypothesis Tests', 'Effect Sizes', 'Bootstrap CIs', 'PSM', '5-Fold CV'].map(label => (
                    <Box key={label} sx={{
                      px: 1, py: 0.3, borderRadius: 1, fontSize: '0.7rem',
                      background: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 600,
                    }}>
                      {label}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EDASummarySection;
