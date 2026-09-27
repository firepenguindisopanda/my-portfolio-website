import React, { useRef, useState } from 'react';
import Exhibit, { Stamp, useDemoUsed } from './Exhibit';

/**
 * The timetable builder's drag, on four example classes: drag a block to
 * another day or hour and it snaps to the grid; put two in the same slot and
 * both are marked as a clash, as the real builder does.
 *
 * Each block is a button, so arrow keys move a focused block a day or an hour
 * at a time. Pointer events cover mouse, pen and touch alike; blocks set
 * `touch-action: none` so dragging one on a phone does not scroll the page.
 */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const H0 = 8;
const H1 = 16;

// Example classes for the interaction, not a real timetable.
export const EXAMPLE_CLASSES = [
  { id: 'lec', label: 'Lecture', short: 'Lec', day: 0, start: 9, len: 2 },
  { id: 'lab', label: 'Lab', short: 'Lab', day: 1, start: 13, len: 2 },
  { id: 'tut', label: 'Tutorial', short: 'Tut', day: 2, start: 10, len: 1 },
  { id: 'sem', label: 'Seminar', short: 'Sem', day: 3, start: 14, len: 1 },
];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const hour = (h) => (h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`);
const range = (b) => `${hour(b.start)}-${hour(b.start + b.len)}`;
const rowOf = (b) => `${b.start - H0 + 2} / span ${b.len}`;

export const findClashes = (blocks) => {
  const pairs = [];
  blocks.forEach((a, i) => {
    blocks.slice(i + 1).forEach((c) => {
      if (a.day === c.day && a.start < c.start + c.len && c.start < a.start + a.len) pairs.push([a, c]);
    });
  });
  return pairs;
};

const TimetableDemo = ({ project }) => {
  const used = useDemoUsed('timetable');
  const [blocks, setBlocks] = useState(EXAMPLE_CLASSES);
  const [movedId, setMovedId] = useState(null);
  const [drag, setDrag] = useState(null);
  const gridRef = useRef(null);
  // Pointer bookkeeping that should not re-render: where the drag began and
  // how big a day column and an hour row are right now.
  const pointer = useRef(null);

  const clashes = findClashes(blocks);
  const clashing = new Set(clashes.flat().map((b) => b.id));
  const moved = blocks.find((b) => b.id === movedId);

  let status = 'No clashes. Try moving Tutorial to Monday 10am.';
  if (clashes.length) {
    const [a, c] = clashes[0];
    status = `Clash: ${a.label} and ${c.label} overlap on ${DAY_NAMES[a.day]}.`;
  } else if (moved) {
    status = `${moved.label} now ${DAYS[moved.day]} ${range(moved)}. No clashes.`;
  }

  // Moves work from the latest blocks, so arrow presses that land before a
  // re-render each count. `to` is where a drag let go; `by` is a key's step.
  const move = (id, { to, by }) => {
    used();
    setBlocks((all) =>
      all.map((b) => {
        if (b.id !== id) return b;
        const day = to ? to.day : b.day + by[0];
        const start = to ? to.start : b.start + by[1];
        return { ...b, day: clamp(day, 0, 4), start: clamp(start, H0, H1 - b.len) };
      })
    );
    setMovedId(id);
  };

  const onPointerDown = (e, b) => {
    if (pointer.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const slots = gridRef.current.querySelectorAll('.tt-slot');
    const [r0, r1, r5] = [slots[0], slots[1], slots[5]].map((el) => el.getBoundingClientRect());
    pointer.current = {
      id: b.id,
      pointerId: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      colW: r1.left - r0.left || 1,
      rowH: r5.top - r0.top || 1,
      b,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Capture is a nicety: without it the drag still works while the pointer stays on the grid.
    }
  };

  const onPointerMove = (e) => {
    const p = pointer.current;
    if (!p || e.pointerId !== p.pointerId) return;
    const dx = e.clientX - p.sx;
    const dy = e.clientY - p.sy;
    // A few pixels of slack, so a tap to focus is not a drag.
    if (!p.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    p.moved = true;
    p.day = clamp(p.b.day + Math.round(dx / p.colW), 0, 4);
    p.start = clamp(p.b.start + Math.round(dy / p.rowH), H0, H1 - p.b.len);
    setDrag({ id: p.id, dx, dy, day: p.day, start: p.start, len: p.b.len });
  };

  // Up and lost capture both end a drag; whichever arrives first wins.
  const endDrag = (commit) => (e) => {
    const p = pointer.current;
    if (!p || e.pointerId !== p.pointerId) return;
    pointer.current = null;
    setDrag(null);
    if (commit && p.moved) move(p.id, { to: { day: p.day, start: p.start } });
  };

  const onKeyDown = (e, b) => {
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!step) return;
    e.preventDefault();
    move(b.id, { by: step });
  };

  const reset = () => {
    pointer.current = null;
    setDrag(null);
    setBlocks(EXAMPLE_CLASSES);
    setMovedId(null);
  };

  const hours = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);

  return (
    <Exhibit
      id="timetable"
      letter="B"
      project={project}
      kicker="Drag to arrange"
      title="Timetable builder"
      note="Four example classes. Drag a block to another day or hour, or focus it and use the arrow keys. Overlaps are marked as clashes."
      stamp={clashes.length ? <Stamp tone="flag">Clash</Stamp> : null}
      status={status}
      flagged={clashes.length > 0}
      actions={
        <button type="button" className="btn btn-sm" onClick={reset}>
          Reset
        </button>
      }
    >
      <div className="tt-grid" ref={gridRef} role="group" aria-label="Example week, Monday to Friday, 8am to 4pm">
        {DAYS.map((d, i) => (
          <div key={d} className="tt-day" style={{ gridColumn: i + 2, gridRow: 1 }} aria-hidden="true">
            {d}
          </div>
        ))}
        {hours.map((h, r) => (
          <React.Fragment key={h}>
            <div className="tt-hour" style={{ gridRow: r + 2 }} aria-hidden="true">
              {hour(h)}
            </div>
            {DAYS.map((d, c) => (
              <div key={d} className="tt-slot" style={{ gridColumn: c + 2, gridRow: r + 2 }} aria-hidden="true" />
            ))}
          </React.Fragment>
        ))}
        {drag && <div className="tt-ghost" style={{ gridColumn: drag.day + 2, gridRow: rowOf(drag) }} aria-hidden="true" />}
        {blocks.map((b) => {
          const dragging = drag?.id === b.id;
          return (
            <button
              key={b.id}
              type="button"
              className={`tt-block${clashing.has(b.id) ? ' clash' : ''}${dragging ? ' dragging' : ''}`}
              style={{
                gridColumn: b.day + 2,
                gridRow: rowOf(b),
                transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
              }}
              aria-label={`${b.label}, ${DAY_NAMES[b.day]} ${range(b)}${clashing.has(b.id) ? ', clashes' : ''}. Arrow keys move it.`}
              onPointerDown={(e) => onPointerDown(e, b)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag(true)}
              onPointerCancel={endDrag(false)}
              onLostPointerCapture={endDrag(true)}
              onKeyDown={(e) => onKeyDown(e, b)}
            >
              {/* Phones show the short name; the button's label always has the full one. */}
              <span className="tt-b-label" aria-hidden="true">
                <span className="full">{b.label}</span>
                <span className="short">{b.short}</span>
              </span>
              <span className="tt-b-time" aria-hidden="true">
                {range(b)}
              </span>
            </button>
          );
        })}
      </div>
    </Exhibit>
  );
};

export default TimetableDemo;
