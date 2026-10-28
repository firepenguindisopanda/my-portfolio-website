import React from 'react';
import { projects } from '../../../data/projects';
import ChimpDemo from './ChimpDemo';
import TimetableDemo from './TimetableDemo';
import TriageDemo from './TriageDemo';
import '../../../styles/tryit.css';

/**
 * Try it: three pieces of the work, small enough to use on the page, framed as
 * exhibits in the case file. Each runs on example data in the browser and
 * links to its case study for the real thing.
 *
 * The three were picked because a story cannot show them: a memory game has to
 * be played, a keyboard-first triage loop has to be pressed through, and a
 * drag has to be dragged. Fraud and the agent graph already play out in the
 * Four cases above.
 *
 * None of them needs animation to work. With motion on, stamps press in and
 * squares pop; with it off, the same states simply appear.
 */

const byId = (id) => projects.find((p) => p.id === id);

const TryIt = () => (
  <section className="section tryit" id="try-it" aria-labelledby="try-it-title">
    <div className="wrap">
      <div className="sec-head">
        <p className="sec-tab">Hands-on</p>
        <h2 className="sec-title" id="try-it-title">
          Try it
        </h2>
        <p className="lede">
          Three pieces of the work, small enough to run right here. They use example data in your browser; each case study
          has the real thing.
        </p>
      </div>
      <div className="ex-grid">
        <ChimpDemo project={byId('chimp-test-game')} />
        <TimetableDemo project={byId('timetable-builder')} />
        <TriageDemo project={byId('link-tracker')} />
      </div>
    </div>
  </section>
);

export default TryIt;
