import React, { useRef } from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import useLayout from '../../hooks/useLayout';
import { RAIL_WIDTH } from '../../utilities/themeConfig';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * How each mode marks the start of a section.
 *
 * Four treatments, one per mode, because a section break is a structural
 * device and structure is what the modes vary. The map is keyed by
 * `custom.layout.heading.rule` rather than by theme, so the component never
 * asks which theme is active.
 *
 *   bar   Instrument. A short accent stroke, like a scale marking.
 *   full  Ledger. A firm ink rule the full width of the sheet, with the item
 *         count set against it - a column header, not a decoration.
 *   rail  Notebook. A hairline in the margin tan, with the eyebrow set out in
 *         the rail beside the title the way a date is written in a margin.
 *   none  Exhibit. Nothing. The air after the title is the separator, and a
 *         rule under a gallery label would be one mark too many.
 */
const RULES = {
  bar: { width: 48, height: 2, color: 'primary.main', gap: 2 },
  full: { width: '100%', height: '1px', color: 'text.primary', gap: 2 },
  rail: { width: '100%', height: '1px', color: 'secondary.main', gap: 2.5 },
  none: null,
};

/**
 * The one section heading used across the page.
 *
 * Nine consecutive sections used to render their own centred, teal, 700-weight
 * heading, so nothing signalled which section mattered. These are left-aligned
 * in the primary text colour, and the mode decides what marks the break.
 *
 * The rule draws in the first time the heading enters the viewport - the single
 * motion cue every section shares, so the page has one signature instead of
 * scattered effects. Skipped under prefers-reduced-motion, and skipped entirely
 * in a mode with no rule to draw.
 *
 * `count` is rendered only where the mode asks for it. Pass a real, checkable
 * number or leave it out; a count that does not match what is on screen is the
 * same failure as an unsourced stat on the Range board.
 */
const SectionHeading = ({ eyebrow, title, description, action, id, count }) => {
  const rootRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { motion } = useTheme().custom;
  const { heading } = useLayout();

  // `in`, not `??`: RULES.none is deliberately null, and a nullish fallback
  // would quietly hand Exhibit the bar rule it is defined as not having.
  const rule = heading.rule in RULES ? RULES[heading.rule] : RULES.bar;
  const railed = heading.rule === 'rail';
  const showCount = heading.count && count != null;

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const trigger = { trigger: rootRef.current, start: 'top 88%', once: true };

      gsap.from('.heading-copy', {
        autoAlpha: 0,
        y: motion.distance,
        duration: motion.duration,
        ease: motion.gsapEase,
        scrollTrigger: trigger,
      });

      if (!rule) return;
      gsap.from('.heading-rule', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: motion.duration,
        // The rule follows the copy rather than racing it. This is a sequencing
        // beat within one heading, not a motion character, so it stays local.
        delay: 0.15,
        ease: motion.gsapEase,
        scrollTrigger: trigger,
      });
    },
    // `revertOnUpdate` is not optional here. Switching mode changes `motion`,
    // so this re-runs - and without a revert, @gsap/react leaves the previous
    // mode's tween and its inline styles in place. Any heading still sitting at
    // its hidden `from` state (i.e. below the fold) is then the state the new
    // `gsap.from` records as its DESTINATION, so the heading animates back into
    // `visibility: hidden` and never comes out of it. Reverting first restores
    // the natural state, which is what the new tween has to land on.
    { scope: rootRef, dependencies: [prefersReducedMotion, motion, rule], revertOnUpdate: true }
  );

  const eyebrowText = eyebrow && (
    <Typography
      variant="overline"
      color={railed ? 'secondary.main' : 'primary.main'}
      sx={{ display: 'block' }}
    >
      {eyebrow}
    </Typography>
  );

  const titleAndDescription = (
    <>
      <Typography variant="h2" component="h2" id={id ? `${id}-heading` : undefined}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
          {description}
        </Typography>
      )}
    </>
  );

  return (
    <Box ref={rootRef} sx={{ mb: { xs: 3, md: 4 } }}>
      {railed ? (
        /*
         * The eyebrow sits out in the margin the section already reserves - see
         * `gutter: 'rail'` in Section. The negative margin lets this block start
         * at the container edge while the title stays aligned with the body
         * copy below it, which is the whole point of a margin rail: the
         * annotation is beside the text, not above it.
         */
        <Box
          className="heading-copy"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: `${RAIL_WIDTH}px minmax(0, 1fr)` },
            ml: { md: `-${RAIL_WIDTH}px` },
            rowGap: 1,
          }}
        >
          <Box sx={{ pr: { md: 3 }, pt: { md: 1 } }}>{eyebrowText}</Box>
          <Box sx={{ maxWidth: 640 }}>
            {titleAndDescription}
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
          </Box>
        </Box>
      ) : (
        <Box className="heading-copy">
          {/* Full width, not inside the copy column, so a count set against the
              right edge lands where the rule below it ends - which is what
              makes it read as a column header rather than a stray number. */}
          {(eyebrow || showCount) && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="baseline"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              {eyebrowText}
              {showCount && (
                <Typography variant="overline" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {count}
                </Typography>
              )}
            </Stack>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          >
            <Box sx={{ maxWidth: 640 }}>{titleAndDescription}</Box>
            {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
          </Stack>
        </Box>
      )}

      {rule && (
        <Box
          className="heading-rule"
          sx={{
            mt: rule.gap,
            width: rule.width,
            height: rule.height,
            bgcolor: rule.color,
            borderRadius: 0,
          }}
        />
      )}
    </Box>
  );
};

export default SectionHeading;
