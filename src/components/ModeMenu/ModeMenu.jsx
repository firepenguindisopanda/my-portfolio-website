import React from 'react';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import { themeLabels, themeOrder } from '../../utilities/themeConfig';

/**
 * The control that switches presentation mode.
 *
 * One component for both the app bar and the drawer. These were two copies of
 * the same markup, which is how the two halves of a control drift apart.
 *
 * Each option carries the one-line descriptor from `themeLabels`, because the
 * names alone do not say what changes. "Instrument" and "Exhibit" mean nothing
 * to a first-time visitor, and the whole point of the switcher is that it
 * changes the layout and not just the colours - a menu of four coloured dots
 * undersells that to exactly the people the site is for.
 */
const ModeSwatch = ({ swatch, mode, size = 12 }) => (
  <Box
    aria-hidden
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      bgcolor: swatch,
      border: '1px solid',
      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
      flexShrink: 0,
      mt: 0.5,
    }}
  />
);

const ModeMenu = ({ current, onChange, variant = 'bar' }) => {
  const inBar = variant === 'bar';

  return (
    <Select
      value={current}
      onChange={onChange}
      size="small"
      fullWidth={!inBar}
      variant={inBar ? 'standard' : 'outlined'}
      disableUnderline={inBar}
      renderValue={(key) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: inBar ? 0.5 : 0 }}>
          {inBar && <PaletteIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          <ModeSwatch swatch={themeLabels[key].swatch} mode={themeLabels[key].mode} />
          {/* The label is dropped only in the app bar, and only because the row
              already carries five section links, a menu and the resume button.
              Everywhere with room, the mode says its own name. */}
          <Box
            component="span"
            sx={{ display: inBar ? { xs: 'none', lg: 'inline' } : 'inline', fontWeight: 600 }}
          >
            {themeLabels[key].label}
          </Box>
        </Box>
      )}
      inputProps={{ 'aria-label': 'Presentation mode' }}
      MenuProps={{ slotProps: { paper: { sx: { maxWidth: 320 } } } }}
      sx={inBar ? { ml: 1, '& .MuiSelect-select': { py: 0.5 } } : undefined}
    >
      {themeOrder.map((key) => (
        <MenuItem key={key} value={key} sx={{ alignItems: 'flex-start', py: 1.25 }}>
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
            <ModeSwatch swatch={themeLabels[key].swatch} mode={themeLabels[key].mode} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                {themeLabels[key].label}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', whiteSpace: 'normal', lineHeight: 1.4 }}
              >
                {themeLabels[key].descriptor}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};

export default ModeMenu;
