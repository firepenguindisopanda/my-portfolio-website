import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { profile, navSections, sections, portfolioPages } from '../../data/profile';
import useSectionSpy from '../../hooks/useSectionSpy';
import { useMotion } from '../../motion/Motion';

/**
 * The one header, on every page.
 *
 * Section links are plain anchors on the home page and router links to
 * `/#section` everywhere else, where Home scrolls to the hash once it has
 * rendered. The deep-dive pages sit under one "Deep dives" disclosure rather
 * than six more top-level links. On the home page the header turns night-
 * coloured while the four case stories are on screen (the Story section sets
 * `rail-on` on <html>).
 *
 * Analytics event names are the ones the site has always sent -
 * `section_navigated`, `resume_downloaded` - plus `motion_toggled`.
 */

const MotionToggle = () => {
  const { motionOn, setMotion } = useMotion();
  const posthog = usePostHog();
  return (
    <button
      type="button"
      className="motion-toggle"
      aria-pressed={motionOn}
      aria-label={motionOn ? 'Motion: on. Turn off scroll animation' : 'Motion: off. Turn on scroll animation'}
      title={motionOn ? 'Turn off scroll animation' : 'Turn on scroll animation'}
      onClick={() => {
        setMotion(!motionOn);
        posthog?.capture('motion_toggled', { on: !motionOn });
      }}
    >
      <span className="dot" aria-hidden="true" />
      <span className="mt-state">{motionOn ? 'Motion: on' : 'Motion: off'}</span>
      <span className="mt-act">{motionOn ? 'Turn off' : 'Turn on'}</span>
    </button>
  );
};

const DeepDives = ({ onNavigate }) => {
  const location = useLocation();
  // Open on the page it was opened on, so navigating anywhere closes it
  // without an effect resetting state after the render.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === location.pathname;
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpenOn(null); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpenOn(null); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <li className="nav-more" ref={ref}>
      <button type="button" className="nav-more-btn" aria-expanded={open} aria-controls="deep-dives" onClick={() => setOpenOn(open ? null : location.pathname)}>
        Deep dives
      </button>
      {open && (
        <ul className="nav-more-list" id="deep-dives">
          {portfolioPages.map((p) => (
            <li key={p.path}>
              <Link to={p.path} aria-current={location.pathname === p.path ? 'page' : undefined} onClick={onNavigate}>
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const SiteHeader = () => {
  const location = useLocation();
  const posthog = usePostHog();
  const onHome = location.pathname === '/';
  // The phone menu, open on the page it was opened on (see DeepDives).
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const menuOpen = menuOpenOn === location.pathname;
  const menuBtn = useRef(null);
  const active = useSectionSpy(onHome ? sections.map((s) => s.id) : []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpenOn(null); menuBtn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpenOn(null);
  const track = (id) => () => {
    posthog?.capture('section_navigated', { section: id, from: onHome ? 'home' : location.pathname });
    closeMenu();
  };

  return (
    <header className={`site-header${menuOpen ? ' open' : ''}`}>
      <div className="hdr">
        <Link className="brand" to="/" onClick={closeMenu}>
          {profile.name}
        </Link>
        <nav className="nav" id="site-nav" aria-label="Primary">
          <ul>
            {navSections.map((s) => (
              <li key={s.id}>
                {onHome ? (
                  <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined} onClick={track(s.id)}>
                    {s.label}
                  </a>
                ) : (
                  <Link to={{ pathname: '/', hash: `#${s.id}` }} onClick={track(s.id)}>
                    {s.label}
                  </Link>
                )}
              </li>
            ))}
            <DeepDives onNavigate={closeMenu} />
            <li className="nav-resume">
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  posthog?.capture('resume_downloaded', { source: 'nav' });
                  closeMenu();
                }}
              >
                Resume<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
        <MotionToggle />
        <button
          ref={menuBtn}
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpenOn(menuOpen ? null : location.pathname)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>
    </header>
  );
};

export default SiteHeader;
