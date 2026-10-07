import React, { useEffect, useLayoutEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, ScrollTrigger } from '../utilities/gsapSetup';

/**
 * A figure that counts up to itself, with motion on: "0.871", "12x",
 * "99.80%", "1,600". Whatever surrounds the number (a unit, a sign) stays
 * put, and the decimals and thousands separators of the original are kept,
 * so the count lands exactly on the text it started as.
 *
 * Nothing waits on it: the figure is written in full at rest, and only counts
 * as it comes into view (or, with `start`, when `start` turns true). Screen
 * readers get the final figure only, never the numbers in between.
 *
 * The counting text is written straight into a node React does not manage,
 * so a re-render can never fight a count in flight.
 */

const parse = (value) => {
  const s = String(value);
  const m = s.match(/\d[\d,]*(\.\d+)?/);
  if (!m) return null;
  return {
    before: s.slice(0, m.index),
    after: s.slice(m.index + m[0].length),
    target: parseFloat(m[0].replace(/,/g, '')),
    decimals: m[1] ? m[1].length - 1 : 0,
    grouped: m[0].includes(','),
  };
};

const format = (p, n) =>
  p.before +
  (p.grouped
    ? n.toLocaleString('en-US', { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : n.toFixed(p.decimals)) +
  p.after;

const CountUp = ({ value, start, className, duration = 1.1 }) => {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const text = String(value);

  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = text;
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    const p = parse(text);
    if (!el || !p || !gsapEnabled || prefersReducedMotion || start === false) return undefined;
    const counter = { n: 0 };
    const tween = gsap.to(counter, {
      n: p.target,
      duration,
      ease: 'power2.out',
      paused: true,
      onStart: () => {
        el.textContent = format(p, 0);
      },
      onUpdate: () => {
        el.textContent = format(p, counter.n);
      },
      onComplete: () => {
        el.textContent = text;
      },
    });
    const trigger =
      start === undefined ? ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => tween.play(0) }) : null;
    if (!trigger) tween.play(0);
    return () => {
      tween.kill();
      trigger?.kill();
      el.textContent = text;
    };
  }, [text, start, duration, prefersReducedMotion]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </span>
  );
};

export default CountUp;
