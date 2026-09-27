import React, { useEffect, useReducer, useRef } from 'react';
import Exhibit, { Stamp, useDemoUsed } from './Exhibit';

/**
 * Link Tracker's triage loop on six example tabs: every link in the inbox gets
 * a decision - Queue, Reference or Drop - and X marks the oldest queued link
 * done, so the queue shrinks. The keys are the real app's.
 *
 * The inbox is a listbox: arrow keys choose a link, Q, R or D decides. The same
 * decisions are buttons for touch, and every queued link has its own X.
 *
 * State moves through a reducer, so keys pressed faster than React renders are
 * still applied one after another rather than all to the same snapshot.
 */

// Example titles, not anyone's saved links: the demo shows the interaction.
export const EXAMPLE_LINKS = [
  { t: 'Conference talk on retry budgets', d: 'youtube.com' },
  { t: 'PostgreSQL docs: CREATE VIEW', d: 'postgresql.org' },
  { t: 'Blog post on SQLite WAL mode', d: 'example.dev' },
  { t: 'Issue thread about a flaky test', d: 'github.com' },
  { t: 'Recipe someone sent me', d: 'example.com' },
  { t: 'Long read saved for the weekend', d: 'example.org' },
];

const DECISIONS = { q: 'Queue', r: 'Reference', d: 'Drop' };
const MOVES = { ArrowDown: 1, ArrowUp: -1 };

const fresh = () => ({
  inbox: EXAMPLE_LINKS.map((l, id) => ({ id, ...l })),
  queue: [],
  counts: { r: 0, d: 0, done: 0 },
  sel: 0,
  status: 'Six example links waiting.',
});

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const reducer = (s, a) => {
  switch (a.type) {
    case 'select':
      return s.inbox.length ? { ...s, sel: clamp(a.sel, 0, s.inbox.length - 1) } : s;
    case 'move':
      return s.inbox.length ? { ...s, sel: clamp(s.sel + a.by, 0, s.inbox.length - 1) } : s;
    case 'decide': {
      if (!s.inbox.length) return { ...s, status: 'The inbox is empty. Reset to try again.' };
      const x = s.inbox[s.sel];
      const inbox = s.inbox.filter((_, i) => i !== s.sel);
      return {
        inbox,
        sel: Math.min(s.sel, Math.max(inbox.length - 1, 0)),
        queue: a.k === 'q' ? [...s.queue, x] : s.queue,
        counts: a.k === 'q' ? s.counts : { ...s.counts, [a.k]: s.counts[a.k] + 1 },
        status: `"${x.t}" sent to ${DECISIONS[a.k]}.`,
      };
    }
    case 'finish': {
      // No id means the keyboard's X: the oldest queued link.
      const x = a.id === undefined ? s.queue[0] : s.queue.find((q) => q.id === a.id);
      if (!x) return { ...s, status: 'The queue is empty.' };
      const queue = s.queue.filter((q) => q !== x);
      return { ...s, queue, counts: { ...s.counts, done: s.counts.done + 1 }, status: `"${x.t}" done. ${queue.length} left in the queue.` };
    }
    case 'reset':
      return fresh();
    default:
      return s;
  }
};

