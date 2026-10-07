import React, { useCallback, useRef } from 'react';
import { usePostHog } from '@posthog/react';
import { CaseStudyLink, splitTitle } from '../links';

/**
 * The frame every Try it demo sits in: a sheet with a folder tab, the file it
 * comes from, a status line read out to screen readers, and the way to the
 * full case study.
 *
 * `stamp` is the result pressed onto the sheet when a demo reaches one - the
 * same rubber stamp the Four cases use. It is decoration: the status line says
 * the same thing in words, so the stamp is hidden from assistive tech.
 */

export const Stamp = ({ tone, children }) => (
  <p className={`ex-stamp ${tone}`} aria-hidden="true">
    {children}
  </p>
);

const Exhibit = ({ id, letter, project, kicker, title, note, stamp, status, flagged, actions, children }) => (
  <article className={`exhibit ex-${id}`} aria-labelledby={`ex-${id}-title`}>
    <p className="ex-tab" aria-hidden="true">
      Exhibit {letter}
    </p>
    <div className="ex-sheet">
      <div className="ex-head">
        <p className="ex-kicker">
          <span className="file">{project.id}</span>
          <span>{kicker}</span>
        </p>
        <h3 className="ex-title" id={`ex-${id}-title`}>
          {title}
        </h3>
      </div>
      {stamp}
      <p className="ex-note">{note}</p>
      {children}
      <div className="ex-foot">
        <p className={`ex-status${flagged ? ' is-flag' : ''}`} aria-live="polite">
          {status}
        </p>
        <div className="ex-actions">
          {actions}
          <CaseStudyLink project={project} source="try-it" className="ex-case">
            Case study<span className="sr-only">: {splitTitle(project.title)[0]}</span>
          </CaseStudyLink>
        </div>
      </div>
    </div>
  </article>
);

/**
 * `tryit_demo_used`, once per demo per visit: the first real move in it (a
 * square picked, a link decided, a class moved), not a stray focus.
 */
export const useDemoUsed = (demo) => {
  const posthog = usePostHog();
  const sent = useRef(false);
  return useCallback(() => {
    if (sent.current) return;
    sent.current = true;
    posthog?.capture('tryit_demo_used', { demo });
  }, [posthog, demo]);
};

export default Exhibit;
