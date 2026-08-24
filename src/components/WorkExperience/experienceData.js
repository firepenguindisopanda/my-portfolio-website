import { useState, useCallback } from 'react';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import BusinessIcon from '@mui/icons-material/Business';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Work history, and the expand/collapse state four renderers share.
 *
 * One accent for the whole section. This used to rotate through seven palette
 * colours by index - primary, secondary, warning, info, error, success - so a
 * run of jobs read as a traffic-light chart where the colours carried no
 * meaning, and `warning` in particular is reserved for uncertainty.
 */
export const workExperiences = [
  {
    id: 'tutor',
    title: 'Part Time Tutor',
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'September 2024 - May 2026',
    type: 'Education',
    icon: SchoolIcon,
    achievements: ['Software Engineering', 'Mentorship', 'Best Practices'],
    items: [
      {
        type: 'task',
        icon: SchoolIcon,
        text: 'Delivered practical sessions on software engineering concepts and coding best practices.',
      },
      {
        type: 'task',
        icon: CodeIcon,
        text: 'Mentored Students on projects, emphasizing version control, design patterns, CI/CD and modern development methodologies.',
      },
    ],
  },
  {
    id: 'scs-contract',
    title: 'Full Stack Developer',
    organization: 'Scarlet Creative Software',
    period: 'September 2024 - May 2025',
    type: 'Full Stack',
    icon: CodeIcon,
    achievements: ['Nuxt.js', 'Firebase', 'Cloud Functions'],
    items: [
      {
        type: 'task',
        icon: CodeIcon,
        text: 'Maintained and improved a Nuxt js application that uses Firebase services, implementing Cloud Functions for server-side logic and data workflows.',
      },
      {
        type: 'task',
        icon: DeveloperModeIcon,
        text: 'Architected and refactored user facing features such as form creation, editing and management, ensuring seamless integration between front end components and backend APIs.',
      },
      {
        type: 'task',
        icon: BusinessIcon,
        text: 'Built and consumed RESTful APIs via cloud functions to handle account management and pdf report generations.',
      },
      {
        type: 'task',
        icon: WorkIcon,
        text: 'Optimized UX across devices and browsers by enforcing responsive design principles and maintaining brand consistency throughout the application.',
      },
    ],
  },
  {
    id: 'ccudev-may24',
    title: 'Independent Developer',
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'May - June 2024',
    type: 'Development',
    icon: DeveloperModeIcon,
    achievements: ['99.59% Performance', 'System Design', 'Optimization'],
    items: [
      { type: 'task', icon: BusinessIcon, text: 'Created various software design artefacts.' },
      { type: 'task', icon: CodeIcon, text: 'Ensured the frontend and backend were connected and working as expected.' },
      { type: 'task', icon: DeveloperModeIcon, text: 'Improved Design of Frontend components to display data in a more user-friendly and accessible manner.' },
      { type: 'achievement', icon: WorkspacePremiumIcon, text: 'Optimized PDF parsing functionality, reducing processing time and achieving a 99.59% performance improvement.' },
      { type: 'task', icon: CodeIcon, text: 'Improved the backend to handle errors and exceptions.' },
      { type: 'task', icon: BusinessIcon, text: 'Conducted thorough performance analysis and profiling to identify bottlenecks and implement effective optimization strategies.' },
    ],
  },
  {
    id: 'ccudev-jan24',
    title: 'Independent Developer',
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'January - February 2024',
    type: 'Development',
    icon: DeveloperModeIcon,
    achievements: ['System Design', 'Testing', 'Deployment'],
    items: [
      { type: 'task', icon: BusinessIcon, text: 'Created various software design artefacts.' },
      { type: 'task', icon: CodeIcon, text: 'Implemented the system according to the design artefacts and requirements.' },
      { type: 'task', icon: CheckCircleIcon, text: 'Performed unit testing.' },
      { type: 'task', icon: DeveloperModeIcon, text: 'Delivered a prototype deployment of the system.' },
    ],
  },
  {
    id: 'beuwi-may23',
    title: 'Independent Developer',
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'May - July 2023',
    type: 'Development',
    icon: DeveloperModeIcon,
    achievements: ['Migration', 'CI/CD', 'Production Deploy'],
    items: [
      { type: 'task', icon: CodeIcon, text: 'Performed migration and dependencies updates' },
      { type: 'task', icon: BusinessIcon, text: 'Deployed updates to staging and production environments' },
      { type: 'task', icon: DeveloperModeIcon, text: 'Created various software design artefacts.' },
      { type: 'task', icon: CodeIcon, text: 'Implemented the system according to the design artefacts and requirements.' },
      { type: 'task', icon: CheckCircleIcon, text: 'Performed unit testing.' },
      { type: 'task', icon: BusinessIcon, text: 'Delivered a prototype deployment of the system.' },
      { type: 'task', icon: CodeIcon, text: 'Updated routes and controllers for the backend to successfully handle errors and exceptions.' },
    ],
  },
  {
    id: 'web3-intern',
    title: 'Intern',
    organization: 'UWI Department of Computing and Information Technology',
    period: 'July - August, 2022',
    type: 'Internship',
    icon: WorkIcon,
    achievements: ['Web3/Blockchain', 'CI/CD Pipeline', 'Angular'],
    items: [
      { type: 'task', icon: BusinessIcon, text: 'Created scripts to automatically deploy applications using Jenkins CI / CD pipeline.' },
      { type: 'task', icon: CodeIcon, text: 'Updated the Flask API with new functions and routes to send data to the frontend applications.' },
      { type: 'achievement', icon: DeveloperModeIcon, text: 'Created 5 Angular Blockchain Web3 Applications and connected them to the Flask API and the Blockchain.' },
      { type: 'task', icon: CheckCircleIcon, text: 'Created Unit Test for the 5 Angular Blockchain Web3 Applications to automatically run on the Jenkins Server before deploying.' },
    ],
  },
  {
    id: 'beuwi-jan22',
    title: 'Independent Developer',
    organization: 'UWI, Department of Computing and Information Technology',
    period: 'January - February, 2022',
    type: 'Development',
    icon: DeveloperModeIcon,
    achievements: ['Angular Migration', 'Search Feature', 'CI/CD'],
    items: [
      { type: 'task', icon: CodeIcon, text: 'Updated existing Angular Applications to the latest version, fixing errors that occured.' },
      { type: 'task', icon: DeveloperModeIcon, text: 'Updated existing search feature to autocomplete search.' },
      { type: 'task', icon: CheckCircleIcon, text: 'Identified and fixed bugs with the existing application. The fix contributed to the overall user experience of the application.' },
      { type: 'task', icon: BusinessIcon, text: 'Changed CircleCI workflow to Github Actions.' },
    ],
  },
];

/** Which entries are open. Shared, so switching mode does not lose the state. */
export const useExpanded = () => {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { expanded, toggle };
};
