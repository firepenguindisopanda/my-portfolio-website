# Starbucks Customer Segmentation & Offer Recommendation

## Problem Statement

Starbucks sends promotional offers to mobile app users, and customers respond to them very differently. Sending everyone the same offers wastes ad spend and misses customers who would have responded to something else. I set out to **improve offer targeting** by finding customer segments, predicting which offers get completed and building a recommendation system on top, with statistical tests behind each step.

**Key Business Questions:**
1. How do customer offer response rates vary across demographics?
2. Which offer types drive the highest engagement for different customer groups?
3. Can we identify distinct customer segments for targeted campaigns?
4. What is the incremental revenue lift from personalized vs. generic campaigns?
5. Are observed treatment effects statistically significant?

---

## Dataset

The simulated Starbucks Rewards app data contains **306,534 events** from **17,000 customers** interacting with **10 unique offers** over a **29-day period**.

| Dataset | Records | Description |
|---------|---------|-------------|
| **profile.json** | 17,000 | Customer demographics (age, gender, income, membership date) |
| **portfolio.json** | 10 | Offer attributes (type, difficulty, reward, duration, channels) |
| **transcript.json** | 306,534 | Event log (transactions, offer received/viewed/completed) |

**Data Quality:**
- 2,175 records (12.8%) have missing gender and income (age=118 sentinel value), handled with missing flags and median imputation
- Schema validation passed for all three datasets via custom JSONL parser
- All 17,000 customers appear in the transcript (no orphans)
- All 10 offers appear in the transcript (no orphans)
- **Feature Engineering:** 55 customer features for segmentation (RFM, time decay, channel use, a CLV proxy), and a separate send-level table of 50,806 offers for the predictive model

---

## Exploratory Data Analysis

### Customer Demographics

![Demographic Distributions](/portfolio_data/starbucks/plots/demographic_distributions.webp)

| Metric | Value |
|--------|-------|
| **Age** | Mean 54.4, Median 55.0, Range 18-101 |
| **Income** | Mean $65K, Median $64K, Range $30K-$120K |
| **Gender** | 49.9% Male, 36.1% Female, 1.2% Other, 12.8% Unknown |
| **Tenure** | Mean 517 days (1.4 years), Median 358 days |

### Offer Funnel Analysis

![Offer Funnel](/portfolio_data/starbucks/plots/offer_funnel.webp)

Engagement drops at each stage from receipt to completion:

| Stage | Count | Conversion |
|-------|-------|------------|
| Offers Received | 76,277 | 100% |
| Offers Viewed | 57,725 | 75.7% |
| Offers Completed | 33,579 | 44.0% |

Average time-to-view: **24.9 hours** (median 18 hours)

### Offer Characteristics

![Offer Characteristics](/portfolio_data/starbucks/plots/offer_characteristics_boxplots.webp)

**Correlation with Completion Rate (Spearman):**
- Duration: **+0.62** (longer offers = higher completion)
- Difficulty: **+0.25** (higher spend requirement = higher completion)
- Reward: **+0.15** (higher reward = modestly higher completion)

This suggests customers prefer offers with more time to complete, even if the spending requirement is higher.

### Transaction Behavior

![Transaction Behavior](/portfolio_data/starbucks/plots/transaction_behavior.webp)

**Responders** (completed >=1 offer, 75.1% of customers):
- Avg transactions: 9.3 per customer
- Avg transaction amount: $16.42
- Avg total spend: $133.02

**Non-Responders** (completed 0 offers, 22.4% of customers):
- Avg transactions: 5.5 per customer
- Avg transaction amount: $4.48
- Avg total spend: $20.04

### Statistical Hypothesis Testing

I also ran hypothesis tests on the main comparisons:

| Test | Comparison | p-value | Effect Size | Interpretation |
|-----|-----------|---------|-------------|----------------|
| **Mann-Whitney U** | Responders vs Non-Responders (spend) | < 0.001 | Cohen's d = 0.36 (small) | Responders spend significantly more |
| **Chi-squared** | Gender × Completion | < 0.001 | Cramer's V = 0.15 | Small but significant association |
| **Kruskal-Wallis H** | Income across offer types | < 0.001 | ε² = 0.002 | Income differs across offer type preferences |
| **Two-proportion z-test** | BOGO vs Discount completion | < 0.001 | - | Discounts complete at higher rate (58.6% vs 51.4%) |

