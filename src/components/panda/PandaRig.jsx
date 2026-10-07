import React, { forwardRef, useId, useImperativeHandle, useLayoutEffect, useRef } from 'react';

/**
 * The panda, drawn to move. It keeps the proportions of the original art
 * (assets/panda-struggle.svg): a round head as wide as the body, eye patches
 * a third of the head's width, small ears set on its edge, a fat body and
 * short thick limbs with a white rim line along their edge. The original art
 * is still used wherever the panda is asleep.
 *
 * Parts are positioned with SVG transform attributes from a plain pose object
 * (see POSES), so any animation (a scroll-scrubbed stamp, a GSAP tween
 * between poses) just computes numbers and calls `apply(pose)`.
 *
 * Seated and facing out, like the original, with the face turned a little to
 * the right. viewBox 0 0 128 120, sitting on y = 116.
 */

export const INK = '#0F1720';
const PAPER = '#FFFFFF';

/** Pivots: hip (the body leans about it), neck, right and left shoulder. */
const H = [64, 116];
const N = [64, 66];
const R = [92, 76];
const L = [36, 76];
/** Where the head's centre sits. */
const HEAD = [64, 37];

/**
 * Named poses. Angles in degrees: `tilt` leans the body about the hip, `head`
 * tilts it about the neck, `ra`/`la` swing the right/left arm (0 hangs
 * straight down, and the sitting paws rest on the belly; the right arm
 * raises with negative angles, the left with positive). `duck` sinks the head into the shoulders, `blink` 1 shuts the
 * eyes, `look` moves the pupils sideways, `lift` raises the whole panda
 * (negative is up).
 */
export const POSES = {
  sit: { tilt: 0, head: 0, ra: 24, la: -24, duck: 0, lift: 0, blink: 0, look: 0 },
};
POSES.stampUp = { ...POSES.sit, ra: -150, head: -5, tilt: -2 };
POSES.stampDown = { ...POSES.sit, ra: -30, head: 7, tilt: 5 };
// A happy squint and both paws up; the double hop in PandaScenes does the rest.
POSES.cheer = { ...POSES.sit, ra: -138, la: 138, head: -6, blink: 1 };
POSES.coverEyes = { ...POSES.sit, ra: -192, la: 192, duck: 8, blink: 1 };
// Waking up: a big stretch with the eyes still shut.
POSES.stretch = { ...POSES.sit, ra: -104, la: 104, head: 8, blink: 1, lift: -3 };
// The 404: in the filing drawer, head on one side, looking for something that is not there.
POSES.puzzled = { ...POSES.sit, ra: 10, la: -10, head: 11, tilt: 3, duck: 2, look: -0.8 };

const set = (el, value) => el && el.setAttribute('transform', value);

/**
 * The face, centred on (0, 0) with a head radius of 31. `turn` shifts the
 * features sideways so the head looks a little towards where the panda faces.
 * `eyes` and `pupils` are ref arrays the owner animates (blink, look).
 */
