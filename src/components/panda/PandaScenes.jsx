import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PANDA_LYING from '../../assets/panda-struggle.svg';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { canHover, gsap, gsapEnabled, ScrollTrigger } from '../../utilities/gsapSetup';
import PandaRig, { INK, PandaHead, POSES } from './PandaRig';
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
 *   TryItPanda  - naps beside Try it until you use a demo, then hops onto
 *                 that demo's sheet, above where its stamp lands: cheers at a
 *                 clean result, covers its eyes at a miss.
 *   FooterNap   - asleep beside the motto, born to dilly dally.
 *
 * All decorative and hidden from assistive tech. With motion off nothing
 * moves: each scene holds a still pose, and the Try it panda still reacts by
 * switching straight to its cheer or cover-eyes pose for a moment.
 */

const PAPER = '#FFFFFF';
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, t) => {
  const out = {};
  Object.keys(a).forEach((k) => { out[k] = a[k] + ((b[k] ?? a[k]) - a[k]) * t; });
  return out;
};
const smooth = (t) => t * t * (3 - 2 * t);

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

/** The clerk's pose for how far into a case's figure the reader is (0 to 1). */
export const clerkPose = (p) => {
  // Eyes on the case the whole time.
  const idle = { ...POSES.sit, look: 1 };
  const up = { ...POSES.stampUp, look: 1 };
  const down = { ...POSES.stampDown, look: 1 };
  if (p < 0.6) return idle;
  if (p < 0.76) return mix(idle, up, smooth((p - 0.6) / 0.16));
  if (p < 0.84) return mix(up, down, smooth((p - 0.76) / 0.08));
  return mix(down, idle, smooth(clamp01((p - 0.9) / 0.1)));
};

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
      el.style.left = `${Math.round(v.left - s.left - el.offsetWidth * 0.62)}px`;
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
/* Try it: naps until a demo is used, then hops onto that demo.       */
/* ------------------------------------------------------------------ */

/** How far in from a sheet's right edge the centre of its stamp lands. */
const STAMP_IN = 76;
/** How long a reaction pose is held with motion off. */
export const HOLD_MS = 1400;

/**
 * Where the panda goes, in the Try it wrap's coordinates: on the top edge of
 * an exhibit's sheet, above where its stamp lands. Asleep it lies on the first
 * sheet (the gap above it is clear at every width, where the heading's text
 * is not); awake it sits a little lower, its feet over the edge.
 */
const spotFor = (wrap, exhibit, el, awake) => {
  const sheet = (exhibit || wrap.querySelector('.exhibit'))?.querySelector('.ex-sheet');
  if (!sheet) return { x: 0, y: 0 };
  const w = wrap.getBoundingClientRect();
  const s = sheet.getBoundingClientRect();
  return {
    x: Math.round(s.right - w.left - STAMP_IN - el.offsetWidth / 2),
    y: Math.round(s.top - w.top - el.offsetHeight + (awake ? 12 : 3)),
  };
};

const CHEER_UP = { ...POSES.cheer, lift: -14 };
const REACTIONS = {
  // A happy double hop.
  ok: {
    steps: [[CHEER_UP, 0.2], [POSES.cheer, 0.16], [CHEER_UP, 0.2], [POSES.cheer, 0.16], [POSES.sit, 0.4]],
    still: POSES.cheer,
  },
  // Can't look.
  miss: {
    steps: [[POSES.coverEyes, 0.3], [POSES.coverEyes, 1.1], [POSES.sit, 0.4]],
    still: POSES.coverEyes,
  },
};

