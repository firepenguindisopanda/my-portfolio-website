import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PandaRig, { POSES } from './PandaRig';
import { clerkPose } from './clerkPose';
import { HOLD_MS } from './PandaScenes';
import { emitPanda, onPanda } from './pandaBus';
import TryIt from '../home/tryit/TryIt';

vi.mock('@posthog/react', () => ({ usePostHog: () => ({ capture: vi.fn() }) }));

describe('the panda bus', () => {
  it('delivers to listeners of that event until they unsubscribe', () => {
    const seen = [];
    const off = onPanda('demo', (d) => seen.push(d.demo));
    emitPanda('demo', { demo: 'chimp' });
    emitPanda('stamp', { tone: 'ok' });
    off();
    emitPanda('demo', { demo: 'timetable' });
    expect(seen).toEqual(['chimp']);
  });

  it('is a no-op with nobody listening', () => {
    expect(() => emitPanda('case', { i: 0, p: 0.5 })).not.toThrow();
  });
});

describe('the rig', () => {
  const rigWith = (pose) => {
    const ref = createRef();
    const { container } = render(<PandaRig ref={ref} />);
    act(() => ref.current.apply(pose));
    return container;
  };
  const pupils = (container) => [...container.querySelectorAll('circle[r="1.7"]')];

  it('is decorative', () => {
    const container = rigWith(POSES.sit);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens and shuts its eyes with the pose', () => {
    const open = rigWith(POSES.sit);
    expect(pupils(open).map((p) => p.getAttribute('opacity'))).toEqual(['1', '1']);
    const shut = rigWith(POSES.coverEyes);
    expect(pupils(shut).map((p) => p.getAttribute('opacity'))).toEqual(['0', '0']);
  });

  it('gives every pose the same parts, so a tween between two never leaves one behind', () => {
    const parts = Object.keys(POSES.sit).sort();
    Object.entries(POSES).forEach(([name, pose]) => expect({ name, parts: Object.keys(pose).sort() }).toEqual({ name, parts }));
  });
});

describe('the Four cases clerk', () => {
  it('watches, raises the stamp, presses it at the result, then settles', () => {
    expect(clerkPose(0.3)).toMatchObject({ ra: POSES.sit.ra, look: 1 });
    expect(clerkPose(0.76).ra).toBeCloseTo(POSES.stampUp.ra);
    expect(clerkPose(0.86).ra).toBeCloseTo(POSES.stampDown.ra);
    expect(clerkPose(1).ra).toBeCloseTo(POSES.sit.ra);
  });
});

describe('the Try it panda (motion off, as under test)', () => {
  const renderTryIt = async () => {
    const view = render(
      <MemoryRouter>
        <TryIt />
      </MemoryRouter>
    );
    // The scenes arrive in their own chunk.
    await waitFor(() => expect(view.container.querySelector('.pd-tryit .pd-tryit-rig')).not.toBeNull());
    return view;
  };
  const chimp = () => screen.getByRole('article', { name: 'Chimp Test' });
  const square = (n) => [...chimp().querySelectorAll('.chimp-sq')].find((b) => b.textContent === String(n));
  const rightArm = (container) => container.querySelector('.pd-tryit-rig > g > g > g:last-child').getAttribute('transform');

  afterEach(() => vi.useRealTimers());

  it('sits in the section, out of the accessibility tree', async () => {
    const { container } = await renderTryIt();
    const panda = container.querySelector('.pd-tryit');
    expect(container.querySelector('#try-it .wrap')).toContainElement(panda);
    expect(panda).toHaveAttribute('aria-hidden', 'true');
    expect(panda).not.toHaveClass('is-awake');
  });

  it('wakes when a demo is first used', async () => {
    const { container } = await renderTryIt();
    fireEvent.click(square(1));
    expect(container.querySelector('.pd-tryit')).toHaveClass('is-awake');
  });

  it('shows a miss with a still cover-eyes pose, then sits back up', async () => {
    const { container } = await renderTryIt();
    vi.useFakeTimers();
    fireEvent.click(square(1));
    fireEvent.click(square(3));
    expect(rightArm(container)).toContain(`rotate(${POSES.coverEyes.ra})`);
    act(() => vi.advanceTimersByTime(HOLD_MS));
    expect(rightArm(container)).toContain(`rotate(${POSES.sit.ra})`);
  });

  it('is told which sheet a stamp landed on', async () => {
    await renderTryIt();
    const stamps = [];
    const off = onPanda('stamp', (d) => stamps.push(d));
    fireEvent.click(square(1));
    fireEvent.click(square(3));
    off();
    expect(stamps).toHaveLength(1);
    expect(stamps[0].tone).toBe('flag');
    expect(stamps[0].at.closest('.exhibit')).toBe(chimp());
    expect(within(chimp()).getByText(/missed at 2/i)).toBe(stamps[0].at);
  });
});
