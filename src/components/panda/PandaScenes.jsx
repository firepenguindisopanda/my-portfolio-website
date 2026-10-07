import React, { useEffect, useRef, useState } from 'react';
import PANDA_LYING from '../../assets/panda-struggle.svg';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { canHover, gsap, gsapEnabled, ScrollTrigger } from '../../utilities/gsapSetup';
import PandaRig, { INK, PandaHead } from './PandaRig';
import { clerkPose } from './clerkPose';
import { onPanda } from './pandaBus';
import '../../styles/panda.css';

/**
 * The panda lives inside the case file. Four small scenes, each placed by
 * the section it belongs to (and loaded through LazyScenes, off the first
 * load):
 *
 *   HeroPeek    - peeks over the top of the hero's file card, eyes following
 *                 the pointer; ducks behind the card as you scroll away.
 *   StoryClerk  - sits by the Four cases stage and presses a rubber stamp at
 *                 each case's result, in step with the scroll (it reverses
 *                 when you scroll back). Only on the pinned stage.
 *   TryItNap    - asleep on the top edge of a Try it sheet, the original
 *                 art with its "z" marks. Still at all times.
 *   FooterNap   - asleep beside the motto, born to dilly dally.
 *
 * All decorative and hidden from assistive tech. With motion off nothing
 * moves: each scene holds a still pose.
 */

const PAPER = '#FFFFFF';

/* ------------------------------------------------------------------ */
/* Hero: a front-facing head and two paws on the card's top edge.     */
/* ------------------------------------------------------------------ */

/** The hero's front-facing head: the same face as the rig, looking straight out. */
const PeekHead = React.forwardRef(({ eyes, pupils }, ref) => (
  <svg ref={ref} className="pd-peek-head" viewBox="-36 -38 72 70" aria-hidden="true" focusable="false">
    <PandaHead eyes={eyes} pupils={pupils} />
  </svg>
));
PeekHead.displayName = 'PeekHead';

export const HeroPeek = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const head = useRef(null);
  const paws = useRef(null);
  const headWrap = useRef(null);
  const pawsWrap = useRef(null);
  const pupils = useRef([]);
  const eyes = useRef([]);

  useEffect(() => {
    if (!gsapEnabled || prefersReducedMotion) return undefined;
    const dots = pupils.current;
    const ctx = gsap.context(() => {
      // Up from behind the card once the cover has arrived.
      gsap.from(head.current, { y: 66, duration: 0.7, delay: 0.9, ease: 'back.out(1.6)' });
      gsap.from(paws.current, { y: 10, opacity: 0, duration: 0.4, delay: 1.1, ease: 'power2.out' });
      // Ducks back down as the reader scrolls away, and pops up again on the
      // way back. On the wrappers, so it never fights the entrance above.
      gsap.fromTo(headWrap.current, { y: 0 }, {
        y: 66,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '.cf .hero', start: 'top top', end: '35% top', scrub: 0.4 },
      });
      gsap.fromTo(pawsWrap.current, { opacity: 1 }, {
        opacity: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '.cf .hero', start: '10% top', end: '25% top', scrub: 0.4 },
      });
      // A blink every few seconds. One repeating timeline, made here, so the
      // context's revert stops it (a chain of delayed calls would outlive it).
      gsap
        .timeline({ repeat: -1, delay: 2.2, repeatDelay: 3.6 })
        .to(eyes.current, { attr: { ry: 0.4 }, duration: 0.07, yoyo: true, repeat: 1 });
    });

    // Eyes follow the pointer, a little.
    const onMove = (e) => {
      const r = head.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      dots.forEach((p) => p?.setAttribute('transform', `translate(${((dx / d) * 1.4).toFixed(2)} ${((dy / d) * 1.2).toFixed(2)})`));
    };
    if (canHover()) window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      ctx.revert();
      window.removeEventListener('pointermove', onMove);
      // Motion switched off: look straight out again.
      dots.forEach((p) => p?.removeAttribute('transform'));
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <span ref={headWrap} className="pd-peek-headwrap" aria-hidden="true">
        <PeekHead ref={head} eyes={eyes} pupils={pupils} />
      </span>
      <span ref={pawsWrap} className="pd-peek-pawswrap" aria-hidden="true">
        <svg ref={paws} className="pd-peek-paws" viewBox="-36 -7 72 14" focusable="false">
          {[-25, 25].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="0" rx="9.5" ry="6.5" fill={INK} />
              <path d={`M ${cx - 5.5} -3.2 Q ${cx} -5.6 ${cx + 5.5} -3.2`} stroke={PAPER} strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </g>
          ))}
        </svg>
      </span>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Four cases: a clerk with a rubber stamp beside the pinned stage.   */
/* ------------------------------------------------------------------ */

export const StoryClerk = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const wrap = useRef(null);
  const rig = useRef(null);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const stage = el?.parentElement;
    if (!stage) return undefined;
    // Sit on the stage's floor, just left of the figure's frame.
    const place = () => {
      const viz = stage.querySelector('.chapter .viz');
      if (!viz || !document.documentElement.classList.contains('pin-mode')) {
        setPlaced(false);
        return;
      }
      const s = stage.getBoundingClientRect();
      const v = viz.getBoundingClientRect();
      // Never on the text column: at tablet widths the gap between it and the
      // figure is narrow, so there the clerk is smaller and leans further in.
      const textEnd = stage.querySelector('.chapter .chapter-text')?.getBoundingClientRect().right ?? -Infinity;
      const w = v.left - textEnd < 50 ? 84 : 112;
      el.style.width = `${w}px`;
      el.style.left = `${Math.round(Math.max(v.left - w * 0.62, textEnd + 6) - s.left)}px`;
      el.style.top = `${Math.round(v.bottom - s.top - el.offsetHeight + 4)}px`;
      setPlaced(true);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(stage);
    const refresh = () => requestAnimationFrame(place);
    ScrollTrigger.addEventListener('refresh', refresh);
    const off = onPanda('case', ({ p }) => {
      if (prefersReducedMotion) return;
      rig.current?.apply(clerkPose(p));
    });
    rig.current?.apply(clerkPose(0));
    return () => {
      ro.disconnect();
      ScrollTrigger.removeEventListener('refresh', refresh);
      off();
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={wrap} className={`pd-clerk${placed ? ' is-placed' : ''}`} aria-hidden="true">
      <PandaRig ref={rig} stamp pose="sit" className="pd-rig" />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Asleep: the original art and its "z" marks, beside Try it and in   */
/* the footer.                                                         */
/* ------------------------------------------------------------------ */

const Zz = () => (
  <svg className="pd-zz" viewBox="0 0 30 26" focusable="false">
    <path d="M 4 18 h 6 l -6 6 h 6" />
    <path d="M 13 9 h 7 l -7 7 h 7" />
    <path d="M 22 1 h 6 l -6 6 h 6" />
  </svg>
);

/** Asleep on the top edge of a Try it sheet. Still: it never wakes or moves. */
export const TryItNap = () => (
  <span className="pd-tryit-nap" aria-hidden="true">
    <img src={PANDA_LYING} alt="" loading="lazy" />
    <Zz />
  </span>
);

/* ------------------------------------------------------------------ */
/* Footer: asleep beside the motto.                                    */
/* ------------------------------------------------------------------ */

export const FooterNap = () => (
  <span className="pd-footer-nap" aria-hidden="true">
    <img src={PANDA_LYING} alt="" loading="lazy" />
    <Zz />
  </span>
);
