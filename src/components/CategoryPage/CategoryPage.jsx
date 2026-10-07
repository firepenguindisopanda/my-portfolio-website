import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { projects as allProjects } from '../../data/projects';
import EvidenceLine from '../Evidence/EvidenceLine';
import { PROJECT_VISUALS } from '../ProjectVisuals';
import { Arrow, splitTitle } from '../home/links';
import { BackIcon, NextIcon } from '../site/icons';
import useOpenFile from '../../motion/useOpenFile';
import useInkHeadings from '../../motion/useInkHeadings';

/**
 * One layout for every deep-dive route (/fullstack, /ml, /desktop, /android):
 * a drawer of the case file, holding every project in that category as a row
 * of the home page's index, with its evidence line in the open.
 *
 * It never shows detail: every row hands off to the case study, which is the
 * only place depth lives. Rows are not numbered - order carries no meaning
 * here - and a project without a screenshot shows its stack set in type, never
 * an invented picture.
 */

const EXT = { target: '_blank', rel: 'noopener noreferrer' };
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

/** The row's picture: the real capture, else a drawn figure, else the stack set in type. */
export const ProjectMedia = ({ project, title }) => {
  const image = project.screenshot || project.thumbnail;
  // A drawn visual only where there is no real capture.
  const Visual = !image && project.visual && PROJECT_VISUALS[project.visual];
  if (image) {
    return (
      <div className="ix-thumb">
        <img src={image} alt={`Screenshot of ${title}`} loading="lazy" decoding="async" width="640" height="400" />
      </div>
    );
  }
  if (Visual) {
    return (
      <div className="ix-thumb">
        <Visual ratio="16 / 10" />
      </div>
    );
  }
  return (
    <div className="ix-thumb ix-data" aria-hidden="true">
      <span className="cap">{project.id}</span>
      <span className="dd-stack">{(project.primaryTech || project.technologies || []).slice(0, 3).join(' / ')}</span>
    </div>
  );
};

const Row = ({ project, surface }) => {
  const posthog = usePostHog();
  const [title, sub] = splitTitle(project.title);
  const openFile = useOpenFile(`/projects/${project.id}`);
  const viewed = (e) => {
    posthog?.capture('project_viewed', {
      project_id: project.id,
      project_title: project.title,
      category: project.category,
      surface,
    });
    openFile(e);
  };

  return (
    <li className="ix-row dd-row">
      <ProjectMedia project={project} title={title} />
      <div className="ix-main">
        <h2 className="ix-title">
          {project.markdown ? (
            <Link to={`/projects/${project.id}`} onClick={viewed}>
              {title}
            </Link>
          ) : (
            title
          )}
          {sub && <span className="sub">{sub}</span>}
        </h2>
        <p className="ix-hl">{project.highlight || project.shortDescription}</p>
        {project.evidence && <EvidenceLine text={project.evidence} compact />}
      </div>
      <div className="ix-meta">
        <p className="ix-cat">
          {project.category}
          {project.liveUrl && <span className="dd-live">Live</span>}
        </p>
        <ul className="tech" aria-label="Tech">
          {(project.primaryTech || project.technologies || []).slice(0, 5).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <p className="ix-links">
        {project.markdown && (
          <Link to={`/projects/${project.id}`} onClick={viewed}>
            Case study<span className="sr-only">: {title}</span>
          </Link>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} {...EXT} onClick={() => posthog?.capture('project_demo_clicked', { project_id: project.id, surface })}>
            Live
            <NewTab />
            <Arrow />
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} {...EXT} onClick={() => posthog?.capture('project_github_clicked', { project_id: project.id, surface })}>
            Code
            <NewTab />
            <Arrow />
          </a>
        )}
      </p>
    </li>
  );
};

/**
 * @param {string}   eyebrow      mono kicker above the title
 * @param {string}   title        page heading
 * @param {string}   description  one sentence on what this collection is
 * @param {string[]} categories   project categories to include, in data order
 * @param {string}   surface      analytics label for this route
 * @param {string}   emptyMessage shown when no project matches yet
 */
const CategoryPage = ({ eyebrow, title, description, categories, surface, emptyMessage }) => {
  const projects = useMemo(() => allProjects.filter((p) => categories.includes(p.category)), [categories]);
  useInkHeadings();

  return (
    <div className="cf pg dd">
      <header className="pg-head">
        <div className="wrap">
          <div className="crumbs">
            <Link className="back" to="/#index">
              <BackIcon /> All work
            </Link>
            <span className="crumb-path" aria-hidden="true">
              deep-dives / {surface}
            </span>
          </div>
          <p className="sec-tab">{eyebrow}</p>
          <h1 className="pg-title">{title}</h1>
          <p className="lede">{description}</p>
          <p className="pg-count">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
      </header>

      <div className="wrap dd-body">
        {projects.length === 0 ? (
          <div className="dd-empty">
            <p className="dd-empty-title">Nothing filed here yet</p>
            <p>{emptyMessage}</p>
            <Link className="btn btn-primary" to="/#index">
              See the shipped work <NextIcon />
            </Link>
          </div>
        ) : (
          <ul className="ix-list">
            {projects.map((project) => (
              <Row key={project.id} project={project} surface={surface} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
