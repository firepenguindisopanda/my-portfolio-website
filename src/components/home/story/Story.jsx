import React, { useMemo, useRef } from 'react';
import { usePostHog } from '@posthog/react';
import { profile } from '../../../data/profile';
import { projects } from '../../../data/projects';
import * as worked from '../../../data/workedExample';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, ScrollTrigger, useGSAP } from '../../../utilities/gsapSetup';
import { CaseStudyLink, OutLinks } from '../links';
import { buildChapters, money } from './storyFigures';

/**
 * Four cases: the work told as stories where messy input becomes checked
 * output, on a night stage.
 *
 * With motion on, on a screen big enough to hold a stage, each chapter pins
 * for 150% of the viewport while its figure plays against the scroll - and
 * reverses when you scroll back. A rail under the header tracks which case you
 * are in. On phones and short screens nothing pins: each figure plays once as
 * it scrolls in. With motion off every figure is simply drawn in its final,
 * checked state and the step lists read as done.
 *
 * Chapter text is ordinary React. The figures are SVG strings (see
 * storyFigures.js) and are reset to fresh markup whenever the scene is built,
 * so a timeline that wrote text into them (the counters) never leaves a stale
 * number behind after motion is switched off.
 */

const PIN = '(min-width: 900px) and (min-height: 720px)';
const FLOW = '(max-width: 899px), (max-height: 719px)';

