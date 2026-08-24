import { projects } from './projects';

/**
 * The six practice domains shown on the Range board.
 *
 * Rule for this file: every `stat` must be measurable from this repo or from a
 * project write-up it links to, and `source` names where to check it. A number
 * that cannot be verified from the evidence it cites does not go on the board.
 */

const fullStackCount = projects.filter((p) => p.category === 'Full Stack').length;

export const domains = [
  {
    code: 'UI',
    name: 'Web design & frontend',
    stat: { value: 4, label: 'theme personalities' },
    source: 'this site - try the palette control in the top bar',
    claim:
      'Four switchable palettes share one token system on this site: same type scale, radii and motion, different mood.',
    flagships: [
      { id: 'portfolio-website', name: 'portfolio-website' },
      { id: 'chimp-test-game', name: 'chimp-test' },
    ],
  },
  {
    code: 'APP',
    name: 'Full-stack web apps',
    stat: { value: fullStackCount, label: 'full-stack builds' },
    source: 'the projects below, filtered to Full Stack',
    claim:
      'FastAPI, Node and Next.js services with real auth, caching, rate limits and the failure paths handled.',
    flagships: [
      { id: 'fastapimocker', name: 'fastapimocker' },
      { id: 'uwi-scraper', name: 'uwi-scraper' },
    ],
  },
  {
    code: 'DESK',
    name: 'Desktop engineering',
    stat: { value: 3, label: 'tools in one offline binary' },
    source: 'PDF Tools - Rust core, Tauri v2, Angular 20',
    claim:
      'Native apps for documents that should never leave the machine: merge, split and audit PDFs with no upload and no account.',
    flagships: [{ id: 'pdf-tools', name: 'pdf-tools' }],
  },
  {
    code: 'DATA',
    name: 'Data science',
    stat: { value: 89, suffix: '%', label: 'modelled fraud losses cut' },
    source: 'fraud detection - threshold derived from a cost function',
    claim:
      'Analysis that reports confidence intervals, paired significance tests and cost curves rather than a single accuracy score.',
    flagships: [
      { id: 'fraud-detection', name: 'fraud-detection' },
      { id: 'starbucks-offer-analysis', name: 'starbucks-analysis' },
    ],
  },
  {
    code: 'ML',
    name: 'Machine learning & DL',
    stat: { value: 2, label: 'datathon podium finishes' },
    source: 'WiDS Datathon, Trinidad & Tobago - 2nd and 3rd place teams',
    claim:
      'Sub-seasonal temperature forecasting with LightGBM on 375K+ samples, and ASR data preparation for Caribbean speech.',
    flagships: [
      { id: 'wids-temp-forecasting', name: 'wids-forecasting' },
      { id: 'caribbean-asr-data-science', name: 'caribbean-asr' },
    ],
  },
  {
    code: 'AGT',
    name: 'LLMs & multi-agent systems',
    stat: { value: 11, label: 'specialist agents, one graph' },
    source: 'IdeaSprinter - a LangGraph StateGraph in three phases',
    claim:
      'Agent systems built to be argued with: an adversarial skeptic, eval harnesses, and a hallucination canary gating prompt changes.',
    flagships: [
      { id: 'idea-sprint', name: 'idea-sprint' },
      { id: 'bi-automatic-reporting', name: 'bi-reporting' },
    ],
  },
];

export default domains;
