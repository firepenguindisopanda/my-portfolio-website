import React, { useRef } from 'react';
import { COLORS, FONTS } from '../../utilities/themeConfig';
import { ShiftIcon } from '../site/icons';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * Link Tracker, drawn rather than captured.
 *
 * The tool's work happens between two windows - a browser full of tabs and a
 * triage app - so no single screenshot shows what it does. This does: a window
 * of hoarded tabs, one keystroke, every tab landing in the Inbox lane it gets
 * sorted from, and then the thing the project exists for - the Queue getting
 * shorter as links are finished.
 *
 * The lane names, the keystroke and the three decisions are the real ones
 * (README: Q / R / D, Alt+Shift+W). The tab and lane counts are illustrative,
 * which is why the whole figure is labelled as an illustration for screen
 * readers rather than read out as data.
 *
 * Plays only while on screen, and not at all under prefers-reduced-motion,
 * where the first frame - tabs on the left, empty lanes on the right - is the
 * diagram on its own.
 */

// Drawn small on purpose. The figure is shown at card width - 300 to 400px -
// and a viewBox this size keeps its 8px labels at roughly 9-10px on screen,
// where a 640-wide drawing shrank them to an unreadable 4px.
const W = 320;
const H = 180;

// The browser window's grid of tabs.
const COLS = 4;
const TAB = { w: 22, h: 12, gap: 5 };
const GRID = { x: 20.5, y: 64 };

// Lanes on the right, and the decision each tab gets.
const LANES = [
  { key: 'Q', label: 'Queue', y: 62 },
  { key: 'R', label: 'Reference', y: 94 },
  { key: 'D', label: 'Drop', y: 126 },
];
const SLOT = { x: 194, w: 8, h: 8, gap: 3 };
// 16 tabs: 6 queued, 5 kept for reference, 5 dropped - interleaved, the way a
// real window mixes things worth doing with things already done with.
const DECISIONS = 'QRDQRQDRQDRQDRQD'.split('');
/** How many queued links get finished before the loop starts over. */
const FINISHED = 4;

const tabs = DECISIONS.map((lane, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const slot = DECISIONS.slice(0, i).filter((d) => d === lane).length;
  const laneIndex = LANES.findIndex((l) => l.key === lane);
  return {
    lane,
    x: GRID.x + col * (TAB.w + TAB.gap),
    y: GRID.y + row * (TAB.h + TAB.gap),
    tx: SLOT.x + slot * (SLOT.w + SLOT.gap),
    ty: LANES[laneIndex].y + 3,
    slot,
  };
});

/** `#RRGGBB` at an opacity, as rgba() - what MUI's alpha() returned for these. */
const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Casefile's tokens, read from the plain theme object rather than through
// MUI's ThemeProvider: this figure sits on case-study and deep-dive pages,
// which carry no MUI.
const accent = COLORS.ink;
const ink = COLORS.ink;
const muted = COLORS.graphite;
const line = COLORS.rule;
const paper = COLORS.paperHi;
const mono = FONTS.mono;
const laneFill = { Q: accent, R: muted, D: alpha(muted, 0.35) };

