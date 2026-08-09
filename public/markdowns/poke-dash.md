# Poke-Dash: Pokemon Dashboard

## Overview

Poke-Dash is a full-stack Pokemon management platform that combines classic collection mechanics with modern machine learning analytics. Users can browse the complete Pokedex (801 Pokemon across 8 generations), hunt wild Pokemon in an interactive arena, test their knowledge with trivia quizzes, chat in real time, and explore advanced ML-powered insights - all within a single Flask application.

**Live Demo:** https://pokemon-dashboard.onrender.com/
**Repository:** https://github.com/firepenguindisopanda/Pokemon-Dashboard

---

## Architecture

The application follows Flask's application factory pattern with blueprint-based modular routing. Each major feature lives in its own blueprint:

| Blueprint | Module | Responsibility |
|-----------|--------|----------------|
| Auth | `blueprints/auth.py` | Registration, login, JWT issuance/refresh, session management |
| Pokemon | `blueprints/pokemon.py` | Pokedex browsing, capture, release, rename, search |
| Arena | `blueprints/arena.py` | Wild Pokemon encounter, damage/attack, catch probability |
| Quiz | `blueprints/quiz.py` | Trivia question generation, answer validation, pokeball rewards |
| Analytics | `blueprints/analytics.py` | ML model serving, dashboard data, async model training |
| Chat | (via SocketIO) | Real-time messaging with message persistence |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Flask 2.2, Python 3.10+ |
| Authentication | Flask-JWT-Extended (access + refresh tokens, cookie-based) |
| Database | SQLAlchemy with SQLite (dev) / PostgreSQL (production) |
| Templates | Jinja2 with server-side rendering |
| Frontend | Materialize CSS, Chart.js 3.x, Font Awesome |
| Real-time | Flask-SocketIO (WebSocket-based chat) |
| ML/Analytics | scikit-learn (Random Forest, Gradient Boosting, Logistic Regression, KMeans, PCA, t-SNE), pandas, NumPy, scipy |
| Model Persistence | joblib with MD5 data-hash versioning |
| Deployment | Gunicorn + Render |

---

## Features

### 1. Authentication System

- **JWT dual-token architecture** - short-lived access tokens (15 min) with refresh tokens (7 days) for secure session management
- **Silent token refresh** - expired access tokens are automatically refreshed using the refresh token cookie, transparent to the user
- **DB-failure resilience** - if the database is unreachable, the system falls back to JWT claims to construct a minimal user object, preventing crashes
- **CSRF protection** configurable via settings

### 2. Pokedex Browsing & Collection

- Browse all 801 Pokemon ordered by Pokedex number
- Search by name (case-insensitive partial match)
- Filter by generation (1-8)
- Detailed view with stats, type(s), abilities, classification, capture rate, height/weight
- Capture Pokemon with custom nicknames (one per species per user)
- Rename or release captured Pokemon
- Pokeball economy - limited resource consumed on capture attempts

### 3. Wild Pokemon Arena

The arena provides an interactive battle-like encounter system:

- **Encounter** - a random wild Pokemon (not already owned) is selected with its full stats
- **Attack** - deal 10-29 random damage per attack, reducing the Pokemon's HP
- **Catch mechanics** - capture chance scales with HP ratio and capture rate:

  ```
  chance = min(HP_ratio * (capture_rate / 255) * 1.5, 0.85)
  ```

- **Pokeball cost** - each throw consumes one pokeball
- **Faint protection** - cannot catch a fainted Pokemon (HP = 0)
- **Run away** - abandon the encounter
- All state managed via server-side sessions

### 4. Pokemon Trivia Quiz

- 10 questions per round drawn from three categories:
  - **Stat questions** - "What is Pikachu's base Speed?"
  - **Type questions** - "What is Charizard's primary type?"
  - **Generation questions** - "Which generation does Mewtwo belong to?"
- Each correct answer awards 1 pokeball
- Sprites displayed alongside questions for visual engagement
- Session-based tracking of correct answers per round

### 5. Real-Time Chat

- WebSocket-based messaging via Flask-SocketIO
- Room-based channels
- Persisted message history with timestamps
- User identity tied to JWT authentication

### 6. Analytics Dashboard

An async-initialized analytics engine powers a rich dashboard:

- **Descriptive statistics** - total Pokemon count, legendary rate, average stats, strongest/fastest/rarest Pokemon lists
- **Type distribution** - doughnut chart showing Pokemon count by primary type
- **Generation distribution** - bar chart across all 8 generations
- **Average stats radar** - HP, Attack, Defense, Sp. Atk, Sp. Def, Speed compared against max (255)
- **Legendary vs non-legendary comparison** - side-by-side bar chart
- **Filter chips** - toggle between All, Gen 1, Gen 2, Legendary, Non-Legendary views
- **Async loading** - page renders instantly; data loads via polling once models are trained
- Dark/light theme toggle