**Effect Size Analysis (Responders vs Non-Responders):**

| Metric | Cohen's d | Magnitude |
|--------|-----------|-----------|
| Total Spend | 0.96 | **Large** |
| Transaction Count | 0.80 | **Medium** |
| Avg Transaction Amount | 0.78 | **Medium** |
| Income | 0.73 | **Medium** |
| Age | 0.31 | Small |

**Bootstrap Confidence Intervals (95%, 1,000 iterations):**
- Responder mean transaction amount: **$14.38** [95% CI: $14.20, $14.56]
- Non-Responder mean transaction amount: **$3.67** [95% CI: $3.51, $3.86]

### Cohort Analysis (by Membership Year)

Customers who joined earlier (2013 to 2016) complete more offers (about 44 to 59%) than those who joined in 2018 (28%). Either engagement grows with tenure, or the earlier cohorts had more favourable offer conditions.

### Channel Effectiveness

| Channel | View Rate (with channel) | View Rate (without) | Completion Rate (with) |
|---------|-------------------------|-------------------|----------------------|
| **Email** | 75.7% | - | 44.0% |
| **Mobile** | 80.3% | 34.7% | 44.0% |
| **Social** | 93.3% | 49.3% | 47.7% |
| **Web** | 72.7% | 87.7% | 49.0% |

Offers sent through social and mobile are viewed most often, and the social plus web combination has the highest completion rates.

---

## Feature Engineering

I built **55 customer features** (plus 75 interaction features) from demographic and behavioural data:

**Demographic (18 features):** Age imputation, income imputation, missing flags, one-hot encoded gender, tenure calculations, categorical bins

**Behavioral (25+ features):**
- Transaction metrics: count, total, average, std, min, max
- Offer response: received/viewed/completed per type (bogo, discount, informational)
- Rate metrics: view rate, completion rate, view-to-completion rate

**RFM & Time-Decay Features:**
- Recency, frequency, monetary (RFM score built from quintiles)
- spend_last_7d, spend_last_14d, spend_trend
- offer_recency_days, avg_time_to_view, avg_time_to_complete
- **CLV Proxy:** trans_total × (1 + completion_rate)

**Channel Interaction Features:** viewed_via_email/mobile/social/web, total_channels_used

**Offer Features (11 features):** One-hot encoded offer types, channel flags (email, mobile, social, web), interaction terms (difficulty × reward, reward per day, difficulty per day)

These features summarise a customer's whole month, which suits segmentation. They cannot be used to predict whether one particular offer will be completed, because they count what happened after that offer was sent, so the predictive model below uses its own send-level features.

---

## Customer Segmentation

### Methodology

I ran K-Means on 32 standardised features (demographic and behavioural) and chose k using silhouette scores, Calinski-Harabasz index, Davies-Bouldin index, gap statistic, and **stability analysis (Adjusted Rand Index across 5 random seeds)**.

### Cluster Optimization Metrics

| k | WCSS (Inertia) | Silhouette | Calinski-Harabasz | Davies-Bouldin | Gap (optimal) |
|---|---------------|-----------|-------------------|----------------|---------------|
| 2 | 455,685 | 0.159 | 3,294.3 | 2.03 | - |
| 3 | 405,506 | **0.170** | **2,902.5** | **1.84** | - |
| **4** | 380,418 | 0.147 | 2,436.1 | 1.94 | Within 1 SE |
| 5 | 355,198 | 0.165 | 2,258.4 | 2.01 | - |

**Why k=4 when k=3 has the higher silhouette:** k=4 separates Discount Seekers from BOGO Advocates, which k=3 merges into one group, and that split decides which offer each of those customers gets. The recommendation system built on k=4 gave a +7.9% lift, and the stability analysis (mean ARI **0.76** across resamples, standard deviation 0.19, lowest 0.60) shows the clusters are moderately stable.

The k=3 silhouette (0.170) is only 0.023 higher than k=4's, and both indicate the weak separation usual in behavioural data. I treat the clusters as **directional guides** for targeting.

### Segment Profiles

![Cluster PCA](/portfolio_data/starbucks/plots/cluster_pca_scatter.webp)

