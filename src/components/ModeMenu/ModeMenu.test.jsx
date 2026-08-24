import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ModeMenu from './ModeMenu';
import {
  getThemePersonality,
  themeLabels,
  themeOrder,
  themePersonalities,
} from '../../utilities/themeConfig';

const renderMenu = (props = {}) =>
  render(
    <ThemeProvider theme={createTheme(getThemePersonality('technical-precision'))}>
      <ModeMenu current="technical-precision" onChange={() => {}} {...props} />
    </ThemeProvider>
  );

const openMenu = () => fireEvent.mouseDown(screen.getByRole('combobox'));

describe('ModeMenu', () => {
  it('gives every mode a label and a descriptor', () => {
    // The descriptor shipped in phase 1 and was read by nothing until the menu
    // used it. A mode without one would render a blank second line.
    themeOrder.forEach((key) => {
      expect({ key, label: !!themeLabels[key].label, descriptor: !!themeLabels[key].descriptor })
        .toEqual({ key, label: true, descriptor: true });
    });
  });

  it('names the control by what it changes, not by colour', () => {
    // It used to be labelled "Colour theme", which undersells a control that
    // changes the layout, the typefaces and the density too.
    renderMenu();
    expect(screen.getByRole('combobox', { name: 'Presentation mode' })).toBeInTheDocument();
  });

  it('lists every mode with what it does', () => {
    renderMenu();
    openMenu();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(themeOrder.length);

    themeOrder.forEach((key, i) => {
      const option = options[i];
      expect(within(option).getByText(themeLabels[key].label)).toBeInTheDocument();
      expect(within(option).getByText(themeLabels[key].descriptor)).toBeInTheDocument();
    });
  });

  it('marks the current mode as selected', () => {
    renderMenu({ current: 'forest-canopy' });
    openMenu();
    const selected = screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(within(selected[0]).getByText('Notebook')).toBeInTheDocument();
  });

  it('reports the chosen mode by its stable id', () => {
    // localStorage and the PostHog super property resolve by these, so the menu
    // must hand back the id and never the label.
    const onChange = vi.fn();
    renderMenu({ onChange });
    openMenu();
    fireEvent.click(screen.getByRole('option', { name: /Ledger/ }));

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target.value).toBe('corporate-clean');
  });

  it('shows the current mode by name in the drawer, where there is room', () => {
    renderMenu({ variant: 'drawer', current: 'ocean-mist' });
    expect(screen.getByRole('combobox')).toHaveTextContent('Exhibit');
  });

  it('keeps the swatch matching the palette each mode actually uses', () => {
    themeOrder.forEach((key) => {
      expect({ key, swatch: themeLabels[key].swatch }).toEqual({
        key,
        swatch: themePersonalities[key].palette.primary.main,
      });
    });
  });
});
