import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IconCarousel from '../components/iconcarousel/IconCarousel';
import { getThemePersonality } from '../utilities/themeConfig';

vi.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));
vi.mock('swiper', () => ({
  __esModule: true,
  default: {
    use: vi.fn(),
  },
  Autoplay: {},
  Navigation: {},
  FreeMode: {},
  A11y: {},
}));
vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/navigation', () => ({}));
vi.mock('swiper/css/autoplay', () => ({}));
vi.mock('swiper/css/free-mode', () => ({}));

// Use a real personality: components read theme.custom for radius and card
// tokens, which a bare createTheme() does not define.
const theme = createTheme(getThemePersonality('technical-precision'));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('IconCarousel Component', () => {
  it('renders without crashing', () => {
    renderWithTheme(<IconCarousel />);
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
  });

  it('renders swiper slides', () => {
    renderWithTheme(<IconCarousel />);
    const slides = screen.getAllByTestId('swiper-slide');
    expect(slides.length).toBeGreaterThan(0);
  });
});
