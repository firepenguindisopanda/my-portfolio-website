import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { profile } from './data/profile';

vi.setConfig({ testTimeout: 20000 });

test('renders loading state initially', async () => {
  render(<App />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('lands on the full home page rather than a standalone card', async () => {
  render(<App />);

  await waitFor(
    () => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    },
    { timeout: 10000 }
  );

  // The name is the page's h1 - `/` used to be a business card with no nav and
  // no way to scroll into the work.
  const heading = await screen.findByRole('heading', { level: 1, name: profile.name }, { timeout: 10000 });
  expect(heading).toBeInTheDocument();

  expect(await screen.findByRole('button', { name: /see my work/i })).toBeInTheDocument();

  // Sections the app bar links to must exist on this same page.
  await waitFor(() => {
    ['projects', 'experience', 'skills', 'contact'].forEach((id) => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });
});
