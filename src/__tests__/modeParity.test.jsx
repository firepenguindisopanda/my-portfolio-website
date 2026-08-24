import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from '../pages/Home';
import { sections } from '../data/profile';
import { getThemePersonality, themeOrder } from '../utilities/themeConfig';

vi.mock('../assets/NicholasSmith_Resume.pdf', () => ({ default: 'mocked-resume.pdf' }));

/**
 * The four modes rearrange the page. They must not change what is on it.
 *
 * Nav, useSectionSpy, hash links, the SEO script and every component test all
 * resolve against the same anchors, and a mode that renamed a section or
 * re-levelled a heading would fork every one of them silently - the page would
 * still look right in the mode being worked on. This renders the whole home
 * page in all four and compares the structure that everything else depends on.
 */
const renderHome = (key) =>
  render(
    <ThemeProvider theme={createTheme(getThemePersonality(key))}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </ThemeProvider>
  );

/** The structural contract: anchors, heading outline, and landmark roles. */
const outlineOf = (container) => ({
  sectionIds: [...container.querySelectorAll('section[id]')].map((el) => el.id),
  headings: [...container.querySelectorAll('h1, h2, h3')].map(
    (h) => `${h.tagName} ${h.textContent.trim()}`
  ),
});

describe('mode parity', () => {
  const cache = new Map();

  /** Rendered once per mode, on first ask - render() may not run in beforeAll. */
  const outline = (key) => {
    if (!cache.has(key)) {
      const { container, unmount } = renderHome(key);
      cache.set(key, outlineOf(container));
      unmount();
    }
    return cache.get(key);
  };

  it('anchors every section the nav links to, in every mode', () => {
    themeOrder.forEach((key) => {
      const ids = outline(key).sectionIds;
      sections.forEach((section) => {
        expect({ key, section: section.id, present: ids.includes(section.id) }).toEqual({
          key,
          section: section.id,
          present: true,
        });
      });
    });
  });

  it('keeps the same section anchors in the same order in every mode', () => {
    const reference = outline(themeOrder[0]).sectionIds;
    themeOrder.slice(1).forEach((key) => {
      expect({ key, ids: outline(key).sectionIds }).toEqual({ key, ids: reference });
    });
  });

  it('keeps the heading outline identical in every mode', () => {
    // Same levels, same text, same order. An arrangement may move a heading on
    // screen; it may not change what the document says it is.
    const reference = outline(themeOrder[0]).headings;
    expect(reference.length).toBeGreaterThan(10);

    themeOrder.slice(1).forEach((key) => {
      expect({ key, headings: outline(key).headings }).toEqual({ key, headings: reference });
    });
  });

  it('has exactly one h1 in every mode', () => {
    themeOrder.forEach((key) => {
      const h1s = outline(key).headings.filter((h) => h.startsWith('H1 '));
      expect({ key, h1s }).toEqual({ key, h1s: ['H1 Nicholas Smith'] });
    });
  });

  it('never skips from h1 straight past h2', () => {
    themeOrder.forEach((key) => {
      const levels = outline(key).headings.map((h) => Number(h[1]));
      levels.forEach((level, i) => {
        const previous = i === 0 ? level : levels[i - 1];
        expect({ key, jump: level - previous <= 1 }).toEqual({ key, jump: true });
      });
    });
  });
});
