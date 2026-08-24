import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SectionHeading from './SectionHeading';
import { getThemePersonality, themeOrder, themePersonalities } from '../../utilities/themeConfig';

const renderIn = (key, props = {}) =>
  render(
    <ThemeProvider theme={createTheme(getThemePersonality(key))}>
      <SectionHeading eyebrow="Selected work" title="Projects" id="projects" {...props} />
    </ThemeProvider>
  );

const ruleOf = (container) => container.querySelector('.heading-rule');

/** Which mode uses which rule treatment, read from the tokens rather than assumed. */
const modeFor = (rule) =>
  themeOrder.find((key) => themePersonalities[key].custom.layout.heading.rule === rule);

describe('SectionHeading', () => {
  it('gives every mode a rule treatment that exists', () => {
    const rules = themeOrder.map((key) => themePersonalities[key].custom.layout.heading.rule);
    expect(new Set(rules)).toEqual(new Set(['bar', 'full', 'rail', 'none']));
  });

  it('draws a short accent bar in the bar mode', () => {
    const { container } = renderIn(modeFor('bar'));
    expect(ruleOf(container)).toHaveStyle({ width: '48px', height: '2px' });
  });

  it('draws a full-width rule in the full mode', () => {
    const { container } = renderIn(modeFor('full'));
    expect(ruleOf(container)).toHaveStyle({ width: '100%', height: '1px' });
  });

  it('draws no rule at all in the none mode', () => {
    const { container } = renderIn(modeFor('none'));
    // Exhibit separates sections with air. An empty 0-height element would still
    // take part in the layout, so the element must be absent, not just invisible.
    expect(ruleOf(container)).toBeNull();
  });

  it('shows a count only where the mode asks for one', () => {
    const counted = modeFor('full');
    renderIn(counted, { count: '18 shown' });
    expect(screen.getByText('18 shown')).toBeInTheDocument();
  });

  it('ignores a count in the modes that did not ask for one', () => {
    themeOrder
      .filter((key) => !themePersonalities[key].custom.layout.heading.count)
      .forEach((key) => {
        const { unmount } = renderIn(key, { count: '18 shown' });
        expect(screen.queryByText('18 shown')).not.toBeInTheDocument();
        unmount();
      });
  });

  it('omits the count row when the caller passes no count', () => {
    renderIn(modeFor('full'));
    expect(screen.getByText('Selected work')).toBeInTheDocument();
    expect(screen.queryByText(/shown/)).not.toBeInTheDocument();
  });

  it('sets the eyebrow out into the margin in the rail mode', () => {
    const { container } = renderIn(modeFor('rail'));
    // The negative margin is what lets the block start at the container edge
    // while the title stays aligned with the body copy below it. Without it the
    // heading indents and the rail stops meaning anything.
    const copy = container.querySelector('.heading-copy');
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');
    const emotionClass = [...copy.classList].find((name) => name.startsWith('css-'));
    expect(css).toMatch(new RegExp(`\\.${emotionClass}\\{[^}]*margin-left:-180px`));
  });

  it('keeps the heading level and id identical in every mode', () => {
    // Nav, useSectionSpy, hash links, the SEO script and the tests all resolve
    // against these. A mode that renamed or re-levelled its heading would fork
    // every one of them.
    themeOrder.forEach((key) => {
      const { unmount } = renderIn(key);
      const heading = screen.getByRole('heading', { level: 2, name: 'Projects' });
      expect({ key, id: heading.id }).toEqual({ key, id: 'projects-heading' });
      unmount();
    });
  });

  it('renders the description in every mode when given one', () => {
    themeOrder.forEach((key) => {
      const { unmount } = renderIn(key, { description: 'Things I have shipped.' });
      expect(screen.getByText('Things I have shipped.')).toBeInTheDocument();
      unmount();
    });
  });
});
