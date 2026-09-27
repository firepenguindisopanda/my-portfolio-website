import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import PANDA from '../assets/panda-struggle.svg';
import { profile } from '../data/profile';
import useDocumentMeta from '../hooks/useDocumentMeta';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { canHover, gsap, gsapEnabled, useGSAP } from '../utilities/gsapSetup';
import { routeMeta } from '../data/routes';
import { BackIcon } from '../components/site/icons';

/**
 * The panda's page: the one place on the site allowed to be playful, filed
 * like everything else - a file card with the panda as its photo.
 *
 * The choreography of the old page is kept: the panda springs in and then
 * floats, the lines step in, and pointing at the panda makes it wiggle. None of
 * it runs with motion off; the page is simply settled.
 */
const PHILOSOPHY = [
  '99% bamboo, 1% coding',
  'Master procrastinator, amateur achiever',
  'Struggling gracefully since day one',
  'Debugging life, one error at a time',
];

const AboutPanda = () => {
  useDocumentMeta(routeMeta('/about-panda'));

  const prefersReducedMotion = usePrefersReducedMotion();
  const root = useRef(null);
  const pandaRef = useRef(null);
  const wiggle = useRef(null);

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      // Entrance, then the idle float starts where the entrance leaves off.
      const tl = gsap.timeline();
      tl.from('.panda-card', { y: 40, rotation: 8, opacity: 0, duration: 0.8, ease: 'back.out(1.4)' })
        .from('.panda-img', { scale: 0, rotation: -180, duration: 0.9, ease: 'back.out(1.4)' }, 0.2)
        .from('.panda-line', { opacity: 0, y: 16, duration: 0.5, stagger: 0.12, ease: 'power2.out' }, 0.3)
        .add(() => {
          gsap.to('.panda-img', { y: -12, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        });
    },
    { scope: root, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  const startWiggle = () => {
    if (!gsapEnabled || prefersReducedMotion || wiggle.current || !canHover()) return;
    wiggle.current = gsap.to(pandaRef.current, {
      keyframes: { rotation: [0, -10, 10, -10, 0] },
      scale: 1.1,
      duration: 2,
      repeat: -1,
      ease: 'sine.inOut',
    });
  };

  const stopWiggle = () => {
    wiggle.current?.kill();
    wiggle.current = null;
    if (gsapEnabled && pandaRef.current) gsap.to(pandaRef.current, { rotation: 0, scale: 1, duration: 0.3 });
  };

  return (
    <div className="cf pg panda" ref={root}>
      <header className="pg-head">
        <div className="wrap panda-grid">
          <div>
            <div className="crumbs">
              <Link className="back" to="/">
                <BackIcon /> Home
              </Link>
              <span className="crumb-path" aria-hidden="true">
                personal / panda
              </span>
            </div>
            <p className="sec-tab panda-line">Personal file</p>
            <h1 className="pg-title panda-line">About the Panda</h1>
            <p className="panda-motto panda-line">
              <mark>&ldquo;{profile.personal.motto}&rdquo;</mark>
            </p>
            <p className="lede panda-line">
              The story behind the panda, the philosophy, and the journey. Personal insights, life lessons, and the
              developer&apos;s journey. Watch this space.
            </p>
          </div>

          <figure className="panda-card filecard">
            <div className="fc-tab" aria-hidden="true">
              PANDA.SVG
            </div>
            <div className="sheet">
              <div className="panda-photo" onMouseEnter={startWiggle} onMouseLeave={stopWiggle}>
                <span className="panda-float panda-img">
                  <img ref={pandaRef} src={PANDA} alt="A panda, struggling" width="548" height="293" />
                </span>
                <span className="panda-stamp" aria-hidden="true">
                  Coming soon
                </span>
              </div>
              <h2 className="panda-h">Panda philosophy</h2>
              <ul className="panda-list">
                {PHILOSOPHY.map((line) => (
                  <li key={line} className="panda-line">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </figure>
        </div>
      </header>
      <div className="wrap panda-foot">
        <Link className="btn btn-primary" to="/">
          <BackIcon /> Back to home
        </Link>
      </div>
    </div>
  );
};

export default AboutPanda;
