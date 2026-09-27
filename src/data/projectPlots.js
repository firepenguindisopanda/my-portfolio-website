/**
 * The EDA plot catalogue for the three case studies that ship an interactive
 * analysis block, read by components/MLCharts/InteractiveAnalysis.
 *
 * Lived inline in pages/ProjectDetail.jsx until it was 170 lines of data at
 * the top of an 870-line page. Nothing here is rendered for the other
 * seventeen case studies, and nothing here needs React.
 */
// Every figure gets a What / Key insight / Why triple so a reader who does not
// know the domain still takes something away. Numbers here are the ones the
// pipeline actually produced - see artifacts/metrics.json in the analysis repo.
export const PLOT_INTERPRETATIONS = {
  'fraud-detection': {
    'target_distribution.webp': {
      what: 'Class balance for each of the three datasets, with the imbalance ratio annotated.',
      insight: 'Fraud is 0.13% to 1.10% of transactions: between 87 and 774 legitimate cases for every fraudulent one.',
      why: 'This is why accuracy is discarded. A model that predicts "never fraud" scores 99.83% accuracy on the Credit Card data and catches none of the 98 frauds. Average precision is used instead, because it summarises the precision-recall curve, which is the curve a fraud team actually operates on.',
    },
    'amount_by_class.webp': {
      what: 'Transaction amount distributions for fraud and legitimate cases, with a Kolmogorov-Smirnov test.',
      insight: 'Fraud does not live at unusually large amounts. Amount ranks well below the anonymised behavioural features on permutation importance.',
      why: 'It refutes the obvious intuition. Fraudsters deliberately use ordinary-looking amounts, so a rule based on transaction size alone would miss most of it. The signal is in the behavioural PCA components, not the dollar value.',
    },
    'correlation_heatmap.webp': {
      what: 'Correlation of each feature with the fraud label.',
      insight: 'No single feature correlates strongly with fraud; the strongest are the V14, V12 and V10 components.',
      why: 'Fraud detection here is inherently multivariate. That no feature is individually decisive is what makes the tree ensembles worth their complexity over a simple rule.',
    },
    'model_comparison_f1.webp': {
      what: 'F1 across all five models and all three datasets, including both dummy baselines.',
      insight: 'The dummy baselines score essentially zero F1 despite 99%+ accuracy; the tree ensembles lead on every dataset.',
      why: 'Including deliberately useless baselines is the cheapest way to show that a metric is doing its job. Any metric on which the dummy looks good is the wrong metric.',
    },
    'confusion_matrix_best.webp': {
      what: 'Confusion matrix for XGBoost on the Credit Card test split at the default 0.5 threshold.',
      insight: 'At 0.5 the model catches 82 of 98 frauds with 11 false alarms: 88% precision at 84% recall.',
      why: 'This is the starting point, not the recommendation. 0.5 is an arbitrary default that implicitly assumes a missed fraud and a false alarm cost the same, which they do not.',
    },
    'feature_importance_direction.webp': {
      what: 'Logistic regression odds ratios with 95% confidence intervals, on a log scale, from a separate unpenalised fit.',
      insight: 'V4 multiplies the fraud odds by about 3.3 per standard deviation; V10 and V14 cut them to roughly 0.41 and 0.56. Intervals crossing 1.0 mean the direction is not established.',
      why: 'Tree importance tells you a feature mattered but not which way. An odds ratio gives direction, magnitude and uncertainty in one number. The inference model is deliberately separate from the prediction model, because scikit-learn\'s penalised fit provides no valid standard errors.',
    },
    'feature_comparison.webp': {
      what: 'Importance from gini, gain and permutation, each normalised to sum to 1 so they are directly comparable.',
      insight: 'V14, V4, V12 and V10 top every method. Permutation importance on the held-out split ranks V14 first at 0.074.',
      why: 'Gini and gain are computed on training data and are biased toward high-cardinality continuous features. Permutation importance measures what accuracy actually loses on unseen data, so it is the defensible one. Where the methods disagree, the feature usually matters only in interaction.',
    },
    'roc_curves.webp': {
      what: 'ROC curves for every model on the Credit Card test split.',
      insight: 'Every model, including logistic regression at 0.971, looks excellent, even the one whose precision is 6%.',
      why: 'This chart is included as a caution. ROC-AUC is dominated by the true-negative mass at a 0.17% base rate, so it stays flattering for models that are not useful. Compare it with the precision-recall curve beside it.',
    },
    'pr_curves.webp': {
      what: 'Precision-recall curves, with the no-skill line drawn at the base rate rather than 0.5.',
      insight: 'XGBoost reaches an average precision of 0.876 (95% CI 0.811 to 0.931) against a chance baseline of 0.0017, a 509x lift.',
      why: 'This is the honest picture of the same models the ROC chart flatters. The no-skill line sits at the fraud rate, so the gap between the curve and that line is the real measure of skill.',
    },
    'calibration_curve.webp': {
      what: 'Predicted probability against observed fraud rate, by decile.',
      insight: 'Class weighting distorts the probabilities: the Brier skill score for logistic regression is strongly negative even though its ranking is fine.',
      why: 'It matters because the cost-optimal threshold is only interpretable as a probability cutoff if the probabilities mean something. Rankings and odds ratios survive miscalibration; absolute probabilities do not.',
    },
    'cost_heatmap.webp': {
      what: 'Total cost across 99 thresholds and 7 false-negative to false-positive cost ratios.',
      insight: 'The optimal threshold slides from 0.97 at 1:1 down to 0.02 once a missed fraud costs 50x a false alarm.',
      why: 'There is no single correct threshold, only a correct threshold given a stated cost ratio. Publishing the whole surface hands the decision to whoever owns the losses instead of burying it in a default.',
    },
    'threshold_sensitivity.webp': {
      what: 'Precision, recall and F1 as the decision threshold moves from 0.01 to 0.99.',
      insight: 'Precision and recall trade off sharply below 0.1; the default 0.5 sits well away from the cost-optimal point.',
      why: 'It makes the trade-off legible. Choosing a threshold is a business decision about which error you would rather make, and this is the curve that decision is made on.',
    },
    'business_impact.webp': {
      what: 'Cost per model at the default threshold, decomposed into missed fraud and false alarms.',
      insight: 'At the cost-optimal 0.02 threshold, XGBoost catches 88 of 98 frauds for 83 false alarms: $1,083 against $9,800 for doing nothing, an 88.9% reduction.',
      why: 'It converts model metrics into the only units a stakeholder needs. The comparison that matters is not against another model but against having no model at all.',
    },
    'lift_gain.webp': {
      what: 'Cumulative fraud caught against the fraction of transactions reviewed.',
      insight: 'Reviewing the top 1% of scored transactions captures the large majority of fraud.',
      why: 'Fraud teams are staffed for a fixed number of reviews per day, so "we can look at 1% of volume" is usually a harder constraint than any metric. This chart answers the question in the units the operation runs on.',
    },
    'effect_size_vs_pvalue.webp': {
      what: 'Effect size against statistical significance for all 30 features.',
      insight: '28 of 30 features are significant after Benjamini-Hochberg correction, but only 15 reach a large effect size and 8 are negligible.',
      why: 'At n = 284,807 the p-value stops discriminating: a difference far too small to act on still clears any significance bar. This is the chart that argues for ranking by effect size, and it does it in one picture.',
    },
    'radar_chart.webp': {
      what: 'Precision, recall, F1 and ROC-AUC per model on one set of axes.',
      insight: 'XGBoost and Random Forest are close on every axis; logistic regression collapses on precision.',
      why: 'Useful for seeing shape rather than rank. Two models with similar summary scores can trade errors quite differently, which is why the differences are also tested formally rather than eyeballed here.',
    },
    'temporal_fraud.webp': {
      what: 'Fraud rate by hour over the two days the Credit Card data covers.',
      insight: 'The fraud rate varies by time of day, with elevated periods overnight.',
      why: 'It suggests time-derived features are worth engineering, and it is also the argument for evaluating on a forward-in-time split rather than a random one, since a deployed model always predicts forward.',
    },
    'online_fraud_by_type.webp': {
      what: 'Fraud rate by transaction type on the Online Payment data, with Wilson confidence intervals.',
      insight: 'Fraud concentrates almost entirely in TRANSFER and CASH_OUT; payments are effectively clean.',
      why: 'Wilson intervals rather than the normal approximation, because rates this close to zero produce negative lower bounds under the usual formula. A category-level rule captures much of the signal here without any model at all.',
    },
    'bank_account_effect_sizes.webp': {
      what: 'Effect size against significance for the Bank Account application data.',
      insight: '24 of 25 features are statistically significant and not one reaches a large effect size (the mirror image of the Credit Card chart).',
      why: 'This single chart is the diagnosis for the dataset that did not work. The signal is real but uniformly thin, spread across many weak features rather than concentrated in a few strong ones. No amount of tuning manufactures separation that is not in the features.',
    },
    'z_score_feature_separation_ranking.webp': {
      what: 'Features ranked by Cohen\'s d, the standardised difference between fraud and legitimate means.',
      insight: 'V17, V14, V12 and V10 separate the classes by several standard deviations; the weakest features barely move.',
      why: 'A z-score puts every feature on the same scale regardless of its units, which is what makes "how much does this feature separate fraud" a comparable question across 30 anonymised components.',
    },
    'z_score_multivariate_chi_distribution.webp': {
      what: 'Distribution of the summed squared z-score across all PCA components, for both classes.',
      insight: 'Fraud averages a chi-score of 667.6 against 26.9 for legitimate transactions (a 24.8x ratio), and 63.2% of fraud sits above the 99th percentile of normal.',
      why: 'It shows fraud is anomalous in aggregate even when no individual feature is extreme. That is the statistical justification for a multivariate model over a set of single-feature rules.',
    },
    'z_score_distribution_all_features.webp': {
      what: 'Per-feature z-score distributions for both classes, ordered by effect size.',
      insight: 'The strongest features show clearly displaced fraud distributions; the weakest overlap almost completely.',
      why: 'It makes the ranking visual rather than numeric, and shows that the separation is a genuine shift in the distribution rather than a handful of outliers dragging a mean.',
    },
    'z_score_amount_time_scatter.webp': {
      what: 'Amount z-score against Time z-score, fraud in red, with reference lines at plus and minus two standard deviations.',
      insight: 'Most fraud sits near z = 0 on Amount: perfectly ordinary transaction sizes.',
      why: 'The clearest refutation of the "fraud means big transactions" intuition. Fraudulent amounts are deliberately unremarkable, which is exactly why the anonymised behavioural features carry the signal instead.',
    },
  },
};

