import React from 'react';

/**
 * The site's one recurring structural device.
 *
 * Almost every project in this portfolio contains a mechanism for checking its
 * own output - an audit script that re-reads the source independently, an eval
 * harness with a hallucination canary, arithmetic that catches the misreads a
 * confidence score cannot. That is the actual through-line of the work, so it
 * gets a dedicated slot rather than being buried in a feature list.
 *
 * In Casefile it is marked the way a reviewer marks a file. On a case study it
 * carries the same rubber stamp as the Sealed files and the Try it demos; in a
 * list of projects, where a stamp on every row would shout, it gets a red
 * bracket in the margin and a short signed note instead.
 *
 * It is deliberately not rendered for projects that have no such mechanism.
 * A device that appears on everything stops carrying information, and a
 * fabricated claim here would undermine every real one beside it.
 *
 * @param {string}  text     the claim, written as a mechanism rather than a metric
 * @param {string}  label    override the heading (default: "How it knows")
 * @param {boolean} compact  the list-row version: margin bracket instead of a stamp
 */
const EvidenceLine = ({ text, label = 'How it knows', compact = false }) => {
  if (!text) return null;

  return (
    <div className={`evidence-note ${compact ? 'compact' : 'stamped'}`}>
      <p className="en-label">{label}</p>
      <p className="en-text">{text}</p>
      {compact ? (
        <span className="en-note" aria-hidden="true">
          checked, N.S.
        </span>
      ) : (
        <span className="en-stamp" aria-hidden="true">
          Verified
          <small>method on file</small>
        </span>
      )}
    </div>
  );
};

export default EvidenceLine;
