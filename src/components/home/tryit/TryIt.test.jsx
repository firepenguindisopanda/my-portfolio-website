import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TryIt from './TryIt';
import { FIRST } from './ChimpDemo';
import { EXAMPLE_LINKS } from './TriageDemo';
import { findClashes } from './TimetableDemo';

const capture = vi.fn();
vi.mock('@posthog/react', () => ({ usePostHog: () => ({ capture }) }));

const renderTryIt = () =>
  render(
    <MemoryRouter>
      <TryIt />
    </MemoryRouter>
  );

const exhibit = (name) => screen.getByRole('article', { name });
const demoEvents = () => capture.mock.calls.filter(([event]) => event === 'tryit_demo_used').map(([, props]) => props.demo);

beforeEach(() => capture.mockClear());

describe('Try it', () => {
  it('is the try-it section, with the three exhibits and their case studies', () => {
    const { container } = renderTryIt();
    expect(container.querySelector('section#try-it')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Try it' })).toBeInTheDocument();

    [
      ['Chimp Test', '/projects/chimp-test-game'],
      ['Timetable builder', '/projects/timetable-builder'],
      ['Link Tracker triage', '/projects/link-tracker'],
    ].forEach(([name, href]) => {
      const link = within(exhibit(name)).getByRole('link', { name: /case study/i });
      expect(link).toHaveAttribute('href', href);
    });
  });
});

describe('Chimp Test', () => {
  const square = (n) => within(exhibit('Chimp Test')).getByRole('button', { name: `Square ${n}` });
  const status = () => exhibit('Chimp Test').querySelector('.ex-status');

  it('hides the numbers after 1 and passes the level when clicked in order', () => {
    renderTryIt();
    expect(status()).toHaveTextContent(`Level 1: ${FIRST} squares`);

    fireEvent.click(square(1));
    expect(within(exhibit('Chimp Test')).getAllByRole('button', { name: 'Hidden square' })).toHaveLength(FIRST - 1);

    // The labels are hidden now, so walk the board by the numbers it drew.
    const board = exhibit('Chimp Test').querySelector('.chimp-board');
    for (let n = 2; n <= FIRST; n += 1) {
      const btn = [...board.querySelectorAll('.chimp-sq')].find((b) => b.textContent === String(n));
      fireEvent.click(btn);
    }
    expect(status()).toHaveTextContent(`All ${FIRST} in order.`);
    expect(screen.getByRole('button', { name: 'Next level' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next level' }));
    expect(status()).toHaveTextContent(`Level 2: ${FIRST + 1} squares`);
    expect(demoEvents()).toEqual(['chimp']);
  });

  it('ends the round on a wrong square and says which came next', () => {
    renderTryIt();
    fireEvent.click(square(1));
    const board = exhibit('Chimp Test').querySelector('.chimp-board');
    const three = [...board.querySelectorAll('.chimp-sq')].find((b) => b.textContent === '3');
    fireEvent.click(three);

    expect(status()).toHaveTextContent('That was 3; 2 came next.');
    expect(three).toHaveClass('miss');
    // Further clicks do nothing once the round is over.
    fireEvent.click(square(2));
    expect(status()).toHaveTextContent('That was 3; 2 came next.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});

describe('Link Tracker triage', () => {
  const lt = () => exhibit('Link Tracker triage');
  const inbox = () => within(lt()).getByRole('listbox');
  const status = () => lt().querySelector('.ex-status');

  it('decides the selected link with the Q, R and D keys', () => {
    renderTryIt();
    const list = inbox();
    expect(within(list).getAllByRole('option')).toHaveLength(EXAMPLE_LINKS.length);

    fireEvent.keyDown(list, { key: 'q' });
    expect(status()).toHaveTextContent(`"${EXAMPLE_LINKS[0].t}" sent to Queue.`);
    expect(within(lt().querySelector('.lt-qlist')).getByText(EXAMPLE_LINKS[0].t)).toBeInTheDocument();

    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(within(list).getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(list, { key: 'r' });
    expect(status()).toHaveTextContent(`"${EXAMPLE_LINKS[2].t}" sent to Reference.`);

    fireEvent.keyDown(list, { key: 'X' });
    expect(status()).toHaveTextContent(`"${EXAMPLE_LINKS[0].t}" done. 0 left in the queue.`);
    expect(demoEvents()).toEqual(['link-tracker']);
  });

  it('works with the buttons alone, down to inbox zero', () => {
    renderTryIt();
    const drop = within(lt()).getByRole('button', { name: /drop/i });
    EXAMPLE_LINKS.forEach(() => fireEvent.click(drop));
    expect(within(inbox()).getByRole('option')).toHaveTextContent('Inbox empty');
    expect(lt().querySelector('.ex-stamp')).toHaveTextContent('Inbox zero');

    fireEvent.click(within(lt()).getByRole('button', { name: 'Reset' }));
    expect(within(inbox()).getAllByRole('option')).toHaveLength(EXAMPLE_LINKS.length);
  });

  it('marks a queued link done with its own button', () => {
    renderTryIt();
    fireEvent.click(within(lt()).getByRole('button', { name: /queue/i }));
    fireEvent.click(within(lt()).getByRole('button', { name: `Mark done: ${EXAMPLE_LINKS[0].t}` }));
    expect(within(lt().querySelector('.lt-qlist')).getByText('Nothing queued.')).toBeInTheDocument();
  });
});

describe('Timetable builder', () => {
  const tt = () => exhibit('Timetable builder');
  const status = () => tt().querySelector('.ex-status');
  const block = (name) => within(tt()).getByRole('button', { name: new RegExp(`^${name},`) });

  it('moves a block with the arrow keys and flags the clash it makes', () => {
    renderTryIt();
    expect(status()).toHaveTextContent('No clashes.');

    // Tutorial, Wednesday 10am: two days left lands it on Monday, inside the lecture.
    fireEvent.keyDown(block('Tutorial'), { key: 'ArrowLeft' });
    expect(status()).toHaveTextContent('Tutorial now Tue 10am-11am. No clashes.');
    fireEvent.keyDown(block('Tutorial'), { key: 'ArrowLeft' });

    expect(status()).toHaveTextContent('Clash: Lecture and Tutorial overlap on Monday.');
    expect(block('Tutorial')).toHaveClass('clash');
    expect(block('Lecture')).toHaveAccessibleName(/clashes/);
    expect(demoEvents()).toEqual(['timetable']);

    fireEvent.click(within(tt()).getByRole('button', { name: 'Reset' }));
    expect(status()).toHaveTextContent('No clashes.');
  });

  it('keeps blocks inside the week', () => {
    renderTryIt();
    const lecture = block('Lecture');
    ['ArrowLeft', 'ArrowUp', 'ArrowUp', 'ArrowUp'].forEach((key) => fireEvent.keyDown(lecture, { key }));
    expect(block('Lecture')).toHaveAccessibleName(/^Lecture, Monday 8am-10am/);
  });

  it('finds overlaps only on the same day', () => {
    const a = { id: 'a', day: 0, start: 9, len: 2 };
    expect(findClashes([a, { id: 'b', day: 0, start: 10, len: 1 }])).toHaveLength(1);
    expect(findClashes([a, { id: 'b', day: 0, start: 11, len: 1 }])).toHaveLength(0);
    expect(findClashes([a, { id: 'b', day: 1, start: 9, len: 2 }])).toHaveLength(0);
  });
});
