import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MotionProvider, registerMotionAnchor, useMotion } from './Motion';

const Switch = () => {
  const { motionOn, setMotion } = useMotion();
  return (
    <button type="button" onClick={() => setMotion(!motionOn)}>
      {motionOn ? 'on' : 'off'}
    </button>
  );
};

const flushFrames = async () => {
  // setMotion restores the reader's place two animation frames after the flip.
  await act(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
};

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('motion-on', 'motion-off');
});

describe('Motion switch', () => {
  it('flips the html class and remembers the choice', () => {
    render(
      <MotionProvider>
        <Switch />
      </MotionProvider>
    );
    // jsdom reports no reduced-motion preference, so motion starts on.
    expect(document.documentElement).toHaveClass('motion-on');
    fireEvent.click(screen.getByRole('button', { name: 'on' }));
    expect(document.documentElement).toHaveClass('motion-off');
    expect(window.localStorage.getItem('casefile-motion')).toBe('off');
  });

  it('lets a registered place claim the reader and puts them back after the flip', async () => {
    const restore = vi.fn();
    const claim = vi.fn(() => ({ restore }));
    const unregister = registerMotionAnchor(claim);
    render(
      <MotionProvider>
        <Switch />
      </MotionProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'on' }));
    // Asked before the flip, restored after it.
    expect(claim).toHaveBeenCalledTimes(1);
    expect(restore).not.toHaveBeenCalled();
    await flushFrames();
    expect(restore).toHaveBeenCalledTimes(1);

    unregister();
    fireEvent.click(screen.getByRole('button', { name: 'off' }));
    await flushFrames();
    expect(claim).toHaveBeenCalledTimes(1);
  });

  it('falls back to the page when no registered place claims the reader', async () => {
    const unregister = registerMotionAnchor(() => null);
    render(
      <MotionProvider>
        <Switch />
      </MotionProvider>
    );
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'on' }))).not.toThrow();
    await flushFrames();
    unregister();
  });
});
