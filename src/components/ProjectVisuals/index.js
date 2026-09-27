import LinkTrackerVisual from './LinkTrackerVisual';

/**
 * Drawn visuals for projects a screenshot cannot explain, keyed by the
 * `visual` field on the project in src/data/projects.js. A key with no entry
 * here falls back to the screenshot or the icon panel, so a typo degrades to
 * the old card rather than an empty one.
 */
export const PROJECT_VISUALS = {
  'link-tracker': LinkTrackerVisual,
};

export default PROJECT_VISUALS;
