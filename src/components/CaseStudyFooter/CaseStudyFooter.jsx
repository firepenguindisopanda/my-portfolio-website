import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { projects } from '../../data/projects';

/**
 * Previous / next navigation at the foot of every case study, so a reader who
 * finishes one write-up is handed the next instead of a dead end. Order is the
 * projects data order, wrapping at both ends - there is always somewhere to go.
 */
const caseStudies = projects.filter((p) => p.markdown);

const NavCell = ({ direction, project, onOpen }) => {
  const isNext = direction === 'next';
  return (
    <button type="button" className={`cn-cell ${direction}`} onClick={() => onOpen(direction, project)}>
      <span className="cn-dir">
        {!isNext && <span aria-hidden="true">&larr; </span>}
        {isNext ? 'Next case study' : 'Previous case study'}
        {isNext && <span aria-hidden="true"> &rarr;</span>}
      </span>
      <span className="cn-title">{project.title}</span>
      <span className="cn-cat">{project.category}</span>
    </button>
  );
};

const CaseStudyFooter = ({ currentId }) => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const index = caseStudies.findIndex((p) => p.id === currentId);
  if (index === -1 || caseStudies.length < 2) return null;

  const count = caseStudies.length;
  const previous = caseStudies[(index - 1 + count) % count];
  const next = caseStudies[(index + 1) % count];

  const open = (direction, project) => {
    posthog?.capture('case_study_nav_clicked', {
      direction,
      from_project: currentId,
      to_project: project.id,
    });
    navigate(`/projects/${project.id}`);
  };

  return (
    <nav className="case-nav" aria-label="More case studies">
      <NavCell direction="previous" project={previous} onOpen={open} />
      <NavCell direction="next" project={next} onOpen={open} />
    </nav>
  );
};

export default CaseStudyFooter;
