import React, { useEffect, useMemo, useRef } from 'react';
import { usePostHog } from '@posthog/react';
import { profile } from '../../../data/profile';
import { projects } from '../../../data/projects';
import * as worked from '../../../data/workedExample';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { captureReadingPlace, registerMotionAnchor, restoreReadingPlace } from '../../../motion/Motion';
import { gsap, gsapEnabled, ScrollTrigger, useGSAP } from '../../../utilities/gsapSetup';
import { CaseStudyLink, OutLinks } from '../links';
import { buildChapters, money } from './storyFigures';

/**
 * Four cases: the work told as stories where messy input becomes checked
 * output, on a night stage.
 *
 * With motion on, on a screen big enough to hold a stage, the four cases share
 * one stage that pins in place: the first case's figure plays against the
 * scroll, holds on its checked result, and then the next case arrives in the
 * same place - and it all reverses when you scroll back. One master timeline
 * drives it, a viewport and a half of scroll per case. A rail under the header
 * tracks which case you are in. On phones and very short windows nothing pins:
 * each figure plays once as it scrolls in. With motion off every figure is
 * simply drawn in its final, checked state and the step lists read as done.
 *
 * On the pinned stage the cases that are not showing stay in the page for
 * screen readers but take no clicks, and tabbing into one scrolls the story to
 * it. Switching motion on or off mid-story keeps the reader on the same case
 * (see registerMotionAnchor in motion/Motion.jsx).
 *
 * Chapter text is ordinary React. The figures are SVG strings (see
 * storyFigures.js) and are reset to fresh markup whenever the scene is built,
 * so a timeline that wrote text into them (the counters) never leaves a stale
 * number behind after motion is switched off.
 */

