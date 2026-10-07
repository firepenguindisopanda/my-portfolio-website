import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProjectDetail from '../pages/ProjectDetail';
import { casefileTheme } from '../utilities/themeConfig';

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

vi.mock('../components/SpacesEmbed/LazySpaceEmbed', () => ({ default: () => <div data-testid="space-embed">Space Embed</div> }));

// The app's own theme, not a bare createTheme(): the figures and analysis
// blocks a case study can render read theme.custom tokens only it defines.
const theme = createTheme(casefileTheme);

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
    expect(screen.getByRole('heading', { level: 1, name: 'No case file by that name' })).toBeInTheDocument();
  });

  it('sends a reader who followed a dead link to the project index', () => {
    renderWithRouter('invalid-project');
    expect(screen.getByRole('link', { name: /see every project/i })).toHaveAttribute('href', '/#index');
  });

  it('renders project content for valid project', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Test'),
    });

    renderWithRouter('test-project');
    expect(screen.getByRole('heading', { level: 1, name: 'Test Project' })).toBeInTheDocument();
    // The spec table states what a reader can do with it right now, and the
    // file summary beside the write-up repeats it, links and all, in reach.
    const summary = screen.getByRole('complementary', { name: 'File summary and contents' });
    expect(screen.getAllByText('Deployed and reachable')).toHaveLength(2);
    expect(within(summary).getByText('Deployed and reachable')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open the live site/i })).toHaveAttribute('href', 'https://test-project.com');
    expect(within(summary).getByRole('link', { name: /live site/i })).toHaveAttribute('href', 'https://test-project.com');
    expect(screen.getAllByRole('link', { name: /^source/i }).map((a) => a.getAttribute('href'))).toEqual([
      'https://github.com/test/project',
      'https://github.com/test/project',
    ]);
    // A one-heading write-up has no contents rail, but still has its summary.
    expect(within(summary).queryByRole('navigation', { name: 'On this page' })).toBeNull();
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
      expect(screen.getByText(/no detailed write-up/i)).toBeInTheDocument();
    });
  });
});
