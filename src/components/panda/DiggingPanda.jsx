import React, { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled } from '../../utilities/gsapSetup';
import PandaRig, { INK, POSES } from './PandaRig';
import '../../styles/panda.css';

/**
 * The 404: the panda is in the filing cabinet, digging through the open top
 * drawer for a page that is not there, flinging index cards over its
 * shoulders. Every so often it stops, looks out, blinks, and goes back in.
 *
 * Three layers, so the panda can be inside the drawer: the cabinet and the
 * drawer's insides behind it, the drawer front in front of it, and the cards
 * on top of everything. Decorative, hidden from assistive tech: the page's
 * own words say what happened. With motion off it holds still, puzzled, with
 * two cards already on the floor.
 */

const PAPER = '#FFFFFF';
const SHEET = '#F6F7F9';
const RULE = '#C3CAD2';
const STAMP = '#B01E33';

/** Arms in the drawer, one then the other, as if sorting through it. */
const DIG_A = { ...POSES.sit, ra: -78, la: 14, head: 7, tilt: 4, duck: 3, look: -0.4 };
const DIG_B = { ...POSES.sit, ra: -14, la: 78, head: -5, tilt: -3, duck: 3, look: 0.4 };
/** Looking out of the drawer, at the reader. */
const LOOK = { ...POSES.sit, ra: 12, la: -12, head: -3, tilt: 0, duck: 0, look: 0 };

/**
 * Each flung card: it leaves the drawer beside the panda (left or right of
 * it, by the way it is thrown) and lands on the floor inside the scene.
 * [dx, peak, spin]; every card falls to the floor line.
 */
const FLIGHTS = [
  [-72, -112, -220],
  [70, -126, 200],
  [-50, -142, 150],
  [76, -100, -170],
];
const FROM_Y = 104;
const FLOOR_Y = 230;
const fromX = (dx) => (dx < 0 ? 114 : 206);

const Card = ({ className, transform }) => (
  <g className={className} transform={transform}>
    <rect x="-17" y="-11" width="34" height="22" rx="1.5" fill={SHEET} stroke={INK} strokeWidth="1.6" />
    <line x1="-11" x2="11" y1="-4" y2="-4" stroke={RULE} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="-11" x2="6" y1="1" y2="1" stroke={RULE} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="-11" x2="9" y1="6" y2="6" stroke={RULE} strokeWidth="1.6" strokeLinecap="round" />
  </g>
);

export const DiggingPanda = () => {
  const root = useRef(null);
  const rig = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const panda = rig.current;
    if (!gsapEnabled || prefersReducedMotion || !panda) return undefined;
    const pose = { ...POSES.puzzled };
    const apply = () => panda.apply(pose);
    const ctx = gsap.context(() => {
      const to = (p, duration, ease = 'sine.inOut') => ({ ...p, duration, ease, onUpdate: apply });
      gsap
        .timeline({ repeat: -1 })
        .to(pose, to(DIG_A, 0.28))
        .to(pose, to(DIG_B, 0.28))
        .to(pose, to(DIG_A, 0.28))
        .to(pose, to(DIG_B, 0.28))
        .to(pose, to(DIG_A, 0.28))
        .to(pose, to(DIG_B, 0.28))
        .to(pose, to(LOOK, 0.4, 'back.out(2)'))
        .to(pose, { blink: 1, duration: 0.07, yoyo: true, repeat: 1, onUpdate: apply }, '+=0.5')
        .to(pose, to(LOOK, 0.6));

      // The cards: out of the drawer, up over the panda, and down onto the floor.
      gsap.utils.toArray('.nf-fly', root.current).forEach((card, i) => {
        const [dx, peak, spin] = FLIGHTS[i];
        const fall = FLOOR_Y - FROM_Y;
        gsap
          .timeline({ repeat: -1, delay: 0.3 + i * 0.85, repeatDelay: 2.6 })
          .set(card, { x: 0, y: 0, rotation: 0, opacity: 1 })
          .to(card, { x: dx * 0.6, y: peak, rotation: spin * 0.5, duration: 0.5, ease: 'power2.out' })
          .to(card, { x: dx, y: fall, rotation: spin, duration: 0.65, ease: 'power2.in' })
          .to(card, { opacity: 0, duration: 0.3 }, '+=0.4');
      });
    }, root);
    return () => {
      ctx.revert();
      panda.apply(POSES.puzzled);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="nf-scene" ref={root} aria-hidden="true">
      {/* Behind the panda: the cabinet, and the open drawer's insides with its folders. */}
      <svg className="nf-layer" viewBox="0 0 320 250" focusable="false">
        <ellipse cx="160" cy="243" rx="132" ry="6" fill={INK} opacity=".12" />
        <rect x="60" y="62" width="200" height="178" rx="3" fill="#DCE1E7" stroke={INK} strokeWidth="2.6" />
        {[156, 198].map((y) => (
          <g key={y}>
            <rect x="74" y={y} width="172" height="34" rx="2" fill="#E6EAF0" stroke={INK} strokeWidth="2" />
            <rect x="142" y={y + 20} width="36" height="7" rx="3.5" fill={INK} />
            <rect x="144" y={y + 5} width="32" height="11" fill={PAPER} stroke={INK} strokeWidth="1.2" />
          </g>
        ))}
        <rect x="44" y="92" width="232" height="20" fill={INK} />
        {[66, 98, 130, 168, 204, 236].map((x, k) => (
          <path
            key={x}
            d={`M ${x} 112 L ${x} ${96 - (k % 2) * 6} L ${x + 8} ${96 - (k % 2) * 6} L ${x + 11} ${90 - (k % 2) * 6} L ${x + 24} ${90 - (k % 2) * 6} L ${x + 26} 112 Z`}
            fill={k % 3 === 1 ? '#FFE07A' : SHEET}
            stroke={INK}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <PandaRig ref={rig} className="nf-panda" pose="puzzled" />
      {/* In front: the drawer front, its label and the stamp; the cards on the floor; the flying cards. */}
      <svg className="nf-layer" viewBox="0 0 320 250" focusable="false" overflow="visible">
        <rect x="38" y="106" width="244" height="46" rx="2.5" fill="#E6EAF0" stroke={INK} strokeWidth="2.6" />
        <rect x="138" y="132" width="44" height="8" rx="4" fill={INK} />
        <rect x="136" y="113" width="48" height="15" fill={PAPER} stroke={INK} strokeWidth="1.4" />
        <text x="160" y="124.5" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fontWeight="600" letterSpacing="1.5" fill={INK}>
          404
        </text>
        <g transform="rotate(-8 240 128)">
          <rect x="200" y="117" width="78" height="20" fill="none" stroke={STAMP} strokeWidth="2" />
          <text x="239" y="131" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight="600" letterSpacing="1.6" fill={STAMP}>
            NOT ON FILE
          </text>
        </g>
        <Card transform="translate(34 232) rotate(-14)" />
        <Card transform="translate(292 234) rotate(9)" />
        {FLIGHTS.map(([dx]) => (
          <g key={dx} transform={`translate(${fromX(dx)} ${FROM_Y})`}>
            <Card className="nf-fly" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default DiggingPanda;
