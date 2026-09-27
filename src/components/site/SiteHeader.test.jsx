import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import { navSections } from '../../data/profile';

vi.mock('../../assets/NicholasSmith_Resume.pdf', () => ({ default: 'mocked-resume.pdf' }));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
      <Routes>
        <Route path="*" element={<p>page</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('site header', () => {
  it('links every nav section, as anchors on home and as /#id elsewhere', () => {
    const { unmount } = renderAt('/');
    navSections.forEach(({ label, id }) => {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', `#${id}`);
    });
    unmount();
    renderAt('/background');
    navSections.forEach(({ label, id }) => {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', `/#${id}`);
    });
  });

  it('closes the Deep dives menu when a page is chosen from it', () => {
    renderAt('/');
    const button = screen.getByRole('button', { name: 'Deep dives' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('link', { name: 'Background' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Background' })).not.toBeInTheDocument();
  });

  it('closes the Deep dives menu on Escape and returns focus to its button', () => {
    renderAt('/');
    const button = screen.getByRole('button', { name: 'Deep dives' });
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });
});
