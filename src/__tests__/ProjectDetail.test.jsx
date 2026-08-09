import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProjectDetail from '../pages/ProjectDetail';
import { getThemePersonality } from '../utilities/themeConfig';

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => ({}) }));
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => <pre data-testid="code-block">{children}</pre>,
  // PrismLight registers grammars explicitly instead of bundling all ~300.
  PrismLight: Object.assign(
    ({ children }) => <pre data-testid="code-block">{children}</pre>,
    { registerLanguage: () => {} }
  ),
}));
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));

vi.mock('../data/projects', () => ({
  projects: [
    {
      id: 'test-project',
      title: 'Test Project',
      shortDescription: 'A test project description',
      category: 'Full Stack',
      technologies: ['React', 'Node.js'],
      githubUrl: 'https://github.com/test/project',
      liveUrl: 'https://test-project.com',
      markdown: '/markdowns/test-project.md',
    },
    {
      id: 'project-no-markdown',
      title: 'Project Without Markdown',
      shortDescription: 'Another test project',
      category: 'AI/ML',
      technologies: ['Python'],
    },
  ],
}));

vi.mock('../components/Layout/Layout', () => ({ children }) => <div data-testid="layout">{children}</div>);
vi.mock('../components/SpacesEmbed/LazySpaceEmbed', () => ({ default: () => <div data-testid="space-embed">Space Embed</div> }));

// The real personality, not a stub palette: the page reads theme.custom tokens
// (codeFont, displayFont) that only the app's own themes define, so a bare
// createTheme() here would pass tests the running app could not.
const theme = createTheme(getThemePersonality('technical-precision'));

global.fetch = vi.fn();

const renderWithRouter = (projectId) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('ProjectDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockReset();
  });

  it('renders project not found for invalid projectId', () => {
    renderWithRouter('invalid-project-id');
    expect(screen.getByText('Project not found')).toBeInTheDocument();
  });

  it('renders back to home button for not found projects', () => {
    renderWithRouter('invalid-project');
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
  });

  it('renders project content for valid project', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Test'),
    });

    renderWithRouter('test-project');
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('shows error message when markdown fails to load', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    renderWithRouter('test-project');

    await waitFor(() => {
      expect(screen.getByText(/failed to load project details/i)).toBeInTheDocument();
    });
  });

  it('shows message for project without markdown', async () => {
    renderWithRouter('project-no-markdown');

    await waitFor(() => {
      expect(screen.getByText(/no detailed writeup available/i)).toBeInTheDocument();
    });
  });
});
