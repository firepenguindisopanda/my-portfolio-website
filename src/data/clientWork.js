/**
 * Client work, told the only way it can be: the sector, the problem and what I
 * did. No client, product or person is named, and there are no screenshots or
 * code: the work belongs to the clients who paid for it.
 *
 * Every claim is backed by my own commits or the work briefs I filed. Where a
 * system did something I did not build, it is context, never a claim. Nothing
 * from a pilot or a work in progress a client has not made public goes here;
 * src/__tests__/confidentiality.test.js keeps client and product names out of
 * the source.
 */
export const clientFiles = [
  {
    id: 'payroll',
    sector: 'Payroll and HR software, used in several Caribbean countries',
    title: 'One payroll platform, seven tenants',
    period: '2025 to now',
    via: 'Through a software consultancy',
    points: [
      'Built and maintain its web and mobile frontend (463 of its 465 commits), with unit and end-to-end tests and CI that ship a build to each of seven tenant deployments.',
      'Documented the database engine that computes statutory tax and social insurance deductions, so changes to it can be reviewed.',
      'Wrote the product and requirements specs, a 54-finding production readiness audit, an authorisation gap analysis and a capacity assessment.',
    ],
    stack: ['Angular 19', 'Ionic 8', 'Playwright', 'GitHub Actions', 'Cloudflare Pages', 'Flask', 'MySQL'],
  },
  {
    id: 'food-manufacturing',
    sector: 'Food manufacturing',
    title: 'Production, stock and orders on a backend that could not change',
    period: '2026',
    via: 'Through a software consultancy',
    points: [
      'Rebuilt the Angular app over a legacy API that had to stay exactly as it was, held to it by an API contract harness.',
      'Replicated the production backend in Docker from a database dump, with fake email and reports, so every write path could be tested without touching real data.',
      'An audit that became 102 fixes, and a backend security review that reported injection, mass assignment and missing authorisation checks.',
    ],
    stack: ['Angular 19', 'Playwright', 'Docker', 'Flask', 'MySQL'],
  },
  {
    id: 'licensing',
    sector: 'Music licensing, run for five organisations',
    title: 'A licensing platform, three framework versions forward',
    period: '2026',
    via: 'Through a software consultancy',
    points: [
      'Upgraded it from Angular 16 to 18, Ionic 7 to 8 and Capacitor 6, onto the esbuild builder.',
      'Replaced its data table library and migrated thousands of legacy form fields.',
    ],
    stack: ['Angular 18', 'Ionic 8', 'Capacitor 6', 'esbuild'],
  },
  {
    id: 'crm',
    sector: 'Sales and customer enquiries',
    title: 'A CRM moved from a hosted backend to its own API',
    period: '2026',
    via: 'Through a software consultancy',
    points: [
      'Wrote the requirements, proved the idea on Supabase with row-level security and realtime updates, then moved it to a self-hosted Flask and MySQL API.',
      'Migrations with Alembic, least-privilege database roles, 49 tests and 12 architecture decision records.',
      'Lead scoring, enquiry triage and an email outbox.',
    ],
    stack: ['Flask', 'MySQL', 'Alembic', 'Supabase'],
  },
  {
    id: 'programme-finder',
    sector: 'Higher education: a regional university',
    title: 'Which degrees can I study? Answered for every applicant',
    period: 'Since 2022',
    points: [
      'Main contributor to the university\'s public programme finder, where applicants enter their secondary school subjects and see the degrees they qualify for: its app, admin dashboard and API.',
      'Kept it current and observable: framework upgrades across several versions, staging and production deploys from CI, a move to GA4, error monitoring with Sentry, and accessibility work on the subject picker and programme pages.',
      'Built the careers data behind each programme, with scripts that generate and normalise job data, and extended the qualification engine\'s parser and tests.',
    ],
    stack: ['Angular', 'Angular Material', 'Node.js', 'Neo4j', 'Firebase', 'GitHub Actions', 'Sentry', 'Python'],
  },
  {
    id: 'advising',
    sector: 'Higher education: academic advising',
    title: 'Degree progress, read straight from a transcript',
    period: '2026',
    via: 'Top contributor in a team of three',
    points: [
      'Students upload a transcript PDF; it is parsed, checked against ground truth data, and evaluated against their degree\'s rules.',
      'An advising assistant over the course catalogue and handbook, with intent routing, query rewriting, an answer judge and streamed replies.',
      'A harness that runs two degree engines on the same transcripts and shows where they disagree.',
    ],
    stack: ['FastAPI', 'React 19', 'TypeScript', 'Pinecone', 'vLLM'],
  },
  {
    id: 'literacy',
    sector: 'Education research: early literacy',
    title: 'A reading and spelling tutor for primary schools',
    period: '2022 to 2023',
    via: 'Contract, on a university research project',
    points: [
      'Designed and built the content management area, role-based navigation for pupils, teachers, parents and administrators, route layouts with protected routes, and the reading and spelling pages.',
      'Showed each attempt with the misread words highlighted, and brought speech recognition into the frontend.',
      'Containerised the two Spring Boot APIs behind an Nginx reverse proxy on EC2 with HTTPS on a custom domain, and set up a secured AWS architecture for production.',
    ],
    stack: ['React', 'Spring Boot', 'Docker', 'Nginx', 'AWS'],
  },
  {
    id: 'workload',
    sector: 'Higher education: a university department',
    title: 'Fair marking loads for teaching assistants',
    period: '2026',
    points: [
      'Modelled the allocation three ways, as an integer program, a mixed integer quadratic program and a min-max model, and compared them on the department\'s real data.',
      'Fairness metrics, parameter sweeps and a Pareto frontier to show the trade-offs, with infeasible inputs caught and explained.',
      'The analysis code is covered by its own pytest suite.',
    ],
    stack: ['Python', 'PuLP', 'CVXPY', 'SCIP', 'pytest'],
  },
];

/** Work too small for a file of its own, stated the same way. */
export const smallerFiles = [
  'A member portal and its admin app for a membership organisation: balances, statements from the existing report server and document uploads, with Cypress in CI.',
  'A marketing site: SEO reviews, a DNS move to Cloudflare, mail deliverability fixes and an image and video pipeline.',
  'Server work: Windows and Linux hosts behind reverse proxies, TLS certificates, health and audit scripts, and a deployment runbook for a healthcare client.',
];
