import React, { useState } from 'react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';
import { bio, notes, community } from '../data/background';
import { awards, featuredCertificates, otherCertificates, totalCertificateCount } from '../data/certificates';

/**
 * The rest of the file: who I am past the projects, every certificate on
 * file, the placings, and the mentoring record.
 *
 * None of this is what an employer opens a portfolio for first, so the home
 * page keeps the placings and hands off here. But all of it is something a
 * reader goes looking for on purpose, and giving it a page means none of it
 * has to be compressed to earn its place.
 */

const EXT = { target: '_blank', rel: 'noopener noreferrer' };
const Arrow = () => <span aria-hidden="true">&nbsp;&#8599;</span>;

/**
 * One credential, one ruled line: who issued it, what it is, and the proof.
 * `Verify` goes to the issuer's own record and is the stronger claim;
 * `Certificate` opens the document itself, which is all there is when the
 * issuer publishes no badge.
 */
const CredentialRow = ({ cert }) => {
  const proofUrl = cert.verifyUrl || cert.image;
  const proofLabel = cert.verifyUrl ? 'Verify' : 'Certificate';
  return (
    <li className="cred-row">
      <span className="cred-issuer">{cert.issuer || 'Coursework'}</span>
      <span className="cred-name">{cert.label}</span>
      {proofUrl && (
        // Ninety rows of a link reading "Verify" is ninety identical entries in
        // a screen reader's link list. The name says which credential this proves.
        <a className="cred-proof" href={proofUrl} {...EXT} aria-label={`${proofLabel}: ${cert.label} (opens in a new tab)`}>
          {proofLabel}
          <Arrow />
        </a>
      )}
    </li>
  );
};

const PAGE_SECTIONS = [
  ['about', 'About'],
  ['credentials', 'Certificates'],
  ['placings', 'Placings'],
  ['community', 'Mentorship'],
];

const Background = () => {
  useDocumentMeta(routeMeta('/background'));
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="cf pg bg">
      <header className="pg-head">
        <div className="wrap">
          <p className="sec-tab">Personal file</p>
          <h1 className="pg-title">Background</h1>
          <p className="lede">
            How I think about the work, every certificate on file, the competition placings, and the mentoring I do
            alongside it.
          </p>
          <nav className="pg-jump" aria-label="On this page">
            <ul>
              {PAGE_SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section className="section" id="about" aria-labelledby="about-title">
        <div className="wrap bg-about">
          <div>
            <div className="sec-head">
              <p className="sec-tab">About</p>
              <h2 className="sec-title" id="about-title">
                About me
              </h2>
            </div>
            <div className="bio">
              {bio.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <ul className="notes">
            {notes.map((note) => (
              <li key={note.title} className="note">
                <h3>{note.title}</h3>
                <p>{note.body}</p>
                {note.links && (
                  <p className="note-links">
                    {note.links.map((l) => (
                      <a key={l.label} href={l.href} {...EXT}>
                        {l.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                        <Arrow />
                      </a>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="credentials" aria-labelledby="cred-title">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-tab">{totalCertificateCount} on file</p>
            <h2 className="sec-title" id="cred-title">
              Certificates
            </h2>
            <p className="lede">Specialisations and professional certificates first. Verification links go straight to the issuer.</p>
          </div>
          <ul className="cred-list" aria-label="Featured certificates">
            {featuredCertificates.map((cert) => (
              <CredentialRow key={cert.id} cert={cert} />
            ))}
          </ul>
          {otherCertificates.length > 0 && (
            <>
              <button
                type="button"
                className="btn btn-ghost cred-toggle"
                aria-expanded={showAll}
                aria-controls="coursework"
                onClick={() => setShowAll((open) => !open)}
              >
                {showAll ? 'Hide the coursework' : `View all ${totalCertificateCount} certificates`}
              </button>
              {showAll && (
                <div id="coursework" className="coursework">
                  <p className="sec-tab">Coursework, {otherCertificates.length} more</p>
                  <ul className="cred-list" aria-label="Coursework certificates">
                    {otherCertificates.map((cert) => (
                      <CredentialRow key={cert.id} cert={cert} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section" id="placings" aria-labelledby="placings-title">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-tab">{awards.length} entries</p>
            <h2 className="sec-title" id="placings-title">
              Placings &amp; scholarships
            </h2>
          </div>
          <ul className="rec-list">
            {awards.map((a) => (
              <li key={a.title}>
                <h3>{a.title}</h3>
                <p className="rec-sub">{a.subtitle}</p>
                <p>{a.description}</p>
                {a.url && (
                  <a className="rec-link" href={a.url} {...EXT}>
                    Details<span className="sr-only">: {a.title} (opens in a new tab)</span>
                    <Arrow />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="community" aria-labelledby="community-title">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-tab">Beyond the day job</p>
            <h2 className="sec-title" id="community-title">
              Mentorship &amp; community
            </h2>
            <p className="lede">Leadership and mentoring across university programmes, datathons and bootcamps.</p>
          </div>
          <ul className="community">
            {community.map((entry) => (
              <li key={entry.id} className="cm-entry">
                <p className="cm-credit">{[entry.organisation, entry.period].filter(Boolean).join(' · ')}</p>
                <h3>{entry.role}</h3>
                <ul className="items">
                  {entry.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {entry.links.length > 0 && (
                  <p className="cm-links">
                    {entry.links.map((link) => (
                      <a key={link.href} href={link.href} {...EXT}>
                        {link.label}
                        <span className="sr-only">: {entry.role} (opens in a new tab)</span>
                        <Arrow />
                      </a>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Background;
