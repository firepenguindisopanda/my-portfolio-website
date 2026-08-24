import React from 'react';
import { Box } from '@mui/material';
import useLayout from '../../hooks/useLayout';

/**
 * The vertical rhythm between sections, owned in one place.
 *
 * This replaces nine copies of `py: { xs: 6, md: 9 }` that were spread across
 * the section components. Density is one of the four things a presentation mode
 * varies, so it has to come from the theme - but it was hardcoded nine times,
 * and the `sectionSpacing` token that was supposed to carry it had never been
 * read by anything.
 *
 * Deliberately renders a plain <Box>, not a <section>: pages/Home.jsx already
 * wraps each section in a semantic <section> carrying the id that the nav,
 * useSectionSpy and hash links resolve against. Owning spacing only keeps the
 * two from competing over one element, and keeps the doubled rhythm that
 * #skills and #credentials render today - each holds two of these.
 *
 * Spacing is emitted in px rather than MUI's 8px-multiple shorthand, because
 * the token is a real measurement per mode (48/72 today, 56 to 128 once the
 * modes diverge) and not every one of those is a multiple of eight.
 */
const Section = React.forwardRef(({ children, component = 'div', sx, ...rest }, ref) => {
  const { sectionSpacing } = useLayout();

  return (
    <Box
      ref={ref}
      component={component}
      sx={{
        py: { xs: `${sectionSpacing.xs}px`, md: `${sectionSpacing.md}px` },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

// forwardRef, because a section is what GSAP scopes a timeline to - RangeBoard
// already does it and phases 2-6 add more. Without this the ref lands on
// nothing and useGSAP silently scopes to the document.
Section.displayName = 'Section';

export default Section;
