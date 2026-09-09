import React, { useRef } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { usePostHog } from '@posthog/react';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import EvidenceLine from '../Evidence/EvidenceLine';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';
import {
  COST_MODEL,
  DATASETS,
  NULL_MODEL,
  SERIES,
  SOURCE,
  formatMoney,
} from '../../data/workedExample';

/**
 * One decision from one case study, shown rather than described.
 *
 * The rest of the page tells an employer what the work is. A data role wants to
 * see the work, and the deepest evidence on this site - cost surfaces, Wilson
 * intervals, odds ratios with confidence intervals - was three clicks down
 * inside a lazily-loaded project page that a recruiter will never open. This
 * lifts the single most legible piece of it onto the home page.
 *
 * Drawn in CSS rather than with a charting library, deliberately. Six bars do
 * not justify ~100kB of recharts on the one route every visitor loads, and a
 * static matplotlib export - which is what the case study ships - would arrive
 * as a white rectangle with red and green lines in a page that has four themes
 * and a no-gradient, solid-accent palette. Bars built from theme tokens follow
 * the mode: they take its accent, its radius and its motion character for free.
 *
 * Colour does no work alone here. Every value is printed beside its own bar, so
 * the figure is fully readable in greyscale, in forced-colors mode, and to a
 * screen reader - the bars are aria-hidden decoration over text that already
 * says everything they encode.
 */

/** Visually hidden, still read aloud - carries each row's series name. */
const SR_ONLY = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const BAR_HEIGHT = 14;

const Bar = ({ share, color, radius }) => (
  <Box
    aria-hidden
    sx={{
      height: BAR_HEIGHT,
      // The track is the full row, so an empty remainder still reads as a
      // proportion rather than as a bar that happens to be short.
      width: '100%',
      bgcolor: 'transparent',
    }}
  >
    <Box
      className="we-bar"
      sx={{
        height: '100%',
        width: `${Math.max(share * 100, 0.8)}%`,
        bgcolor: color,
        borderRadius: `0 ${radius}px ${radius}px 0`,
        transformOrigin: 'left center',
      }}
    />
  </Box>
);

const Swatch = ({ color, radius }) => (
  <Box
    aria-hidden
    sx={{
      width: 12,
      height: 12,
      bgcolor: color,
      borderRadius: `${radius}px`,
      flexShrink: 0,
    }}
  />
);

const Legend = ({ baseline, radius }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 3 }}>
    {[
      { label: SERIES.baseline, color: baseline },
      { label: SERIES.result, color: 'primary.main' },
    ].map((entry) => (
      <Box key={entry.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Swatch color={entry.color} radius={radius} />
        <Typography variant="caption" color="text.secondary">
          {entry.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

const DatasetRow = ({ row, baseline, radius, codeFont }) => (
  <Box component="li" sx={{ listStyle: 'none', mb: 3.5, '&:last-child': { mb: 0 } }}>
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 1,
        mb: 1.25,
      }}
    >
      <Typography component="h3" variant="body2" sx={{ fontWeight: 600 }}>
        {row.label}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontFamily: codeFont }}
      >
        {`threshold ${row.threshold} · ${row.fraudCaughtPct}% of fraud caught`}
      </Typography>
    </Box>

    {[
      { series: SERIES.baseline, value: row.doingNothing, share: 1, color: baseline, note: null },
      {
        series: SERIES.result,
        value: row.atThreshold,
        share: row.atThreshold / row.doingNothing,
        color: 'primary.main',
        note: `${row.reductionPct}% less`,
      },
    ].map((bar) => (
      <Box
        key={bar.series}
        sx={{
          display: 'grid',
          // 160px, not 132: "$17,054" plus "61.3% less" measured just over the
          // narrower column and wrapped the note onto its own line, which broke
          // the row rhythm on exactly one of the three rows.
          gridTemplateColumns: { xs: 'minmax(0, 1fr) 128px', sm: 'minmax(0, 1fr) 160px' },
          alignItems: 'center',
          columnGap: 2,
          mb: 0.75,
          '&:last-child': { mb: 0 },
        }}
      >
        <Bar share={bar.share} color={bar.color} radius={radius} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'flex-end' }}>
          <Box component="span" sx={SR_ONLY}>{`${bar.series}: `}</Box>
          {/* Values wear text ink, never the series colour - the bar beside
              them is what carries identity. */}
          <Typography variant="body2" sx={{ fontFamily: codeFont, fontWeight: 600 }}>
            {formatMoney(bar.value)}
          </Typography>
          {bar.note && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: codeFont, whiteSpace: 'nowrap' }}
            >
              {bar.note}
            </Typography>
          )}
        </Box>
      </Box>
    ))}
  </Box>
);

const WorkedExample = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const prefersReducedMotion = usePrefersReducedMotion();
  const rootRef = useRef(null);

  const baseline = theme.custom.chart.baseline;
  const radius = theme.custom.radius.control;
  const codeFont = theme.custom.codeFont;

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      // `from`, so a skipped animation leaves every bar at its true width.
      gsap.from('.we-bar', {
        scaleX: 0,
        duration: theme.custom.motion.duration * 1.6,
        stagger: theme.custom.motion.stagger,
        ease: theme.custom.motion.gsapEase,
        scrollTrigger: { trigger: rootRef.current, start: 'top 80%', once: true },
      });
    },
    // See SectionHeading: a mode switch changes `motion`, and without a revert
    // the previous tween's inline styles become the new tween's destination.
    {
      scope: rootRef,
      dependencies: [prefersReducedMotion, theme.custom.motion],
      revertOnUpdate: true,
    }
  );

  return (
    <Section ref={rootRef}>
      <SectionHeading
        eyebrow="Worked example"
        title="A model can be 99.8% accurate and catch nothing"
        description={`A classifier that always answers "not fraud" scores ${NULL_MODEL.accuracyPct}% accuracy on this data and catches ${NULL_MODEL.fraudCaught} of the ${NULL_MODEL.fraudPresent} frauds in the test split. So the threshold that raises an alert is chosen by minimising cost instead. Here is what that decision is worth.`}
      />

      <Box component="figure" sx={{ m: 0 }}>
        <Legend baseline={baseline} radius={radius} />

        <Box component="ul" sx={{ m: 0, p: 0 }}>
          {DATASETS.map((row) => (
            <DatasetRow
              key={row.id}
              row={row}
              baseline={baseline}
              radius={radius}
              codeFont={codeFont}
            />
          ))}
        </Box>

        <Typography
          component="figcaption"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2.5, maxWidth: '68ch', lineHeight: 1.6 }}
        >
          Each pair is scaled against its own dataset&apos;s cost of running no model;
          both amounts are printed. Bank Account is the dataset the analysis
          concludes did not work, and it stays for the same reason it stays in the
          write-up.
        </Typography>
      </Box>

      <Box sx={{ mt: 2.5, maxWidth: '68ch' }}>
        <EvidenceLine
          label="How the threshold is chosen"
          text={`${COST_MODEL.formula}, swept across 99 thresholds. There is no correct threshold in the abstract, only a correct one given a cost ratio somebody is willing to state.`}
          compact
        />
      </Box>

      <Box
        sx={{
          mt: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            posthog?.capture('worked_example_clicked', { project_id: SOURCE.projectId });
            navigate(`/projects/${SOURCE.projectId}`);
          }}
        >
          Read the full analysis
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: codeFont }}>
          {`${SOURCE.artifact} · ${SOURCE.generated} · ${SOURCE.gitSha}`}
        </Typography>
      </Box>
    </Section>
  );
};

export default WorkedExample;