// 600px tall is a laptop browser window with its toolbars; below that the
// stage cannot hold a case's text beside its figure (casefile.css compacts
// the stage from 760px down).
const PIN = '(min-width: 900px) and (min-height: 600px)';
const FLOW = '(max-width: 899px), (max-height: 599px)';
/** Scroll per case on the pinned stage, in viewport heights. */
const SEG = 1.5;
/** The handover between two cases and the pause on a finished figure, in the units of a figure timeline (1). */
const HANDOVER = 0.36;
const HOLD = 0.2;
/** Header plus chapter rail: where a case's top should land when scrolled to in flow. */
const TOP_OFFSET = 104;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

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
  // What the current build can do: where each case is, and which one is being
  // read. Rebuilt with the scene; read by the rail, focus handling and the
  // Motion switch.
  const stage = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const html = document.documentElement;
      const wrap = root.querySelector('.chapters');
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
        if (railFills[i]) railFills[i].style.transform = `scaleX(${clamp01(p).toFixed(3)})`;
      };
      let railIdx = -1;
      const railActive = (i) => {
        if (i === railIdx) return;
        railIdx = i;
        railLinks.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
        const id = chapters[i].project.id;
        if (!seen.current.has(id)) {
          seen.current.add(id);
          posthog?.capture('story_chapter_viewed', { project_id: id, chapter: i + 1 });
        }
      };

      if (!gsapEnabled) {
        stepsDone();
        stage.current = null;
        return undefined;
      }

      /** In flow the cases are stacked: the one crossing the reading line is current. */
      const flowStage = {
        pinned: false,
        scrollFor: (i) => chapterEls[i].getBoundingClientRect().top + window.scrollY - TOP_OFFSET,
        where: () => {
          const line = window.innerHeight * 0.45;
          const i = chapterEls.findIndex((el) => {
            const r = el.getBoundingClientRect();
            return r.top <= line && r.bottom > line;
          });
          return i < 0 ? null : { chapter: i, progress: 0 };
        },
      };

      const animate = !prefersReducedMotion;
      const mm = gsap.matchMedia();
      mm.add({ pin: PIN, flow: FLOW }, (ctx) => {
        const pin = Boolean(ctx.conditions.pin) && animate;

        if (pin) {
          html.classList.add('pin-mode');
          const master = gsap.timeline({ defaults: { ease: 'none' } });
          const starts = []; // when case i begins to arrive
          const figAt = []; // when its figure starts to play
          const figLen = [];
          chapterEls.forEach((ch, i) => {
            starts.push(master.duration());
            // The handover is a stretch of the timeline; stage() draws it.
            if (i > 0) master.to({}, { duration: HANDOVER });
            figAt.push(master.duration());
            const tl = chapters[i].timeline(figs[i]);
            if (tl) {
              tl.eventCallback('onUpdate', () => setStep(i, tl.progress()));
              setStep(i, 0);
              master.add(tl.paused(false), master.duration());
            }
            figLen.push(Math.max(master.duration() - figAt[i], 0.001));
            master.to({}, { duration: HOLD });
          });
          const total = master.duration();
          const ends = [...starts.slice(1), total];

          /*
           * The handover, in place: the last case lifts away in the first half,
           * the next one settles in during the second, so two cases' text is
           * never on the stage at once. Drawn straight from the timeline's time rather than
           * tweened, so the stage never owns a style it cannot hand back: the
           * cleanup below removes exactly these, and turning motion off
           * mid-case leaves every case visible in the flow.
           */
          const ease = gsap.parseEase('power1.inOut');
          const parts = chapterEls.map((el) => [el, el.querySelector('.chapter-text'), el.querySelector('.chapter-visual')]);
          const half = HANDOVER / 2;
          const stageAt = (t) => {
            parts.forEach(([el, text, visual], i) => {
              const arrive = i === 0 ? 1 : ease(clamp01((t - starts[i] - half) / half));
              const leave = i === parts.length - 1 ? 0 : ease(clamp01((t - starts[i + 1]) / half));
              el.style.opacity = String(Math.min(arrive, 1 - leave));
              text.style.transform = `translateY(${(36 * (1 - arrive) - 36 * leave).toFixed(1)}px)`;
              visual.style.transform = `translateY(${(20 * (1 - arrive) - 20 * leave).toFixed(1)}px)`;
            });
          };

          let current = -1;
          const show = (i) => {
            if (i === current) return;
            current = i;
            chapterEls.forEach((el, k) => el.classList.toggle('is-current', k === i));
            railActive(i);
          };
          /** Case i counts as current once its handover is half done. */
          const caseAt = (t) => {
            let i = 0;
            starts.forEach((s, k) => { if (k > 0 && t >= s + HANDOVER / 2) i = k; });
            return i;
          };
          const sync = () => {
            const t = master.time();
            stageAt(t);
            show(caseAt(t));
            starts.forEach((s, i) => railFill(i, (t - s) / (ends[i] - s)));
          };
          master.eventCallback('onUpdate', sync);
          stageAt(0);
          show(0);

          const trigger = ScrollTrigger.create({
            trigger: wrap,
            start: 'top top',
            end: () => `+=${Math.round(window.innerHeight * SEG * chapterEls.length)}`,
            pin: wrap,
            scrub: 0.6,
            animation: master,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          });

          stage.current = {
            pinned: true,
            scrollFor: (i, p = 0) => trigger.start + ((figAt[i] + clamp01(p) * figLen[i]) / total) * (trigger.end - trigger.start),
            where: () => {
              // From the scroll position, not the scrubbed timeline, which lags it.
              const y = window.scrollY;
              if (y < trigger.start - window.innerHeight * 0.3 || y > trigger.end) return null;
              const t = trigger.progress * total;
              const i = caseAt(t);
              return { chapter: i, progress: clamp01((t - figAt[i]) / figLen[i]) };
            },
          };
        } else {
          if (animate) {
            chapterEls.forEach((ch, i) => {
              const tl = chapters[i].timeline(figs[i]);
              if (!tl) return;
              tl.eventCallback('onUpdate', () => setStep(i, tl.progress()));
              setStep(i, 0);
              tl.timeScale(1 / 3.2);
              ScrollTrigger.create({ trigger: figs[i], start: 'top 78%', once: true, onEnter: () => tl.play() });
            });
          } else {
            stepsDone();
          }
          chapterEls.forEach((ch, i) => {
            ScrollTrigger.create({
              trigger: ch,
              start: 'top 55%',
              end: 'bottom 55%',
              onToggle: (self) => { if (self.isActive) railActive(i); },
              onUpdate: (self) => railFill(i, self.progress),
            });
          });
          stage.current = flowStage;
        }

        ScrollTrigger.create({
          trigger: root,
          start: 'top 60px',
          end: 'bottom 60px',
          onToggle: (self) => html.classList.toggle('rail-on', self.isActive),
        });

        return () => {
          html.classList.remove('pin-mode');
          html.classList.remove('rail-on');
          chapterEls.forEach((el) => {
            el.classList.remove('is-current');
            el.style.removeProperty('opacity');
            el.querySelector('.chapter-text').style.removeProperty('transform');
            el.querySelector('.chapter-visual').style.removeProperty('transform');
          });
          railFills.forEach((f) => f.style.removeProperty('transform'));
          railLinks.forEach((a) => a.removeAttribute('aria-current'));
          railIdx = -1;
        };
      });

      // Web fonts change line heights, and a rebuild (the Motion switch) adds
      // or removes the pinned stretch, moving every trigger below it.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(raf);
        mm.revert();
        stage.current = null;
      };
    },
    { scope: rootRef, dependencies: [prefersReducedMotion, figureMarkup], revertOnUpdate: true }
  );

  // The Motion switch asks where the reader is before it flips, and puts them
  // back on the same case after the scene is rebuilt the other way.
  useEffect(
    () =>
      registerMotionAnchor(() => {
        const place = stage.current?.where();
        if (!place) return null;
        return {
          restore: () => {
            const next = stage.current;
            if (!next) return;
            ScrollTrigger.refresh();
            window.scrollTo({ top: Math.max(0, next.scrollFor(place.chapter, place.progress)), behavior: 'instant' });
            ScrollTrigger.update();
          },
        };
      }),
    []
  );

  /*
   * Resizing the window across the pinning size (PIN) makes GSAP rebuild the
   * stage, and its own scroll restore can leave the page at the top. So the
   * reader's place is noted whenever scrolling settles, and put back once the
   * rebuild is done - the same case in the story, the same section anywhere
   * else on the page.
   */
  useEffect(() => {
    if (!gsapEnabled) return undefined;
    let place = null;
    const note = () => {
      if (!ScrollTrigger.isRefreshing) place = captureReadingPlace();
    };
    const putBack = () => {
      const p = place;
      if (p) requestAnimationFrame(() => restoreReadingPlace(p));
    };
    note();
    ScrollTrigger.addEventListener('scrollEnd', note);
    gsap.addEventListener('matchMedia', putBack);
    return () => {
      ScrollTrigger.removeEventListener('scrollEnd', note);
      gsap.removeEventListener('matchMedia', putBack);
    };
  }, []);

  /** Rail links and focus both go to a case by scrolling to it; on the pinned stage there is no other way there. */
  const goTo = (i, behavior) => {
    const s = stage.current;
    if (!s) return false;
    window.scrollTo({ top: Math.max(0, s.scrollFor(i, 0)), behavior });
    return true;
  };
  const onRailClick = (i) => (e) => {
    if (stage.current?.pinned && goTo(i, 'smooth')) e.preventDefault();
  };
  const onChapterFocus = (i) => (e) => {
    const s = stage.current;
    if (!s?.pinned || e.currentTarget.classList.contains('is-current')) return;
    goTo(i, 'instant');
  };

  return (
    <section className="story on-night" id="story" ref={rootRef} aria-labelledby="story-title">
      <nav className="rail" aria-label="Case chapters">
        <ol>
          {chapters.map((ch, i) => (
            <li key={ch.project.id}>
              <a href={`#case-${ch.project.id}`} onClick={onRailClick(i)}>
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

      <div className="chapters">
        {chapters.map((ch, i) => {
          const p = ch.project;
          const id = `case-${p.id}`;
          return (
            <article className="chapter" id={id} key={p.id} aria-labelledby={`${id}-title`} onFocus={onChapterFocus(i)}>
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
      </div>
    </section>
  );
};

export default Story;