#### Unengaged Unknowns (12.8%, 2,170 customers)
- **Demographics:** Age=55, Income=$64K, 100% missing gender
- **Behavior:** Low transaction activity ($18.53 avg spend), low completion (11.4%)
- **CLV Proxy (12-mo):** $222
- **Recommendation:** Informational offers only; prioritize data collection incentives

#### Discount Seekers (24.9%, 4,228 customers)
- **Demographics:** Age=55.6, Income=$68K, 53% Male
- **Behavior:** High transaction activity ($152.50 avg spend), **89.2% discount completion rate**
- **CLV Proxy (12-mo):** $1,830 | **Offer ROI: 15.7x**
- **Recommendation:** Prioritize discount offers

#### BOGO Advocates (28.5%, 4,837 customers)
- **Demographics:** Age=57.0, Income=$72K, 54% Female
- **Behavior:** Highest transaction activity ($180.80 avg spend), **87.1% BOGO completion rate**
- **CLV Proxy (12-mo):** $2,170 | **Offer ROI: 7.4x**
- **Recommendation:** Prioritize BOGO offers; this is the highest-value segment

#### Passive Browsers (33.9%, 5,765 customers)
- **Demographics:** Age=51.3, Income=$57K, 71% Male
- **Behavior:** Moderate transaction activity ($37.45 avg spend), low completion (14.8%)
- **CLV Proxy (12-mo):** $449
- **Recommendation:** Informational offers only, avoid spam; focus on retention

![Cluster Sizes](/portfolio_data/starbucks/plots/cluster_sizes.webp)

### Business Metric Validation

I checked each segment against business metrics:

| Segment | Revenue/Customer | Offer ROI | Churn Risk | Business Viability |
|---------|----------------|-----------|------------|-------------------|
| Unengaged Unknowns | $18.53 | N/A | High (0.81) | Data collection priority |
| Discount Seekers | $152.50 | **15.7x** | Low (0.27) | High-value discount target |
| BOGO Advocates | $180.80 | **7.4x** | Low (0.24) | **Highest-value segment** |
| Passive Browsers | $37.45 | N/A | High (0.74) | Retention focus |

> **53.3% of customers (Discount Seekers + BOGO Advocates) generate 85.6% of total revenue.**

### Clustering Quality

The silhouette score of 0.147 (k=4) indicates **weak separation**, meaning the clusters overlap. That is common in behavioural data, where customer groups have fuzzy edges. In the stability analysis (mean ARI 0.76, lowest 0.60) most of the structure recurs across resamples, though some of it does not, so the segment boundaries are soft. That is why the recommendation system includes secondary offer types.

---

## Predictive Modeling

### The question

The model predicts whether a customer will complete a BOGO or discount offer within its validity window, at the point the offer is sent. A targeting system makes its decision at that moment, so every feature has to be something known when the offer goes out.

### What the first version got wrong

The first version of this model scored an AUC of **0.994**, while its own 5-fold cross-validation gave 0.908. I looked into that gap and found these problems inflating the score:

1. **Rows that never happened.** It crossed every customer with all ten offers, 170,000 rows, most of them offers the customer never received, including informational offers that cannot be completed at all, and predicting 0 for those is trivial.
2. **No window.** The target was "ever completed this offer", with no limit to the offer's validity window.
3. **Features from the future.** Its strongest feature was whether the offer was viewed by email, which only happens after the send, and it used completion counts over the whole month, the offer being predicted included.
4. **A random split.** Rows were split at random, so each customer's other offers sat in both the training and the test set.

### The setup I report

- **One row per offer actually sent:** 61,042 BOGO and discount sends. A completion is credited to the latest send of that offer whose window contains it, so an offer received twice counts as two sends.
- **Censored sends dropped:** 10,236 sends whose validity window runs past the last hour of data (714) are excluded, because whether they would have completed is unknown. That leaves **50,806 sends to 16,804 customers**, 54.4% completed.
- **Features known at send time:** the offer's terms (difficulty, reward, duration, type, channels), demographics, and the customer's history strictly before the send: earlier offers received, completed and viewed, transactions, spend, and hours since the last purchase.
- **Customers kept apart:** 5-fold cross-validation grouped by customer, a held-out set of 3,361 customers (10,210 sends) never seen in training, and a time check that trains on the first three send waves and scores the later three.
- **Tested:** unit tests check the window, the crediting of repeat sends and the censoring, and one test deletes every event after each send and confirms that none of its features change. Deliberately breaking either rule makes those tests fail.

