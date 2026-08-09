import RESUME from '../assets/NicholasSmith_Resume.pdf';

/**
 * Single source of truth for identity, contact details and headline copy.
 * Previously these were re-typed in BusinessCard, DrawerAppBar, Contact and
 * AboutMe, which is how the experience claim drifted out of sync.
 */
export const profile = {
  name: 'Nicholas Smith',
  role: 'Software Engineer',
  location: 'Port of Spain, Trinidad & Tobago',
  available: true,

  tagline: 'Building full-stack systems that make a difference',

  /**
   * The hero framing line. Read the projects in this repo end to end and the
   * same concern appears in most of them - a separate audit script, an eval
   * harness, an arithmetic check, a circuit breaker, a fourth "ambiguous"
   * outcome where three would have done. This sentence names that concern,
   * and `heroLedger` below gives three specific instances of it.
   *
   * Written plainly and in the first person, describing an approach rather
   * than making a claim about it. Earlier drafts personified the systems
   * ("check their own work and say so when they aren't sure"), which read as
   * a slogan rather than as a description of how the work is done.
   */
  thesis:
    'A recurring theme in my work is verification: building systems that can check ' +
    'their own output and report where they are uncertain.',

  /**
   * The hero proof line. Every claim here is drawn from the work-experience and
   * project data in this repo - keep it that way.
   */
  proof:
    'Software engineer in Port of Spain, working across full-stack web, machine learning ' +
    'and desktop tools. Recent work includes multi-agent AI systems built on LangGraph ' +
    'and Pinecone, a cache-aware web crawler with PostgreSQL full-text search, and a ' +
    'document extraction pipeline combining OCR and computer vision.',

  /**
   * Names the ledger below as examples of the framing line above it. Without
   * this the three rows read as an unexplained list rather than as the
   * evidence for the sentence they sit under.
   */
  heroLedgerLabel: 'Three examples, from the projects below',

  /**
   * Three instances of the framing line, shown in the hero as its supporting
   * evidence. Each `id` must match a project in src/data/projects.js so the row
   * can link to the case study that substantiates it - the hero's boldest
   * element is also its most useful navigation.
   *
   * Short forms of the `evidence` field on those projects. State the mechanism
   * and stop; the flourish belongs in neither. Keep them under roughly 90
   * characters or the two-column row wraps badly on a tablet.
   */
  heroLedger: [
    {
      id: 'handbooks-parser',
      name: 'handbooks-parser',
      claim: 'A separate audit script re-reads the source PDFs independently of the parser.',
    },
    {
      id: 'bi-automatic-reporting',
      name: 'bi-reporting',
      claim: 'An eval harness with a hallucination canary fixture gates prompt changes.',
    },
    {
      id: 'python-ocr',
      name: 'python_ocr',
      claim: 'Arithmetic reconciliation catches misreads that a confidence score does not.',
    },
  ],

  /**
   * Derived from the earliest entry in WorkExperience (January 2022). Stated as
   * a start year rather than a running total so it never needs updating and
   * never overstates.
   */
  since: 2022,

  personal: {
    // Kept off the app bar and shown in the footer instead.
    motto: 'Born to dilly dally, forced to lock in',
  },

  email: 'nicholas122008@hotmail.com',
  whatsapp: { display: '686-4906', href: 'https://api.whatsapp.com/send?phone=+18686864906' },
  resume: RESUME,

  links: {
    github: 'https://github.com/firepenguindisopanda',
    linkedin: 'https://www.linkedin.com/in/nicholas-smith-933125148/',
    codewars: 'https://www.codewars.com/users/firepenguindisopanda',
    leetcode: 'https://leetcode.com/NickSmith/',
    codeforces: 'https://codeforces.com/profile/nicosmith.smith3',
  },

  skills: ['React', 'Node.js', 'Python', 'AI/ML'],
};

/** In-page sections, in the order they appear on the home page. */
export const sections = [
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
];

/** Deep-dive pages, grouped under one menu rather than five top-level links. */
export const portfolioPages = [
  { label: 'Full-Stack Web', path: '/fullstack' },
  { label: 'Desktop Tools', path: '/desktop' },
  { label: 'Android', path: '/android' },
  { label: 'Machine Learning', path: '/ml' },
  { label: 'About the Panda', path: '/about-panda' },
];

export default profile;
