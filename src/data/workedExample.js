/**
 * The one figure on the home page, and the numbers behind it.
 *
 * Every other section on this page describes work. This one shows a piece of
 * it: the decision at the centre of the fraud-detection case study, drawn from
 * the same artifact the project's README, HTML report and Gradio demo are
 * generated from.
 *
 * Why this decision and not a model score: choosing an alert threshold is the
 * point where analysis stops describing and starts costing somebody money, and
 * it is the clearest instance on the site of the thesis in the hero. A score
 * says the model ranks well. A threshold says which error you would rather
 * make, and admits that the answer depends on a cost ratio somebody has to
 * state out loud.
 *
 * The numbers are transcribed rather than fetched. A fetch on the home page
 * buys a loading state, a layout shift and a request, to display six numbers
 * that change only when the analysis is re-run - and it would not actually make
 * them checkable, because a reader cannot see the response. Instead
 * `src/__tests__/workedExample.data.test.js` reads the artifact in
 * public/ and fails the build if any value here drifts from it, which is the
 * same standard the analysis itself holds: one artifact, and a test that fails
 * on drift.
 */

/** Where every number below is checked against, shown to the reader. */
export const SOURCE = {
  artifact: 'artifacts/metrics.json',
  path: '/portfolio_data/fraud_detection/data/model_metrics.json',
  gitSha: '83ec70c',
  generated: 'August 2026',
  projectId: 'fraud-detection',
};

/**
 * The cost function the threshold is chosen by. Stated in the figure, because a
 * threshold without its cost ratio is not a result - it is a preference nobody
 * wrote down.
 */
export const COST_MODEL = {
  falseNegative: 100,
  falsePositive: 1,
  formula: 'Z = $100 x missed fraud + $1 x false alarm',
};

/**
 * The hook, and the reason average precision replaces accuracy in this project.
 * A classifier that predicts "never fraud" scores this and catches nothing.
 */
export const NULL_MODEL = {
  accuracyPct: 99.83,
  fraudCaught: 0,
  fraudPresent: 98,
};

/**
 * One row per dataset, in descending order of how well it worked.
 *
 * Bars are scaled within a row, not across all three: on a shared dollar axis
 * the Bank Account row (44,100) flattens Online Payment's result to a five-pixel
 * bar, which is a rendering artifact rather than a finding. Each row therefore
 * encodes the share of its own do-nothing cost that survives, which is also the
 * comparison worth making across rows - and both dollar amounts are printed, so
 * the absolute scale is never hidden behind the proportion.
 *
 * The Bank Account row stays in. It is the dataset the project's own post-mortem
 * calls a failure - 24 of 25 features significant, none with a large effect -
 * and a figure that quietly dropped it would be arguing something the analysis
 * does not.
 */
export const DATASETS = [
  {
    id: 'online_payment',
    label: 'Online Payment',
    doingNothing: 5200,
    atThreshold: 390,
    threshold: 0.01,
    fraudCaughtPct: 96.2,
    reductionPct: 92.5,
  },
  {
    id: 'credit_card',
    label: 'Credit Card',
    doingNothing: 9800,
    atThreshold: 1083,
    threshold: 0.02,
    fraudCaughtPct: 89.8,
    reductionPct: 88.9,
  },
  {
    id: 'bank_account',
    label: 'Bank Account',
    doingNothing: 44100,
    atThreshold: 17054,
    threshold: 0.12,
    fraudCaughtPct: 84.8,
    reductionPct: 61.3,
  },
];

/** The two marks in the figure, named once so the legend and bars cannot disagree. */
export const SERIES = {
  baseline: 'No model',
  result: 'At the chosen threshold',
};

export const formatMoney = (value) => `$${value.toLocaleString('en-US')}`;
