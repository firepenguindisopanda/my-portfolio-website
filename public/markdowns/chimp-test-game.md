# Chimp Test & Visual Memory Game Suite

## Overview

A cognitive memory training game suite built with **React 19**, **TypeScript**, and **Vite**. Inspired by the classic "Chimp Test" working memory experiment, this project features two distinct game modes with progressive difficulty, configurable challenge settings, and a Supabase-powered real-time leaderboard.

**Repository:** [https://github.com/firepenguindisopanda/game-test-chimp](https://github.com/firepenguindisopanda/game-test-chimp)

---

## Games

### Chimp Test

The classic working memory challenge. Numbered tiles are briefly revealed on a 6×6 grid before being hidden. Your task: click the tiles in ascending numerical order from memory. Each successful level adds a new tile, ramping up the challenge.

- **Beginner Mode:** Tiles remain visible until you're ready - perfect for practice
- **Advanced Mode:** Tiles auto-hide after a configurable view time (3s/5s/7s), adding time pressure
- **Super Advanced Mode:** Timed view + random number gaps (tiles use non-sequential numbers), requiring stronger concentration

### Visual Memory Test

A grid of tiles briefly highlights positions you must memorize and recall. After the showing phase, the grid may rotate 90°–180°, requiring you to track positions through spatial transformation.

- **Beginner Mode:** No rotation - pure position recall
- **Advanced Mode:** Grid rotates 1–2 steps (90°–180°) after hiding tiles
- **Super Advanced Mode:** Rotation + timed viewing + 90-second recall timer
- Dynamic grid sizing: starts at 3×3, grows every 2 levels (3×3 to 4×4 to 5×5 to 6×6 to 7×7+)
- Retry system: 2 retries per level before the level drops back by 1

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **React 19** with **TypeScript** |
| Build Tool | **Vite** |
| Styling | **Tailwind CSS v4** + **shadcn/ui** primitives |
| Animation | **Framer Motion** (`motion` package) |
| Backend/Database | **Supabase** (PostgreSQL) |
| Audio | Custom `AudioManager` with 100+ Warcraft-themed sound effects |
| Icons | **Lucide React** |
| State Management | **useReducer** + refs for complex game state |

---

## Architecture

### State Management
Both games use `useReducer` for state management with well-defined action types:

```
ChimpTest State:
  START_GAME to CLICK_TILE to HIDE_TILES to NEXT_ROUND to LIFE_LOST to GAME_OVER

VisualMemory State:
  START_GAME to FINISH_SHOWING to ROTATE_STEP to ROTATION_COMPLETE to
  CLICK_TILE to LEVEL_COMPLETE / HANDLE_FEEDBACK_DONE to GAME_OVER
```

### Audio System
The game features a comprehensive audio feedback system:
- **Singleton `AudioManager`** manages all sound playback with volume/mute controls
- **`InteractionManager`** maps game events (tile click, wrong guess, level clear, game over) to specific sound effects
- 100+ **Warcraft II**-inspired unit acknowledgment and selection sounds from Alliance and Horde factions
- Graceful degradation: audio failures (autoplay policy, 404s) are caught silently - the game never breaks

### Database (Supabase)
A unified `game_scores` table stores scores for both games with:
- `game_type`, `player_name`, `best_level`, `tiles_count` (core fields)
- `mode`, `view_time`, `grid_size`, `time_played` (game-specific extras)
- Row-Level Security (RLS) allowing anyone to insert and read scores
- Real-time subscriptions via Supabase's `postgres_changes` for live leaderboard updates

---

## Key Features

- **Dual Game Modes:** Two distinct memory challenges in one app
- **Progressive Difficulty:** Each level gets harder; the game tracks your best performance
- **Configurable Challenge:** Three mode tiers + adjustable view times let you customize the difficulty
- **Real-time Leaderboard:** Supabase-powered global rankings with personal score history and mode filtering
- **Spatial Rotation Mechanic:** Unique grid rotation in Visual Memory Test adds a spatial reasoning dimension
- **Rich Audio Feedback:** 100+ Warcraft-themed sounds create an engaging, game-like atmosphere
- **Responsive Design:** Works on desktop and mobile with touch-friendly tile interactions
- **Accessible:** Keyboard-navigable cards, ARIA labels on tiles, focus management, and screen reader support
- **Typesafe:** Full TypeScript strict mode with exhaustive union types for game actions

---

## Project Structure

```
src/
├── App.tsx                    # Root app with game routing and state orchestration
├── components/
│   ├── MainHubScreen.tsx      # Game selection hub with mode/time/name config
│   ├── GameScreen.tsx         # Chimp Test game screen
│   ├── VisualMemoryScreen.tsx # Visual Memory game screen with rotation
│   ├── LeaderboardScreen.tsx  # Global + personal leaderboard
│   ├── Tile.tsx               # Reusable tile component with 7 visual states
│   ├── TimerRing.tsx          # SVG countdown ring component
│   └── ui/                    # shadcn/ui primitives
├── lib/
│   ├── gameReducer.ts         # Chimp Test state reducer
│   ├── visualMemoryReducer.ts # Visual Memory state reducer
│   ├── types.ts               # Shared TypeScript types
│   ├── supabase.ts            # Database client and query functions
│   ├── audio/                 # Audio management system
│   │   ├── AudioManager.ts    # Singleton audio playback
│   │   ├── InteractionManager.ts  # Game-event sound mapping
│   │   ├── audioConfig.ts     # Audio file paths
│   │   └── index.ts           # Public API
│   └── utils.ts               # Utility functions (cn, etc.)
data/                          # Warcraft-themed audio assets
├── alliance/                  # Alliance faction sounds
└── horde/                     # Horde faction sounds
```
