import React, { useRef } from 'react';
import { workExperiences } from '../../data/experience';
import { CollapseIcon, ExpandIcon } from '../site/icons';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * Where I've worked, newest first, on a dated timeline.
 *
 * Consecutive stints with the same title at the same place are one entry
 * with every period listed inside it, so the page does not read as the same
 * line four times, and no period disappears. Periods that share a `group`
 * (the UWI contract work and the internship) are joined the same way under the
 * group's title, and each one keeps its own title.
 *
 * With motion on, the ink line draws down the timeline as you scroll and each
 * role's dot turns yellow as the line reaches it. With motion off the line is
 * drawn and every dot is lit.
 */

const groupKey = (e) => (e.group ? `group:${e.group.id}` : `role:${e.title}|${e.organization}`);

const groups = workExperiences.reduce((acc, e) => {
  const last = acc[acc.length - 1];
  if (last && last.key === groupKey(e)) last.parts.push(e);
  else acc.push({ key: groupKey(e), id: e.id, title: e.group?.title || e.title, organization: e.organization, parts: [e] });
  return acc;
}, []);

const year = (s) => {
  const m = String(s).match(/\d{4}/g);
  return m ? m[m.length - 1] : s;
};

const Tags = ({ items }) => (
  <ul className="tags" aria-label="Focus">
    {items.map((t) => <li key={t}>{t}</li>)}
  </ul>
);

/** The first `open` points shown, the rest behind a disclosure. */
const Items = ({ list, open }) => {
  const texts = list.map((i) => i.text);
  const shown = texts.slice(0, open);
  const rest = texts.slice(open);
  return (
    <>
      {shown.length > 0 && <ul className="items">{shown.map((t) => <li key={t}>{t}</li>)}</ul>}
      {rest.length > 0 && (
        <details>
          <summary>
            <ExpandIcon className="when-closed" />
            <CollapseIcon className="when-open" />
            {shown.length ? `${rest.length} more` : 'What I did'}
          </summary>
          <ul className="items">{rest.map((t) => <li key={t}>{t}</li>)}</ul>
        </details>
      )}
    </>
  );
};

const Experience = () => {
  const rootRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return undefined;
      const list = rootRef.current.querySelector('.tl');
      const items = Array.from(list.querySelectorAll('.tl-item'));
      let marks = [];
      const measure = () => {
        const h = list.offsetHeight || 1;
        marks = items.map((it) => it.offsetTop / h);
      };
      const mark = (p) => items.forEach((it, k) => it.classList.toggle('passed', p >= marks[k] - 0.0001));
      measure();
      gsap.fromTo(
        '.tl-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: list,
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: 0.4,
            onRefresh: (self) => { measure(); mark(self.progress); },
            onUpdate: (self) => mark(self.progress),
          },
        }
      );
      return () => items.forEach((it) => it.classList.add('passed'));
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <section className="section experience" id="experience" ref={rootRef} aria-labelledby="exp-title">
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-tab">{groups.length} roles, newest first</p>
          <h2 className="sec-title" id="exp-title">Experience</h2>
        </div>
        <div className="tl-wrap">
          <span className="tl-line" aria-hidden="true" />
          <ol className="tl">
            {groups.map((g) => {
              const single = g.parts.length === 1;
              const mixed = g.parts.some((e) => e.title !== g.parts[0].title);
              const when = single ? g.parts[0].period : `${year(g.parts[g.parts.length - 1].period)} to ${year(g.parts[0].period)}`;
              return (
                <li className="tl-item passed" key={g.id}>
                  <p className="tl-when">{when}</p>
                  <span className="tl-dot" aria-hidden="true" />
                  <div className="tl-body">
                    <h3>
                      {g.title}
                      {!single && <span className="n">{g.parts.length} periods</span>}
                    </h3>
                    <p className="org">{g.organization}</p>
                    {single ? (
                      <>
                        <Tags items={g.parts[0].achievements || []} />
                        <Items list={g.parts[0].items || []} open={2} />
                      </>
                    ) : (
                      <ul className="periods">
                        {g.parts.map((e) => (
                          <li key={e.id}>
                            <span className="when">{e.period}</span>
                            {mixed && <span className="role">{e.title}</span>}
                            <Tags items={e.achievements || []} />
                            <Items list={e.items || []} open={0} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Experience;
