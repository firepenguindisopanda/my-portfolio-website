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
        text: 'Rebuilt a food manufacturer\'s production, stock and ordering app over a legacy API that could not change, testing every write path against a Docker replica of production.',
      },
      {
        type: 'task',
        text: 'Moved a licensing platform three framework versions forward, and a CRM from a hosted backend to its own API.',
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
        text: 'Delivered practical sessions on software engineering concepts and coding best practices.',
      },
      {
        type: 'task',
        text: 'Mentored Students on projects, emphasizing version control, design patterns, CI/CD and modern development methodologies.',
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
        text: 'Maintained and improved a Nuxt js application that uses Firebase services, implementing Cloud Functions for server-side logic and data workflows.',
      },
      {
        type: 'task',
        text: 'Architected and refactored user facing features such as form creation, editing and management, ensuring seamless integration between front end components and backend APIs.',
      },
      {
        type: 'task',
        text: 'Built and consumed RESTful APIs via cloud functions to handle account management and pdf report generations.',
      },
      {
        type: 'task',
        text: 'Optimized UX across devices and browsers by enforcing responsive design principles and maintaining brand consistency throughout the application.',
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
      { type: 'task', text: 'Ensured the frontend and backend were connected and working as expected.' },
      { type: 'task', text: 'Improved Design of Frontend components to display data in a more user-friendly and accessible manner.' },
      { type: 'achievement', text: 'Optimized PDF parsing functionality, reducing processing time and achieving a 99.59% performance improvement.' },
      { type: 'task', text: 'Improved the backend to handle errors and exceptions.' },
      { type: 'task', text: 'Conducted thorough performance analysis and profiling to identify bottlenecks and implement effective optimization strategies.' },
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
      { type: 'task', text: 'Performed migration and dependencies updates' },
      { type: 'task', text: 'Deployed updates to staging and production environments' },
      { type: 'task', text: 'Created various software design artefacts.' },
      { type: 'task', text: 'Implemented the system according to the design artefacts and requirements.' },
      { type: 'task', text: 'Performed unit testing.' },
      { type: 'task', text: 'Delivered a prototype deployment of the system.' },
      { type: 'task', text: 'Updated routes and controllers for the backend to successfully handle errors and exceptions.' },
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
      { type: 'task', text: 'Created scripts to automatically deploy applications using Jenkins CI / CD pipeline.' },
      { type: 'task', text: 'Updated the Flask API with new functions and routes to send data to the frontend applications.' },
      { type: 'achievement', text: 'Created 5 Angular Blockchain Web3 Applications and connected them to the Flask API and the Blockchain.' },
      { type: 'task', text: 'Created Unit Test for the 5 Angular Blockchain Web3 Applications to automatically run on the Jenkins Server before deploying.' },
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
      { type: 'task', text: 'Updated existing Angular Applications to the latest version, fixing errors that occurred.' },
      { type: 'task', text: 'Updated existing search feature to autocomplete search.' },
      { type: 'task', text: 'Identified and fixed bugs with the existing application. The fix contributed to the overall user experience of the application.' },
      { type: 'task', text: 'Changed CircleCI workflow to Github Actions.' },
    ],
  },
];
