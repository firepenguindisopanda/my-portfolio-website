import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PandaRig, { POSES } from './PandaRig';
import { clerkPose } from './clerkPose';
import { emitPanda, onPanda } from './pandaBus';
import TryIt from '../home/tryit/TryIt';

vi.mock('@posthog/react', () => ({ usePostHog: () => ({ capture: vi.fn() }) }));

describe('the panda bus', () => {
  it('delivers to listeners of that event until they unsubscribe', () => {
    const seen = [];
    const off = onPanda('case', (d) => seen.push(d.i));
    emitPanda('case', { i: 0, p: 0.2 });
    emitPanda('other', { i: 9 });
    off();
    emitPanda('case', { i: 1, p: 0.4 });
    expect(seen).toEqual([0]);
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

describe('the Try it panda', () => {
  const renderTryIt = async () => {
    const view = render(
      <MemoryRouter>
        <TryIt />
      </MemoryRouter>
    );
    // The scenes arrive in their own chunk.
    await waitFor(() => expect(view.container.querySelector('.pd-tryit-nap')).not.toBeNull());
    return view;
  };
  const chimp = () => screen.getByRole('article', { name: 'Chimp Test' });
  const square = (n) => [...chimp().querySelectorAll('.chimp-sq')].find((b) => b.textContent === String(n));

  it('sleeps on the demo grid, out of the accessibility tree', async () => {
    const { container } = await renderTryIt();
    const panda = container.querySelector('.pd-tryit-nap');
    expect(container.querySelector('#try-it .ex-grid')).toContainElement(panda);
    expect(panda).toHaveAttribute('aria-hidden', 'true');
    expect(panda.querySelector('img')).not.toBeNull();
    expect(panda.querySelectorAll('.pd-zz path')).toHaveLength(3);
  });

  it('is the still sleeping art, with no moving rig', async () => {
    const { container } = await renderTryIt();
    expect(container.querySelector('#try-it .pd-rig')).toBeNull();
  });

  it('stays asleep and unchanged when the demos are used', async () => {
    const { container } = await renderTryIt();
    const before = container.querySelector('.pd-tryit-nap').outerHTML;
    fireEvent.click(square(1));
    fireEvent.click(square(3));
    expect(container.querySelector('.pd-tryit-nap').outerHTML).toBe(before);
  });
});
