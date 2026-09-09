import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IconCarousel from '../components/iconcarousel/IconCarousel';
import { getThemePersonality } from '../utilities/themeConfig';

// Use a real personality: components read theme.custom for radius and card
// tokens, which a bare createTheme() does not define.
const theme = createTheme(getThemePersonality('technical-precision'));

const renderWithTheme = (component) => render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);

describe('IconCarousel', () => {
  it('is a labelled section with every tool named once for assistive tech', () => {
    renderWithTheme(<IconCarousel />);

    expect(screen.getByRole('region', { name: /tech stack/i })).toBeInTheDocument();

    // The strip renders the row twice so the loop is seamless. Exactly one copy
    // may be exposed to a screen reader, or every tool is announced twice.
    const copies = screen.getAllByText('PostgreSQL');
    expect(copies).toHaveLength(2);
    const exposed = copies.filter((el) => !el.closest('[aria-hidden="true"]'));
    expect(exposed).toHaveLength(1);
  });

  it('has a pause control that reports its state', () => {
    renderWithTheme(<IconCarousel />);

    const button = screen.getByRole('button', { name: /pause the tech stack strip/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /resume the tech stack strip/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
