import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Home from '../pages/Home';
import { profile, sections } from '../data/profile';
import { projects } from '../data/projects';

const capture = vi.fn();
vi.mock('@posthog/react', () => ({
  usePostHog: () => ({ capture, setPersonProperties: vi.fn(), captureException: vi.fn() }),
}));
vi.mock('@emailjs/browser', () => ({ default: { sendForm: vi.fn() } }));
vi.mock('../assets/NicholasSmith_Resume.pdf', () => ({ default: 'mocked-resume.pdf' }));

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Home />
    </MemoryRouter>
  );

beforeEach(() => {
  capture.mockClear();
  emailjs.sendForm.mockReset();
});

describe('Home page', () => {
  it('anchors every section the header and the 404 page link to, in order', () => {
    const { container } = renderHome();
    const found = [...container.querySelectorAll('section[id]')].map((el) => el.id);
    const expected = sections.map((s) => s.id);
    expected.forEach((id) => expect(found).toContain(id));
    // Document order follows `sections`, which is the order the header lists.
    expect(found.filter((id) => expected.includes(id))).toEqual(expected);
  });

  it('has one h1, the name', () => {
    renderHome();
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(profile.name.split(' ')[0]);
  });

  it('tells the work as four cases, each with its case study', () => {
    const { container } = renderHome();
    const chapters = container.querySelectorAll('#story .chapter');
    expect(chapters).toHaveLength(4);
    chapters.forEach((ch) => {
      expect(within(ch).getAllByRole('link', { name: /case study/i })[0].getAttribute('href')).toMatch(/^\/projects\//);
    });
  });

  it('indexes every featured project', () => {
    const { container } = renderHome();
    const featured = projects.filter((p) => p.featured);
    expect(container.querySelectorAll('#index .ix-row')).toHaveLength(featured.length);
  });

  it('keeps the full credential index and the mentoring off the home page', () => {
    // Both live on /background; the home page links there from Recognition.
    const { container } = renderHome();
    expect(container.querySelector('#community')).toBeNull();
    expect(container.querySelector('#credentials')).toBeNull();
    expect(within(container.querySelector('#recognition')).getByRole('link', { name: /every certificate/i })).toHaveAttribute(
      'href',
      '/background'
    );
  });
});

describe('contact form', () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'We have a contract role.' } });
  };
  const form = () => screen.getByRole('form', { name: 'Send a message' });

  it('sends through EmailJS with the fields the template reads', async () => {
    emailjs.sendForm.mockResolvedValue({ status: 200 });
    renderHome();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(within(form()).getByRole('status')).toHaveTextContent('Message sent.'));
    const [service, template, sentForm, key] = emailjs.sendForm.mock.calls[0];
    expect([service, template, key]).toEqual(['service_wf5ex2f', 'template_0ouoimq', 'Mbp02i3iokIucc48d']);
    expect(['name', 'email', 'message'].map((n) => sentForm.elements.namedItem(n)?.name)).toEqual(['name', 'email', 'message']);
    expect(capture).toHaveBeenCalledWith('contact_form_submitted');
    // Sent, so the fields clear.
    expect(screen.getByLabelText('Your name')).toHaveValue('');
  });

  it('says how else to reach me when sending fails, and keeps the message', async () => {
    emailjs.sendForm.mockRejectedValue({ text: 'The service is unavailable' });
    renderHome();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(within(form()).getByRole('status')).toHaveTextContent(profile.email));
    expect(capture).toHaveBeenCalledWith('contact_form_failed', { error: 'The service is unavailable' });
    expect(screen.getByLabelText('Message')).toHaveValue('We have a contract role.');
  });

  it('does not send an incomplete form', () => {
    renderHome();
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(emailjs.sendForm).not.toHaveBeenCalled();
  });
});
