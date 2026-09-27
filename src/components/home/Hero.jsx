import React, { useRef } from 'react';
import { usePostHog } from '@posthog/react';
import PROFILE_PHOTO from '../../assets/Nicholas_Smith_profile_pic.webp';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { canHover, gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';
import { CaseStudyLink, EXT, NewTab, Arrow, splitTitle } from './links';
import { DownIcon, ExternalIcon } from '../site/icons';
import { HeroPeek } from '../panda/LazyScenes';

/**
 * The case file's cover: the name, the thesis, and a file card with the one
 * photograph on the page, clipped to a sheet.
 *
 * Below it, the thesis's evidence - three projects where the work checks
 * itself - set as highlighted excerpts. Pointing at one sweeps the highlighter
 * across it; each opens the case study that substantiates it.
 *
 * Motion (only when on): a first-load settle under a second, and the file card
 * leaning toward the pointer. Nothing is hidden at rest - every tween is a
 * `from` a readable state.
 */

let introPlayed = false;

const Hero = ({ onSeeWork }) => {
  const rootRef = useRef(null);
  const posthog = usePostHog();
  const prefersReducedMotion = usePrefersReducedMotion();

  const parts = profile.name.split(' ');
  const last = parts.pop();
  const first = parts.join(' ');
  const tabLabel = `${last.toUpperCase()}, ${first.charAt(0).toUpperCase()}.`;
  const [before, after] = profile.thesis.split('verification');

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return undefined;

      if (!introPlayed) {
        introPlayed = true;
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.card-tilt', { y: 26, rotation: -3, duration: 0.9 }, 0)
          .from('.name .ln', { yPercent: 10, duration: 0.7, stagger: 0.08 }, 0)
          .from('.swash', { scaleX: 0, duration: 0.6, ease: 'power2.inOut' }, 0.3);
      }

      if (!canHover()) return undefined;
      const card = rootRef.current.querySelector('.card-tilt');
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        ry(gsap.utils.clamp(-10, 10, dx * 24));
        rx(gsap.utils.clamp(-8, 8, -dy * 20));
      };
      const onLeave = () => {
        rx(0);
        ry(0);
      };
      const hero = rootRef.current;
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
      return () => {
        hero.removeEventListener('pointermove', onMove);
        hero.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <section className="hero" id="hero" ref={rootRef} aria-labelledby="hero-name">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="kicker">
              <span>Case file</span>
              <span aria-hidden="true">/</span>
              <span>Building software since {profile.since}</span>
            </p>
            <h1 className="name" id="hero-name">
              <span className="ln ln1">{first}</span>{' '}
              <span className="ln">
                <span className="ln2">
                  <span className="swash" aria-hidden="true" />
                  {last}
                </span>
              </span>
            </h1>
            <p className="role">{profile.role}</p>
            <p className="loc">{profile.location}</p>
            <p className="thesis">
              {before}
              <mark>verification</mark>
              {after}
            </p>
            <div className="cta-row">
              <a
                className="btn btn-primary"
                href="#story"
                onClick={(e) => {
                  posthog?.capture('hero_see_work_clicked');
                  if (onSeeWork) {
                    e.preventDefault();
                    onSeeWork();
                  }
                }}
              >
                See my work
                <DownIcon />
              </a>
              <a
                className="btn btn-ghost"
                href={profile.resume}
                {...EXT}
                onClick={() => posthog?.capture('resume_downloaded', { source: 'hero' })}
              >
                Resume
                <NewTab />
                <ExternalIcon />
              </a>
            </div>
            <ul className="socials">
              <li>
                <a href={profile.links.github} {...EXT} onClick={() => posthog?.capture('contact_channel_clicked', { channel: 'github', source: 'hero' })}>
                  GitHub
                  <NewTab />
                  <Arrow />
                </a>
              </li>
              <li>
                <a href={profile.links.linkedin} {...EXT} onClick={() => posthog?.capture('contact_channel_clicked', { channel: 'linkedin', source: 'hero' })}>
                  LinkedIn
                  <NewTab />
                  <Arrow />
                </a>
              </li>
            </ul>
            {profile.available && <p className="avail">{profile.availability}</p>}
          </div>

          <div className="card-stage">
            <div className="card-tilt">
              <figure className="filecard">
                <div className="fc-tab" aria-hidden="true">{tabLabel}</div>
                <div className="sheet">
                  <svg className="clip" viewBox="0 0 28 72" aria-hidden="true" focusable="false">
                    <path
                      d="M10 22 L10 54 A4 4 0 0 0 18 54 L18 12 A7 7 0 0 0 4 12 L4 58 A10 10 0 0 0 24 58 L24 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="photo">
                    <img src={PROFILE_PHOTO} alt={`Portrait of ${profile.name}`} width="264" height="325" decoding="async" />
                    <span className="ph-label" aria-hidden="true">profile.webp</span>
                  </div>
                  <dl className="fc-fields">
                    <div><dt>Role</dt><dd>{profile.role}</dd></div>
                    <div><dt>Based in</dt><dd>{profile.location}</dd></div>
                    <div>
                      <dt>Status</dt>
                      <dd>{profile.available ? <span className="yes">Available</span> : 'Not available'}</dd>
                    </div>
                    <div><dt>Stack</dt><dd>{profile.skills.slice(0, 5).join(', ')}</dd></div>
                  </dl>
                </div>
                <HeroPeek />
              </figure>
            </div>
          </div>
        </div>

        <div className="evidence">
          <div className="ev-head">
            <h2 className="ev-title">{profile.heroLedgerLabel}</h2>
            <span className="ev-title" aria-hidden="true">Highlighted excerpts</span>
          </div>
          <ul className="ev-list">
            {profile.heroLedger.map((e) => {
              const p = projects.find((x) => x.id === e.id);
              return (
                <li className="ev-row" key={e.id}>
                  <CaseStudyLink
                    project={p}
                    source="hero-evidence"
                    onClick={() => posthog?.capture('hero_ledger_clicked', { project_id: e.id })}
                  >
                    <span className="ev-name">{e.name}</span>
                    <span className="ev-claim">
                      <span className="hl">{e.claim}</span>
                    </span>
                    <span className="ev-go">
                      Case study<span className="sr-only">: {splitTitle(p.title)[0]}</span>
                    </span>
                  </CaseStudyLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Hero;
