# Multi-Dataset Fraud Detection Pipeline

> I worked with three financial fraud datasets, five models and one cost
> function. The main output is a decision threshold derived from what a missed
> fraud costs, reported with its uncertainty.

**[Try the interactive explorer](https://huggingface.co/spaces)**,
[Source on GitHub](https://github.com/firepenguindisopanda/fraud-analysis),
[Full HTML report](/reports/fraud_analysis_report.html)

## The problem

A fraud model can be 99.8% accurate and still catch no fraud at all.

On the Credit Card dataset, a classifier that predicts "not fraud" for every
transaction scores **99.83% accuracy** and misses all 98 frauds in the held-out
split. Any metric that rewards that model is the wrong one for this problem, and
accuracy is usually the first one people reach for.

Fraud detection is hard because two problems compound:

1. **Extreme imbalance.** There are between 90 and 774 legitimate transactions
   for every fraudulent one. Fraud is rare enough that a model can ignore it
   entirely and still look excellent.
2. **Asymmetric costs.** Letting a fraudulent transaction through costs the full
   disputed amount. Blocking a legitimate one costs a moment of a customer's
   patience and a few minutes of an analyst's time. A 0.5 decision threshold
   treats those two costs as equal.

## Datasets

| Dataset | Rows analysed | Available | Features | Fraud rate | Imbalance |
|---|---|---|---|---|---|
| Credit Card Fraud | 284,807 | 284,807 | 30 (PCA) | 0.17% | 578:1 |
| Online Payment Fraud | 200,000 | 6,362,620 | 9 (raw) | 0.13% | 774:1 |
| Bank Account Application Fraud | 200,000 | 1,000,000 | 31 (mixed) | 1.10% | 90:1 |

I capped two datasets at 200,000 rows to keep five-fold cross-validation
tractable. That compute budget is recorded in the run configuration.

I chose the three to differ. Credit Card is anonymised PCA components, with
strong signal and no interpretability. Online Payment has transparent balance
features and a near-perfect ROC-AUC that overstates how useful it is. Bank
Account is the hard case: the model mostly fails there, and most of the work
went into explaining why.

## Results

| Dataset | Best model | Average precision (95% CI) | Lift vs chance | ROC-AUC | Fraud in test |
|---|---|---|---|---|---|
| Online Payment | XGBoost | **0.891** (0.820-0.955) | 686x | 1.000 | 52 |
| Credit Card | XGBoost | **0.876** (0.811-0.931) | 509x | 0.975 | 98 |
| Bank Account | XGBoost | **0.136** (0.109-0.169) | 12x | 0.874 | 441 |

I report average precision as the headline metric. Below a 1% base rate,
accuracy is dominated by the majority class and ROC-AUC by the true-negative
mass, so both stay high for models that are not useful. Average precision
summarises the precision-recall curve, which is the curve a fraud team works on.
The lift column shows how many times better than random the ranking is.

### The accuracy paradox, measured

| Dataset | Model | Accuracy | Fraud caught | Average precision |
|---|---|---|---|---|
| Credit Card | Dummy (most frequent) | **99.83%** | 0 / 98 | 0.0017 |
| Credit Card | XGBoost | 99.95% | 82 / 98 | 0.8760 |
| Bank Account | Dummy (most frequent) | **98.90%** | 0 / 441 | 0.0110 |
| Bank Account | XGBoost | 93.08% | 234 / 441 | 0.1359 |

In the Bank Account rows the useful model has *lower* accuracy than the useless
one, so choosing between them by accuracy would pick the wrong model.

### Choosing the threshold from cost

The objective is `Z = $100 x false negative + $1 x false alarm`. The 0.5 default
is optimal only when those two costs are equal.

| Dataset | Threshold | Fraud caught | False alarms | Cost Z | vs doing nothing |
|---|---|---|---|---|---|
| Credit Card | **0.02** | 88 / 98 (90%) | 83 | $1,083 | **-89%** |
| Online Payment | **0.01** | 50 / 52 (96%) | 190 | $390 | **-92%** |
| Bank Account | **0.12** | 374 / 441 (85%) | 10,354 | $17,054 | **-61%** |

The recommendation depends on the cost ratio, so the project publishes the whole
cost surface. As the ratio moves from 1:1 to 50:1, the optimal Credit Card
threshold slides from 0.97 to 0.02.

## What this found

### 1. Imbalance correction and threshold tuning solve the same problem

SMOTE and `class_weight="balanced"` shift *where the decision boundary falls*,
but they barely change how well a model *ranks*. Since the operating threshold
is chosen separately from the cost function, the correction is largely
redundant: the threshold already handles the problem it addresses.

### 2. SMOTE plus class weighting is a no-op

`class_weight="balanced"` computes `n_samples / (n_classes x bincount(y))`. After
SMOTE has equalised the classes, that evaluates to exactly `[1.0, 1.0]`, so the
class weighting has no effect.

| Strategy | Model | Average precision | Precision | Recall |
|---|---|---|---|---|
| `none` | Random Forest | 0.8729 | 0.9419 | 0.8265 |
| `class_weight` | Random Forest | 0.8590 | 0.9610 | 0.7551 |
| `smote` | Random Forest | 0.8751 | 0.8804 | 0.8265 |
| `smote+cw` | Random Forest | **0.8751** | **0.8804** | **0.8265** |

The last two rows are identical to the last decimal, which shows the two
corrections do not compound. A test in the suite pins this result so it stays
true as the code changes.

### 3. The best regularisation depends on the dataset

Forest leaf size is tuned by cross-validation on the training split. Where the
classes separate cleanly it selects unpruned trees. On the noisy application
data it prunes hard, which *improved* average precision and shrank the
serialised model by about 70%, because unbounded trees were memorising noise.

Tuning on the training folds matters. Picking the leaf size by comparing test
scores is selection on the test set, and every number reported afterwards would
be optimistically biased.

### 4. Most "significant" differences are too small to matter

| Dataset | Features tested | Significant after BH | Large effect | Negligible |
|---|---|---|---|---|
| Credit Card | 30 | 28 | 15 | 8 |
| Online Payment | 7 | 7 | 2 | 2 |
| Bank Account | 25 | 24 | **0** | 13 |

At n = 284,807 the standard error is so small that a difference of no practical
consequence still returns p below any threshold you like. When nearly every
feature is significant, significance tells you nothing, so the useful ranking is
**by effect size**.

### 5. One dataset does not work, and why

The Bank Account model is weak, and the diagnosis turned out to be the most
interesting part of the project. The last table shows the problem: nearly every
feature is statistically significant and *not one* reaches a large effect size.
The signal is real but thin, spread evenly across many weak features with no
strong ones.

The causes, in order of how much they matter:

1. **The benchmark is designed to be hard.** Bank Account Fraud (NeurIPS 2022) is
   a synthetic, privacy-preserving dataset whose published results are reported
   as TPR at 5% FPR. Scoring it on F1 at a 0.5 cutoff, a metric its designers
   did not use, makes it look like a failure.
2. **0.5 is the wrong cutoff.** At the default threshold recall is a few percent.
   At the cost-optimal 0.12 it catches 85% of fraud and cuts losses by 61%. A
   model reported at the wrong operating point can look broken and still be
   deployable.
3. **A data bug.** `Base.csv` encodes "not applicable" as a negative sentinel:
   `prev_address_months_count` is `-1` in **71.9%** of rows. The original
   pipeline treated those as real measurements, which distorted the medians and
   (because the log transform only applies to non-negative columns) switched off
   that transform on the columns that needed it.
4. **The dataset's own design was ignored.** It ships a `month` column so that
   models can be evaluated under temporal distribution shift.

My conclusion is that this is a data problem before it is a modelling problem.
Applications are *designed* to look legitimate. Real gains would need new
features such as device fingerprinting, IP reputation or graph features over
shared attributes. More hyperparameter tuning would not get there.

## Methodology

### No data leakage

All preprocessing (sentinel handling, imputation, skew-based log transforms,
one-hot encoding, scaling) is fitted **inside** a pipeline on the training split
only, and refitted independently within every cross-validation fold. SMOTE lives
in the same pipeline, so it runs on `fit` and never on `predict`.

An earlier version of this project transformed the entire dataset before
splitting. When I rebuilt it, I measured what fixing that was worth. Imputation
turned out to be a no-op (there were no missing values), the skew-based column
choice was a weak leak, and the encoding issue was a deployment bug that would
crash on an unseen category. So this write-up does not claim a large improvement
from removing the leak.

### Statistical rigour

| Question | Test | Effect size |
|---|---|---|
| Does this feature differ between fraud and legitimate? | Mann-Whitney U, Kolmogorov-Smirnov | Cliff's delta, Hedges' g |
| Do fraud rates differ across categories? | Chi-squared, per-cell standardised residuals | Cramer's V |
| What is the fraud rate for this category? | - | Wilson interval |
| Is model A better than model B? | McNemar (exact when discordant pairs < 25) | odds ratio |
| Is AUC_A > AUC_B? | DeLong (correlated AUCs) | delta AUC + CI |
| Is PR-AUC_A > PR-AUC_B? | Paired bootstrap (no closed form exists) | delta AP + CI |
| Are cross-validated scores different? | Nadeau-Bengio corrected resampled t-test | delta + CI |
| Are the probabilities honest? | Hosmer-Lemeshow, reliability diagram | Brier skill score |

Multiplicity is handled with **both** Bonferroni (family-wise error, for
confirmatory claims) and Benjamini-Hochberg (false discovery rate, for
screening), because they answer different questions. Fraud rates use Wilson
intervals, because rates this close to zero produce negative lower bounds under
the usual normal approximation.

### Are the model differences real?

| Comparison | Delta AP (95% CI) | Verdict |
|---|---|---|
| Logistic Regression vs Random Forest | -0.1477 (-0.2264 to -0.0662) | **significant** |
| Logistic Regression vs XGBoost | -0.1646 (-0.2434 to -0.0859) | **significant** |
| Random Forest vs XGBoost | -0.0170 (-0.0546 to +0.0087) | not significant |

XGBoost has the better point estimate, but **it is not distinguishable from
Random Forest**. When an interval spans zero, the evidence does not support
preferring the higher number, so the choice should come down to cost, latency or
interpretability. On the Bank Account data all three models are tied. When a
linear model, a bagged ensemble and a boosted ensemble cannot be separated, the
ceiling is set by the features.

These are **paired** tests, because both models score the same transactions and
their errors are correlated. An unpaired comparison would badly misstate the
uncertainty.

### Interpretability

- **Coefficients as odds ratios with confidence intervals.** scikit-learn's
  logistic regression is L2-penalised and reports no standard errors, so
  inference uses a separate *unpenalised* statsmodels fit on *unresampled*
  training data. I kept the prediction model and the inference model as
  separate objects on purpose. On the Credit Card data, V4 multiplies the fraud
  odds by about 3.3 per standard deviation, while V10 cuts them to 0.41.
- **Both unit systems.** Features are standardised, so `exp(beta)` reads as the
  odds multiplier per one standard deviation. The tables also convert back to
  original units, so an effect can be quoted per dollar or per month.
- **VIF as a contrast.** Credit Card's features are PCA components, so they are
  orthogonal by construction and variance inflation sits near 1, which makes
  those coefficients unusually safe to read individually. Application data has
  no such guarantee.
- **Importance from three angles.** Gini, gain and permutation importance, each
  normalised to sum to 1. Permutation importance is measured on the held-out
  split against average precision, which makes it the one I would defend; the
  others are training-set quantities biased toward high-cardinality features.
- **Exact per-prediction attribution with no runtime dependency.** TreeSHAP via
  XGBoost's built-in `pred_contribs`, and the closed form `phi = beta * z` for
  linear models. Both are checked against the `shap` reference implementation in
  the test suite, so the deployed app can ship without `shap` or `numba`.

## Statistical deep dive: z-scores

A z-score puts every feature on the same scale regardless of its units, so how
much each feature separates fraud can be compared across 30 anonymised
components.

**Class separation by Cohen's d.** V17 leads at 8.32 standard deviations,
followed by V14, V12 and V10. Fifteen of thirty features reach a large effect
size.

**The multivariate chi-score** (the sum of squared z-scores across all PCA
components) averages **667.6** for fraud against **26.9** for legitimate
transactions, a **24.8x** ratio, with **63.2%** of fraud above the 99th
percentile of normal. Fraud is anomalous *in aggregate* even when no individual
feature is extreme, which is the statistical case for a multivariate model over a
set of single-feature rules.

**Outlier detection, IQR versus z-score.** Across all 30 features, every
`|z| > 3` outlier was also an IQR outlier, so the z-score method found nothing
the interquartile rule missed. IQR flags far more cases (11.2% of rows on Amount
alone), so for skewed financial data the robust median-and-MAD variant is the
better tool.

**Amount is not the signal.** Most fraud sits near z = 0 on transaction amount,
at ordinary sizes. That goes against the common intuition that fraud means large
transactions, and it is why the signal comes from the anonymised behavioural
features.

## Engineering

Numbers in this write-up, the README, the HTML report and the interactive demo
are all generated from a single `artifacts/metrics.json`. A test re-renders the
documents and **fails the build** if any of them drift.

The check exists because an earlier version of this project claimed an F1 of
0.774 for a model that scored 0.060, and its narrative document quoted two
different values for the same model in adjacent sections. Prose and data drift
apart whenever a person has to keep them in sync by hand.

Other engineering in the project:

- **75 tests** covering leakage, threshold optimisation, statistical correctness
  (checked against statsmodels and scipy), inference parity and documentation
  drift. CI runs on Python 3.11 and 3.12.
- **A deployable inference path.** Fitted pipelines are serialised, with XGBoost
  in its native JSON format so the artifacts survive version bumps.
- **An interactive explorer** running on about 30 MB of artifacts and none of the
  819 MB of raw data. Every threshold and cost figure is an exact numpy operation
  over a small parquet of held-out predictions, so the demo reproduces the report
  exactly (a test enforces this to 1e-9).

## Limitations

- **The Credit Card test split contains 98 fraud cases.** Every interval is wide,
  and the top two models are not statistically distinguishable.
- **Two datasets are sampled** to 200,000 rows, an explicit compute budget.
- **Probabilities are not calibrated to the population base rate** when class
  weighting is used. Rankings and odds ratios are unaffected; absolute
  probabilities should not be read as long-run frequencies.
- **The $100:$1 cost ratio is an assumption.** It was not measured, which is why
  the project publishes the whole cost surface alongside the recommended
  thresholds.
- **Evaluation is static**: no concept drift, no adversarial adaptation, no
  feedback loop from analyst decisions. A deployed model faces all three.

## What I would do next

1. **Temporal validation everywhere.** The Bank Account `month` column makes this
   the highest-value open experiment.
2. **Probability calibration** (Platt or isotonic) so the cost-optimal threshold
   matches its theoretical value of `cost_fp / (cost_fp + cost_fn)`.
3. **Graph features for application fraud**: shared phones, addresses and
   devices across applications, which is where the missing signal probably lives.
4. **Cost-sensitive learning** in place of post-hoc thresholding, optimising the
   business objective directly.

## Stack

Python 3.11, scikit-learn, XGBoost, imbalanced-learn, statsmodels, SciPy, pandas,
NumPy, matplotlib, Gradio, uv, pytest, ruff, GitHub Actions.

## Reproducing

```bash
git clone https://github.com/firepenguindisopanda/fraud-analysis
cd fraud-analysis

uv sync --extra dev                              # install (Python 3.11 via uv)
uv run python scripts/download_data.py           # fetch datasets (~819 MB)
uv run python run_pipeline.py                    # -> artifacts/metrics.json
uv run python scripts/render_docs.py             # regenerate docs from artifacts
uv run python app.py                             # launch the explorer
```

Or `make all` for the whole chain.
