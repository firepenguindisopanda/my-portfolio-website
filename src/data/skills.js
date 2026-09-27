/**
 * Skills, grouped by where they sit in the stack.
 *
 * Moved out of the old TechnicalExperiences component so the data outlives any
 * one layout. No self-rated percentages: a "90%" next to React says nothing
 * a project cannot say better.
 *
 * C# / .NET is here because Link Tracker is built on it (a WPF app, a CLI and
 * a native-messaging host on .NET 10) - add a skill when a project shows it.
 */
export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    caption: 'Interfaces & interaction',
    skills: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Angular', 'Flutter', 'React Native', '.NET MAUI', 'Jetpack Compose', 'Tailwind CSS', 'Material UI', 'HTML & CSS'],
  },
  {
    id: 'backend',
    title: 'Backend and databases',
    caption: 'Services & data',
    skills: ['Node.js (Express, NestJS)', 'Python (FastAPI, Flask)', 'C# (.NET, WPF)', 'Java (Spring Boot)', 'PostgreSQL', 'MongoDB', 'SQLite', 'Neo4j', 'Redis', 'Supabase', 'NeonDB', 'Firebase'],
  },
  {
    id: 'platform',
    title: 'Platform & DevOps',
    caption: 'Build, ship, run',
    skills: ['Docker', 'Git & GitHub', 'GitHub Actions', 'Jenkins', 'AWS', 'Google Cloud', 'Cloudflare', 'Vercel', 'Render', 'FastAPI Cloud', 'Firebase Hosting', 'HuggingFace Spaces', 'Nginx'],
  },
  {
    id: 'ml',
    title: 'Data & ML',
    caption: 'Models & analysis',
    skills: ['PyTorch', 'TensorFlow', 'scikit-learn', 'XGBoost & LightGBM', 'Pandas & NumPy', 'LangChain & LangGraph'],
  },
];

export const skillCount = skillGroups.reduce((n, g) => n + g.skills.length, 0);

export default skillGroups;
