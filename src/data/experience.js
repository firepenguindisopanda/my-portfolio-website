/**
 * Work history, newest first. home/Experience.jsx draws it as the timeline and
 * groups repeated roles under one heading, keeping each period visible. A
 * `group` joins consecutive periods with different titles under one heading,
 * as the UWI contract work and the internship are on the resume.
 *
 * Client work is stated at sector level only: see data/clientWork.js.
 */
export const workExperiences = [
  {
    id: 'teaching-assistant',
    title: 'Full Time Teaching Assistant',
    organization: 'UWI, Department of Computing and Information Technology',
    // The appointment letter (2026 September 03) sets the term as
    // 2026 September 01 to 2027 May 31. Stated as the term rather than as
    // "present" because it has a defined end date, which is the same standard
    // every other row here is written to.
    period: 'September 2026 to May 2027',
    type: 'Education',
    // 'Cloud computing' rather than 'Two semesters': both of these are terms a
    // recruiter or an ATS actually matches on, and the period is already stated
    // above. The spread is the point - analytics at one end, cloud at the other.
    achievements: ['Data analytics', 'Cloud computing', 'Five courses'],
    items: [
      /*
       * Every title is the official course title, not a paraphrase. The
       * appointment letter names codes only; the Semester I pair was resolved by
       * code against the published UWI timetable, and the Semester II three came
       * from the departmental course descriptions, which is where they had to
       * come from - the Semester II timetable is not published yet.
       *
       * INFO 3604's real title is just "Project" (the capstone), so it is left
       * as that rather than dressed up into something more descriptive.
       */
      {
        type: 'task',
        text: 'Semester I: Introduction to Data Analytics (COMP 3605) and Business Information Systems (INFO 3600).',
      },
      {
        type: 'task',
        text: 'Semester II: Information Systems Development (INFO 2600), Project (INFO 3604) and Cloud Computing (INFO 3606).',
      },
      {
        type: 'task',
        text: 'Ran practical sessions and supported coursework across the department\'s computing and information technology programmes.',
      },
      {
        type: 'task',
        text: 'Produced a typeset guide of worked solutions to the COMP 3605 tutorials and assignments.',
      },
      {
        type: 'task',
        text: 'Rebuilt the INFO 3600 lab walkthroughs, added an advanced SQL track, and redesigned the Power BI labs with every figure they quote checked against the data by script.',
      },
    ],
  },
  {
    id: 'consultancy',
    title: 'Contract Software Engineer',
    organization: 'A Caribbean software consultancy',
    period: 'August 2025 to present',
    type: 'Full Stack',
    achievements: ['Angular and Ionic', 'Multi-tenant SaaS', 'Audits and specs'],
    items: [
      {
        type: 'task',
        text: 'Built and maintain the frontend of a payroll and HR platform used in several Caribbean countries, shipped by CI to seven tenant deployments.',
      },
      {
        type: 'task',
        // The 2026 client work is not public yet: stated as experience, with no sector.
        text: 'Rebuilt and upgraded other client apps over legacy APIs that could not change, testing write paths against Docker replicas of production.',
      },
      {
        type: 'task',
        text: 'Wrote product and requirements specs, production readiness and security audits, and runbooks for Windows and Linux servers.',
      },
    ],
  },
  {
    id: 'tutor',
    title: 'Part Time Tutor',
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'September 2024 to May 2026',
    type: 'Education',
    achievements: ['Software Engineering', 'Mentorship', 'Best Practices'],
    items: [
      {
        type: 'task',
        text: 'Ran practical sessions on software engineering concepts and good coding practice.',
      },
      {
        type: 'task',
        text: 'Mentored students on their projects, with a focus on version control, design patterns and CI/CD.',
      },
    ],
  },
  {
    id: 'scs-contract',
    title: 'Full Stack Developer',
    organization: 'Scarlet Creative Software',
    period: 'September 2024 to May 2025',
    type: 'Full Stack',
    achievements: ['Nuxt.js', 'Firebase', 'Cloud Functions'],
    items: [
      {
        type: 'task',
        text: 'Maintained and extended a Nuxt.js app built on Firebase, writing Cloud Functions for its server-side logic and data workflows.',
      },
      {
        type: 'task',
        text: 'Designed and refactored the form features (creating, editing and managing forms) and connected them to the backend APIs.',
      },
      {
        type: 'task',
        text: 'Built REST APIs on Cloud Functions for account management and PDF report generation, and wired them into the app.',
      },
      {
        type: 'task',
        text: 'Made the app work well across devices and browsers with responsive layouts, and kept it consistent with the brand.',
      },
    ],
  },
  {
    id: 'uwi-contract-may24',
    title: 'Contract Developer',
    group: { id: 'uwi-contract', title: 'Contract Developer and Intern' },
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'May to June 2024',
    type: 'Development',
    achievements: ['99.59% Performance', 'System Design', 'Optimization'],
    items: [
      { type: 'task', text: 'Created various software design artefacts.' },
      { type: 'task', text: 'Connected the frontend to the backend and tested that they worked together.' },
      { type: 'task', text: 'Redesigned frontend components so the data was easier to read and more accessible.' },
      { type: 'achievement', text: 'Cut PDF parsing time by 99.59% after profiling the parser.' },
      { type: 'task', text: 'Added error and exception handling to the backend.' },
      { type: 'task', text: 'Profiled the system to find its bottlenecks, then fixed them.' },
    ],
  },
  {
    id: 'uwi-contract-jan24',
    title: 'Contract Developer',
    group: { id: 'uwi-contract', title: 'Contract Developer and Intern' },
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'January to February 2024',
    type: 'Development',
    achievements: ['System Design', 'Testing', 'Deployment'],
    items: [
      { type: 'task', text: 'Created various software design artefacts.' },
      { type: 'task', text: 'Implemented the system according to the design artefacts and requirements.' },
      { type: 'task', text: 'Performed unit testing.' },
      { type: 'task', text: 'Delivered a prototype deployment of the system.' },
    ],
  },
  {
    id: 'uwi-contract-may23',
    title: 'Contract Developer',
    group: { id: 'uwi-contract', title: 'Contract Developer and Intern' },
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'May to July 2023',
    type: 'Development',
    achievements: ['Migration', 'CI/CD', 'Production Deploy'],
    items: [
      { type: 'task', text: 'Migrated the app and updated its dependencies.' },
      { type: 'task', text: 'Deployed updates to staging and production.' },
      { type: 'task', text: 'Created various software design artefacts.' },
      { type: 'task', text: 'Implemented the system according to the design artefacts and requirements.' },
      { type: 'task', text: 'Performed unit testing.' },
      { type: 'task', text: 'Delivered a prototype deployment of the system.' },
      { type: 'task', text: 'Updated the backend routes and controllers to handle errors and exceptions.' },
    ],
  },
  {
    id: 'uwi-intern-jul22',
    title: 'Intern',
    group: { id: 'uwi-contract', title: 'Contract Developer and Intern' },
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'July to August 2022',
    type: 'Internship',
    achievements: ['Web3/Blockchain', 'CI/CD Pipeline', 'Angular'],
    items: [
      { type: 'task', text: 'Wrote scripts to deploy applications automatically through a Jenkins CI/CD pipeline.' },
      { type: 'task', text: 'Updated the Flask API with new functions and routes to send data to the frontend applications.' },
      { type: 'achievement', text: 'Built 5 Angular Web3 applications and connected them to the Flask API and the blockchain.' },
      { type: 'task', text: 'Wrote unit tests for the 5 Web3 applications that run on the Jenkins server before each deploy.' },
    ],
  },
  {
    id: 'uwi-contract-jan22',
    title: 'Contract Developer',
    group: { id: 'uwi-contract', title: 'Contract Developer and Intern' },
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'January to February 2022',
    type: 'Development',
    achievements: ['Angular Migration', 'Search Feature', 'CI/CD'],
    items: [
      { type: 'task', text: 'Upgraded existing Angular applications to the latest version and fixed the errors the upgrade caused.' },
      { type: 'task', text: 'Changed the existing search to autocomplete.' },
      { type: 'task', text: 'Found and fixed bugs in the existing application.' },
      { type: 'task', text: 'Moved the CircleCI workflow to GitHub Actions.' },
    ],
  },
];

/**
 * The roles as the Experience timeline lists them: consecutive stints with
 * the same title at the same place, and periods that share a `group`, are one
 * entry. The hero card's back counts these too, so the two never disagree.
 */
const groupKey = (e) => (e.group ? `group:${e.group.id}` : `role:${e.title}|${e.organization}`);

export const roleGroups = workExperiences.reduce((acc, e) => {
  const last = acc[acc.length - 1];
  if (last && last.key === groupKey(e)) last.parts.push(e);
  else acc.push({ key: groupKey(e), id: e.id, title: e.group?.title || e.title, organization: e.organization, parts: [e] });
  return acc;
}, []);
