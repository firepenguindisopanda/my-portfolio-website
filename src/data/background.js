import CCU_TECH_LEAD_CERTIFICATE from '../assets/CCU_Tech_lead.pdf';
import { profile } from './profile';

/**
 * The /background page's own content: the About narrative (which used to be
 * a home page section) and the mentoring record. Credentials and placings
 * come from data/certificates.js, which the home page shares.
 */

/**
 * Degrees and the diploma, newest first. The M.Sc. is in progress (part
 * time), so it says since when rather than a year awarded.
 */
export const education = [
  { id: 'msc', award: 'M.Sc. Data Science, part time', school: 'The University of the West Indies, St. Augustine', when: 'Since September 2026' },
  { id: 'bsc', award: 'B.Sc. Computer Science', school: 'The University of the West Indies, St. Augustine', when: '2024' },
  { id: 'diploma', award: 'Diploma in Software Engineering', school: 'University of Trinidad and Tobago, John Donaldson Campus', when: '2018' },
];

/**
 * The bio used to be swapped by colour theme - one version for corporate-clean,
 * a shorter generic one for everything else. Content shouldn't change with a
 * palette, so the stronger version is the only version.
 */
export const bio = [
  `Most of what interests me comes back to one question: why do people and systems behave the way they do? In software engineering, machine learning and AI, that becomes a technical problem of modelling prediction and decision-making in code. I also read sociology, anthropology, psychology and philosophy, where the same question is about how people make meaning, form communities and make choices.`,
  `The two sides overlap more than they seem to. It's why I care about the psychology of interface design: how a screen fits the way people's attention, memory and expectations work as they move through a product, as well as how it looks.`,
  `At home I tinker with Raspberry Pis and IoT devices, wiring up small systems to see software control something physical. I like taking an idea apart until I understand it well enough to build it again myself.`,
];

/** The three short notes that sat beside the bio. */
export const notes = [
  {
    title: 'I teach what I use',
    // Present tense only for what is current: WiDS mentoring and private
    // tutoring. The DCIT sessions were the part-time tutor role, now past.
    body: 'I mentor with the WiDS Datathon, and I tutor students privately in their UWI courses. Earlier, as a part-time tutor at UWI DCIT, I ran sessions on version control, design patterns and CI/CD for students on their first real projects.',
  },
  {
    title: 'I check results more than one way',
    body: 'My ML write-ups compare methods side by side: permutation importance next to Gini importance, and precision-recall next to the ROC curve, which looks better than it should on imbalanced data. When two methods disagree, I report where and why.',
  },
  {
    title: 'I still practise the fundamentals',
    body: 'I keep up data structures and algorithms practice on Codewars, LeetCode and Codeforces, and the profiles are public.',
    links: [
      { label: 'Codewars', href: profile.links.codewars },
      { label: 'LeetCode', href: profile.links.leetcode },
      { label: 'Codeforces', href: profile.links.codeforces },
    ],
  },
];

/**
 * Mentoring and community work. One entry per programme, the points in the
 * open, and a link wherever there is a certificate to check. No summary
 * numbers ("50+ students tutored"), because none can say where they come from.
 */
export const community = [
  {
    id: 'wids-mentor',
    role: 'Mentor, WiDS Datathon',
    organisation: 'UWI, Department of Computing and Information Technology',
    period: '2022 to present',
    points: [
      'Wrote the training content the other mentors work from.',
      'Mentored the team that placed 3rd in the 2024 local datathon, a team of four.',
    ],
    links: [
      {
        label: 'Certificate',
        href: 'https://www.linkedin.com/in/nicholas-smith-933125148/details/certifications/1711166446408/single-media-viewer/?profileId=ACoAACOdFPcBKISwS8FqrESmFMsZpo9GSQh6yk4',
      },
    ],
  },
  {
    id: 'ccu-tech-lead',
    role: 'Tech lead, Computer Connections Unit apprenticeship',
    organisation: 'UWI, Department of Computing and Information Technology',
    period: 'August to September 2024',
    points: [
      'Led the tech team on the My Advisor project.',
      'Ran a cross-functional team on an Agile cadence.',
      'Set up the GitHub project structure and wrote the development tasks.',
    ],
    links: [{ label: 'Certificate of achievement', href: CCU_TECH_LEAD_CERTIFICATE }],
  },
  {
    id: 'wids-lead-mentor',
    role: 'Lead mentor, WiDS Datathon 2022/23',
    organisation: 'UWI, Department of Computing and Information Technology',
    period: '2023',
    points: [
      'Delivered an interactive exploratory data analysis tutorial.',
      'Led the team to 2nd place in the local competition.',
    ],
    links: [
      {
        label: 'Certificate',
        href: 'https://www.linkedin.com/posts/nicholas-smith-933125148_certificate-of-participation-in-wids-2023-activity-7040796180926099457-wvrs?utm_source=share&utm_medium=member_desktop',
      },
    ],
  },
  {
    id: 'youth-speak-up',
    role: 'Digital literacy mentor, Youth Speak Up programme',
    organisation: 'St. Augustine Rotary Club and UWI',
    period: '2022',
    points: ['Google Docs training.', 'Google Sheets data-management workshops.', 'Google Slides presentation workshops.'],
    links: [],
  },
  {
    id: 'robotics-bootcamp',
    role: 'Robotics mentor, DCIT Robotics Boot Camp',
    organisation: 'UWI, Department of Computing and Information Technology',
    // The source data recorded no year for this one, so none is claimed.
    period: null,
    points: [
      'Guided students through Python for autonomous robot navigation.',
      'Coached the team that won the maze-solving challenge.',
    ],
    links: [],
  },
];
