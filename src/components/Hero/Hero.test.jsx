import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as router from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Hero from './Hero';
import { profile } from '../../data/profile';
import { getThemePersonality, themeOrder, themePersonalities } from '../../utilities/themeConfig';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
}));

vi.mock('../../assets/NicholasSmith_Resume.pdf', () => ({ default: 'mocked-resume.pdf' }));

const renderIn = (key, props = {}) =>
  render(
    <ThemeProvider theme={createTheme(getThemePersonality(key))}>
      <MemoryRouter>
        <Hero {...props} />
      </MemoryRouter>
    </ThemeProvider>
  );

const modeFor = (arrangement) =>
  themeOrder.find((key) => themePersonalities[key].custom.layout.hero === arrangement);

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router.useNavigate.mockImplementation(() => vi.fn());
  });

  it('gives every mode an arrangement that exists', () => {
    const arrangements = themeOrder.map((key) => themePersonalities[key].custom.layout.hero);
    expect(new Set(arrangements)).toEqual(new Set(['panel', 'masthead', 'cover', 'plate']));
  });

  describe('invariants across every mode', () => {
    it.each(themeOrder)('%s makes the name the only h1', (key) => {
      // App.test.jsx resolves the landing page by this exact heading, and it is
      // the page's single top-level heading in every arrangement.
      const { unmount } = renderIn(key);
      const h1s = screen.getAllByRole('heading', { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toHaveAccessibleName(profile.name);
      unmount();
    });

    it.each(themeOrder)('%s keeps the name copy-pasteable across the word masks', (key) => {
      // Each word sits in its own overflow-hidden box so a timeline can unmask
      // it. Without a real space text node between them a screen reader and the
      // clipboard both get "NicholasSmith".
      const { unmount } = renderIn(key);
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(profile.name);
      unmount();
    });

    it.each(themeOrder)('%s offers the same two calls to action', (key) => {
      const { unmount } = renderIn(key);
      expect(screen.getByRole('button', { name: /see my work/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^resume$/i })).toBeInTheDocument();
      unmount();
    });

    it.each(themeOrder)('%s fires the see-my-work callback', (key) => {
      const onSeeWork = vi.fn();
      const { unmount } = renderIn(key, { onSeeWork });
      fireEvent.click(screen.getByRole('button', { name: /see my work/i }));
      expect(onSeeWork).toHaveBeenCalled();
      unmount();
    });

    it.each(themeOrder)('%s links every social profile', (key) => {
      const { unmount } = renderIn(key);
      ['GitHub', 'LinkedIn', 'Email'].forEach((label) => {
        expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
      });
      unmount();
    });

    it.each(themeOrder)('%s shows all three pieces of evidence', (key) => {
      // The thesis above the ledger is unsupported without these, and each row
      // is also the hero's most useful navigation.
      const { unmount } = renderIn(key);
      profile.heroLedger.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(item.claim)).toBeInTheDocument();
      });
      unmount();
    });

    it.each(themeOrder)('%s opens the case study behind an evidence row', (key) => {
      const navigate = vi.fn();
      router.useNavigate.mockImplementation(() => navigate);

      const { unmount } = renderIn(key);
      const first = profile.heroLedger[0];
      fireEvent.click(screen.getByRole('button', { name: new RegExp(first.name, 'i') }));

      expect(navigate).toHaveBeenCalledWith(`/projects/${first.id}`);
      unmount();
    });

    it.each(themeOrder)('%s states the thesis and the proof', (key) => {
      const { unmount } = renderIn(key);
      expect(screen.getByText(profile.thesis)).toBeInTheDocument();
      expect(screen.getByText(profile.proof)).toBeInTheDocument();
      unmount();
    });

    it.each(themeOrder)('%s keeps the ATS skill list intact', (key) => {
      // Kept for the readers who are not reading: recruiter keyword scanners
      // match on the plain names, so an arrangement may not drop them.
      const { unmount } = renderIn(key);
      profile.skills.forEach((skill) => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
      unmount();
    });
  });

  describe('notebook', () => {
    it('sets the thesis in the body face, not the mono display face', () => {
      // This mode's display face is JetBrains Mono. Three lines of mono at 23px
      // read as a terminal transcript rather than a written opening - the
      // headers are stamped in this mode, the prose is not.
      renderIn(modeFor('cover'));
      const thesis = screen.getByText(profile.thesis);
      expect(thesis).not.toHaveStyle({ fontFamily: expect.stringContaining('JetBrains') });
    });
  });

  describe('ledger', () => {
    it('states the filing fields the mode is built around', () => {
      renderIn(modeFor('masthead'));
      ['Location', 'Available', 'Working since', 'Focus'].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
      expect(screen.getByText(String(profile.since))).toBeInTheDocument();
    });
  });
});