### Taking the leaks out, one at a time

Each step uses the same model (histogram gradient boosting), the same sends and 5-fold cross-validation:

| Step | AUC |
|---|---|
| Original pipeline: every customer x every offer, random split | 0.994 |
| One row per real send, still with month-long completion counts and the viewed flag | 0.934 |
| Viewed flag removed | 0.931 |
| Month-long counts replaced by history before the send | 0.866 |
| Customers kept apart across folds (the setup I report) | **0.865** |

![Taking the leaks out](/portfolio_data/starbucks/plots/offer_response_ladder.webp)

Most of the inflation came from the rows that never happened (0.994 to 0.934) and the month-long completion counts (0.931 to 0.866). With send-time features in place, keeping customers apart costs almost nothing (0.866 to 0.865), which suggests the model is not memorising individual customers.

### Results on customers the model never saw

| Model | CV AUC (grouped) | Held-out AUC | 95% CI | Brier |
|---|---|---|---|---|
| Offer terms only (logistic regression) | | 0.605 | | 0.239 |
| Offer terms and demographics, no history | | 0.825 | | 0.170 |
| Logistic regression, all features | 0.819 (sd 0.006) | 0.822 | 0.813 to 0.831 | 0.170 |
| XGBoost | 0.864 (sd 0.005) | 0.865 | 0.857 to 0.873 | 0.148 |
| **Histogram gradient boosting** | **0.865 (sd 0.005)** | **0.865** | **0.857 to 0.873** | **0.148** |

The 95% interval is a bootstrap over customers. At a 0.5 threshold the best model has precision 0.797, recall 0.822 and F1 0.809. When trained only on the first three send waves (hours 0 to 336), it scores **0.878** on the later three, so it holds up forward in time.

![Calibration on held-out customers](/portfolio_data/starbucks/plots/offer_response_calibration.webp)

The probabilities are well calibrated. Across ten bins of held-out sends, the share that completed tracks the predicted probability closely (for example, 0.52 completed where 0.52 was predicted). For targeting this matters more than AUC, because a targeting rule spends money in proportion to those probabilities.

### What the model relies on

Permutation importance on the held-out customers (AUC lost when the feature is shuffled):

| Feature | AUC lost |
|---|---|
| Average spend per purchase before the send | 0.089 |
| Membership tenure | 0.069 |
| Income | 0.028 |
| Reward | 0.026 |
| Age | 0.018 |
| Number of channels the offer goes out on | 0.014 |

In this simulated data an offer counts as completed when the customer spends past its difficulty within the window, whether or not they viewed it, so features about past spending and the means to spend rank highest. Offer terms alone reach only 0.605, so most of the model's signal comes from what it knows about the customer.

---

## Causal Inference

### Average Treatment Effect (ATE) on Transaction Spend

| Treatment | Control Mean | Treatment Mean | ATE ($) | ATE (%) | Cohen's d | p-value | 95% CI | Significant? |
|-----------|--------------|----------------|---------|---------|-----------|---------|--------|-------------|
| Any Offer vs. None | $12.53 | $12.78 | **+$0.25** | **+2.0%** | 0.018 | < 0.001 | [$0.17, $0.32] | yes |
| BOGO vs. No BOGO | $12.57 | $12.80 | **+$0.24** | **+1.9%** | 0.015 | < 0.001 | [$0.15, $0.32] | yes |
| Discount vs. No Discount | $13.00 | $12.75 | **-$0.25** | **-1.9%** | -0.019 | < 0.001 | [-$0.34, -$0.16] | yes |
| Informational vs. No Info | $12.78 | $12.78 | **$0.00** | **0.0%** | 0.0001 | 0.976 | [-$0.08, $0.08] | No |

![ATE by Offer Type](/portfolio_data/starbucks/plots/ate_by_offer_type.webp)

**Key Insights:**
- **Any Offer:** Small positive effect (+2.0%), suggesting offers mildly increase spending
- **BOGO:** Positive effect (+1.9%), customers spend slightly more with BOGO offers
- **Discount:** Negative effect (-1.9%), customers spend less on discounted items (intuitive)
- **Informational:** No direct effect (expected for awareness-only offers)

