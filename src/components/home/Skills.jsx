import React from 'react';
import { Link } from 'react-router-dom';
import { profile } from '../../data/profile';
import { skillGroups, skillCount } from '../../data/skills';
import { awards } from '../../data/certificates';

/**
 * Skills and recognition, on paper: the short list first, then everything by
 * where it sits in the stack; then the placings and scholarships. The full
 * certificate index lives on /background.
 */

export const Skills = () => (
  <section className="section skills" id="skills" aria-labelledby="skills-title">
    <div className="wrap">
      <div className="sec-head">
        <p className="sec-tab">{skillGroups.length} groups, {skillCount} tools</p>
        <h2 className="sec-title" id="skills-title">Skills</h2>
      </div>
      <ul className="headline" aria-label="Headline skills">
        {profile.skills.map((s) => <li key={s}>{s}</li>)}
      </ul>
      <div className="skills-grid">
        {skillGroups.map((g) => (
          <div className="sk-group" key={g.id}>
            <h3>
              {g.title}
              <span>{g.skills.length}</span>
            </h3>
            <ul>
              {g.skills.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Recognition = () => (
  <section className="section recognition" id="recognition" aria-labelledby="rec-title">
    <div className="wrap">
      <div className="sec-head">
        <p className="sec-tab">{awards.length} entries</p>
        <h2 className="sec-title" id="rec-title">Recognition</h2>
      </div>
      <ul className="rec-list">
        {awards.map((a) => (
          <li key={a.title}>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
          </li>
        ))}
      </ul>
      <Link className="rec-more" to="/background">
        Every certificate, plus mentoring and community work
      </Link>
    </div>
  </section>
);

export default Skills;
