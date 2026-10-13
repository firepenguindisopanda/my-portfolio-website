# WiDS 2023: Sub-Seasonal Temperature Forecasting

## Problem Statement

The WiDS Datathon 2023 asked participants to forecast the 14-day average temperature (mean of daily max and min) across US locations. This is **sub-seasonal forecasting**: predicting weather 2 weeks ahead, which falls between short-term weather forecasts and long-term climate predictions.

Forecasts at this range are used in agriculture, energy planning and disaster preparedness.

## Dataset

- **375,734** training samples across **514 US locations**
- **731 days** of observations (September 2014 to August 2016)
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

The target is roughly bimodal, following seasonal temperature variation across the US, and ranges from -20°C to 37°C.

### Spatial Patterns

![Spatial Temperature Map](/portfolio_data/wids/plots/spatial_temperature_map.webp)

Temperature follows geography: warmer in the south, cooler in the north and at higher elevations.

### Feature Correlations

![Correlation Heatmap](/portfolio_data/wids/plots/correlation_heatmap.webp)

NMME model forecasts correlate most strongly with the target, which is expected because they are physics-based predictions of the same quantity.

## Feature Engineering

### Approach

1. **Temporal Features:** Month (cyclic encoding), season, day-of-year
2. **NMME Ensemble Statistics:** Mean, std, range across forecast models (captures model agreement/uncertainty)
3. **Interaction Features:** Elevation × forecast, uncertainty × prediction, precipitation × humidity
4. **Feature Selection:** Mutual information ranking, selecting top 150 of 246 features

### Key Engineered Features

- `nmme_34w_mean/std/range`: Ensemble statistics across 10 NMME models
- `nmme_uncertainty`: Model spread × mean (high uncertainty when models disagree)
- `elev_x_nmme`: Elevation modulates temperature forecasts
- `precip_x_rhum`: Precipitation-humidity interaction

## Model: LightGBM

### Why LightGBM

- **Strong on tabular data**: gradient-boosted trees tend to do well on structured datasets
- **Fast training**: histogram-based splitting keeps training on 375K samples quick
- **Built-in feature importance**: gives feature rankings I can read and check
- **Handles mixed feature types**: little preprocessing needed

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

LightGBM cut RMSE by **90%** compared with the physics-based NMME ensemble baseline.

### Feature Importance

![Feature Importance](/portfolio_data/wids/plots/feature_importance.webp)

NMME model forecasts make up most of the top features, so the physics-based predictions are still the strongest signal. The model also uses atmospheric variables and temporal patterns to refine them.

### Prediction Quality

![Predicted vs Actual](/portfolio_data/wids/plots/prediction_vs_actual.webp)

Predictions sit close to the diagonal across the full temperature range.

### Residual Analysis

![Model Residuals](/portfolio_data/wids/plots/model_residuals.webp)

Residuals are approximately normal, with a slight bias at the temperature extremes. With only 2 years of training data, that is what I expected.

## Key Insights

1. **NMME forecasts leave room for correction**: The ensemble mean reaches R²=0.88, which leaves significant room for an ML-based correction
2. **Model disagreement is a useful feature**: The spread between NMME models has predictive value of its own
3. **Seasonal features rank high**: Month/season features are near the top of the importance ranking
4. **Geography helps**: Elevation and climate region interactions improve predictions
5. **Two years of data is a limit**: A longer training period would likely improve predictions at the extremes

## Technical Details

- **Framework:** LightGBM 4.x
- **Feature Selection:** Mutual information (top 150 of 246)
- **Cross-Validation:** 5-fold, shuffled
- **Training Samples:** 375,734
- **Features Used:** 150

## Links

- [Kaggle Competition](https://www.kaggle.com/competitions/widsdatathon2023)
- [GitHub Repository](https://github.com/firepenguindisopanda)
