import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { profile } from './data/profile';

/**
 * This test renders the whole App, so Suspense has to resolve nine lazily
 * imported routes before anything can be asserted - and Vite's transform cost
 * for those lands inside the wait window. Measured import time for the suite
 * swings between roughly 29s and 48s depending on how many files are competing
 * for workers, so a 10s window was tight enough that adding any new test file
 * to the project could fail this one. The budget matches the observed spread;
 * every assertion below is unchanged.
 */
vi.setConfig({ testTimeout: 40000 });

const SUSPENSE_BUDGET = 25000;

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
    { timeout: SUSPENSE_BUDGET }
  );

  // The name is the page's h1 - `/` used to be a business card with no nav and
  // no way to scroll into the work.
  const heading = await screen.findByRole('heading', { level: 1, name: profile.name }, { timeout: SUSPENSE_BUDGET });
  expect(heading).toBeInTheDocument();

  expect(await screen.findByRole('button', { name: /see my work/i })).toBeInTheDocument();

  // Sections the app bar links to must exist on this same page.
  await waitFor(() => {
    ['projects', 'experience', 'skills', 'contact'].forEach((id) => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });
});
