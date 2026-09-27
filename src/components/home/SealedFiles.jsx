import React from 'react';
import { clientFiles, smallerFiles, stillSealed } from '../../data/clientWork';

/**
 * Client work, under seal. Most of the paid work belongs to the clients who
 * paid for it, so each file keeps the sector, the problem and what I did, and
 * redacts the rest. The black bar is drawn by CSS, not text hidden under a
 * box: there is nothing behind it to read, copy or find in the page source.
 */

const fileNo = (i) => `File ${String(i + 1).padStart(2, '0')}`;

const SealedFile = ({ file, index }) => (
  <li className="sf-file">
    <article aria-labelledby={`sf-${file.id}`}>
      <p className="sf-tab" aria-hidden="true">
        {fileNo(index)}
      </p>
      <div className="sf-sheet">
        <p className="sf-client">
          <span className="sf-k">Client</span>
          <span className="sf-redact" aria-hidden="true" />
          <span className="sr-only">name withheld</span>
        </p>
        <p className="sf-sector">{file.sector}</p>
        <h3 className="sf-title" id={`sf-${file.id}`}>
          {file.title}
        </h3>
        <p className="sf-meta">
          <span>{file.period}</span>
          {file.via && <span>{file.via}</span>}
        </p>
        <ul className="sf-points">
          {file.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <ul className="tags sf-stack" aria-label="Stack">
          {file.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="sf-stamp" aria-hidden="true">
          Sealed
        </p>
      </div>
    </article>
  </li>
);

/** The 2026 work: not public yet, so even the sector is under the bar. */
const StillSealed = ({ index }) => (
  <li className="sf-file sf-closed">
    <article aria-labelledby="sf-still-sealed">
      <p className="sf-tab" aria-hidden="true">
        {fileNo(index)}
      </p>
      <div className="sf-sheet">
        <p className="sf-client">
          <span className="sf-k">Client</span>
          <span className="sf-redact" aria-hidden="true" />
          <span className="sr-only">name withheld</span>
        </p>
        <p className="sf-sector">
          <span className="sf-redact" aria-hidden="true" />
          <span className="sr-only">sector withheld</span>
        </p>
        <h3 className="sf-title" id="sf-still-sealed">
          Still sealed
        </h3>
        <p className="sf-meta">
          <span>2026</span>
        </p>
        <p className="sf-note">{stillSealed}</p>
        <p className="sf-stamp" aria-hidden="true">
          Sealed
        </p>
      </div>
    </article>
  </li>
);

const SealedFiles = () => (
  <section className="section sealed" id="clients" aria-labelledby="sealed-title">
    <div className="wrap">
      <div className="sec-head">
        <p className="sec-tab">Client work, {clientFiles.length + 1} files</p>
        <h2 className="sec-title" id="sealed-title">
          Sealed files
        </h2>
        <p className="lede">
          Most of my paid work belongs to the clients who paid for it. Their names and their code stay with them; the
          problem, and what I built, are on file.
        </p>
      </div>
      <ol className="sf-grid">
        {clientFiles.map((file, i) => (
          <SealedFile key={file.id} file={file} index={i} />
        ))}
        <StillSealed index={clientFiles.length} />
      </ol>
      {smallerFiles.length > 0 && (
        <div className="sf-more">
          <h3 className="sf-more-title">Smaller files</h3>
          <ul>
            {smallerFiles.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </section>
);

export default SealedFiles;
