import { projects } from './projects';

/**
 * Which projects in the index show each skill: the evidence behind the
 * Skills list. A skill gets a count only when a project's own tech list
 * names it, matched by the patterns below (the tech lists spell things many
 * ways: "React 19", "Pandas" and "pandas", "Python 3.12", "Neon Postgres").
 *
 * A skill with no pattern, or one no project matches, gets no count rather
 * than a guess: HTML and CSS are in everything but tagged nowhere, Git is
 * behind every repo, and the mobile and cloud skills come from client work
 * that cannot be shown. A count here should always be checkable in the index.
 */
const MATCHERS = {
  React: /^react( \d+)?$/i,
  TypeScript: /^typescript$/i,
  JavaScript: /^(javascript|vanilla js)$/i,
  'Next.js': /^next\.js( \d+)?$/i,
  Angular: /^angular \d+$/i,
  'Tailwind CSS': /^tailwind css( v\d+)?$/i,
  'Material UI': /^material ui$/i,
  'Node.js (Express, NestJS)': /^(node\.js|express|nestjs|node:test)$/i,
  'Node.js': /^(node\.js|express|nestjs|node:test)$/i,
  'Python (FastAPI, Flask)': /^(python( \d+(\.\d+)?)?|fastapi|flask)$/i,
  Python: /^python( \d+(\.\d+)?)?$/i,
  'C# (.NET, WPF)': /^(c#|\.net \d+|wpf|c# \/ \.net \d+)$/i,
  'C# / .NET': /^(c#|\.net \d+|wpf|c# \/ \.net \d+)$/i,
  Rust: /^rust$/i,
  PostgreSQL: /^(postgresql|sqlite\/postgresql|neon postgres|neon|psycopg \d+|asyncpg)$/i,
  MongoDB: /^mongodb$/i,
  SQLite: /^(sqlite|sqlite\/postgresql)$/i,
  Redis: /^(upstash )?redis$/i,
  Supabase: /^supabase$/i,
  NeonDB: /^neon( postgres)?$/i,
  Docker: /^docker$/i,
  'GitHub Actions': /^github actions$/i,
  Render: /^render$/i,
  'FastAPI Cloud': /^fastapi cloud$/i,
  Nginx: /^nginx$/i,
  PyTorch: /^(pytorch|torchaudio)$/i,
  'scikit-learn': /^scikit-learn$/i,
  'XGBoost & LightGBM': /^(xgboost|lightgbm)$/i,
  'Pandas & NumPy': /^(pandas|numpy)$/i,
  'LangChain & LangGraph': /^(langchain|langgraph)$/i,
};

/** The projects the index lists: the featured ones. */
const indexed = projects.filter((p) => p.featured);
const techOf = (p) => [...new Set([...(p.technologies || []), ...(p.primaryTech || [])])];

/** The indexed projects whose tech list names `skill` (empty when the skill has no pattern). */
export const projectsUsing = (skill) => {
  const re = MATCHERS[skill];
  return re ? indexed.filter((p) => techOf(p).some((t) => re.test(t.trim()))) : [];
};

/** Whether one project shows `skill`. */
export const projectUses = (project, skill) => {
  const re = MATCHERS[skill];
  return Boolean(re) && techOf(project).some((t) => re.test(t.trim()));
};

export const evidencedSkills = Object.keys(MATCHERS);
