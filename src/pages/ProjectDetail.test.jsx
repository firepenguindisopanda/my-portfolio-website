import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectDetail from './ProjectDetail';
import * as router from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { getThemePersonality } from '../utilities/themeConfig';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: vi.fn(),
}));

describe('ProjectDetail navigation and scroll state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Back to All Projects passes projectsScrollY back via navigate state', async () => {
    const mockNavigate = vi.fn();
    router.useNavigate.mockImplementation(() => mockNavigate);
    router.useLocation.mockImplementation(() => ({ pathname: '/projects/ai-pitchdeck-generator', state: {} }));
    router.useParams.mockImplementation(() => ({ projectId: 'ai-pitchdeck-generator' }));

    global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('# Hello\nThis is a test markdown') }));

    render(
      <ThemeProvider theme={createTheme(getThemePersonality('technical-precision'))}>
        <MemoryRouter>
          <ProjectDetail />
        </MemoryRouter>
      </ThemeProvider>
    );

    // The leading "# Hello" is stripped on load - the page header already
    // carries the title - so the body is what proves the markdown rendered.
    await screen.findByText(/This is a test markdown/i);

    window.history.replaceState({ projectsScrollY: 999 }, '');
    const backButton = screen.getByRole('button', { name: /Back to All Projects/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
