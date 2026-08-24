import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WorkExperience from './WorkExperience';
import Surface from '../Surface/Surface';
import { workExperiences } from './experienceData';
import { getThemePersonality, themeOrder, themePersonalities } from '../../utilities/themeConfig';

const renderIn = (key, ui = <WorkExperience />) =>
  render(<ThemeProvider theme={createTheme(getThemePersonality(key))}>{ui}</ThemeProvider>);

const modeFor = (renderer) =>
  themeOrder.find((key) => themePersonalities[key].custom.layout.experience === renderer);

describe('Experience', () => {
  it('gives every mode a renderer that exists', () => {
    const renderers = themeOrder.map((key) => themePersonalities[key].custom.layout.experience);
    expect(new Set(renderers)).toEqual(new Set(['timeline', 'table', 'rail', 'stack']));
  });

  describe('invariants across every mode', () => {
    it.each(themeOrder)('%s lists every role as a level-3 heading', (key) => {
      const { unmount } = renderIn(key);
      const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      expect(headings).toEqual(workExperiences.map((e) => e.title));
      unmount();
    });

    it.each(themeOrder)('%s shows every period and organisation', (key) => {
      const { unmount } = renderIn(key);
      workExperiences.forEach((experience) => {
        expect(screen.getByText(experience.period)).toBeInTheDocument();
        expect(screen.getAllByText(experience.organization).length).toBeGreaterThan(0);
      });
      unmount();
    });

    it.each(themeOrder)('%s keeps every entry collapsed until asked', (key) => {
      const { unmount } = renderIn(key);
      const toggles = screen.getAllByRole('button', { name: /view details/i });
      expect(toggles).toHaveLength(workExperiences.length);
      toggles.forEach((t) => expect(t).toHaveAttribute('aria-expanded', 'false'));
      unmount();
    });

    it.each(themeOrder)('%s reveals the tasks behind an entry on request', (key) => {
      const { unmount } = renderIn(key);
      const first = workExperiences[0];

      expect(screen.queryByText(first.items[0].text)).not.toBeInTheDocument();
      fireEvent.click(screen.getAllByRole('button', { name: /view details/i })[0]);

      expect(screen.getByText(first.items[0].text)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /less details/i })[0]).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      unmount();
    });

    it.each(themeOrder)('%s points each toggle at the panel it controls', (key) => {
      const { unmount } = renderIn(key);
      const toggle = screen.getAllByRole('button', { name: /view details/i })[0];
      expect(toggle.getAttribute('aria-controls')).toBe(`experience-detail-${workExperiences[0].id}`);
      unmount();
    });
  });

  describe('ledger', () => {
    it('announces as a real table of dated claims', () => {
      renderIn(modeFor('table'));
      const table = screen.getByRole('table');
      expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
        'Period',
        'Role',
        'Organisation',
        'Focus',
      ]);
    });
  });
});

describe('Surface', () => {
  it('gives every mode a treatment that exists', () => {
    const surfaces = themeOrder.map((key) => themePersonalities[key].custom.layout.surface);
    surfaces.forEach((s) => expect(['card', 'rule', 'plate']).toContain(s));
  });

  it('draws a border only where the mode encloses in a box', () => {
    themeOrder.forEach((key) => {
      const surface = themePersonalities[key].custom.layout.surface;
      const { container, unmount } = renderIn(key, <Surface>Block</Surface>);
      const el = container.firstElementChild;

      // Asserted on border-style, not width: with no border set, jsdom reports
      // width as the initial "medium" rather than 0.
      const style = getComputedStyle(el);
      const sides = [style.borderTopStyle, style.borderBottomStyle];

      // `card` is a box, bordered on every side. `rule` and `plate` are a
      // hairline above and nothing else - a sheet and a wall label do not put
      // their contents in boxes.
      const expected = surface === 'card' ? ['solid', 'solid'] : ['solid', 'none'];
      expect({ key, surface, sides }).toEqual({ key, surface, sides: expected });
      unmount();
    });
  });
});