export const TryItPanda = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const box = useRef(null);
  const rig = useRef(null);
  // The exhibit it sits on (null: still asleep on the first one) and whether
  // it has woken. Refs, so a motion switch rebuilding the effect below leaves
  // it where and how it was.
  const perch = useRef(null);
  const woke = useRef(false);
  const [awake, setAwake] = useState(false);

  // A layout effect, so it is in place before it is first painted.
  useLayoutEffect(() => {
    const el = box.current;
    const wrap = el?.parentElement;
    if (!wrap) return undefined;
    const animate = gsapEnabled && !prefersReducedMotion;
    const pose = { ...POSES.sit };
    const apply = () => rig.current?.apply(pose);
    let tl = null;
    let back = 0;
    let hopping = false;

    const place = () => gsap.set(el, spotFor(wrap, perch.current, el, woke.current));
    const stop = () => {
      tl?.kill();
      tl = null;
      hopping = false;
      clearTimeout(back);
    };

    /**
     * Go to `exhibit` (if given) and react there. With motion on: `before`
     * plays where it is, then the hop if it is not already there (or was cut
     * off mid-hop by this reaction), then `after`. With motion off it is
     * simply there, holding `still` for a moment.
     */
    const react = (exhibit, { before = [], after = [], still = POSES.sit }) => {
      stop();
      setAwake(true);
      woke.current = true;
      if (exhibit) perch.current = exhibit;
      if (!animate) {
        place();
        Object.assign(pose, still);
        apply();
        if (still !== POSES.sit) {
          back = setTimeout(() => {
            Object.assign(pose, POSES.sit);
            apply();
          }, HOLD_MS);
        }
        return;
      }
      tl = gsap.timeline();
      const poseTo = ([target, duration]) => tl.to(pose, { ...target, duration, ease: 'power2.inOut', onUpdate: apply });
      before.forEach(poseTo);
      const to = spotFor(wrap, perch.current, el, true);
      const from = { x: gsap.getProperty(el, 'x'), y: gsap.getProperty(el, 'y') };
      if (Math.abs(from.x - to.x) > 1 || Math.abs(from.y - to.y) > 1) {
        hopping = true;
        poseTo([POSES.stretch, 0.14]);
        tl.to(el, { x: to.x, duration: 0.5, ease: 'power1.inOut' })
          .to(el, { y: Math.min(from.y, to.y) - 36, duration: 0.22, ease: 'power2.out' }, '<')
          .to(el, { y: to.y, duration: 0.28, ease: 'power2.in' }, '>')
          // Landed: settle on the spot as it is now, in case the page moved mid-hop.
          .call(() => {
            hopping = false;
            place();
          });
        poseTo([POSES.sit, 0.16]);
      }
      after.forEach(poseTo);
    };

    place();
    // A motion switch in the middle of a reaction leaves it sitting.
    apply();
    // Demos change height as they are used; keep it on its spot (a hop in
    // flight lands on the new spot instead).
    const ro = new ResizeObserver(() => {
      if (!hopping) place();
    });
    ro.observe(wrap);

    const exhibitOf = (node) => {
      const ex = node?.closest?.('.exhibit');
      return ex && wrap.contains(ex) ? ex : null;
    };
    const offDemo = onPanda('demo', ({ demo }) => {
      const exhibit = wrap.querySelector(`.ex-${demo}`);
      if (!perch.current) {
        // Wakes with a big stretch, then hops over to watch.
        react(exhibit, { before: [[POSES.stretch, 0.45], [POSES.stretch, 0.3]] });
      } else if (exhibit && exhibit !== perch.current) {
        react(exhibit, {});
      }
    });
    const offStamp = onPanda('stamp', ({ tone, at }) => {
      const { steps, still } = tone === 'ok' ? REACTIONS.ok : REACTIONS.miss;
      react(exhibitOf(at), { after: steps, still });
    });
    return () => {
      offDemo();
      offStamp();
      ro.disconnect();
      stop();
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={box} className={`pd-tryit${awake ? ' is-awake' : ''}`} aria-hidden="true">
      <img className="pd-tryit-nap" src={PANDA_LYING} alt="" loading="lazy" />
      <PandaRig ref={rig} pose="sit" className="pd-rig pd-tryit-rig" />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Footer: asleep beside the motto.                                    */
/* ------------------------------------------------------------------ */

export const FooterNap = () => (
  <span className="pd-footer-nap" aria-hidden="true">
    <img src={PANDA_LYING} alt="" loading="lazy" />
    <svg className="pd-zz" viewBox="0 0 30 26" focusable="false">
      <path d="M 4 18 h 6 l -6 6 h 6" />
      <path d="M 13 9 h 7 l -7 7 h 7" />
      <path d="M 22 1 h 6 l -6 6 h 6" />
    </svg>
  </span>
);
