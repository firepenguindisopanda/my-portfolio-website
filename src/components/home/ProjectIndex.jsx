import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { projects as allProjects } from '../../data/projects';
import { DATASETS } from '../../data/workedExample';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { canHover, Flip, gsap, gsapEnabled, ScrollTrigger } from '../../utilities/gsapSetup';
import { CaseStudyLink, OutLinks, splitTitle } from './links';
import { projectUses } from '../../data/skillEvidence';
import { onSkillPicked } from './indexFilter';

/**
 * The full index: every featured project, flagships first, filterable by
 * category. This is the recruiter's fast path - the four cases above tell
 * stories, this lists everything with its links.
 *
 * Two interactions:
 *   - Filtering moves the rows that stay to their new places (GSAP Flip) and
 *     fades in the ones that arrive, when motion is on.
 *   - The hover preview, from the Harbour concept: pointing at a row in "More
 *     projects" floats that project's screenshot beside the cursor and leans it
 *     with the pointer's speed. A project without a screenshot shows its
 *     evidence line on a night card instead - never an invented picture.
 *     Mouse and trackpad only; on touch the row's links are right there.
 *
 * Skills (further down) can also filter it: picking a skill there shows the
 * projects that use it, each marked with the reviewer's red bracket and a
 * note, and brings the reader up here.
 */

/** The eight projects to walk someone through first, in order. */
export const FLAGSHIP_IDS = [
  'timetable-builder',
  'idea-sprint',
  'python-ocr',
  'fraud-detection',
  'link-tracker',
  'bi-automatic-reporting',
  'uwi-scraper',
  'handbooks-parser',
];

const featured = allProjects.filter((p) => p.featured);
const flagships = FLAGSHIP_IDS.map((id) => featured.find((p) => p.id === id)).filter(Boolean);
const others = featured.filter((p) => !FLAGSHIP_IDS.includes(p.id));
const categories = featured.reduce((acc, p) => (p.category && !acc.includes(p.category) ? [...acc, p.category] : acc), []);

const Tech = ({ items }) => (
  <ul className="tech" aria-label="Tech">
    {items.map((t) => <li key={t}>{t}</li>)}
  </ul>
);

/** A project without a screenshot gets its own numbers, never a fake UI. */
const DataTile = ({ project }) => {
  if (project.id === 'fraud-detection') {
    const max = Math.max(...DATASETS.map((d) => d.doingNothing));
    return (
      <div className="ix-thumb ix-data" aria-hidden="true">
        <span className="cap">modelled loss, to scale</span>
        <svg viewBox="0 0 160 70" focusable="false">
          {DATASETS.map((d, j) => {
            const hN = (d.doingNothing / max) * 60;
            const hT = (d.atThreshold / max) * 60;
            const x = 8 + j * 52;
            return (
              <g key={d.id}>
                <rect x={x} y={(66 - hN).toFixed(1)} width="18" height={hN.toFixed(1)} fill="none" stroke="#FF6B7D" strokeWidth="1.2" strokeDasharray="3 2" />
                <rect x={x + 22} y={(66 - hT).toFixed(1)} width="18" height={Math.max(hT, 1).toFixed(1)} fill="#FFD23F" />
              </g>
            );
          })}
          <line x1="0" y1="66.5" x2="160" y2="66.5" stroke="#A3AEBF" />
        </svg>
      </div>
    );
  }
  const m = /(\d[\d,.]*\+?%?)\s+([A-Za-z-]+)/.exec(project.highlight || '');
  return (
    <div className="ix-thumb ix-data" aria-hidden="true">
      <span className="cap">{project.id}</span>
      {m && (
        <span>
          <span className="big">{m[1]}</span>
          <br />
          <span className="cap">{m[2]}</span>
        </span>
      )}
    </div>
  );
};

