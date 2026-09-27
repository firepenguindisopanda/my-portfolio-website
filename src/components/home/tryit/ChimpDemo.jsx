import React, { useState } from 'react';
import Exhibit, { Stamp, useDemoUsed } from './Exhibit';

/**
 * The Chimp Test, small: numbered squares on a 5 x 3 board. Click 1 and the
 * rest turn face down; click them in order from memory. Each cleared level
 * adds a square, as the real game does, from 4 up to 9.
 *
 * Every square is a button, so the board works by keyboard and touch too. Once
 * they are face down a screen reader hears "Hidden square", which is the test.
 */

const COLS = 5;
const ROWS = 3;
export const FIRST = 4;
export const LAST = 9;

const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** A board: the number on each cell, 0 for an empty one. */
const deal = (n) => {
  const board = new Array(COLS * ROWS).fill(0);
  shuffle(board.map((_, i) => i))
    .slice(0, n)
    .forEach((cell, k) => {
      board[cell] = k + 1;
    });
  return board;
};

const ChimpDemo = ({ project }) => {
  const used = useDemoUsed('chimp');
  // phase: 'show' (numbers visible), 'hide' (after 1), 'won' or 'lost'.
  const [game, setGame] = useState(() => ({ round: 0, size: FIRST, board: deal(FIRST), next: 1, phase: 'show', miss: 0 }));
  const { round, size, board, next, phase, miss } = game;
  const over = phase === 'won' || phase === 'lost';

  const start = (n) => {
    const board = deal(n);
    setGame((g) => ({ round: g.round + 1, size: n, board, next: 1, phase: 'show', miss: 0 }));
  };

  // Each pick works from the latest state, so two clicks landing before a
  // re-render are still judged in order.
  const pick = (n) => {
    used();
    setGame((g) => {
      if (g.phase === 'won' || g.phase === 'lost' || n < g.next) return g;
      if (n !== g.next) return { ...g, phase: 'lost', miss: n };
      if (n === g.size) return { ...g, phase: 'won', next: n + 1 };
      return { ...g, phase: 'hide', next: n + 1 };
    });
  };

  let status;
  if (phase === 'show') status = `Level ${size - FIRST + 1}: ${size} squares. Find 1 to start.`;
  else if (phase === 'hide') status = next === 2 ? `Now 2 to ${size}, from memory.` : `${next - 1} of ${size}.`;
  else if (phase === 'won') status = `All ${size} in order.${size < LAST ? ` The next level has ${size + 1}.` : ' That is the top level here.'}`;
  else status = `That was ${miss}; ${next} came next.`;

  let action;
  if (phase === 'won' && size < LAST) action = ['Next level', size + 1];
  else if (phase === 'won') action = ['Start over', FIRST];
  else if (phase === 'lost') action = ['Try again', size];
  else action = ['New board', size];

  return (
    <Exhibit
      id="chimp"
      letter="A"
      project={project}
      kicker="Working memory"
      title="Chimp Test"
      note="Memorise where the numbers are. Press 1 and the rest turn face down; then press 2 onwards in order, from memory."
      stamp={
        phase === 'won' ? (
          <Stamp tone="ok">Recalled {size} of {size}</Stamp>
        ) : phase === 'lost' ? (
          <Stamp tone="flag">Missed at {next}</Stamp>
        ) : null
      }
      status={status}
      flagged={phase === 'lost'}
      actions={
        <button type="button" className="btn btn-sm" onClick={() => start(action[1])}>
          {action[0]}
        </button>
      }
    >
      <div className={`chimp-board is-${phase}`} role="group" aria-label="Chimp test board">
        {board.map((n, i) => {
          const key = `${round}-${i}`;
          if (!n) return <span key={key} className="chimp-cell" aria-hidden="true" />;
          const hit = n < next;
          const cls = ['chimp-sq', hit && 'hit', phase === 'lost' && n === miss && 'miss', phase === 'lost' && n === next && 'expected']
            .filter(Boolean)
            .join(' ');
          let label = `Square ${n}`;
          if (phase === 'hide' && !hit) label = 'Hidden square';
          else if (hit) label = `Square ${n}, done`;
          return (
            <button
              key={key}
              type="button"
              className={cls}
              style={{ '--i': n }}
              aria-label={label}
              aria-disabled={hit || over}
              onClick={() => pick(n)}
            >
              <span aria-hidden="true">{n}</span>
            </button>
          );
        })}
      </div>
    </Exhibit>
  );
};

export default ChimpDemo;
