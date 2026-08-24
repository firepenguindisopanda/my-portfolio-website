import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Section from './Section';
import { getThemePersonality, themeOrder } from '../../utilities/themeConfig';

const renderIn = (personality, ui) =>
  render(<ThemeProvider theme={createTheme(personality)}>{ui}</ThemeProvider>);

/**
 * The vertical padding Emotion actually emitted for this element, smallest
 * breakpoint first.
 *
 * Read from the stylesheet rather than via getComputedStyle, because the
 * spacing is responsive and jsdom does not resolve media queries - it reports
 * padding-top as "0" for a value that only exists inside `@media`. Reading the
 * rules covers both breakpoints instead of neither.
 */
const paddingSteps = (element) => {
  const emotionClass = [...element.classList].find((name) => name.startsWith('css-'));
  const css = [...document.querySelectorAll('style')].map((tag) => tag.textContent).join('\n');
  const rule = new RegExp(`\\.${emotionClass}\\{[^}]*padding-top:([^;}]+)`, 'g');
  return [...css.matchAll(rule)].map((match) => match[1].trim());
};

describe('Section', () => {
  it('renders its children', () => {
    renderIn(getThemePersonality('technical-precision'), <Section>Projects</Section>);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('takes its rhythm from the mode rather than hardcoding it', () => {
    // Spacing unlike any real mode's: if the component were still carrying
    // `py: { xs: 6, md: 9 }`, this would read 48px and 72px.
    const personality = getThemePersonality('technical-precision');
    const invented = {
      ...personality,
      custom: {
        ...personality.custom,
        layout: { ...personality.custom.layout, sectionSpacing: { xs: 13, md: 137 } },
      },
    };

    renderIn(invented, <Section data-testid="band">Range</Section>);
    expect(paddingSteps(screen.getByTestId('band'))).toEqual(['13px', '137px']);
  });

  it('renders each mode at its own declared rhythm', () => {
    themeOrder.forEach((key) => {
      const personality = getThemePersonality(key);
      const { xs, md } = personality.custom.layout.sectionSpacing;
      const { unmount } = renderIn(
        personality,
        <Section data-testid={`band-${key}`}>Section</Section>
      );
      expect({ key, steps: paddingSteps(screen.getByTestId(`band-${key}`)) }).toEqual({
        key,
        steps: [`${xs}px`, `${md}px`],
      });
      unmount();
    });
  });

  it('gives the four modes four different densities', () => {
    // The check above would still pass if every mode declared the same numbers,
    // which is what phase 0 shipped. Density is one of the things a presentation
    // mode varies, so four identical values would mean the modes differ by
    // colour and type alone - the defect this whole change exists to fix.
    const rhythms = themeOrder.map((key) => getThemePersonality(key).custom.layout.sectionSpacing.md);
    expect(new Set(rhythms).size).toBe(themeOrder.length);
  });

  it('lets a caller add styles without losing the rhythm', () => {
    const personality = getThemePersonality('technical-precision');
    const { xs, md } = personality.custom.layout.sectionSpacing;

    renderIn(personality, <Section data-testid="band" sx={{ maxWidth: 640 }}>Contact</Section>);

    const band = screen.getByTestId('band');
    expect(band).toHaveStyle({ maxWidth: '640px' });
    expect(paddingSteps(band)).toEqual([`${xs}px`, `${md}px`]);
  });
});