**Caveat:** All the statistically significant results have **negligible effect sizes** (Cohen's d < 0.02). With samples this large (N > 100K), even tiny differences reach significance. **The business impact is in offer completion rates (up to 89%); the lift in per-transaction amount is too small to matter.**

### Propensity Score Matching (PSM)

To reduce selection bias, I ran nearest-neighbour PSM with propensity scores from a logistic regression on age, income, gender and tenure:

| Offer Type | Naive ATE | Matched ATE | Matched Pairs | Balance Improvement |
|-----------|-----------|-------------|---------------|-------------------|
| BOGO | +$0.24 | **+$0.18** | 12,800 | Covariates balanced |
| Discount | -$0.25 | **-$0.22** | 13,400 | Covariates balanced |
| Informational | $0.00 | **-$0.01** | 8,500 | Limited match quality |

> PSM reduces but does not eliminate selection bias. Unobserved confounders (engagement propensity) may still bias estimates.

### Heterogeneous Treatment Effects by Segment

ATE varies by segment:

| Segment | Best Offer | ATE for Best | ATE for Worst |
|---------|-----------|-------------|---------------|
| Unengaged Unknowns | Informational | +$0.13 | -$0.01 (discount) |
| Discount Seekers | Informational | +$0.06 | -$1.53 (BOGO) |
| BOGO Advocates | Informational | +$1.30 | -$0.53 (discount) |
| Passive Browsers | Informational | **+$2.34** | **-$2.90 (BOGO)** |

> Informational offers have the highest estimated effect in every segment. The matched offers cannot be tested this way: every Discount Seeker received a discount, and only 2 BOGO Advocates went without a BOGO, so neither has a control group. The discount and BOGO recommendations for those two segments rest on their completion rates (89.2% and 87.1%), not on these estimates.

### A/B Test Simulation Framework

I sized the A/B test needed to validate the recommendation system in production:

| Parameter | Value |
|-----------|-------|
| Baseline completion rate | 43.5% |
| Treatment (rule-based) rate | 47.0% |
| Absolute lift | 3.5 pp |
| Required sample per group | **3,277** |
| Required total | 6,554 |
| **Feasible?** | **Yes** (17K customers available) |
| Empirical power (at n=3,277) | **0.80** |
| Recommended duration | **30+ days** |

> With 17,000 customers, a 50/50 A/B test is feasible and should achieve >80% power.

---

## Recommendation System

### Rule-Based System Design

From the 4 customer segments I wrote simple targeting rules:

| Segment | Primary Offer | Rationale | Secondary Offer |
|---------|--------------|-----------|-----------------|
| Unengaged Unknowns (12.8%) | Informational | Missing data, low engagement | None |
| Discount Seekers (24.9%) | **Discount** | 89.2% discount completion rate | BOGO (56.0%) |
| BOGO Advocates (28.5%) | **BOGO** | 87.1% BOGO completion rate | Discount (72.5%) |
| Passive Browsers (33.9%) | Informational | Low completion across all types | None |

### Performance

![Recommendation Performance](/portfolio_data/starbucks/plots/recommendation_performance.webp)

| Targeting Method | Completion Rate | Lift vs. Random |
|-----------------|-----------------|-----------------|
| Random Targeting (baseline) | 43.5% | - |
| **Rule-Based Targeting** | **47.0%** | **+7.9%** |

The rules lift offer completion by **+7.9%** over random targeting. That falls short of the +10% target because the two low-engagement segments (Unengaged Unknowns and Passive Browsers) make up 46.7% of customers.

### Business Impact

| Scenario | Method | 30-Day Incremental Revenue | Annual Incremental Revenue |
|----------|--------|---------------------------|---------------------------|
| Current (Random) | Baseline | - | - |
| **Optimized (Rule-Based)** | Segment targeting | **$4,250** | **$51,000** |
| **Best Case (Full Personalization)** | ML model + segments | **$6,375** | **$76,500** |

- **+7.9% increase** in offer completion rates
- **85.6% of revenue** concentrated in 2 of 4 segments; targeted spend reduces waste on unresponsive segments
- **Scalable:** the rules run in production with no model inference

---

## Business KPIs

| Metric | Value |
|--------|-------|
| **Total Addressable Market** | 17,000 customers |
| **Total 30-Day Revenue** | $1,775,409 |
| **Avg. Revenue/Customer (30-Day)** | $104.44 |
| **Estimated Annual Revenue** | **$21.3M** (pro-rated) |

### Revenue per Customer by Segment

| Segment | 30-Day Spend | Annual Spend (Est.) | Offers Completed | Offer ROI |
|---------|-------------|---------------------|-----------------|-----------|
| Unengaged Unknowns | $18.53 | $222 | 0.5 | N/A |
| Discount Seekers | $152.50 | $1,830 | 3.2 | **15.7x** |
| BOGO Advocates | $180.80 | $2,170 | 3.3 | **7.4x** |
| Passive Browsers | $37.45 | $449 | 0.6 | N/A |

---

## Risk & Limitations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Leakage in the first model** | Its 0.994 AUC was not achievable at send time | Rebuilt at send time, with tests that fail if a feature sees the future (0.865 on unseen customers) |
| **Simulated Data** | Results may not generalize to real Starbucks behavior | Validate with production A/B tests before scaling |
| **Selection Bias in ATE** | Offer assignment may not be random | PSM partially adjusts but cannot eliminate unobserved confounding |
| **Low Silhouette Score** | k=4 = 0.147 (weak separation) | Business interpretability justified k=4; stability (mean ARI 0.76) is moderate, so boundaries are soft |
| **Negligible Effect Sizes** | All Cohen's d < 0.02 for ATE | Business impact should focus on completion rates (up to 89%), not transaction lift |
| **30-Day Window** | Single test period; no seasonality or lifecycle effects | Annual extrapolations are rough estimates from pro-rated data |

---

## Key Insights

1. **4 customer segments** (Unengaged Unknowns, Discount Seekers, BOGO Advocates, Passive Browsers), each with a clear offer preference and checked against business metrics
2. **The first model's 0.994 AUC was leakage**: it came from rows that never happened and features from after the send. Rebuilt at send time, the model scores **0.865** on customers it never saw (0.878 forward in time), with well-calibrated probabilities
3. **Past spending is the strongest predictor**: average spend before the send, tenure and income lead the importance ranking, while offer terms on their own reach only 0.605
4. **Two segments bring in 85.6% of revenue**: Discount Seekers and BOGO Advocates, 53.3% of customers
5. **Rule-based recommendations give a +7.9% lift** over random targeting; the A/B test simulation shows a live test is feasible at n=3,277 per group with power 0.80
6. **Offer types differ in causal effect**: BOGO offers add +$0.24 per transaction and discounts change it by -$0.25; these effects are statistically significant but negligible in size (Cohen's d < 0.02)
7. **Statistical testing**: hypothesis tests, bootstrap CIs, effect sizes, propensity score matching and heterogeneous treatment effects sit alongside the descriptive statistics
8. **Clustering quality is modest**: silhouette 0.147 and mean stability ARI 0.76, so the segments work as directional guides with soft boundaries
9. **Missing demographics (12.8%)** form their own low-engagement segment, a common problem in real data that data collection incentives could address
10. **The recommendation gap** (+7.9% vs +10% target) comes from the large low-engagement segments; future re-engagement work on those segments could close it

---

## Technical Details

- **Framework:** Python 3.13+, pandas 3.0.2, scikit-learn 1.8.0, XGBoost 3.2.0
- **Statistical Testing:** SciPy (Mann-Whitney U, Chi-squared, Kruskal-Wallis, Welch's t-test), Cohen's d, Cramer's V, bootstrap (B=1,000)
- **Preprocessing:** StandardScaler, median imputation, one-hot encoding, missing flags
- **Feature Engineering:** 55 customer features (demographic, behavioral, RFM, time-decay, CLV proxy) + 75 interaction features
- **Clustering:** K-Means (k=4), validated with silhouette, Calinski-Harabasz, Davies-Bouldin, gap statistic, stability analysis (ARI)
- **Predictive model:** one row per offer sent, features strictly before the send, censored windows dropped; logistic regression, histogram gradient boosting, XGBoost
- **Evaluation:** 5-fold CV grouped by customer, a held-out 20% of customers with a customer-level bootstrap interval, a forward-in-time check, calibration curve, Brier score, permutation importance, and a leakage ladder
- **Causal Inference:** ATE with bootstrap CIs (B=1,000), PSM via logistic regression, Welch's t-test, Cohen's d, heterogeneous treatment effects, A/B test simulation (Monte Carlo, 1,000 runs)
- **Reproducibility:** All stochastic processes seeded with `random_state=42`
