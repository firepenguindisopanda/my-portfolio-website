import React from 'react';
import { Link } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { profile } from '../../data/profile';
import { skillGroups, skillCount } from '../../data/skills';
import { projectsUsing } from '../../data/skillEvidence';
import { awards } from '../../data/certificates';
import { showSkillInIndex } from './indexFilter';

/**
 * Skills and recognition, on paper: the short list first, then everything by
 * where it sits in the stack; then the placings and scholarships. The full
 * certificate index lives on /background.
 *
 * A skill a project in the index shows carries a footnote: how many projects
 * use it. Selecting it sends the index those projects, marked, and takes the
 * reader there (see data/skillEvidence.js for what counts).
 */

const Skill = ({ name }) => {
  const posthog = usePostHog();
  const n = projectsUsing(name).length;
  if (!n) return name;
  return (
    <button
      type="button"
      className="sk-ev"
      onClick={() => {
        posthog?.capture('skill_evidence_clicked', { skill: name, projects: n });
        showSkillInIndex(name);
      }}
    >
      {name}
      <sup className="fn" aria-hidden="true">{n}</sup>
      <span className="sr-only">: show the {n} project{n === 1 ? '' : 's'} that use it</span>
    </button>
  );
};

export const Skills = () => (
  <section className="section skills" id="skills" aria-labelledby="skills-title">
    <div className="wrap">
      <div className="sec-head">
        <p className="sec-tab">{skillGroups.length} groups, {skillCount} tools</p>
        <h2 className="sec-title" id="skills-title">Skills</h2>
        <p className="lede">The small numbers count the projects in the index that use each one. Select one to see them.</p>
      </div>
      <ul className="headline" aria-label="Headline skills">
        {profile.skills.map((s) => <li key={s}><Skill name={s} /></li>)}
      </ul>
      <div className="skills-grid">
        {skillGroups.map((g) => (
          <div className="sk-group" key={g.id}>
            <h3>
              {g.title}
              <span>{g.skills.length}</span>
            </h3>
            <ul>
              {g.skills.map((s) => <li key={s}><Skill name={s} /></li>)}
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