export const PROJECT_PLOTS = {
  // Ordered as a narrative: what the data looks like, how the models compare,
  // what the operating point costs, and what actually drives a prediction.
  'fraud-detection': [
    { file: 'target_distribution.webp', label: 'Class distribution across all three datasets: fraud is 0.13% to 1.10% of transactions' },
    { file: 'amount_by_class.webp', label: 'Amount by class: fraud does not sit at unusually large amounts, which rules out the obvious heuristic' },
    { file: 'correlation_heatmap.webp', label: 'Feature correlation with the fraud label: no single feature is decisive, so the problem is inherently multivariate' },
    { file: 'model_comparison_f1.webp', label: 'Model comparison including both dummy baselines, which score near-zero F1 despite 99%+ accuracy' },
    { file: 'pr_curves.webp', label: 'Precision-recall curves: XGBoost reaches 0.876 average precision against a 0.0017 chance baseline, a 509x lift' },
    { file: 'roc_curves.webp', label: 'ROC curves, included as a caution: every model looks excellent here, including one with 6% precision' },
    { file: 'confusion_matrix_best.webp', label: 'XGBoost confusion matrix at the default 0.5 threshold: 82 of 98 frauds caught, 11 false alarms' },
    { file: 'calibration_curve.webp', label: 'Calibration: class weighting distorts the probabilities even where the ranking stays sound' },
    { file: 'cost_heatmap.webp', label: 'Cost surface: the optimal threshold slides from 0.97 at equal costs to 0.02 once a missed fraud costs 50x a false alarm' },
    { file: 'threshold_sensitivity.webp', label: 'Precision, recall and F1 across the threshold range: the 0.5 default sits far from the cost optimum' },
    { file: 'business_impact.webp', label: 'Business impact: at threshold 0.02, $1,083 of loss against $9,800 for doing nothing, an 88.9% reduction' },
    { file: 'lift_gain.webp', label: 'Cumulative gain: how much fraud is caught per unit of analyst review effort' },
    { file: 'feature_importance_direction.webp', label: 'Odds ratios with 95% confidence intervals: V4 multiplies fraud odds by 3.3 per standard deviation, V10 cuts them to 0.41' },
    { file: 'feature_comparison.webp', label: 'Importance across gini, gain and permutation, each normalised so the methods are directly comparable' },
    { file: 'effect_size_vs_pvalue.webp', label: 'Effect size vs significance: 28 of 30 features are significant, but only 15 have a large effect' },
    { file: 'radar_chart.webp', label: 'Model shape across precision, recall, F1 and ROC-AUC' },
    { file: 'temporal_fraud.webp', label: 'Fraud rate by hour: the argument for time features and for forward-in-time evaluation' },
    { file: 'online_fraud_by_type.webp', label: 'Online Payment fraud rate by transaction type, with Wilson confidence intervals' },
    { file: 'bank_account_effect_sizes.webp', label: 'Bank Account effect sizes (24 of 25 features significant, none with a large effect): the diagnosis for the dataset that failed' },
    { file: 'z_score_feature_separation_ranking.webp', label: 'Features ranked by Cohen\'s d: V17, V14, V12 and V10 separate the classes by several standard deviations' },
    { file: 'z_score_multivariate_chi_distribution.webp', label: 'Multivariate chi-score: fraud averages 667.6 against 26.9 for legitimate, a 24.8x ratio' },
    { file: 'z_score_distribution_all_features.webp', label: 'Per-feature z-score distributions for both classes, ordered by effect size' },
    { file: 'z_score_amount_time_scatter.webp', label: 'Amount vs Time z-scores: most fraud uses perfectly ordinary amounts' },
  ],
  'wids-temp-forecasting': [
    { file: 'target_distribution.webp', label: 'Target Distribution' },
    { file: 'spatial_temperature_map.webp', label: 'Spatial Temperature Map' },
    { file: 'correlation_heatmap.webp', label: 'Correlation Heatmap' },
    { file: 'model_residuals.webp', label: 'Model Residuals' },
  ],
  'starbucks-offer-analysis': [
    { file: 'demographic_distributions.webp', label: 'Customer Demographics: Age, Income & Gender Distribution' },
    { file: 'offer_funnel.webp', label: 'Offer Engagement Funnel: Received to Viewed to Completed' },
    { file: 'offer_characteristics_boxplots.webp', label: 'Offer Characteristics: Duration, Difficulty & Reward vs Completion' },
    { file: 'transaction_behavior.webp', label: 'Transaction Behavior: Responders vs Non-Responders' },
    { file: 'cluster_pca_scatter.webp', label: 'PCA Visualization of 4 Customer Segments' },
    { file: 'cluster_sizes.webp', label: 'Segment Size Distribution' },
    { file: 'cluster_boxplots.webp', label: 'Feature Distributions Across Segments' },
    { file: 'offer_response_ladder.webp', label: 'Taking the leaks out, one at a time: AUC at each step' },
    { file: 'offer_response_calibration.webp', label: 'Calibration on held-out customers' },
    { file: 'ate_by_offer_type.webp', label: 'Causal ATE: Impact of Offers on Transaction Spend' },
    { file: 'recommendation_performance.webp', label: 'Recommendation System Lift vs Random Targeting' },
  ],
};
