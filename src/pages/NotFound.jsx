import React from 'react';
import { Link } from 'react-router-dom';
import { sections } from '../data/profile';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { DiggingPanda } from '../components/panda/LazyScenes';

/**
 * Catch-all route. Firebase Hosting rewrites every unknown path to index.html,
 * so without this a typo'd or stale URL rendered a blank page.
 *
 * In the case file the panda is in the filing cabinet, digging through the
 * drawer for a page that is not there (components/panda/DiggingPanda.jsx),
 * and the page says where everything is.
 */
const NotFound = () => {
  useDocumentMeta({
    title: 'Page not found',
    description: "That page doesn't exist. Everything worth seeing is on the home page.",
  });

  return (
    <div className="cf pg nf">
      <header className="pg-head">
        <div className="wrap nf-grid">
          <div>
            <p className="sec-tab">Error 404</p>
            <h1 className="pg-title">This page doesn&apos;t exist</h1>
            <p className="lede">
              The link may be out of date, or the page may have moved. Everything worth seeing is on the home page.
            </p>
            <div className="cta-row pg-cta">
              <Link className="btn btn-primary" to="/">
                Back to home
              </Link>
              <Link className="btn btn-ghost" to="/#index">
                See the projects
              </Link>
            </div>
          </div>
          <div className="nf-stage">
            <DiggingPanda />
          </div>
        </div>
      </header>
      <nav className="wrap nf-jump" aria-label="Home page sections">
        <p className="sec-tab">Or jump straight to</p>
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <Link to={`/#${section.id}`}>{section.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NotFound;
