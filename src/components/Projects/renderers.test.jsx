import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import * as router from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Projects from './Projects';
import { getThemePersonality, themeOrder, themePersonalities } from '../../utilities/themeConfig';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

const renderIn = (key) =>
  render(
    <ThemeProvider theme={createTheme(getThemePersonality(key))}>
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    </ThemeProvider>
  );

/** Which mode uses which renderer, read from the tokens rather than assumed. */
const modeFor = (renderer) =>
  themeOrder.find((key) => themePersonalities[key].custom.layout.projects === renderer);

describe('project renderers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    window.scrollTo = vi.fn();
    router.useNavigate.mockImplementation(() => vi.fn());
    router.useLocation.mockImplementation(() => ({ pathname: '/', state: {} }));
  });

  it('gives every mode a renderer that exists', () => {
    const renderers = themeOrder.map((key) => themePersonalities[key].custom.layout.projects);
    expect(new Set(renderers)).toEqual(new Set(['cards', 'table', 'entries', 'plates']));
  });

  describe('invariants across every mode', () => {
    it.each(themeOrder)('%s renders each project as a level-3 heading', (key) => {
      const { unmount } = renderIn(key);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
      unmount();
    });

    it.each(themeOrder)('%s offers the same category filters', (key) => {
      const { unmount } = renderIn(key);
      ['All', 'Full Stack', 'Data Science'].forEach((cat) => {
        expect(screen.getByRole('button', { name: cat })).toBeInTheDocument();
      });
      unmount();
    });

    it.each(themeOrder)('%s filters to the same projects', (key) => {
      const { unmount } = renderIn(key);
      fireEvent.click(screen.getByRole('button', { name: 'Data Science' }));
      expect(screen.getByText(/Caribbean ASR Data Science/i)).toBeInTheDocument();
      expect(screen.queryByText(/Chimp Test/i)).toBeNull();
      unmount();
    });

    it.each(themeOrder)('%s stashes scroll and navigates on opening a case study', (key) => {
      const navigate = vi.fn();
      router.useNavigate.mockImplementation(() => navigate);
      Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 456 });

      const { unmount } = renderIn(key);
      fireEvent.click(screen.getAllByRole('button', { name: /case study/i })[0]);

      expect(sessionStorage.getItem('projectsScrollY')).toBe('456');
      expect(navigate).toHaveBeenCalledWith(expect.stringMatching(/^\/projects\//));
      unmount();
    });

    it.each(themeOrder)('%s expands the list on "view all"', (key) => {
      const { unmount } = renderIn(key);
      const before = screen.getAllByRole('heading', { level: 3 }).length;
      fireEvent.click(screen.getByRole('button', { name: /view all \d+ projects/i }));
      expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(before);
      unmount();
    });

  });

  describe('ledger', () => {
    it('counts what is on screen, not what exists', () => {
      // `18 shown` while six were rendered was a claim the page could not back
      // up - the same failure the Range board's source lines exist to prevent.
      // Ledger is the only mode that asks for a count, so it is the only one
      // that can get this wrong.
      renderIn(modeFor('table'));
      const rendered = screen.getAllByRole('heading', { level: 3 }).length;
      expect(screen.getByText(new RegExp(`^${rendered} of \\d+$`))).toBeInTheDocument();
    });

    it('keeps the count honest after expanding the list', () => {
      renderIn(modeFor('table'));
      fireEvent.click(screen.getByRole('button', { name: /view all \d+ projects/i }));
      const rendered = screen.getAllByRole('heading', { level: 3 }).length;
      expect(screen.getByText(`${rendered} of ${rendered}`)).toBeInTheDocument();
    });

    it('announces as a real table with column headers', () => {
      renderIn(modeFor('table'));
      const table = screen.getByRole('table');
      expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
        'Project',
        'Category',
        'Stack',
        'Links',
      ]);
      // Six projects plus the header row.
      expect(within(table).getAllByRole('row')).toHaveLength(7);
    });

    it('keeps screenshots out of the sheet until a row is opened', () => {
      renderIn(modeFor('table'));
      expect(screen.queryAllByRole('img', { name: /screenshot/i })).toHaveLength(0);

      const toggle = screen.getAllByRole('button', { expanded: false })[0];
      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('img', { name: /screenshot/i }).length).toBeGreaterThan(0);
    });

    it('points each row toggle at the detail row it controls', () => {
      const { container } = renderIn(modeFor('table'));
      const toggle = screen.getAllByRole('button', { expanded: false })[0];
      fireEvent.click(toggle);

      const id = toggle.getAttribute('aria-controls');
      expect(id).toBeTruthy();
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    });
  });

  describe('the other three show their work up front', () => {
    it.each([modeFor('cards'), modeFor('entries'), modeFor('plates')])(
      '%s renders screenshots without being asked',
      (key) => {
        const { unmount } = renderIn(key);
        expect(screen.getAllByRole('img', { name: /screenshot/i }).length).toBeGreaterThan(0);
        unmount();
      }
    );
  });

  describe('exhibit', () => {
    it('labels each plate with its real category and stack', () => {
      renderIn(modeFor('plates'));
      // A wall label lists what the object is and what it is made of. Both come
      // from project data - no invented year, no invented dimensions.
      const credits = screen.getAllByText(/Full Stack · /i);
      expect(credits.length).toBeGreaterThan(0);
    });

    it('uses no chips, because a wall label is not a tag cloud', () => {
      const { container } = renderIn(modeFor('plates'));
      const chipsInPlates = container.querySelectorAll('.MuiChip-root');
      // The category filter row still uses chips; the plates themselves do not.
      const filterChips = within(screen.getByRole('button', { name: 'All' }).parentElement)
        .queryAllByText((_c, el) => el.classList?.contains('MuiChip-label'));
      expect(chipsInPlates.length).toBe(filterChips.length);
    });
  });
});
