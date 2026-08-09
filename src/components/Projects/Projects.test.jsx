import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import * as router from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Projects from './Projects';
import { getThemePersonality } from '../../utilities/themeConfig';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

const theme = createTheme(getThemePersonality('technical-precision'));

const renderProjects = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    window.scrollTo = vi.fn();
    router.useNavigate.mockImplementation(() => vi.fn());
    router.useLocation.mockImplementation(() => ({ pathname: '/', state: {} }));
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('stashes scroll position and navigates when opening a case study', async () => {
    const mockNavigate = vi.fn();
    router.useNavigate.mockImplementation(() => mockNavigate);
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 456 });

    renderProjects();

    const buttons = await screen.findAllByRole('button', { name: /case study/i });
    fireEvent.click(buttons[0]);

    expect(sessionStorage.getItem('projectsScrollY')).toBe('456');
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/projects\//));
  });

  test('restores a stashed scroll position on mount and clears it', async () => {
    sessionStorage.setItem('projectsScrollY', '333');

    renderProjects();

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 333, left: 0, behavior: 'auto' });
    });
    expect(sessionStorage.getItem('projectsScrollY')).toBeNull();
  });

  test('filters projects by category', async () => {
    renderProjects();

    fireEvent.click(await screen.findByRole('button', { name: 'Data Science' }));

    expect(await screen.findByText(/Caribbean ASR Data Science/i)).toBeInTheDocument();
    expect(screen.queryByText(/Chimp Test/i)).toBeNull();
  });

  test('shows a bounded set of cards until "view all" is used', async () => {
    renderProjects();

    const viewAll = await screen.findByRole('button', { name: /view all \d+ projects/i });
    const before = screen.getAllByRole('heading', { level: 3 }).length;
    expect(before).toBe(6);

    fireEvent.click(viewAll);

    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(before);
  });

  test('caps technology chips at four per card', async () => {
    renderProjects();

    // Poke-Dash previously listed 14 technologies, wrapping to four rows.
    const headings = await screen.findAllByRole('heading', { level: 3 });
    headings.forEach((heading) => {
      const card = heading.closest('.MuiCard-root');
      const chips = within(card).queryAllByText(
        (_content, el) => el.classList?.contains('MuiChip-label')
      );
      // Allow one extra for the optional "Top pick" badge.
      expect(chips.length).toBeLessThanOrEqual(5);
    });
  });

  test('marks only top picks, not every card', async () => {
    renderProjects();

    await screen.findAllByRole('heading', { level: 3 });
    const topPicks = screen.getAllByText('Top pick');
    const cards = screen.getAllByRole('heading', { level: 3 });

    expect(topPicks.length).toBeGreaterThan(0);
    expect(topPicks.length).toBeLessThan(cards.length);
  });
});
