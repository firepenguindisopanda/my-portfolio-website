import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * The site's one recurring structural device.
 *
 * Almost every project in this portfolio contains a mechanism for checking its
 * own output - an audit script that re-reads the source independently, an eval
 * harness with a hallucination canary, arithmetic that catches the misreads a
 * confidence score cannot. That is the actual through-line of the work, so it
 * gets a dedicated slot rather than being buried in a feature list.
 *
 * It is deliberately not rendered for projects that have no such mechanism.
 * A device that appears on everything stops carrying information, and a
 * fabricated claim here would undermine every real one beside it.
 *
 * @param {string}  text     the claim, written as a mechanism rather than a metric
 * @param {string}  label    override the heading (default: "How it knows")
 * @param {boolean} compact  tighter type and spacing, for use inside a card
 */
const EvidenceLine = ({ text, label = 'How it knows', compact = false }) => {
  const theme = useTheme();

  if (!text) return null;

  return (
    <Box
      sx={{
        borderLeft: '2px solid',
        borderColor: 'primary.main',
        pl: compact ? 1.5 : 2,
        py: compact ? 0.25 : 0.5,
      }}
    >
      <Typography
        component="p"
        sx={{
          fontFamily: theme.custom.codeFont,
          fontSize: compact ? '0.625rem' : '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'primary.main',
          mb: compact ? 0.375 : 0.625,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: compact ? '0.8125rem' : '0.875rem', lineHeight: 1.6 }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default EvidenceLine;
