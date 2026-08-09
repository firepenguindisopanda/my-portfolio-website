# WiDS 2023: Sub-Seasonal Temperature Forecasting

## Problem Statement

The WiDS Datathon 2023 challenged participants to forecast the 14-day average temperature (mean of daily max and min) across US locations. This is a **sub-seasonal forecasting** problem - predicting weather 2 weeks ahead, which sits between short-term weather forecasts and long-term climate predictions.

Accurate sub-seasonal forecasts are critical for agriculture, energy planning, and disaster preparedness.

## Dataset

- **375,734** training samples across **514 US locations**
- **731 days** of observations (September 2014 - August 2016)
- **246 features** from multiple climate and atmospheric data sources
- **15 Köppen-Geiger climate regions** represented

### Data Sources

| Source | Variables | Description |
|--------|-----------|-------------|
| NMME Models | 40+ | North American Multi-Model Ensemble temperature & precipitation forecasts |
| Atmospheric | 20+ | Pressure, humidity, geopotential height at multiple pressure levels |
| Ocean | 20+ | Sea surface temperature, sea ice concentration |
| Climate Indices | 5 | MEI (ENSO), MJO phase/amplitude |
| Static | 2 | Elevation, Köppen-Geiger climate classification |

## Exploratory Data Analysis

### Target Distribution

![Target Distribution](/portfolio_data/wids/plots/target_distribution.webp)

The target variable shows a roughly bimodal distribution reflecting seasonal temperature variation across the US, ranging from -20°C to 37°C.

### Spatial Patterns

![Spatial Temperature Map](/portfolio_data/wids/plots/spatial_temperature_map.webp)

Temperature patterns clearly follow geographic location, with warmer regions in the south and cooler regions in the north and at higher elevations.

### Feature Correlations

![Correlation Heatmap](/portfolio_data/wids/plots/correlation_heatmap.webp)

NMME model forecasts show the strongest correlation with the target, as expected since they are physics-based predictions of the same quantity.

## Feature Engineering

### Approach

1. **Temporal Features:** Month (cyclic encoding), season, day-of-year
2. **NMME Ensemble Statistics:** Mean, std, range across forecast models (captures model agreement/uncertainty)
3. **Interaction Features:** Elevation × forecast, uncertainty × prediction, precipitation × humidity
4. **Feature Selection:** Mutual information ranking, selecting top 150 of 246 features

### Key Engineered Features

- `nmme_34w_mean/std/range` - Ensemble statistics across 10 NMME models
- `nmme_uncertainty` - Model spread × mean (high uncertainty when models disagree)
- `elev_x_nmme` - Elevation modulates temperature forecasts
- `precip_x_rhum` - Precipitation-humidity interaction

## Model: LightGBM

### Why LightGBM?

- **Best-in-class for tabular data** - consistently outperforms other algorithms on structured datasets
- **Fast training** - handles 375K samples efficiently with histogram-based splitting
- **Built-in feature importance** - provides interpretable feature rankings
- **Handles mixed feature types** - no need for extensive preprocessing

### Training Setup

- **5-fold cross-validation** with early stopping (100 rounds)
- **2,000 estimators** with learning rate 0.05
- **Feature selection:** Top 150 features by mutual information
- **Baseline:** NMME ensemble mean (physics-based forecast)

## Results

### Performance Comparison

| Metric | LightGBM | NMME Baseline | Improvement |
|--------|----------|---------------|-------------|
| RMSE | 0.338 | 3.419 | **90.1%** |
| MAE | 0.264 | 2.753 | **90.4%** |
| R² | 0.999 | 0.880 | - |

The LightGBM model achieves a **90% reduction in RMSE** compared to the physics-based NMME ensemble baseline.

### Feature Importance

![Feature Importance](/portfolio_data/wids/plots/feature_importance.webp)

The top features are dominated by NMME model forecasts, confirming that physics-based predictions remain the strongest signal. However, the model also leverages atmospheric variables and temporal patterns for refinement.

### Prediction Quality

![Predicted vs Actual](/portfolio_data/wids/plots/prediction_vs_actual.webp)

Predictions cluster tightly around the diagonal, indicating high accuracy across the full temperature range.

### Residual Analysis

![Model Residuals](/portfolio_data/wids/plots/model_residuals.webp)

Residuals are approximately normally distributed with a slight bias at temperature extremes, which is expected given the limited training period (2 years).

## Key Insights

1. **NMME forecasts are strong but imperfect** - The ensemble mean achieves R²=0.88, but there's significant room for improvement through ML-based correction
2. **Model disagreement is informative** - The spread between NMME models is itself a predictive feature
3. **Seasonal patterns dominate** - Month/season features rank high in importance
4. **Geography matters** - Elevation and climate region interactions improve predictions
5. **Two years of data is limiting** - A longer training period would likely improve extreme temperature predictions

## Technical Details

- **Framework:** LightGBM 4.x
- **Feature Selection:** Mutual information (top 150 of 246)
- **Cross-Validation:** 5-fold, shuffled
- **Training Samples:** 375,734
- **Features Used:** 150

## Links

- [Kaggle Competition](https://www.kaggle.com/competitions/widsdatathon2023)
- [GitHub Repository](https://github.com/firepenguindisopanda)
