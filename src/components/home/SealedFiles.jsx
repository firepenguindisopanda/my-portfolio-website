import React, { useRef } from 'react';
import { clientFiles, smallerFiles, stillSealed } from '../../data/clientWork';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled, useGSAP } from '../../utilities/gsapSetup';

/**
 * Client work, under seal. Most of the paid work belongs to the clients who
 * paid for it, so each file keeps the sector, the problem and what I did, and
 * redacts the rest. The black bar is drawn by CSS, not text hidden under a
 * box: there is nothing behind it to read, copy or find in the page source.
 */

const fileNo = (i) => `File ${String(i + 1).padStart(2, '0')}`;

/** The stamp, with the ring of ink it throws out as it lands (hidden at rest). */
const Stamp = () => (
  <p className="sf-stamp" aria-hidden="true">
    Sealed
    <span className="sf-thud" />
  </p>
);

/*
 * With motion on, each file is pulled from the drawer and dropped on the
 * desk, the marker goes over the name, and the stamp comes down hard enough
 * to jolt the sheet and throw out a ring of ink. Once per file, as it scrolls
 * in. With motion off the files are simply on the page, sealed.
 */
const useFilesLanding = (rootRef, prefersReducedMotion) => {
  useGSAP(
    () => {
      if (!gsapEnabled || prefersReducedMotion) return;
      const twoUp = window.matchMedia('(min-width: 861px)').matches;
      gsap.utils.toArray('.sf-file', rootRef.current).forEach((file, i) => {
        const article = file.querySelector('article');
        const sheet = file.querySelector('.sf-sheet');
        const stamp = file.querySelector('.sf-stamp');
        const tilt = i % 2 ? 2.2 : -2.2;
        gsap
          .timeline({
            delay: twoUp ? (i % 2) * 0.14 : 0,
            scrollTrigger: { trigger: file, start: 'top 82%', once: true },
          })
          .from(article, { y: 70, rotation: tilt, opacity: 0, duration: 0.75, ease: 'power3.out' }, 0)
          .fromTo(sheet, { '--stack': 0 }, { '--stack': 1, duration: 0.5, ease: 'power2.out' }, 0.45)
          .fromTo(
            file.querySelectorAll('.sf-redact'),
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 0.42, ease: 'power1.inOut', stagger: 0.22 },
            0.55
          )
          .fromTo(stamp, { opacity: 0, scale: 2.6, rotation: -22 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.24, ease: 'power4.in' }, 1.05)
          .addLabel('impact')
          .fromTo(file.querySelector('.sf-thud'), { opacity: 0.6, scale: 0.92 }, { opacity: 0, scale: 1.45, duration: 0.55, ease: 'power2.out' }, 'impact')
          .to(article, { keyframes: { y: [0, 4, -1.5, 0], rotation: [0, tilt * -0.18, tilt * 0.06, 0] }, duration: 0.3, ease: 'none' }, 'impact');
      });
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true }
  );
};

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
        <Stamp />
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
        <Stamp />
      </div>
    </article>
  </li>
);

const SealedFiles = () => {
  const rootRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  useFilesLanding(rootRef, prefersReducedMotion);
  return (
    <section className="section sealed" id="clients" aria-labelledby="sealed-title" ref={rootRef}>
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-tab">Client work, {clientFiles.length + 1} files</p>
          <h2 className="sec-title" id="sealed-title">
            Sealed files
          </h2>
          <p className="lede">
            Client names and code stay with the clients. The problem, and what I built, are on file.
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
};

export default SealedFiles;
