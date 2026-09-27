# WiDS 2024: Metastatic Breast Cancer Diagnosis

> A model that scores 0.80 AUC at predicting timely breast cancer diagnosis turns
> out to be mostly a clock. Finding that out, and what it does to the equity
> question the datathon was asking, is the part of this project worth reading.

**WiDS Datathon 2024, Challenge 1, revisited in 2026.** Private leaderboard AUC
**0.792**, public 0.801. The submissions were made after the competition closed,
so they appear in no ranking. The rebuild took the winning team's published
write-up as its starting point, then went on to ask what the model had learned.

## The problem

Each row is a patient diagnosed with metastatic triple negative breast cancer. The
task is to predict whether the diagnosis came within 90 days of screening
(`DiagPeriodL90D`). Patient records from Health Verity are joined, by the first
three digits of the zip code, to socioeconomic data and to NASA and Columbia air
quality measures (ozone, PM2.5, NO2).

| | |
|---|---|
| Training rows | 12,906, 83 columns |
| Test rows | 5,792 |
| Diagnosed within 90 days | 62.5% of training rows |
| Metric | ROC AUC (public leaderboard about 51% of test, private 49%) |
| Missing | BMI 69.5%, race 49.5%, payer type 14.0% |

## Results

| Step | AUC | Measured on |
|---|---|---|
| Baseline, CatBoost | 0.7897 | a single holdout split |
| 14 boosted tree models on one-hot features, best | 0.8014 | 5-fold cross-validation |
| Rebuilt features and a 25-model zoo, best single (XGBoost) | 0.8037 | out of fold |
| Ensemble of 4 pruned members | 0.8077 | nested cross-validation |
| Public leaderboard | 0.801 | about 51% of test |
| Private leaderboard | **0.792** | the other 49% |

Selected members of the model zoo, out of fold:

| Model | Family | AUC |
|---|---|---|
| XGBoost | boosted trees | 0.8037 |
| CatBoost | boosted trees | 0.8031 |
| XGBoost random forest | bagged trees | 0.7980 |
| Logistic regression (L2) | linear | 0.7974 |
| Linear SVM | linear | 0.7972 |
| Linear discriminant analysis | linear | 0.7970 |
| PyTorch MLP | neural | 0.7965 |
| Random forest | bagged trees | 0.7915 |
| LightGBM | boosted trees | 0.7888 |
| Gaussian naive Bayes | probabilistic | 0.7831 |

The spread from best to worst is only 0.021. What made the zoo worth building is
that its members disagree: the mean pairwise rank correlation of their
predictions is 0.78, against more than 0.98 for the first version's fourteen
boosted trees, whose average bought almost nothing.

## What this found

### 1. The model is mostly a clock

The single strongest column is which version of the diagnosis code a patient's
record uses. Patients coded in ICD-10 were diagnosed within 90 days 78.4% of the
time; patients coded in ICD-9, 9.5%. That flag alone scores 0.762 AUC. The US
retired ICD-9 in October 2015, so the flag mostly records **when** a patient was
screened, not anything about the patient.

The model knows it. The flag carries 34.5% of the model's split gain, and
shuffling it costs 0.030 AUC, seven times more than any other feature:

| Feature | AUC lost when shuffled |
|---|---|
| ICD-10 flag | 0.0304 |
| Age, within the ICD-10 era | 0.0045 |
| Metastatic diagnosis code | 0.0044 |
| Age | 0.0041 |
| Diagnosis code prefix | 0.0041 |
| Breast cancer diagnosis code | 0.0026 |
| Payer type missing | 0.0014 |
| Race | 0.0011 |

Decomposing the AUC by pair makes it plain. An AUC is the share of (diagnosed on
time, diagnosed late) pairs the model ranks correctly. 53.9% of those pairs set
an ICD-10 patient diagnosed on time against an ICD-9 patient diagnosed late, and
the model ranks every one of them correctly: that alone is 0.539 of the total
0.806. (The 1.6% of pairs the other way round, it ranks wrongly every time.) Within the ICD-10 era it ranks pairs
correctly 60.2% of the time, and within ICD-9, 56.8%. Once the era is known, the
model is only modestly better than chance.

### 2. The crude comparisons understate the disparity

The datathon was framed around equity, and the era effect distorts the obvious
comparisons, because the groups are not spread evenly across the two eras:

| Contrast, share diagnosed within 90 days | All rows | Within the ICD-10 era |
|---|---|---|
| Black vs White | -0.046 (p = 0.007) | **-0.078** (p = 1e-6) |
| Hispanic vs White | -0.027 (p = 0.15, not significant) | -0.043 (p = 0.015) |
| Medicaid vs commercial insurance | +0.012 (p = 0.33, not significant) | -0.025 (p = 0.030) |

The gap for Black patients widens by more than two thirds once the era is held
fixed, a gap for Hispanic patients appears, and the Medicaid difference changes
sign. After adjusting for era, age, missing BMI, area socioeconomic measures and
metastatic site, Black patients have an odds ratio of **0.697** (95% CI 0.585 to
0.830, p = 5e-5) for a diagnosis within 90 days: the only demographic effect that
survives every specification, and adjustment makes it stronger.

The caveat that limits all of it: race is missing for 49.5% of patients, and
whether it is missing is itself associated with the outcome, so every race
estimate is conditional on race having been recorded.

### 3. The model is least accurate for the group with the widest gap

Within the ICD-10 era, AUC by recorded race:

| Group | Patients | AUC | 95% CI |
|---|---|---|---|
| Black | 872 | 0.552 | 0.509 to 0.595 |
| Unknown | 4,728 | 0.592 | 0.572 to 0.612 |
| Other | 514 | 0.592 | 0.532 to 0.649 |
| White | 2,850 | 0.609 | 0.582 to 0.636 |
| Asian | 286 | 0.641 | 0.562 to 0.718 |
| Hispanic | 665 | 0.647 | 0.598 to 0.694 |

For Black patients the model is barely above chance. A leaderboard AUC of 0.8
says nothing about that, which is why this table belongs next to the score.

### 4. The environmental data is real but weak

After a false discovery rate correction, 28 of the 69 numeric zip code and air
quality columns differ significantly between the two outcomes, but the largest
effect size among them is 0.116 (Cohen's d), below the 0.2 conventionally called
small. An unknown payer type matters more: an odds ratio of 1.44 (95% CI 1.24 to
1.66) in the adjusted model.

### 5. Pruning the ensemble had been fitting noise

The first leaderboard submission pruned a 25-model ensemble down to 4 members, on
gains of about 0.00007 per step against a standard error of 0.0037. Its nested
estimate was 0.8077; the private leaderboard gave 0.792. The post-mortem changed
the rule: the ensemble size is now chosen on held-out rows with a one standard
error rule that leans towards keeping members, and it drops one model instead of
twenty-one. The same discipline had already picked the combiner: a plain average
beat fitted weights on the nested estimate (0.80599 against 0.80552), although the
fitted weights looked better in sample (0.80729).

## Method

- **Where it started.** The rebuild followed the winning team's published
  write-up: leak-free target encoding, a deliberately diverse model zoo, and no
  hyperparameter tuning, because their write-up found tuning pushed members
  towards the same model and hurt the blend.
- **Leakage.** Target encoders give training rows out-of-fold encodings and
  inference rows the full mapping, inside the cross-validation pipeline, so no
  row is encoded with its own label.
- **Features.** 46 engineered features (123 columns in all), then forward
  selection for the tree models and backward elimination for the linear ones.
- **Trusting cross-validation.** An adversarial classifier trying to tell train
  from test scored 0.494 AUC: the two are indistinguishable, so cross-validation
  was trusted over a public leaderboard built on half the test rows.
- **Honest ensemble scores.** Ensemble weights and pruning are re-fitted inside
  their own folds, and that nested number is the one quoted.

## Limitations

- The submissions came after the deadline, so there is no official placing.
- Feature selection ran on the same training data that cross-validation later
  scored, which leaves a little optimism in the estimate.
- The corrected ensemble, with its size chosen by the one standard error rule,
  has not been scored on the leaderboard.
- Two checks were written but not run: dropping the geographic columns, and
  probing for time leakage through patient ID and row order.

## What I would do next

- Report performance within the ICD-10 era as the headline number, since that is
  the part of the problem with clinical meaning.
- Run the geography and time leakage checks, and score the corrected ensemble.

## Stack

Python, pandas, scikit-learn, XGBoost, CatBoost, LightGBM, PyTorch, statsmodels,
SciPy, Kaggle.
