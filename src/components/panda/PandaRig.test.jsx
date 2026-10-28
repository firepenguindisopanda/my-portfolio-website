import React, { createRef } from 'react';
import { act, render } from '@testing-library/react';
import PandaRig, { POSES } from './PandaRig';

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

