import React from 'react';
import { Box, useTheme } from '@mui/material';
import useLayout from '../../hooks/useLayout';

/**
 * How a mode encloses a block of content.
 *
 * The highest-leverage token in the system: About, Skills, Credentials and
 * Contact all present small self-contained blocks, and this is what stops each
 * of them growing four hand-written layouts to do it. One switch, three
 * treatments, and every section that uses it follows the mode for free.
 *
 *   card   A bordered box on paper. Separation comes from the border, never a
 *          shadow - shadows are reserved for true overlays.
 *   rule   No box at all. A hairline above, tight padding, sitting directly on
 *          the ground. A sheet does not put its rows in boxes.
 *   plate  A hairline above in the label colour, then air. What holds a gallery
 *          caption together is the space around it, not an edge drawn round it.
 *
 * `flush` is for a block whose own content reaches the edge - a certificate
 * image, say. It drops the padding a box would need without dropping the
 * hairline the other two treatments are made of.
 *
 * `rule` and `plate` are both hairline-and-air rather than a box, but they are
 * not the same block: one is 15px on a tight rhythm under an ink line, the
 * other 17px on a loose one under brass. The mode's type and palette do that
 * work; this only has to stop drawing a border where a border is wrong.
 */
const TREATMENTS = {
  card: (theme, interactive, flush) => ({
    p: flush ? 0 : 2.5,
    borderRadius: `${theme.custom.radius.container}px`,
    border: theme.custom.card.border,
    bgcolor: 'background.paper',
    transition: 'border-color 0.2s ease',
    ...(interactive && { '&:hover': { borderColor: theme.custom.card.hoverBorderColor } }),
  }),
  rule: (_theme, _interactive, flush) => ({
    pt: 1.5,
    pb: flush ? 0 : 2,
    borderTop: '1px solid',
    borderColor: 'divider',
  }),
  plate: (_theme, _interactive, flush) => ({
    pt: 2,
    pb: flush ? 0 : 3,
    borderTop: '1px solid',
    borderColor: 'secondary.main',
  }),
};

const Surface = React.forwardRef(
  ({ children, interactive = true, flush = false, component = 'div', sx, ...rest }, ref) => {
    const theme = useTheme();
    const { surface } = useLayout();
    const treatment = TREATMENTS[surface] ?? TREATMENTS.card;

    return (
      <Box
        ref={ref}
        component={component}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...treatment(theme, interactive, flush),
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Box>
    );
  }
);

Surface.displayName = 'Surface';

export default Surface;