const Row = ({ project, rich, onPreview, cited }) => {
  const [title, sub] = splitTitle(project.title);
  return (
    <li
      className={`ix-row${rich ? '' : ' compact'}${cited ? ' cited' : ''}`}
      data-cat={project.category}
      data-flip-id={project.id}
      onPointerEnter={onPreview ? (e) => onPreview.show(project, e) : undefined}
      onPointerLeave={onPreview ? onPreview.hide : undefined}
    >
      {rich && (project.screenshot ? (
        <div className="ix-thumb">
          <img src={project.screenshot} alt={`Screenshot of ${title}`} loading="lazy" decoding="async" width="640" height="400" />
        </div>
      ) : (
        <DataTile project={project} />
      ))}
      <div className="ix-main">
        <h4 className="ix-title">
          <CaseStudyLink project={project} source="index">{title}</CaseStudyLink>
          {sub && <span className="sub">{sub}</span>}
        </h4>
        {rich && <p className="ix-hl">{project.highlight}</p>}
        {cited && (
          <span className="ix-cite" aria-hidden="true">
            uses {cited}
          </span>
        )}
      </div>
      <div className="ix-meta">
        <p className="ix-cat">{project.category}</p>
        <Tech items={(project.primaryTech || project.technologies || []).slice(0, 4)} />
      </div>
      <p className="ix-links">
        <CaseStudyLink project={project} source="index">Case study<span className="sr-only">: {title}</span></CaseStudyLink>
        <OutLinks project={project} source="index" />
      </p>
    </li>
  );
};