export const PandaHead = ({ turn = 0, eyes, pupils }) => (
  <>
    {[[-21 + turn * 0.3, -24.5], [21 + turn * 0.6, -24.5]].map(([cx, cy], k) => (
      <g key={cx}>
        <circle cx={cx} cy={cy} r="9.5" fill={INK} />
        <path
          d={k ? `M ${cx + 1.5} ${cy - 6.2} a 6.2 6.2 0 0 1 5 5.8` : `M ${cx - 1.5} ${cy - 6.2} a 6.2 6.2 0 0 0 -5 5.8`}
          stroke={PAPER}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    ))}
    <circle cx="0" cy="0" r="31" fill={PAPER} stroke={INK} strokeWidth="2.6" />
    <ellipse cx={-14.5 + turn} cy="0" rx="10.5" ry="12.5" fill={INK} transform={`rotate(30 ${-14.5 + turn} 0)`} />
    <ellipse cx={14 + turn} cy="0" rx={10.5 - Math.abs(turn) * 0.2} ry="12.5" fill={INK} transform={`rotate(-30 ${14 + turn} 0)`} />
    {[-12.2 + turn, 11.8 + turn].map((cx, k) => (
      <g key={cx}>
        <ellipse ref={(el) => { if (eyes) eyes.current[k] = el; }} cx={cx} cy="-2.6" rx="3.2" ry="3.2" fill={PAPER} />
        <circle ref={(el) => { if (pupils) pupils.current[k] = el; }} cx={cx} cy="-2.4" r="1.7" fill={INK} />
      </g>
    ))}
    <path
      d={`M ${turn - 4.2} 10.4 q 4.2 -1.8 8.4 0 q -1.2 4.4 -4.2 4.9 q -3 -0.5 -4.2 -4.9 z`}
      fill={INK}
      stroke={INK}
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path
      d={`M ${turn - 3.6} 17 q 1.8 1.9 3.6 0 q 1.8 1.9 3.6 0`}
      stroke={INK}
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

/** A short, thick arm hanging from its shoulder, with the rim line on its outer edge. */
const Arm = forwardRef(({ side, stamp }, ref) => (
  <g ref={ref}>
    <rect x="-8.5" y="-8" width="17" height="34" rx="8.5" fill={INK} />
    <path d={`M ${side * 4} -2 L ${side * 4} 19`} stroke={PAPER} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    {stamp && (
      <g className="pd-stamp" transform="translate(0 25)">
        <rect x="-3" y="-2" width="6" height="12" rx="3" fill="#8A5A2B" stroke={INK} strokeWidth="1.4" />
        <rect x="-9" y="9" width="18" height="6" rx="1.5" fill="#D7263D" stroke={INK} strokeWidth="1.4" />
      </g>
    )}
  </g>
));
Arm.displayName = 'Arm';

/** A foot out in front, with a white gap between it and the leg behind. */
const Foot = ({ cx, angle, side }) => (
  <g transform={`rotate(${angle} ${cx} 106)`}>
    <ellipse cx={cx} cy="106" rx="14.5" ry="11" fill={PAPER} />
    <ellipse cx={cx} cy="106" rx="13.5" ry="10" fill={INK} />
    <path d={`M ${cx - side * 8} 99 Q ${cx} 96.4 ${cx + side * 8} 99.4`} stroke={PAPER} strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </g>
);

const PandaRig = forwardRef(({ className, stamp = false, pose = 'sit' }, ref) => {
  const clip = `pd-body-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const root = useRef(null);
  const body = useRef(null);
  const head = useRef(null);
  const ra = useRef(null);
  const la = useRef(null);
  const eyes = useRef([]);
  const pupils = useRef([]);

  const apply = (p) => {
    set(root.current, `translate(0 ${p.lift ?? 0})`);
    set(body.current, `rotate(${p.tilt ?? 0} ${H[0]} ${H[1]})`);
    set(head.current, `translate(0 ${p.duck ?? 0}) rotate(${p.head ?? 0} ${N[0]} ${N[1]})`);
    set(ra.current, `translate(${R[0]} ${R[1]}) rotate(${p.ra ?? 0})`);
    set(la.current, `translate(${L[0]} ${L[1]}) rotate(${p.la ?? 0})`);
    const open = 1 - Math.min(1, Math.max(0, p.blink ?? 0));
    eyes.current.forEach((e) => e?.setAttribute('ry', (3 * open + 0.2).toFixed(2)));
    pupils.current.forEach((e) => {
      e?.setAttribute('opacity', open > 0.35 ? '1' : '0');
      set(e, `translate(${((p.look ?? 0) * 1.3).toFixed(2)} 0)`);
    });
  };

  useImperativeHandle(ref, () => ({ apply }));
  useLayoutEffect(() => {
    apply(POSES[pose] || POSES.sit);
    // Only the starting pose; animations take over from here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg viewBox="0 0 128 120" className={className} aria-hidden="true" focusable="false" overflow="visible">
      <defs>
        <clipPath id={clip}>
          <ellipse cx="64" cy="88" rx="38" ry="28" />
        </clipPath>
      </defs>
      <g ref={root}>
        <g ref={body}>
          <ellipse cx="64" cy="88" rx="38" ry="28" fill={PAPER} />
          {/* The black band over the shoulders, and the legs. */}
          <path d="M 20 56 L 108 56 L 108 76 Q 64 88 20 76 Z" fill={INK} clipPath={`url(#${clip})`} />
          <ellipse cx="36" cy="108" rx="21" ry="17" fill={INK} clipPath={`url(#${clip})`} />
          <ellipse cx="92" cy="108" rx="21" ry="17" fill={INK} clipPath={`url(#${clip})`} />
          <ellipse cx="64" cy="88" rx="38" ry="28" fill="none" stroke={INK} strokeWidth="2.6" />
          <Foot cx={42} angle={16} side={-1} />
          <Foot cx={86} angle={-16} side={1} />
          <g ref={head}>
            <g transform={`translate(${HEAD[0]} ${HEAD[1]})`}>
              <PandaHead turn={3} eyes={eyes} pupils={pupils} />
            </g>
          </g>
          {/* After the head, so a raised paw (a stamp, covering the eyes) is in front of it. */}
          <Arm ref={la} side={-1} />
          <Arm ref={ra} side={1} stamp={stamp} />
        </g>
      </g>
    </svg>
  );
});
PandaRig.displayName = 'PandaRig';

export default PandaRig;
