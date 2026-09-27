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
 * In Casefile it is the highlighted passage: the line of the file someone has
 * run a highlighter through, because it is the one that was checked.
 *
 * It is deliberately not rendered for projects that have no such mechanism.
 * A device that appears on everything stops carrying information, and a
 * fabricated claim here would undermine every real one beside it.
 *
 * @param {string}  text     the claim, written as a mechanism rather than a metric
 * @param {string}  label    override the heading (default: "How it knows")
 * @param {boolean} compact  tighter type, for use inside a list row
 */
const EvidenceLine = ({ text, label = 'How it knows', compact = false }) => {
  if (!text) return null;

  return (
    <div className={`evidence-note${compact ? ' compact' : ''}`}>
      <p className="en-label">{label}</p>
      <p className="en-text">
        <span className="en-hl">{text}</span>
      </p>
    </div>
  );
};

export default EvidenceLine;
