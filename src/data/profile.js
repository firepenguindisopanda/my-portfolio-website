import RESUME from '../assets/NicholasSmith_Resume.pdf';

/**
 * Single source of truth for identity, contact details and headline copy.
 * Previously these were re-typed in BusinessCard, DrawerAppBar, Contact and
 * AboutMe, which is how the experience claim drifted out of sync.
 */
export const profile = {
  name: 'Nicholas Smith',
  /**
   * Both roles, because both are being applied for.
   *
   * This read "Software Engineer" while the site was being used to look for
   * data work as well, and the only place the second half was ever stated was
   * the Contact blurb at the very bottom of a ~9,700px page. A data hiring
   * manager scanning the first screen had nothing to match on and no reason to
   * keep scrolling. The thesis below covers both readings of the same habit -
   * an audit script for an engineer, a confidence interval for an analyst - so
   * naming both here is a claim the rest of the page already substantiates.
   */
  role: 'Software engineer and data analyst',
  location: 'Port of Spain, Trinidad & Tobago',
  available: true,
  /** Said plainly wherever availability shows - hero, file card, contact. */
  availability: 'Open to software engineering, data and ML roles, and to contract work.',

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
    'Working across full-stack web, data analysis and machine learning from Port of ' +
    'Spain. Recent work includes multi-agent AI systems built on LangGraph and ' +
    'Pinecone, a fraud-detection study reported with bootstrap confidence intervals ' +
    'and cost curves rather than one accuracy score, and a document extraction ' +
    'pipeline combining OCR and computer vision.',

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
   *
   * One row per audience, deliberately. All three used to be engineering
   * instances - an audit script, an eval harness, and python_ocr's arithmetic
   * reconciliation - which made a sentence that describes both halves of the
   * job read as if it only described one. python_ocr made way for
   * fraud-analysis because it was also the most redundant of the three: it and
   * handbooks-parser are both "re-check the extraction independently", where
   * choosing a threshold from a cost function is the same habit doing a
   * different job.
   */
  heroLedger: [
    {
      id: 'handbooks-parser',
      name: 'handbooks-parser',
      claim: 'A separate audit script re-reads the source PDFs independently of the parser.',
    },
    {
      id: 'fraud-detection',
      name: 'fraud-analysis',
      claim: 'The alert threshold comes from a cost function, not from maximising accuracy.',
    },
    {
      id: 'bi-automatic-reporting',
      name: 'bi-reporting',
      claim: 'An eval harness with a hallucination canary fixture gates prompt changes.',
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

  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'Rust',
    'C# / .NET',
    'Data Science',
    'Machine Learning',
    'LLMs & Multi-Agent Systems',
  ],
};

/**
 * In-page sections, in the order they appear on the home page.
 *
 * Every id here is anchored on the home page (Home.test.jsx asserts it), and
 * `useSectionSpy` watches the whole list so the header underlines where the
 * reader actually is. Only the ones without `nav: false` become header links:
 * "Try it" and "Recognition" are things you arrive at by scrolling rather than
 * things you go looking for.
 */
export const sections = [
  { id: 'story', label: 'Work' },
  { id: 'try-it', label: 'Try it', nav: false },
  { id: 'index', label: 'Index' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'recognition', label: 'Recognition', nav: false },
  { id: 'contact', label: 'Contact' },
];

/** The subset the app bar and drawer link to. */
export const navSections = sections.filter((section) => section.nav !== false);

/** Deep-dive pages, grouped under one menu rather than five top-level links. */
export const portfolioPages = [
  { label: 'Full-Stack Web', path: '/fullstack' },
  { label: 'Desktop Tools', path: '/desktop' },
  { label: 'Android', path: '/android' },
  { label: 'Machine Learning', path: '/ml' },
  { label: 'Background', path: '/background' },
  { label: 'About the Panda', path: '/about-panda' },
];

export default profile;
