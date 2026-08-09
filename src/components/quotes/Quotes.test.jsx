import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Quotes from './Quotes';

describe('Quotes component', () => {
  let consoleErrorSpy;
  let fetchSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (fetchSpy) fetchSpy.mockRestore && fetchSpy.mockRestore();
    global.fetch = undefined;
  });

  it('renders and does not produce duplicate-key warnings when parsing markdown with ASCII hyphens', async () => {
    const markdownWithAsciiHyphenAuthors = `This is an example quote with a list:\n- item one\n- item two\n-- Author 1\n\n---\nAnother quote with the same hyphens:\n- item three\n- item four\n-- Author 2`;

    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({ text: () => Promise.resolve(markdownWithAsciiHyphenAuthors) })
    );

    render(<Quotes />);

    await screen.findByText(/Inspiring Quotes/i);

    const hadDuplicateKeyWarning = consoleErrorSpy.mock.calls.some(call => typeof call[0] === 'string' && call[0].includes('Encountered two children with the same key'));
    expect(hadDuplicateKeyWarning).toBe(false);
  });

  it('parses ASCII hyphen author lines correctly ("-- Author")', async () => {
    const markdown = `Example quote\n-- Test Author`;
    fetchSpy.mockRestore && fetchSpy.mockRestore();
    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({ text: () => Promise.resolve(markdown) })
    );
    render(<Quotes />);
    await waitFor(() => expect(screen.getAllByText(/Test Author/i).length).toBeGreaterThan(0));
  });

  it('renders bullet lists properly and does not treat leading - as author lines', async () => {
    const markdown = `- First bullet\n- Second bullet\n-- Bullet Author`;
    fetchSpy.mockRestore && fetchSpy.mockRestore();
    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({ text: () => Promise.resolve(markdown) })
    );
    render(<Quotes />);
    await waitFor(() => expect(screen.getAllByText(/First bullet|Second bullet/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/Bullet Author/i).length).toBeGreaterThan(0);
  });

  it('parses Step-based content into ordered steps', async () => {
    const markdown = `Intro paragraph\nStep 1: Do A\nStep 2: Do B\n-- Step Author`;
    fetchSpy.mockRestore && fetchSpy.mockRestore();
    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({ text: () => Promise.resolve(markdown) })
    );
    render(<Quotes />);
    await screen.findByText(/Do A/i);
    expect(screen.getAllByText(/Step Author/i).length).toBeGreaterThan(0);
  });
});
