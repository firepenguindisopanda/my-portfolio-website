# Chimp Test & Visual Memory Game Suite

## Overview

Two memory games built with **React 19**, **TypeScript** and **Vite**, based on the "Chimp Test" working memory experiment. Each game gets harder as you level up, has configurable difficulty settings, and posts scores to a real-time leaderboard on Supabase.

**Repository:** [https://github.com/firepenguindisopanda/game-test-chimp](https://github.com/firepenguindisopanda/game-test-chimp)

---

## Games

### Chimp Test

Numbered tiles are shown briefly on a 6×6 grid and then hidden. You click the tiles in ascending order from memory, and each level you clear adds another tile.

- **Beginner Mode:** Tiles stay visible until you start clicking, which suits practice
- **Advanced Mode:** Tiles hide automatically after a configurable view time (3s/5s/7s)
- **Super Advanced Mode:** Timed view + random number gaps (tiles use non-sequential numbers)

### Visual Memory Test

The grid briefly highlights a set of positions for you to memorize and then click. After the highlights disappear, the grid may rotate 90° to 180°, so you have to track where the positions moved.

- **Beginner Mode:** No rotation, position recall only
- **Advanced Mode:** Grid rotates 1 to 2 steps (90° to 180°) after hiding tiles
- **Super Advanced Mode:** Rotation + timed viewing + 90-second recall timer
- Grid size: starts at 3×3, grows every 2 levels (3×3 to 4×4 to 5×5 to 6×6 to 7×7+)
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
Both games manage state with `useReducer` and a fixed set of action types:

```
ChimpTest State:
  START_GAME to CLICK_TILE to HIDE_TILES to NEXT_ROUND to LIFE_LOST to GAME_OVER

VisualMemory State:
  START_GAME to FINISH_SHOWING to ROTATE_STEP to ROTATION_COMPLETE to
  CLICK_TILE to LEVEL_COMPLETE / HANDLE_FEEDBACK_DONE to GAME_OVER
```

### Audio System
Game events trigger sound effects:
- **Singleton `AudioManager`** handles all sound playback, with volume/mute controls
- **`InteractionManager`** maps game events (tile click, wrong guess, level clear, game over) to specific sound effects
- 100+ **Warcraft II**-inspired unit acknowledgment and selection sounds from Alliance and Horde factions
- Audio failures (autoplay policy, 404s) are caught and ignored, so a missing sound never stops the game

### Database (Supabase)
A unified `game_scores` table stores scores for both games with:
- `game_type`, `player_name`, `best_level`, `tiles_count` (core fields)
- `mode`, `view_time`, `grid_size`, `time_played` (game-specific extras)
- Row-Level Security (RLS) allowing anyone to insert and read scores
- Real-time subscriptions via Supabase's `postgres_changes` for live leaderboard updates

---

## Key Features

- **Two games:** Chimp Test and Visual Memory Test in one app
- **Progressive difficulty:** Each level gets harder, and the game records your best result
- **Configurable difficulty:** Three mode tiers + adjustable view times
- **Real-time leaderboard:** Global rankings on Supabase, with personal score history and filtering by mode
- **Grid rotation:** The Visual Memory Test rotates the grid, which adds spatial reasoning to the recall task
- **Audio feedback:** 100+ Warcraft-themed sounds
- **Responsive layout:** Works on desktop and mobile, with touch-friendly tiles
- **Accessible:** Keyboard-navigable cards, ARIA labels on tiles, focus management, and screen reader support
- **Typesafe:** TypeScript strict mode, with exhaustive union types for game actions

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