const FraudTable = ({ fraud }) => (
  <div className="viz-scroll">
    <table className="viz-table">
      <caption>{fraud.title}. Modelled loss by dataset.</caption>
      <thead>
        <tr>
          <th scope="col">Dataset</th>
          <th scope="col">No model</th>
          <th scope="col">At threshold</th>
          <th scope="col">Threshold</th>
          <th scope="col">Change</th>
        </tr>
      </thead>
      <tbody>
        {fraud.datasets.map((d) => (
          <tr key={d.id}>
            <th scope="row">{d.label}</th>
            <td>{money(d.doingNothing)}</td>
            <td className="now">{money(d.atThreshold)}</td>
            <td>{d.threshold}</td>
            <td>&minus;{d.reductionPct}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Story = () => {
  const rootRef = useRef(null);
  const posthog = usePostHog();
  const prefersReducedMotion = usePrefersReducedMotion();
  const linkTracker = projects.find((p) => p.id === 'link-tracker');
  const chapters = useMemo(
    () => buildChapters({ projects, worked, linkTrackerImage: linkTracker.screenshot }),
    [linkTracker.screenshot]
  );
  const figureMarkup = useMemo(() => chapters.map((ch) => ch.figure()), [chapters]);
  const seen = useRef(new Set());

  useGSAP(
    () => {
      const root = rootRef.current;
      const html = document.documentElement;
      const chapterEls = Array.from(root.querySelectorAll('.chapter'));
      const figs = Array.from(root.querySelectorAll('.viz'));
      const railLinks = Array.from(root.querySelectorAll('.rail a'));
      const railFills = Array.from(root.querySelectorAll('.rail .fill'));

      // Fresh figure markup for every build - see the note at the top.
      figs.forEach((f, i) => { f.innerHTML = figureMarkup[i]; });
      const shot = root.querySelector('.c4-shot img');
      shot?.addEventListener('error', () => { shot.parentNode.style.display = 'none'; });

      const stepIdx = chapters.map(() => -1);
      const setStep = (i, p) => {
        const [b0, b1] = chapters[i].bounds;
        const idx = p < b0 ? 0 : p < b1 ? 1 : 2;
        if (stepIdx[i] === idx) return;
        stepIdx[i] = idx;
        chapterEls[i].querySelectorAll('.steps li').forEach((li, k) => {
          li.classList.toggle('is-active', k === idx);
          li.classList.toggle('is-done', k < idx);
        });
      };
      const stepsDone = () => {
        chapterEls.forEach((el) => el.querySelectorAll('.steps li').forEach((li) => {
          li.classList.remove('is-active');
          li.classList.add('is-done');
        }));
      };
      const railFill = (i, p) => {
        if (railFills[i]) railFills[i].style.transform = `scaleX(${Math.max(0, Math.min(1, p)).toFixed(3)})`;
      };
      const railActive = (i) => {
        railLinks.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
        const id = chapters[i].project.id;
        if (!seen.current.has(id)) {
          seen.current.add(id);
          posthog?.capture('story_chapter_viewed', { project_id: id, chapter: i + 1 });
        }
      };

      if (!gsapEnabled) {
        stepsDone();
        return undefined;
      }

      const animate = !prefersReducedMotion;
      const mm = gsap.matchMedia();
      mm.add({ pin: PIN, flow: FLOW }, (ctx) => {
        const pin = Boolean(ctx.conditions.pin) && animate;
        if (pin) html.classList.add('pin-mode');

        if (animate) {
          chapterEls.forEach((ch, i) => {
            const tl = chapters[i].timeline(figs[i]);
            if (!tl) return;
            tl.eventCallback('onUpdate', () => setStep(i, tl.progress()));
            setStep(i, 0);
            if (pin) {
              ScrollTrigger.create({
                trigger: ch,
                start: 'top top',
                end: '+=150%',
                pin: ch.querySelector('.stage'),
                scrub: 0.6,
                animation: tl,
                anticipatePin: 1,
                onUpdate: (self) => railFill(i, self.progress),
              });
            } else {
              tl.timeScale(1 / 3.2);
              ScrollTrigger.create({ trigger: figs[i], start: 'top 78%', once: true, onEnter: () => tl.play() });
            }
          });
        } else {
          stepsDone();
        }

        // Created after the pins, so their positions include pin spacing.
        chapterEls.forEach((ch, i) => {
          ScrollTrigger.create({
            trigger: ch,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => { if (self.isActive) railActive(i); },
            ...(pin ? {} : { onUpdate: (self) => railFill(i, self.progress) }),
          });
        });
        ScrollTrigger.create({
          trigger: root,
          start: 'top 60px',
          end: 'bottom 60px',
          onToggle: (self) => html.classList.toggle('rail-on', self.isActive),
        });

        return () => {
          html.classList.remove('pin-mode');
          html.classList.remove('rail-on');
        };
      });

      // Web fonts change line heights, and with them every pin's start.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion, figureMarkup], revertOnUpdate: true }
  );

  return (
    <section className="story on-night" id="story" ref={rootRef} aria-labelledby="story-title">
      <nav className="rail" aria-label="Case chapters">
        <ol>
          {chapters.map((ch, i) => (
            <li key={ch.project.id}>
              <a href={`#case-${ch.project.id}`}>
                <span>{i + 1} {ch.short}</span>
                <span className="bar" aria-hidden="true"><span className="fill" /></span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="wrap story-intro">
        <p className="sec-tab">The work, told as four cases</p>
        <h2 className="sec-title" id="story-title">Four cases</h2>
        <p className="lede">
          Each case starts with messy input and ends with output that has been checked. Scroll through them, or{' '}
          <a href="#index">jump straight to the full index</a>.
        </p>
        <p className="lede-2">{profile.proof}</p>
      </div>

      {chapters.map((ch, i) => {
        const p = ch.project;
        const id = `case-${p.id}`;
        return (
          <article className="chapter" id={id} key={p.id} aria-labelledby={`${id}-title`}>
            <div className="stage">
              <div className="chapter-text">
                <p className="ch-kicker">
                  <span>Case {i + 1} of {chapters.length}</span>
                  <span className="file">{p.id}</span>
                  <span>{p.category}</span>
                </p>
                <h3 className="ch-title" id={`${id}-title`}>{ch.title}</h3>
                {ch.body.map((b) => <p className="ch-body" key={b}>{b}</p>)}
                {ch.fraud && (
                  <>
                    <p className="ch-model">{ch.fraud.costModel}</p>
                    <p className="ch-source">
                      Source: {ch.fraud.source.artifact} at {ch.fraud.source.gitSha}, {ch.fraud.source.generated}
                    </p>
                  </>
                )}
                <ol className="steps" aria-label="What the figure shows">
                  {ch.steps.map((s, k) => (
                    <li key={s}><span className="n" aria-hidden="true">{k + 1}</span>{s}</li>
                  ))}
                </ol>
                <ul className="tech" aria-label="Tech">
                  {(p.primaryTech || []).map((t) => <li key={t}>{t}</li>)}
                </ul>
                <p className="ch-links">
                  <CaseStudyLink className="primary" project={p} source="story">Read the case study</CaseStudyLink>
                  <OutLinks project={p} source="story" />
                </p>
              </div>
              <div className="chapter-visual">
                <figure
                  className={`viz viz-${p.id}`}
                  // Our own data, escaped in storyFigures.js - never user input.
                  dangerouslySetInnerHTML={{ __html: figureMarkup[i] }}
                />
                {ch.fraud && <FraudTable fraud={ch.fraud} />}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default Story;