/** The floating card that follows the pointer over "More projects". */
const usePreview = (previewRef, motionOn) => {
  const posthog = usePostHog();
  const state = useRef({ x: 0, y: 0, last: 0, movers: null, seen: new Set() });

  return useMemo(() => {
    if (!canHover()) return null;
    const place = (e) => {
      const el = previewRef.current;
      if (!el) return;
      const s = state.current;
      const w = el.offsetWidth || 300;
      const h = el.offsetHeight || 220;
      // Sit to the right of the pointer, flipping left near the edge.
      const x = e.clientX + 28 + w > window.innerWidth ? e.clientX - 28 - w : e.clientX + 28;
      const y = Math.min(Math.max(12, e.clientY - h / 2), window.innerHeight - h - 12);
      if (gsapEnabled && motionOn) {
        if (!s.movers) {
          s.movers = {
            x: gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' }),
            r: gsap.quickTo(el, 'rotation', { duration: 0.6, ease: 'power3.out' }),
          };
        }
        const vx = e.clientX - s.x;
        s.movers.x(x);
        s.movers.y(y);
        s.movers.r(gsap.utils.clamp(-7, 7, vx * 0.35));
      } else {
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      s.x = e.clientX;
    };
    const onMove = (e) => place(e);
    return {
      show: (p, e) => {
        const el = previewRef.current;
        if (!el) return;
        state.current.x = e.clientX;
        place(e);
        el.style.opacity = '1';
        window.addEventListener('pointermove', onMove, { passive: true });
        if (!state.current.seen.has(p.id)) {
          state.current.seen.add(p.id);
          posthog?.capture('index_preview_shown', { project_id: p.id });
        }
      },
      hide: () => {
        const el = previewRef.current;
        window.removeEventListener('pointermove', onMove);
        if (el) el.style.opacity = '0';
        state.current.movers?.r(0);
      },
    };
  }, [previewRef, motionOn, posthog]);
};

const Preview = React.forwardRef(({ project }, ref) => {
  const [title] = project ? splitTitle(project.title) : [''];
  return (
    <div className="ix-preview" ref={ref} aria-hidden="true">
      {project && (project.screenshot ? (
        <>
          <img src={project.screenshot} alt="" />
          <span className="pv-cap">{title}</span>
        </>
      ) : (
        <div className="pv-data">
          <span className="pv-cap">
            {project.id}
            <span className="pv-note">no screenshot</span>
          </span>
          <p>{project.evidence || project.highlight}</p>
        </div>
      ))}
    </div>
  );
});
Preview.displayName = 'Preview';

const ProjectIndex = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [cat, setCat] = useState('all');
  /** A skill sent from Skills, or null. Takes over from the category while set. */
  const [skill, setSkill] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);
  const listRef = useRef(null);
  const previewRef = useRef(null);
  const flipState = useRef(null);
  const posthog = usePostHog();

  const preview = usePreview(previewRef, !prefersReducedMotion);
  const previewHandlers = useMemo(
    () => (preview ? {
      show: (p, e) => { setPreviewProject(p); preview.show(p, e); },
      hide: () => preview.hide(),
    } : null),
    [preview]
  );

  const visible = (p) => (skill ? projectUses(p, skill) : cat === 'all' || p.category === cat);
  const shownFlag = flagships.filter(visible);
  const shownOther = others.filter(visible);
  const count = shownFlag.length + shownOther.length;

  const holdPlaces = () => {
    if (gsapEnabled && !prefersReducedMotion && listRef.current) {
      flipState.current = Flip.getState(listRef.current.querySelectorAll('.ix-row'));
    }
  };

  const choose = (next, label) => {
    if (next === cat && !skill) return;
    holdPlaces();
    setSkill(null);
    setCat(next);
    posthog?.capture('index_filtered', { category: label });
  };

  // A skill picked in Skills: show its projects, then bring the reader here,
  // to the status line that says what is showing (focus follows for keyboards).
  const statusRef = useRef(null);
  const arrived = useRef(false);
  useEffect(
    () =>
      onSkillPicked((picked) => {
        holdPlaces();
        setCat('all');
        setSkill(picked);
        arrived.current = true;
      }),
    // holdPlaces reads refs and the motion setting at call time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefersReducedMotion]
  );
  useEffect(() => {
    if (!arrived.current) return;
    arrived.current = false;
    document.getElementById('index')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    statusRef.current?.focus({ preventScroll: true });
  }, [skill, prefersReducedMotion]);

  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || !gsapEnabled || prefersReducedMotion) {
      if (gsapEnabled) ScrollTrigger.refresh();
      return;
    }
    Flip.from(state, {
      duration: 0.5,
      ease: 'power2.inOut',
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.12 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [cat, skill, prefersReducedMotion]);

  return (
    <section className="section index" id="index" aria-labelledby="index-title">
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-tab">{featured.length} featured projects</p>
          <h2 className="sec-title" id="index-title">The full index</h2>
          <p className="lede">Every featured project, flagships first. Filter by category, or point at a project for a closer look.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter projects by category">
          <button type="button" aria-pressed={!skill && cat === 'all'} onClick={() => choose('all', 'All')}>
            All<span className="ct">{featured.length}</span>
          </button>
          {categories.map((c) => (
            <button type="button" key={c} aria-pressed={!skill && cat === c} onClick={() => choose(c, c)}>
              {c}<span className="ct">{featured.filter((p) => p.category === c).length}</span>
            </button>
          ))}
        </div>
        <div className="ix-panel" ref={listRef}>
          <div className="ix-status-row">
            <p className="ix-status" aria-live="polite" tabIndex={-1} ref={statusRef}>
              {skill
                ? `Showing ${count} project${count === 1 ? '' : 's'} that use${count === 1 ? 's' : ''} ${skill}.`
                : cat === 'all'
                  ? `Showing all ${count} projects.`
                  : `Showing ${count} ${cat} project${count === 1 ? '' : 's'}.`}
            </p>
            {skill && (
              <button type="button" className="ix-clear" onClick={() => choose('all', 'All')}>
                Show all projects
              </button>
            )}
          </div>
          {shownFlag.length > 0 && (
            <div className="ix-group">
              <h3 className="ix-group-title">Flagship work</h3>
              <ul className="ix-list">
                {shownFlag.map((p) => <Row key={p.id} project={p} rich cited={skill} />)}
              </ul>
            </div>
          )}
          {shownOther.length > 0 && (
            <div className="ix-group">
              <h3 className="ix-group-title">More projects</h3>
              <ul className="ix-list">
                {shownOther.map((p) => <Row key={p.id} project={p} onPreview={previewHandlers} cited={skill} />)}
              </ul>
            </div>
          )}
        </div>
      </div>
      {preview && <Preview ref={previewRef} project={previewProject} />}
    </section>
  );
};

export default ProjectIndex;
