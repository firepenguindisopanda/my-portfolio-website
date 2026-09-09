import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNextdotjs,
  SiAngular,
  SiFlutter,
  SiDotnet,
  SiJetpackcompose,
  SiTailwindcss,
  SiMui,
  SiHtml5,
  SiNodedotjs,
  SiPython,
  SiSpringboot,
  SiPostgresql,
  SiMongodb,
  SiSqlite,
  SiRedis,
  SiSupabase,
  SiFirebase,
  SiDocker,
  SiGit,
  SiGithubactions,
  SiJenkins,
  SiAmazonaws,
  SiGooglecloud,
  SiCloudflare,
  SiVercel,
  SiRender,
  SiFastapi,
  SiNginx,
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiPandas,
} from 'react-icons/si';
import { LuNetwork, LuDatabase, LuBoxes, LuTrees, LuShare2 } from 'react-icons/lu';

/**
 * A mark per skill, keyed on the exact skill string in TechnicalExperiences.
 *
 * These are the icons the Tech Stack marquee used to autoplay on its own row.
 * The marquee named the same technologies the skills panel already lists, so it
 * was the list twice - once as text grouped by where it sits in the stack, once
 * as logos in no order at all. The logos moved here, where they mark an entry
 * that says something, and the marquee went.
 *
 * Rendered monochrome in `currentColor`, never in brand colours: forty vendor
 * hues in one panel is a rainbow, and the palette holds one accent on purpose.
 *
 * Where Simple Icons has no mark - four of them - the fallback describes the
 * thing rather than standing in for a missing logo: gradient-boosted trees get
 * a tree, a graph database and a graph framework get graphs, hosted Spaces get
 * containers. A skill with no entry here renders as text, which is why the
 * panel does not break when the skill list grows.
 */
const techIcons = {
  // Frontend
  React: SiReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  'Next.js': SiNextdotjs,
  Angular: SiAngular,
  Flutter: SiFlutter,
  'React Native': SiReact,
  '.NET MAUI': SiDotnet,
  'Jetpack Compose': SiJetpackcompose,
  'Tailwind CSS': SiTailwindcss,
  'Material UI': SiMui,
  'HTML & CSS': SiHtml5,

  // Backend and databases
  'Node.js (Express, NestJS)': SiNodedotjs,
  'Python (FastAPI, Flask)': SiPython,
  'Java (Spring Boot)': SiSpringboot,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  SQLite: SiSqlite,
  Neo4j: LuNetwork,
  Redis: SiRedis,
  Supabase: SiSupabase,
  NeonDB: LuDatabase,
  Firebase: SiFirebase,

  // Platform and DevOps
  Docker: SiDocker,
  'Git & GitHub': SiGit,
  'GitHub Actions': SiGithubactions,
  Jenkins: SiJenkins,
  AWS: SiAmazonaws,
  'Google Cloud': SiGooglecloud,
  Cloudflare: SiCloudflare,
  Vercel: SiVercel,
  Render: SiRender,
  'FastAPI Cloud': SiFastapi,
  'Firebase Hosting': SiFirebase,
  'HuggingFace Spaces': LuBoxes,
  Nginx: SiNginx,

  // Data and ML
  PyTorch: SiPytorch,
  TensorFlow: SiTensorflow,
  'scikit-learn': SiScikitlearn,
  'XGBoost & LightGBM': LuTrees,
  'Pandas & NumPy': SiPandas,
  'LangChain & LangGraph': LuShare2,
};

export default techIcons;