const TriageDemo = ({ project }) => {
  const used = useDemoUsed('link-tracker');
  const [s, dispatch] = useReducer(reducer, undefined, fresh);
  const listRef = useRef(null);
  const queueRef = useRef(null);
  // After an X, focus moves to the next X in line (or back to the inbox), so a
  // keyboard user is never dropped onto <body> when their button disappears.
  const focusAfterDone = useRef(null);

  useEffect(() => {
    const idx = focusAfterDone.current;
    if (idx === null) return;
    focusAfterDone.current = null;
    const left = queueRef.current?.querySelectorAll('.lt-x') || [];
    const target = left.length ? left[Math.min(idx, left.length - 1)] : listRef.current;
    target?.focus({ preventScroll: true });
  }, [s.queue]);

  const decide = (k) => {
    used();
    dispatch({ type: 'decide', k });
  };

  const finish = (id, focusIndex) => {
    used();
    if (focusIndex !== undefined) focusAfterDone.current = focusIndex;
    dispatch({ type: 'finish', id });
  };

  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target === listRef.current && (e.key in MOVES || e.key === 'Home' || e.key === 'End')) {
      e.preventDefault();
      if (e.key in MOVES) dispatch({ type: 'move', by: MOVES[e.key] });
      else dispatch({ type: 'select', sel: e.key === 'Home' ? 0 : Infinity });
      return;
    }
    const k = e.key.toLowerCase();
    if (k in DECISIONS) {
      e.preventDefault();
      decide(k);
    } else if (k === 'x') {
      e.preventDefault();
      finish(undefined, queueRef.current?.contains(document.activeElement) ? 0 : undefined);
    }
  };

  const counters = [
    ['Inbox', s.inbox.length],
    ['Queue', s.queue.length],
    ['Reference', s.counts.r],
    ['Drop', s.counts.d],
    ['Done', s.counts.done],
  ];
  const active = s.inbox[s.sel];

  return (
    <Exhibit
      id="link-tracker"
      letter="C"
      project={project}
      kicker="Keyboard triage"
      title="Link Tracker triage"
      note={
        <>
          Six example tabs, not real data. Choose one, then press <kbd>Q</kbd> to queue it, <kbd>R</kbd> to keep it for
          reference or <kbd>D</kbd> to drop it. <kbd>X</kbd> marks the oldest queued link done.
        </>
      }
      stamp={!s.inbox.length ? <Stamp tone="ok">Inbox zero</Stamp> : null}
      status={s.status}
      actions={
        <button type="button" className="btn btn-sm" onClick={() => dispatch({ type: 'reset' })}>
          Reset
        </button>
      }
    >
      {/* Shortcuts work wherever focus is inside the demo; the controls are
          ordinary buttons and a listbox, so the listener only adds keys. */}
      <div className="lt" onKeyDown={onKeyDown}>
        <ul className="lt-counters" aria-label="Counts">
          {counters.map(([label, n]) => (
            <li key={label}>
              {label}
              {/* Keyed on the value, so a change remounts it and it bumps. */}
              <b key={n}>{n}</b>
            </li>
          ))}
        </ul>
        <ul
          className="lt-list"
          ref={listRef}
          role="listbox"
          tabIndex={0}
          aria-label="Example inbox. Arrow keys choose a link; Q, R or D decides."
          aria-activedescendant={active ? `lt-o-${active.id}` : undefined}
        >
          {s.inbox.length ? (
            s.inbox.map((x, i) => (
              <li
                key={x.id}
                id={`lt-o-${x.id}`}
                role="option"
                aria-selected={i === s.sel}
                onClick={() => {
                  dispatch({ type: 'select', sel: i });
                  listRef.current?.focus({ preventScroll: true });
                }}
              >
                <span className="lt-t">{x.t}</span>
                <span className="lt-d">{x.d}</span>
              </li>
            ))
          ) : (
            <li className="lt-empty" role="option" aria-disabled="true" aria-selected="false">
              Inbox empty. Every link has a decision.
            </li>
          )}
        </ul>
        <div className="lt-side">
          <div className="lt-actions" role="group" aria-label="Decide">
            {Object.entries(DECISIONS).map(([k, label]) => (
              <button key={k} type="button" className="btn btn-sm" onClick={() => decide(k)}>
                <kbd aria-hidden="true">{k.toUpperCase()}</kbd>
                {label}
              </button>
            ))}
          </div>
          <div className="lt-queue">
            <p className="lt-qhead" id="lt-qhead">
              Queue, oldest first
            </p>
            <ol className="lt-qlist" ref={queueRef} aria-labelledby="lt-qhead">
              {s.queue.length ? (
                s.queue.map((x, i) => (
                  <li key={x.id}>
                    <span>{x.t}</span>
                    <button type="button" className="lt-x" aria-label={`Mark done: ${x.t}`} onClick={() => finish(x.id, i)}>
                      X
                    </button>
                  </li>
                ))
              ) : (
                <li className="lt-qempty">Nothing queued.</li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </Exhibit>
  );
};

export default TriageDemo;
