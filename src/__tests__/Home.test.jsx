import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from '../pages/Home';
import { getThemePersonality } from '../utilities/themeConfig';

vi.mock('../components/Hero/Hero', () => ({ default: () => <div data-testid="hero">Hero</div> }));
vi.mock('../components/AboutMe/AboutMe', () => ({ default: () => <div data-testid="about-me">About Me</div> }));
vi.mock('../components/TechnicalExperiences/TechnicalExperiences', () => ({ default: () => <div data-testid="technical">Skills</div> }));
vi.mock('../components/Projects/Projects', () => ({ default: () => <div data-testid="projects">Projects</div> }));
vi.mock('../components/WorkExperience/WorkExperience', () => ({ default: () => <div data-testid="work">Experience</div> }));
vi.mock('../components/AcademicAchievements/AcademicAchievements', () => ({ default: () => <div data-testid="academic">Certificates</div> }));
vi.mock('../components/contact/Contact', () => ({ default: () => <div data-testid="contact">Contact</div> }));
vi.mock('../components/TechnicalSkills/ExtraCurricular', () => ({ default: () => <div data-testid="extra">Extra Curricular</div> }));
vi.mock('../components/iconcarousel/IconCarousel', () => ({ default: () => <div data-testid="carousel">Icon Carousel</div> }));
vi.mock('../components/OnlineLearningBadges/OnlineLearningBadges', () => ({ default: () => <div data-testid="badges">Badges</div> }));
vi.mock('../components/BackToTop/BackToTop', () => ({ default: ({ children }) => <div data-testid="scroll-top">{children}</div> }));
vi.mock('../assets/NicholasSmith_Resume.pdf', () => ({ default: 'mocked-resume.pdf' }));

const theme = createTheme(getThemePersonality('technical-precision'));

const renderHome = (initialEntries = ['/']) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <Home />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('Home page', () => {
  it('renders every section', () => {
    renderHome();

    ['hero', 'projects', 'work', 'about-me', 'technical', 'carousel', 'academic', 'badges', 'extra', 'contact']
      .forEach((testId) => expect(screen.getByTestId(testId)).toBeInTheDocument());
  });

  it('renders the scroll-to-top control', () => {
    renderHome();
    expect(screen.getByTestId('scroll-top')).toBeInTheDocument();
  });

  it('puts projects and experience ahead of credentials in the DOM', () => {
    const { container } = renderHome();
    const order = [...container.querySelectorAll('[data-testid]')].map((el) => el.dataset.testid);

    // The whole point of the reorder: an employer meets the work first.
    expect(order.indexOf('projects')).toBeLessThan(order.indexOf('academic'));
    expect(order.indexOf('work')).toBeLessThan(order.indexOf('academic'));
    expect(order.indexOf('hero')).toBeLessThan(order.indexOf('projects'));
  });

  it('gives the app bar real anchor targets for every nav section', () => {
    const { container } = renderHome();

    ['projects', 'experience', 'skills', 'credentials', 'contact'].forEach((id) => {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    });
  });
});
