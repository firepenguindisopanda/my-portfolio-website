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
    id: 'schools',
    sector: 'Education',
    title: 'An intelligent system for schools',
    period: '2022 to 2023',
    via: 'Contract',
    points: [
      'Designed and built the content management area, role-based navigation for each kind of user, and route layouts with protected routes.',
      'Built the pages students work in, and brought the system\'s speech features into the frontend.',
      'Containerised the backend APIs behind a reverse proxy on AWS, with HTTPS on a custom domain, and set up a secured architecture for production.',
    ],
    stack: ['React', 'Spring Boot', 'Docker', 'Nginx', 'AWS'],
  },
];

/**
 * Client work from 2026 is not public yet, so it has no file: only the kinds
 * of experience it added, with no sector, client or detail.
 */
export const stillSealed =
  'Newer client work from 2026 stays closed until the clients make it public. It adds experience in rebuilding apps over legacy APIs that cannot change, upgrades across several major framework versions, CRM backends, retrieval over documents, and optimisation models for fair allocation.';

/** Work too small for a file of its own, stated the same way. */
export const smallerFiles = [
  'A member portal and its admin app for a membership organisation: balances, statements from the existing report server and document uploads, with Cypress in CI.',
  'A marketing site: SEO reviews, a DNS move to Cloudflare, mail deliverability fixes and an image and video pipeline.',
  'Server work: Windows and Linux hosts behind reverse proxies, TLS certificates, health and audit scripts, and a deployment runbook for a healthcare client.',
];
