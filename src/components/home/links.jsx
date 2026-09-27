import React from 'react';
import { Link } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { ExternalIcon } from '../site/icons';

/**
 * Links every section of the home page shares, so the analytics a link fires
 * cannot drift between sections.
 *
 * Event names are the ones the site has always sent (`project_viewed`,
 * `project_demo_clicked`, `project_github_clicked`), so existing PostHog
 * insights keep counting across the redesign. `source` says which part of the
 * page the click came from.
 */

export const EXT = { target: '_blank', rel: 'noopener noreferrer' };
export const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;
export const Arrow = () => <ExternalIcon className="icon-after" />;

/**
 * Remembers where the reader was on the home page, so the back button from a
 * case study lands them on the row they clicked rather than the top.
 * useScrollRestore reads it back.
 */
const stashScroll = () => {
  try {
    sessionStorage.setItem('projectsScrollY', String(globalThis.scrollY || 0));
  } catch {
    // Private browsing blocks sessionStorage; restoring scroll is optional.
  }
};

export const CaseStudyLink = ({ project, source, className, onClick, children }) => {
  const posthog = usePostHog();
  return (
    <Link
      className={className}
      to={`/projects/${project.id}`}
      onClick={(e) => {
        onClick?.(e);
        posthog?.capture('project_viewed', {
          project_id: project.id,
          project_title: project.title,
          category: project.category,
          source,
        });
        stashScroll();
      }}
    >
      {children ?? 'Case study'}
    </Link>
  );
};

/** Live site and source code, when the project has them. */
export const OutLinks = ({ project, source }) => {
  const posthog = usePostHog();
  return (
    <>
      {project.liveUrl && (
        <a href={project.liveUrl} {...EXT} onClick={() => posthog?.capture('project_demo_clicked', { project_id: project.id, source })}>
          Live
          <NewTab />
          <Arrow />
        </a>
      )}
      {project.githubUrl && (
        <a href={project.githubUrl} {...EXT} onClick={() => posthog?.capture('project_github_clicked', { project_id: project.id, source })}>
          Code
          <NewTab />
          <Arrow />
        </a>
      )}
    </>
  );
};

/** "Title: subtitle" project names split into the two lines the index sets them in. */
export const splitTitle = (title) => {
  const i = title.indexOf(': ');
  return i > 0 ? [title.slice(0, i), title.slice(i + 2)] : [title, ''];
};
