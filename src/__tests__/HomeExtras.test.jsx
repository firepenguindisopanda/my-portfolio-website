import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import CountUp from '../components/CountUp';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { roleGroups } from '../data/experience';
import { evidencedSkills, projectsUsing } from '../data/skillEvidence';
import { skillGroups } from '../data/skills';

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
const featured = projects.filter((p) => p.featured);
const techOf = (p) => [...(p.technologies || []), ...(p.primaryTech || [])];

beforeEach(() => {
  capture.mockClear();
  emailjs.sendForm.mockReset();
});

describe('skills point to evidence', () => {
  it('counts only skills the site lists, and only projects in the index', () => {
    const listed = new Set([...skillGroups.flatMap((g) => g.skills), ...profile.skills]);
    evidencedSkills.forEach((skill) => expect({ skill, listed: listed.has(skill) }).toEqual({ skill, listed: true }));
    evidencedSkills.forEach((skill) => projectsUsing(skill).forEach((p) => expect(p.featured).toBe(true)));
  });

  it('counts a project only when its own tech list names the skill', () => {
    // React counts "React 19", never a look-alike.
    expect(projectsUsing('React').length).toBeGreaterThan(0);
    projectsUsing('React').forEach((p) => expect(techOf(p).some((t) => /^React( \d+)?$/.test(t))).toBe(true));
    // AngularJS is not Angular.
    projectsUsing('Angular').forEach((p) => expect(techOf(p).some((t) => /^Angular \d+$/.test(t))).toBe(true));
    // A skill no project shows gets no count rather than a guess.
    expect(projectsUsing('Flutter')).toEqual([]);
    expect(projectsUsing('HTML & CSS')).toEqual([]);
  });

  it('footnotes a skill with its count, and leaves a skill without evidence as plain text', () => {
    const { container } = renderHome();
    const grid = container.querySelector('#skills .skills-grid');
    const n = projectsUsing('PostgreSQL').length;
    expect(within(grid).getByRole('button', { name: `PostgreSQL: show the ${n} projects that use it` })).toBeInTheDocument();
    expect(within(grid).queryByRole('button', { name: /^Flutter/ })).toBeNull();
    expect(within(grid).getByText('Flutter')).toBeInTheDocument();
  });

  it('sends a picked skill to the index, marks its projects, and can go back to all', () => {
    const { container } = renderHome();
    const n = projectsUsing('React').length;
    fireEvent.click(within(container.querySelector('#skills .skills-grid')).getByRole('button', { name: /^React: show the/ }));

    const index = container.querySelector('#index');
    expect(within(index).getByText(`Showing ${n} projects that use React.`)).toBeInTheDocument();
    expect(index.querySelectorAll('.ix-row')).toHaveLength(n);
    expect(index.querySelectorAll('.ix-row.cited')).toHaveLength(n);
    expect(capture).toHaveBeenCalledWith('skill_evidence_clicked', { skill: 'React', projects: n });
    // No category is pressed while a skill is showing.
    expect(within(index).queryAllByRole('button', { pressed: true })).toHaveLength(0);

    fireEvent.click(within(index).getByRole('button', { name: 'Show all projects' }));
    expect(index.querySelectorAll('.ix-row')).toHaveLength(featured.length);
    expect(index.querySelector('.ix-row.cited')).toBeNull();
  });
});

describe('the back of the file card', () => {
  it('turns over to a case summary counted from the site\'s own records', () => {
    const { container } = renderHome();
    const front = container.querySelector('.fc-front');
    const back = container.querySelector('.fc-back');
    expect(back).toHaveAttribute('aria-hidden', 'true');

    const hero = within(container.querySelector('#hero'));
    fireEvent.click(hero.getByRole('button', { name: 'Turn the card over' }));
    expect(hero.getByRole('button', { name: 'Back to the photo' })).toHaveAttribute('aria-pressed', 'true');
    expect(front).toHaveAttribute('aria-hidden', 'true');
    expect(back).not.toHaveAttribute('aria-hidden');
    const figure = (label) => within(back).getByText(label).closest('div').querySelector('.sr-only').textContent;
    expect(figure('Years building software')).toBe(String(new Date().getFullYear() - profile.since));
    expect(figure('Projects in the index')).toBe(String(featured.length));
    expect(figure('Written case studies')).toBe(String(projects.filter((p) => p.markdown).length));
    expect(figure('Roles')).toBe(String(roleGroups.length));
    expect(capture).toHaveBeenCalledWith('hero_card_turned', { to: 'back' });
  });
});

describe('contact, filed', () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'We have a contract role.' } });
  };

  // Queries stay inside the contact section: role queries over the whole
  // home page are slow enough to time out when the suite runs in parallel.
  const contact = () => within(document.getElementById('contact'));

  it('files a sent message in an envelope, and lets another be written', { timeout: 15000 }, async () => {
    emailjs.sendForm.mockResolvedValue({ status: 200 });
    renderHome();
    fill();
    fireEvent.click(contact().getByRole('button', { name: 'Send message' }));

    // The send resolves, then the fields fold, then the envelope is drawn: allow for a busy test run.
    const again = await contact().findByRole('button', { name: 'Write another message' }, { timeout: 4000 });
    expect(contact().getByLabelText('Message filed')).toHaveFocus();
    expect(contact().getByLabelText('Your name')).not.toBeVisible();

    fireEvent.click(again);
    expect(contact().getByLabelText('Your name')).toBeVisible();
    expect(contact().queryByRole('button', { name: 'Write another message' })).toBeNull();
  });

  it('keeps the form open when sending fails', async () => {
    emailjs.sendForm.mockRejectedValue({ text: 'The service is unavailable' });
    renderHome();
    fill();
    fireEvent.click(contact().getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalled());
    await waitFor(() => expect(contact().getByRole('button', { name: 'Send message' })).toBeEnabled(), { timeout: 4000 });
    expect(contact().queryByRole('button', { name: 'Write another message' })).toBeNull();
    expect(screen.getByLabelText('Message')).toBeVisible();
  });

  it('stamps COPIED on the copy button after a copy', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderHome();
    fireEvent.click(contact().getByRole('button', { name: 'Copy email' }));
    expect(await contact().findByText('Copied', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(profile.email);
    delete navigator.clipboard;
  });
});

describe('the 404', () => {
  it('says what happened, and shows the panda digging through the drawer', async () => {
    const { container } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("This page doesn't exist");
    await waitFor(() => expect(container.querySelector('.nf-scene')).not.toBeNull());
    expect(container.querySelector('.nf-scene')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('CountUp', () => {
  it('shows the figure in full at rest, and gives screen readers only the final figure', () => {
    const { container } = render(<CountUp value="12.5x" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('12.5x');
    expect(container.querySelector('.sr-only')).toHaveTextContent('12.5x');
  });
});
