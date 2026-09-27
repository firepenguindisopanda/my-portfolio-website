import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '../components/CodeBlock/CodeBlock';
import EvidenceLine from '../components/Evidence/EvidenceLine';
import LazySpaceEmbed from '../components/SpacesEmbed/LazySpaceEmbed';
import CaseStudyFooter from '../components/CaseStudyFooter/CaseStudyFooter';
import { PROJECT_VISUALS } from '../components/ProjectVisuals';
import { splitTitle } from '../components/home/links';
import { BackIcon, ExternalIcon } from '../components/site/icons';
import useDocumentMeta from '../hooks/useDocumentMeta';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useSectionSpy from '../hooks/useSectionSpy';
import { projects } from '../data/projects';
import { gsap, gsapEnabled, useGSAP } from '../utilities/gsapSetup';

/**
 * A case study, as a file: the cover sheet (what it is, how it knows, the spec
 * table and the screenshot clipped to it), then the write-up with a contents
 * rail that highlights the section you are reading.
 */

/**
 * Three of the twenty case studies carry an interactive analysis block, and it
 * is the heaviest thing on the site: recharts and its d3 dependencies were
 * 40% of this route's chunk, downloaded by every reader of the other
 * seventeen. It now arrives only on the pages that render it.
 */
const InteractiveAnalysis = lazy(() => import('../components/MLCharts/InteractiveAnalysis'));

/** Heading id shared by the rendered h2 and the contents rail, so they cannot disagree. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

/** ReactMarkdown hands `children` as an array of nodes; the rail needs plain text. */
const nodeText = (children) =>
  React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : child?.props?.children ?? ''))
    .join('');

/**
 * What a reader can actually do with this project right now, stated plainly.
 * "Private repository" is more useful than an absent row, which reads as an
 * oversight rather than a fact.
 */
const availabilityOf = (project) => {
  if (project.liveUrl) return 'Deployed and reachable';
  if (project.githubUrl) return 'Source on GitHub';
  return 'Private repository';
};

const EXT = { target: '_blank', rel: 'noopener noreferrer' };
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

