import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import * as router from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RangeBoard from './RangeBoard';
import { Stat } from './rangeParts';
import { domains } from '../../data/domains';
import { getThemePersonality, themeOrder, themePersonalities } from '../../utilities/themeConfig';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
}));

const renderIn = (key, ui = <RangeBoard />) =>
  render(
    <ThemeProvider theme={createTheme(getThemePersonality(key))}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );

const modeFor = (renderer) =>
  themeOrder.find((key) => themePersonalities[key].custom.layout.range === renderer);

describe('Range board', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router.useNavigate.mockImplementation(() => vi.fn());
  });

  it('gives every mode a renderer that exists', () => {
    const renderers = themeOrder.map((key) => themePersonalities[key].custom.layout.range);
    expect(new Set(renderers)).toEqual(new Set(['grid', 'table', 'annotated', 'strip']));
  });

  describe('the rule the board exists to demonstrate', () => {
    it.each(themeOrder)('%s shows every readout with its source line', (key) => {
      // domains.js: "every stat must be measurable from this repo or from a
      // project write-up it links to, and `source` names where to check it."
      // A renderer that dropped the citation would turn six measurements into
      // six decorations, so this is asserted per mode rather than once.
      const { unmount } = renderIn(key);

      domains.forEach((domain) => {
        expect(screen.getByText(domain.source)).toBeInTheDocument();
        expect(screen.getByText(domain.name)).toBeInTheDocument();
      });
      unmount();
    });

    it.each(themeOrder)('%s renders the real value, not a zero', (key) => {
      // The count-up is a `from` tween over textContent, so the truth has to be
      // in the markup - if the tween never runs, the board still reads right.
      const { container } = renderIn(key);

      const values = [...container.querySelectorAll('.range-stat')].map((el) => el.textContent);
      expect(values).toEqual(domains.map((d) => String(d.stat.value)));
    });

    it.each(themeOrder)('%s tweens a bare number, never a number with a unit', (key) => {
      // A suffix inside `.range-stat` would be swept into the numeric tween and
      // disappear, so "89%" would count up to "89".
      const { container, unmount } = renderIn(key);

      [...container.querySelectorAll('.range-stat')].forEach((el) => {
        expect(el.textContent).toMatch(/^\d+$/);
      });
      unmount();
    });

    it('renders a suffix beside the tweened span rather than inside it', () => {
      // No live domain carries a suffix any more: the DATA cell's "89%" was the
      // only one, and it moved to the worked-example section, which shows that
      // result in full rather than restating it. The guarantee still has to
      // hold for whoever adds the next one, so it is exercised with a fixture
      // instead of being left to rot until the day it matters.
      const { container } = renderIn(
        themeOrder[0],
        <Stat domain={{ stat: { value: 89, suffix: '%' } }} />
      );

      expect(container.querySelector('.range-stat').textContent).toBe('89');
      expect(container.textContent).toContain('89%');
    });
  });

  describe('invariants across every mode', () => {
    it.each(themeOrder)('%s names each domain in a level-3 heading', (key) => {
      const { unmount } = renderIn(key);
      const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      expect(headings).toEqual(domains.map((d) => d.name));
      unmount();
    });

    it.each(themeOrder)('%s links every flagship to its case study', (key) => {
      const navigate = vi.fn();
      router.useNavigate.mockImplementation(() => navigate);

      const { unmount } = renderIn(key);
      const flagship = domains[0].flagships[0];
      fireEvent.click(screen.getByRole('button', { name: new RegExp(flagship.name, 'i') }));

      expect(navigate).toHaveBeenCalledWith(`/projects/${flagship.id}`);
      unmount();
    });

    it.each(themeOrder)('%s tags its repeating unit for the entrance tween', (key) => {
      const { container, unmount } = renderIn(key);
      expect(container.querySelectorAll('.range-item')).toHaveLength(domains.length);
      unmount();
    });
  });

  describe('ledger', () => {
    it('announces as a real table with a source column', () => {
      renderIn(modeFor('table'));
      const table = screen.getByRole('table');
      expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
        'Code',
        'Domain',
        'Measure',
        'Source',
        'Flagships',
      ]);
      expect(within(table).getAllByRole('row')).toHaveLength(domains.length + 1);
    });
  });
});