### 7. ML Playground

The ML engine (`PokemonAnalytics` class in `lib.py`) trains and serves multiple models:

#### Legendary Classification
- **Algorithm**: Random Forest with GridSearchCV hyperparameter tuning
- **Cross-validation**: StratifiedKFold (5-fold) with F1 scoring due to severe class imbalance (~8.7% legendary)
- **Hyperparameter search**: n_estimators [50, 100, 200], max_depth [5, 10, 15, None], class_weight variants
- **Ensemble comparison**: Random Forest vs Gradient Boosting vs Logistic Regression vs soft Voting ensemble
- **Feature importance**: HP, attack, base_total, and generation are top predictors

#### Base Total Regression
- Random Forest regressor with R² and MSE evaluation
- GridSearchCV with 3-fold cross-validation
- Feature importance analysis showing relative contribution of each stat

#### Clustering Analysis
- KMeans clustering with configurable cluster count (default 5)
- Two visualization methods:
  - **PCA** - 2D projection with explained variance ratios
  - **t-SNE** - non-linear 2D projection with perplexity=30
- Per-cluster profiling: dominant types, legendary rate, average base total, stat profiles, generation distribution

#### Similarity Search
- **Forward search**: find Pokemon similar to a given one using cosine similarity across 10 stat dimensions
- **Reverse search**: input a custom stat profile (HP, Attack, Defense, etc.) and find the closest real Pokemon
- Both use StandardScaler normalization before cosine similarity computation

#### Team Recommendation Engine
A sophisticated recommendation system that constructs balanced 6-Pokemon teams:

| Parameter | Options |
|-----------|---------|
| Playstyle | Offensive, Defensive, Speed, Balanced |
| Difficulty | Beginner (capture-rate weighted), Intermediate, Advanced (pure performance) |
| Legendary handling | Allow (max 2), Exclude, Auto (80/20 preference) |
| Generation filter | Range-based (e.g., Gen 1-3) |
| Type preference | Filter by preferred types |
| Team roles | Physical Attacker, Special Attacker, Tank, Fast Support, Balanced, Wildcard |

- Role-specific scoring using weighted stat combinations
- Type coverage analysis
- Synergy score (0-1) measuring how well the team fits the chosen playstyle
- Team strength/weakness analysis

#### Build Optimizer
- Uses scipy's L-BFGS-B minimization to find the optimal stat distribution maximizing predicted base_total
- Bounded optimization across all 13 features (HP 1-255, Attack 1-255, etc.)
- Returns a complete optimal Pokemon build specification

### 8. Database & Models

- **User** - username, email, hashed password, pokeballs, quiz tracking
- **Pokemon** - 20+ attributes including stats, type(s), abilities, capture rate, classification, generation, legendary status
- **UserPokemon** - junction table linking users to captured Pokemon with nicknames
- **Message** - chat message persistence with sender, room, text, timestamp
- Composite indexes on frequently queried columns (type, generation, legendary status)

### 9. Model Caching System

- **Data-hash versioning**: MD5 hash of training data determines cache validity
- **Joblib persistence**: models, scalers, and encoders serialized to disk
- **Manifest tracking**: metadata including training timestamp, metrics, and data hash
- **Automatic retraining**: cache miss triggers full training pipeline
- **Force retrain** endpoint for manual regeneration

---

## Deployment

- **Hosting**: Render (gunicorn web service)
- **Environment**: Python 3.10+
- **Database**: SQLite for local development, PostgreSQL via Neon for production
- **Configuration**: Pydantic Settings with `.env` file loading
- **Startup**: Auto-initializes database if empty; trains ML models asynchronously in background thread

---

## Testing

- End-to-end browser tests using Playwright/Mocha
- Database seeding with Pokemon CSV (801 species)
- Test fixture for JWT token handling
- Coverage includes: auth flows, Pokemon CRUD, arena mechanics, quiz logic, analytics endpoints

---

## Why This Project Stands Out

This project demonstrates full-stack competency across the entire web development spectrum:

1. **Backend engineering** - Flask factory pattern, blueprint modularity, SQLAlchemy ORM, JWT security
2. **Real-time systems** - WebSocket-based chat with Flask-SocketIO
3. **Machine learning** - End-to-end ML pipeline from data cleaning to production model serving with caching
4. **UI/UX** - Server-rendered templates with modern CSS framework and interactive Chart.js visualizations
5. **DevOps** - Deployed on Render with environment-based configuration and automated DB initialization
6. **Data engineering** - CSV parsing, data cleaning, feature engineering, model persistence
