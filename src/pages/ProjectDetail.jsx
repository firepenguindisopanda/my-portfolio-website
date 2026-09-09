import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '../components/CodeBlock/CodeBlock';
import EvidenceLine from '../components/Evidence/EvidenceLine';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { projects } from '../data/projects';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import Reveal from '../components/Reveal/Reveal';
import LazySpaceEmbed from '../components/SpacesEmbed/LazySpaceEmbed';
import CaseStudyFooter from '../components/CaseStudyFooter/CaseStudyFooter';

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

/** One line of the header spec table: mono label, free-form value. */
const SpecRow = ({ label, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '110px minmax(0, 1fr)' },
      gap: { xs: 0.75, sm: 3 },
      alignItems: 'baseline',
      py: 1.75,
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography variant="overline" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

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

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { radius } = theme.custom;
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const project = projects.find(p => p.id === projectId);

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
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load project details');
          }
          return response.text();
        })
        .then(text => {
          // The page header already states the title, so the write-up's own
          // leading H1 would render it twice, one line apart.
          const withoutTitle = text.replace(/^\s*#\s+.*\n/, '');
          setMarkdownContent(withoutTitle);
          setLoading(false);
          setError(null);
        })
        .catch(error => {
          console.error('Error loading markdown:', error);
          setError('Failed to load project details. Please try again later.');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No detailed writeup available for this project yet.');
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

  if (!project) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Project not found
          </Typography>
          <Button
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Container>
    );
  }

  const isFraud = project.id === 'fraud-detection';

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/*
        * Spec-sheet header. This was previously a solid primary-colour band with
        * white text and a row of translucent chips - a treatment that read as a
        * template banner, fought all four themes, and pushed the actual writing
        * a full screen down. The metadata now sits in a mono spec table, which
        * is quieter and carries strictly more information.
        */}
      <Box component="header" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
          <Reveal>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              size="small"
              sx={{ mb: 3, ml: -1, color: 'text.secondary' }}
            >
              Back
            </Button>

            <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 1.5 }}>
              Case study &middot; {project.category}
            </Typography>

            <Typography
              variant="h1"
              component="h1"
              sx={{ mb: 2, maxWidth: 900, fontSize: { xs: '2.125rem', sm: '2.5rem', md: '3rem' } }}
            >
              {project.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 3.5 }}>
              {project.shortDescription}
            </Typography>

            {project.evidence && (
              <Box sx={{ maxWidth: 720, mb: 4 }}>
                <EvidenceLine text={project.evidence} />
              </Box>
            )}

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', maxWidth: 900 }}>
              <SpecRow label="Stack">
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {project.technologies.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        fontFamily: theme.custom.codeFont,
                        fontSize: '0.6875rem',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                      }}
                    />
                  ))}
                </Stack>
              </SpecRow>

              <SpecRow label="Availability">
                <Typography variant="body2" color="text.secondary">
                  {availabilityOf(project)}
                </Typography>
              </SpecRow>

              {(project.githubUrl || project.liveUrl || isFraud) && (
                <SpecRow label="Links">
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {project.liveUrl && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<LaunchIcon />}
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open the live site
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GitHubIcon />}
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Source
                      </Button>
                    )}
                    {isFraud && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AssessmentIcon />}
                        href="/reports/fraud_analysis_report.html"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Full report
                      </Button>
                    )}
                  </Stack>
                </SpecRow>
              )}
            </Box>
          </Reveal>
        </Container>
      </Box>

      {project.id === 'idea-sprint' && (
        <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
          <LazySpaceEmbed src="https://ai-robotix-nick-multi-agent-system.hf.space" height={450} />
        </Container>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            // The rail is a fixed 240px so the prose column keeps a readable
            // measure instead of stretching to whatever is left over.
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 240px' },
            gap: { xs: 0, md: 6 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <Reveal>
            <Box
              className="markdown-content"
              sx={{
                /*
                 * Markdown is authored elsewhere, so nothing here can assume the
                 * content fits: headings, prose and list items all have to be able
                 * to break. Without this a single long word or URL widened the whole
                 * document, and because the AppBar is fixed to the viewport it then
                 * ended mid-screen as soon as you scrolled sideways.
                 */
                // A readable measure. Without this the prose stretches to the
                // full grid column and runs past 110 characters a line.
                maxWidth: 760,
                '& h1, & h2, & h3, & h4, & p, & li': {
                  overflowWrap: 'break-word'
                },
                '& h1, & h2, & h3': {
                  fontFamily: theme.custom.displayFont,
                  letterSpacing: '-0.02em',
                  color: theme.palette.text.primary
                },
                '& h1': {
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  fontWeight: 700,
                  mt: 6,
                  mb: 2.5,
                  lineHeight: 1.15
                },
                '& h2': {
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  fontWeight: 600,
                  mt: 6,
                  mb: 2,
                  pt: 3,
                  lineHeight: 1.2,
                  // Clears the fixed app bar when a contents-rail link jumps here.
                  scrollMarginTop: 88,
                  borderTop: `1px solid ${theme.palette.divider}`
                },
                '& h2:first-of-type': {
                  mt: 0,
                  pt: 0,
                  borderTop: 'none'
                },
                // Several write-ups already separate sections with `---`. Where
                // one does, the rule it produces and the heading's own top rule
                // would stack into a visible double line.
                '& hr + h2': {
                  mt: 0,
                  pt: 0,
                  borderTop: 'none'
                },
                '& h3': {
                  fontSize: { xs: '1.15rem', sm: '1.3rem' },
                  fontWeight: 600,
                  mt: 4,
                  mb: 1.5
                },
                '& h4': {
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  fontWeight: 600,
                  mt: 3,
                  mb: 1.25,
                  color: theme.palette.text.primary
                },
                '& p': {
                  lineHeight: 1.75,
                  mb: 2.5,
                  fontSize: '1rem',
                  color: theme.palette.text.secondary
                },
                '& ul, & ol': {
                  mb: 3,
                  pl: { xs: 3, sm: 4 },
                  '& li': {
                    mb: 1.5,
                    lineHeight: 1.7,
                    color: theme.palette.text.secondary
                  }
                },
                '& code': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  px: 1,
                  py: 0.5,
                  borderRadius: `${radius.control}px`,
                  fontSize: '0.9em',
                  // The site's one code face, not a fifth family nothing bundles.
                  fontFamily: theme.custom.codeFont,
                  fontWeight: 500,
                  // File paths and shell commands have no spaces to break on.
                  // `anywhere` rather than `break-word` because only `anywhere`
                  // shrinks min-content width, which is what table cells size to.
                  overflowWrap: 'anywhere'
                },
                '& pre': {
                  mb: 3,
                  borderRadius: `${radius.container}px`,
                  overflow: 'hidden',
                  border: '1px solid', borderColor: 'divider'
                },
                '& blockquote': {
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  pl: 3,
                  ml: 0,
                  my: 3,
                  fontStyle: 'italic',
                  color: theme.palette.text.secondary,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  py: 2,
                  pr: 2,
                  borderRadius: `0 ${radius.container}px ${radius.container}px 0`
                },
                '& hr': {
                  my: 5,
                  border: 'none',
                  height: '2px',
                  bgcolor: theme.palette.divider
                },
                '& a': {
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  // Bare repo URLs are a single unbreakable token otherwise.
                  overflowWrap: 'anywhere',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: `${radius.container}px`,
                  my: 3,
                  border: '1px solid', borderColor: 'divider'
                },
                /*
                 * A table wider than the screen scrolls inside its own wrapper
                 * (see the `table` renderer below) instead of stretching the
                 * document. `width: 100%` still lets narrow tables fill the
                 * column; wide ones grow past it and the wrapper takes the scroll.
                 */
                '& .markdown-table-scroll': {
                  width: '100%',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  mb: 3
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    p: { xs: 1.25, sm: 2 },
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    textAlign: 'left'
                  },
                  '& td': {
                    p: { xs: 1.25, sm: 2 },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary
                  },
                  '& tr:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }
                },
                '& strong': {
                  fontWeight: 700,
                  color: theme.palette.text.primary
                }
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Ids come from the same slugify the contents rail uses, so a
                  // rail link can never point at a heading that is not there.
                  h2({ node: _node, children, ...props }) {
                    return (
                      <h2 id={slugify(nodeText(children))} {...props}>
                        {children}
                      </h2>
                    );
                  },
                  table({ node: _node, children, ...props }) {
                    return (
                      <Box className="markdown-table-scroll">
                        <table {...props}>{children}</table>
                      </Box>
                    );
                  },
                  code({ node: _node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: `${radius.container}px`,
                          fontSize: '0.95rem'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </Box>
          </Reveal>
        )}
          </Box>

          {/*
            * Contents rail. Hidden below md rather than collapsed into an
            * accordion: on a phone the heading list is the same scroll distance
            * as the headings themselves, so it would cost space and earn nothing.
            */}
          {headings.length > 2 && (
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                // The grid sets alignItems:'start', which shrink-wraps this
                // column to its own height and leaves the sticky child nothing
                // to travel within. Stretching the column back to the full row
                // height is what makes the rail actually stick.
                alignSelf: 'stretch',
              }}
            >
              <Box
                component="nav"
                aria-label="On this page"
                sx={{
                  position: 'sticky',
                  top: 88,
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  pl: 2.5,
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  On this page
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {headings.map((heading) => (
                    <Box component="li" key={heading.id} sx={{ mb: 1 }}>
                      <Box
                        component="a"
                        href={`#${heading.id}`}
                        sx={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          lineHeight: 1.45,
                          color: 'text.secondary',
                          textDecoration: 'none',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {heading.text}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      {project.portfolioData && (
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress aria-label="Loading analysis" />
            </Box>
          }
        >
          <InteractiveAnalysis project={project} />
        </Suspense>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 8 }}>
        <CaseStudyFooter currentId={project.id} />

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            onClick={() => navigate('/', { state: { scrollTo: 'projects' } })}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="large"
          >
            Back to all projects
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectDetail;