const markdownComponents = {
  // Each write-up opens with its project's title, which the page header
  // already shows as the page's one h1; a second would repeat it mid-page.
  h1() {
    return null;
  },
  // Ids come from the same slugify the contents rail uses, so a rail link can
  // never point at a heading that is not there.
  h2({ node: _node, children, ...props }) {
    return (
      <h2 id={slugify(nodeText(children))} {...props}>
        {children}
      </h2>
    );
  },
  // A table wider than the column scrolls inside its own wrapper instead of
  // stretching the document.
  table({ node: _node, children, ...props }) {
    return (
      <div className="markdown-table-scroll">
        <table {...props}>{children}</table>
      </div>
    );
  },
  code({ node: _node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <CodeBlock language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.92rem' }} {...props}>
        {String(children).replace(/\n$/, '')}
      </CodeBlock>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const headRef = useRef(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const project = projects.find((p) => p.id === projectId);
  const HowItWorks = project?.visual ? PROJECT_VISUALS[project.visual] : null;

  // These 20-odd pages are the deepest content on the site and, until this was
  // added, every one of them inherited whichever title the previous route had
  // set - or the generic index.html title on a direct visit.
  useDocumentMeta({
    title: project?.title,
    description: project?.shortDescription,
    path: project ? `/projects/${project.id}` : undefined,
    type: 'article',
  });

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (_e) {
      window.scrollTo(0, 0);
    }
  }, [projectId]);

  useEffect(() => {
    if (project?.markdown) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetch(project.markdown)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load project details');
          }
          return response.text();
        })
        .then((text) => {
          // The page header already states the title, so the write-up's own
          // leading H1 would render it twice, one line apart.
          const withoutTitle = text.replace(/^\s*#\s+.*\n/, '');
          setMarkdownContent(withoutTitle);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error('Error loading markdown:', err);
          setError('Failed to load project details. Please try again later.');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No detailed write-up for this project yet.');
    }
  }, [project]);

  /*
   * These write-ups run to a couple of thousand words, which is the length at
   * which a reader needs to see the shape before committing to the scroll.
   * Only h2s are listed - h3 depth would turn the rail into a second document.
   * Fenced code blocks are stripped first so a `## ` inside one is not indexed.
   */
  const headings = useMemo(() => {
    const withoutFences = markdownContent.replace(/```[\s\S]*?```/g, '');
    return [...withoutFences.matchAll(/^##\s+(.+)$/gm)].map((match) => {
      const raw = match[1].trim();
      return {
        // Inline code in a heading arrives as literal backticks here, where the
        // rendered heading shows none. Strip them so the rail reads as prose.
        text: raw.replace(/`/g, ''),
        id: slugify(raw),
      };
    });
  }, [markdownContent]);
  const activeHeading = useSectionSpy(headings.map((h) => h.id));

  // The screenshot is dropped onto the cover sheet, as the hero's photo is. It
  // is decoration arriving, never text waiting to be read.
  useGSAP(
    () => {
      // Not every case file has a screenshot.
      if (!gsapEnabled || prefersReducedMotion || !headRef.current?.querySelector('.case-shot')) return;
      gsap.from('.case-shot', { y: 28, rotation: 5, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
    },
    { scope: headRef, dependencies: [projectId, prefersReducedMotion], revertOnUpdate: true }
  );

  if (!project) {
    return (
      <div className="cf pg">
        <header className="pg-head">
          <div className="wrap">
            <p className="sec-tab">Error 404</p>
            <h1 className="pg-title">No case file by that name</h1>
            <p className="lede">The link may be out of date. Every project is in the index on the home page.</p>
            <div className="cta-row pg-cta">
              <Link className="btn btn-primary" to="/#index">
                See every project
              </Link>
            </div>
          </div>
        </header>
      </div>
    );
  }

  const [title, sub] = splitTitle(project.title);
  const image = project.screenshot || project.thumbnail;
  const isFraud = project.id === 'fraud-detection';
  // Back goes back when there is somewhere on this site to go back to; a
  // reader who arrived straight from a link is sent home instead of away.
  const goBack = () => (location.key && location.key !== 'default' ? navigate(-1) : navigate('/'));

  return (
    <article className="cf pg case">
      <header className="pg-head case-head" ref={headRef}>
        <div className="wrap">
          <div className="crumbs">
            <button type="button" className="back" onClick={goBack}>
              <BackIcon /> Back
            </button>
            <span className="crumb-path" aria-hidden="true">
              case-files / {project.id}
            </span>
          </div>

          <div className={`case-grid${image ? '' : ' no-shot'}`}>
            <div className="case-intro">
              <p className="sec-tab">
                Case study <span aria-hidden="true">/</span> {project.category}
              </p>
              <h1 className="pg-title case-title">
                {title}
                {sub && <span className="sub">{sub}</span>}
              </h1>
              <p className="lede">{project.shortDescription}</p>
              <EvidenceLine text={project.evidence} />
            </div>
            {image && (
              <figure className="case-shot">
                <img src={image} alt={`Screenshot of ${title}`} width="1280" height="800" decoding="async" />
                <figcaption aria-hidden="true">{project.id}.webp</figcaption>
              </figure>
            )}
          </div>

          <dl className="spec">
            <div>
              <dt>Stack</dt>
              <dd>
                <ul className="tech" aria-label="Technologies">
                  {project.technologies.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{availabilityOf(project)}</dd>
            </div>
            {(project.githubUrl || project.liveUrl || isFraud) && (
              <div>
                <dt>Links</dt>
                <dd className="spec-links">
                  {project.liveUrl && (
                    <a className="btn btn-primary btn-sm" href={project.liveUrl} {...EXT}>
                      Open the live site
                      <NewTab />
                      <ExternalIcon />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a className="btn btn-ghost btn-sm" href={project.githubUrl} {...EXT}>
                      Source
                      <NewTab />
                      <ExternalIcon />
                    </a>
                  )}
                  {isFraud && (
                    <a className="btn btn-ghost btn-sm" href="/reports/fraud_analysis_report.html" {...EXT}>
                      Full report
                      <NewTab />
                      <ExternalIcon />
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      {project.id === 'idea-sprint' && (
        <div className="wrap case-embed">
          <LazySpaceEmbed src="https://ai-robotix-nick-multi-agent-system.hf.space" height={450} />
        </div>
      )}

      {/* A drawn how-it-works figure, for projects whose work happens across
          several windows no single screenshot can hold. */}
      {HowItWorks && (
        <div className="wrap">
          <figure className="case-figure">
            <HowItWorks ratio="16 / 9" />
            <figcaption>
              How it works, drawn: one keystroke saves a window of tabs, each link gets a decision, and the queue shrinks.
            </figcaption>
          </figure>
        </div>
      )}

      <div className={`wrap case-body${headings.length > 2 ? '' : ' no-toc'}`}>
        <div className="case-main">
          {loading ? (
            <p className="case-status" role="status">
              Opening the write-up&hellip;
            </p>
          ) : error ? (
            <p className="case-status" role="status">
              {error}
            </p>
          ) : (
            <div className="prose markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {markdownContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/*
          * Contents rail. Hidden on narrow screens rather than collapsed into an
          * accordion: on a phone the heading list is the same scroll distance as
          * the headings themselves, so it would cost space and earn nothing.
          */}
        {headings.length > 2 && (
          <aside className="toc-col">
            <nav className="toc" aria-label="On this page">
              <p className="toc-title">On this page</p>
              <ol>
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`} aria-current={activeHeading === heading.id ? 'true' : undefined}>
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
      </div>

      {project.portfolioData && (
        <Suspense
          fallback={
            <p className="case-status wrap" role="status">
              Loading the analysis&hellip;
            </p>
          }
        >
          <div className="case-analysis">
            <InteractiveAnalysis project={project} />
          </div>
        </Suspense>
      )}

      <div className="wrap case-foot">
        <CaseStudyFooter currentId={project.id} />
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/', { state: { scrollTo: 'index' } })}>
          <BackIcon /> Back to all projects
        </button>
      </div>
    </article>
  );
};

export default ProjectDetail;
