/**
 * The home page figure may not drift from the artifact it claims to quote.
 *
 * src/data/workedExample.js transcribes six numbers out of the fraud analysis
 * so the home page can render a figure without a fetch. Transcribed numbers rot
 * - that is the whole reason the analysis it comes from generates its README,
 * its report and its demo from one metrics file. This is that guarantee,
 * extended to the one place the number was copied by hand: re-run the analysis,
 * drop in a new artifact, and any value that moved fails here by name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COST_MODEL, DATASETS, NULL_MODEL, SOURCE } from '../data/workedExample';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const metrics = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public', SOURCE.path), 'utf8')
);

describe('worked example data', () => {
  it('quotes an artifact that exists where the figure says it does', () => {
    expect(metrics.best_per_dataset).toBeDefined();
    expect(metrics.git_sha.startsWith(SOURCE.gitSha)).toBe(true);
  });

  it('states the cost function the analysis actually minimised', () => {
    expect(metrics.cost_model.cost_fn).toBe(COST_MODEL.falseNegative);
    expect(metrics.cost_model.cost_fp).toBe(COST_MODEL.falsePositive);
  });

  it('states the null model the headline metric exists to defeat', () => {
    expect(Number((metrics.baseline_dummy.accuracy * 100).toFixed(2))).toBe(
      NULL_MODEL.accuracyPct
    );
    expect(metrics.baseline_dummy.recall).toBe(0);
    expect(metrics.n_positive_test).toBe(NULL_MODEL.fraudPresent);
  });

  it.each(DATASETS)('$id matches the artifact row it is drawn from', (row) => {
    const source = metrics.best_per_dataset[row.id];
    expect(source).toBeDefined();

    expect({
      doingNothing: row.doingNothing,
      atThreshold: row.atThreshold,
      threshold: row.threshold,
      fraudCaughtPct: row.fraudCaughtPct,
      reductionPct: row.reductionPct,
    }).toEqual({
      doingNothing: source.cost_of_doing_nothing,
      atThreshold: source.total_cost,
      threshold: source.threshold,
      fraudCaughtPct: source.fraud_caught_pct,
      reductionPct: source.cost_reduction_pct,
    });
  });

  it('covers every dataset the artifact reports, so none is quietly dropped', () => {
    // The Bank Account row is the one the project's post-mortem calls a
    // failure. Showing two of three would be a stronger-looking figure and a
    // weaker claim, so the figure is not allowed to be a subset.
    expect(DATASETS.map((row) => row.id).sort()).toEqual(
      Object.keys(metrics.best_per_dataset).sort()
    );
  });

  it('never shows a result worse than doing nothing without saying so', () => {
    DATASETS.forEach((row) => {
      expect(row.atThreshold).toBeLessThan(row.doingNothing);
    });
  });
});