const LinkTrackerVisual = ({ ratio = '16 / 9' }) => {
  const rootRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;

      const root = rootRef.current;
      const counts = { Q: 0, R: 0, D: 0 };
      const setCount = (lane, n) => {
        counts[lane] = n;
        const el = root.querySelector(`[data-count="${lane}"]`);
        if (el) el.textContent = String(n);
      };
      const reset = () => LANES.forEach((l) => setCount(l.key, 0));

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.2,
        defaults: { ease: 'power2.inOut' },
        onRepeat: reset,
        // Runs only while the figure is on screen; a card grid scrolled past
        // should cost nothing.
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' },
      });

      tl.call(reset, null, 0)
        .fromTo('.lt-tab', { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.012 }, 0)
        // The keystroke: the key goes down and lights, the arrow runs.
        .to('.lt-key', { y: 1.5, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.9)
        .to('.lt-key-face', { fill: alpha(accent, 0.22), stroke: accent, duration: 0.12 }, 0.9)
        .fromTo('.lt-arrow', { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, 0.95);

      // Every tab leaves the window for its lane, in reading order.
      root.querySelectorAll('.lt-tab').forEach((el, i) => {
        const t = tabs[i];
        const at = 1.15 + i * 0.055;
        tl.to(
          el,
          { attr: { x: t.tx, y: t.ty, width: SLOT.w, height: SLOT.h }, fill: laneFill[t.lane], duration: 0.62 },
          at
        ).call(() => setCount(t.lane, counts[t.lane] + 1), null, at + 0.62);
      });

      tl.to('.lt-key-face', { fill: paper, stroke: line, duration: 0.3 }, '<');

      // The point of the tool: the queue shrinks. Finished links leave the
      // lane one at a time, from the front, and the count follows them down.
      const queued = root.querySelectorAll('.lt-tab[data-lane="Q"]');
      const finishAt = tl.duration() + 0.5;
      Array.from(queued)
        .slice(0, FINISHED)
        .forEach((el, i) => {
          const at = finishAt + i * 0.32;
          tl.to(el, { attr: { y: '-=7' }, opacity: 0, duration: 0.3, ease: 'power2.in' }, at).call(
            () => setCount('Q', counts.Q - 1),
            null,
            at + 0.3
          );
        });
      tl.fromTo('.lt-done', { opacity: 0 }, { opacity: 1, duration: 0.3 }, finishAt)
        .to('.lt-done', { opacity: 0, duration: 0.3 }, '+=1.4')
        .to('.lt-tab', { opacity: 0, duration: 0.35 }, '<')
        .to('.lt-arrow', { strokeDashoffset: 40, duration: 0.2 }, '<');
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div
      ref={rootRef}
      style={{
        aspectRatio: ratio,
        backgroundColor: alpha(accent, 0.05),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Illustration of Link Tracker: a browser window of tabs is saved with one keystroke, each link is sorted into Queue, Reference or Drop, and the queue gets shorter as links are finished."
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g fontFamily={mono} fontSize="9.5" letterSpacing="0.05em">
          {/* Browser window */}
          <text x="12" y="20" fill={muted}>BROWSER</text>
          <rect x="12" y="28" width="120" height="124" rx="4" fill={paper} stroke={line} />
          <line x1="12" y1="40" x2="132" y2="40" stroke={line} />
          {[19, 25, 31].map((cx) => (
            <circle key={cx} cx={cx} cy="34" r="1.8" fill={alpha(muted, 0.5)} />
          ))}
          <text x="126" y="37" textAnchor="end" fill={muted} fontSize="8">100+ TABS</text>

          {/* The keystroke */}
          <path
            className="lt-arrow"
            d="M 140 80 L 177 80"
            stroke={accent}
            strokeWidth="1.5"
            strokeDasharray="40"
            strokeDashoffset="0"
            fill="none"
          />
          <path d="M 173 76.5 L 178 80 L 173 83.5" stroke={accent} strokeWidth="1.5" fill="none" />
          <g className="lt-key">
            <rect className="lt-key-face" x="137" y="90" width="44" height="17" rx="3" fill={paper} stroke={line} />
            <text x="154.5" y="101.5" textAnchor="end" fill={ink} fontSize="8.5" letterSpacing="0.02em">ALT</text>
            <ShiftIcon x="155" y="93.5" size={9} color={ink} strokeWidth={1.6} />
            <text x="164.5" y="101.5" fill={ink} fontSize="8.5">W</text>
          </g>
          <text x="159" y="118" textAnchor="middle" fill={muted} fontSize="7.5">SAVE+CLOSE</text>

          {/* Link Tracker's lanes */}
          <text x="186" y="20" fill={muted}>LINK TRACKER</text>
          <rect x="186" y="28" width="122" height="124" rx="4" fill={paper} stroke={line} />
          <line x1="186" y1="40" x2="308" y2="40" stroke={line} />
          {LANES.map((lane) => {
            const isQueue = lane.key === 'Q';
            return (
              <g key={lane.key}>
                <text x="194" y={lane.y - 1} fill={isQueue ? accent : ink} fontSize="9">
                  {`${lane.key} ${lane.label.toUpperCase()}`}
                </text>
                <line x1="194" y1={lane.y + 14} x2="300" y2={lane.y + 14} stroke={line} />
                <text
                  data-count={lane.key}
                  x="300"
                  y={lane.y - 1}
                  textAnchor="end"
                  fill={isQueue ? accent : muted}
                  fontSize="9.5"
                >
                  0
                </text>
              </g>
            );
          })}
          <text className="lt-done" x="308" y="168" textAnchor="end" fill={accent} fontSize="8" opacity="0">
            X = DONE, THE QUEUE SHRINKS
          </text>

          {/* The tabs themselves - drawn last so they fly over both windows. */}
          {tabs.map((t, i) => (
            <rect
              key={i}
              className="lt-tab"
              data-lane={t.lane}
              x={t.x}
              y={t.y}
              width={TAB.w}
              height={TAB.h}
              rx="2"
              fill={alpha(muted, 0.45)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default LinkTrackerVisual;
