# Dual N-Back: A Brain Workshop Port for Desktop and Android

## Overview

Dual n-back is a working-memory exercise: each trial a square lights up in one of eight cells and a voice says a letter, and you press when either matches what came n trials earlier. Brain Workshop is a free trainer for it, written in Python (its main file is 4,347 lines). I ported it twice: to the desktop in **Rust and Tauri**, and to Android in native **Kotlin**. Both play all 110 Brain Workshop modes with the same trial generation, scoring and level progression, and store every trial, key press and reaction time so the history can be analysed.

Both apps are GPL-3.0-or-later, as derivatives of Brain Workshop by Paul Hoskinson and contributors, and the repositories credit it in `NOTICE.md`.

| | Desktop | Android |
|---|---|---|
| Stack | Rust, Tauri v2, React 19, TypeScript | Kotlin, Jetpack Compose, Room |
| Storage | SQLite (rusqlite, bundled), STRICT tables | Room on a bundled SQLite 3.50 |
| Size | About 10,000 lines of Rust and 9,000 of TypeScript | About 25,000 lines of Kotlin |
| Tests | 117 Rust and 111 Vitest | Over 400 JVM and Robolectric |
| Status | v0.5.3, Windows installers | 0.1.0, installed on my phone over USB |

---

## Faithful to the original, with every change written down

The rules come from reading `brainworkshop.pyw` line by line into a spec that marks each of the original's quirks with its line number. Where the port deliberately differs, it is one of 15 numbered decisions with the reason; everything else is kept as it was. A few of them:

- **Trial length.** Brain Workshop reports a trial as T tenths of a second but actually runs it for T minus 2 (2.8 s for a "3.0 s" trial). The port runs exactly what it reports.
- **Seeded randomness.** Each session's sequence comes from a ChaCha8 generator seeded from a stored number, so any session can be regenerated exactly. Replay depends on this.
- **Presses.** The first press in a trial is the one scored, a press timestamped before the trial began is ignored, and pausing moves the trial's start, so reaction times never include a pause.
- **Kept for comparability.** The 250 ms miss window, floored integer percentages, Brain Workshop's own score formula, the 20 + n² trial count and the lure probabilities stay as they were, so scores mean the same thing as in the original.

Generation is tested statistically: over 10,000 trials the match rate has to land at the original's 22% within tolerance.

**Replay** rebuilds a session from its seed and its stored settings snapshot. If any stored stimulus differs from the rebuild, the replay shows no grid pictures rather than a picture that might be wrong. Rebuilding a 101-trial session takes 0.41 ms.

---

## Desktop: the core knows nothing about the screen

The desktop app is a Cargo workspace in a ports-and-adapters layout:

- `nback-core`: the rules (modes, generation, scoring, progression, statistics) as pure functions with no IO, randomness only from a seed.
- `nback-store`: the only code that writes SQL. Every table is STRICT, migrations are numbered files, settings are stored as immutable snapshots, and imports keep their lineage.
- `src-tauri`: a game service and thin Tauri commands, with contract tests on the IPC boundary. TypeScript types are generated from the Rust ones, so the two sides cannot drift.

The UI is React with plain CSS and hand-written SVG charts, each with a data-table view. The backend scores; the UI never does.

### Timing

A working-memory test is only as good as its timing. Trial onsets follow a drift-free schedule computed from the session start, so small delays never accumulate. Measured on the desktop:

- The earliest a newly requested sound can be heard is about 47 ms, so audio is scheduled at least 100 ms ahead, and scheduled sounds land within 0.01 ms of their time.
- A two-stage timer cut timer lateness from about 8 ms (20 ms at worst) to 2 ms or less.
- A key press reaches the screen as feedback in 1.5 to 2.7 ms.

### Statistics

Progress charts cover level over time, accuracy, d′ and median reaction time per stream, and lure errors. d′ uses the log-linear correction for perfect scores (Hautus 1995) and Acklam's approximation for the inverse normal. Insights report d′ and response bias per stream (flagged when |c| ≥ 0.3), how d′ changes across a session, and whether time of day, session of the day or rest make a difference, calling an effect clear only at Welch's z ≥ 1.96. A summary table cut the lure-error query from 555 to 75 ms at 10,000 sessions.

The app also imports Brain Workshop's own `stats.txt`, runs a monthly Counting Span test, and offers Strict sessions (no pause; leaving ends the session as a failed one) and an automatic pace that speeds up or slows down by 0.1 s from the last few sessions.

---

## Android: a port held to the desktop by fixtures

The Android app shares no code with the desktop: the first design decision was all Kotlin, with no FFI and no NDK. The rules are ported instead, and the two are pinned together by test fixtures: a Rust program exports golden JSON fixtures that the Kotlin tests must reproduce, and another exports sample desktop databases from each schema version for the import tests. The ChaCha8 generator and the Rust `rand` crate's sampling are reproduced bit for bit, so the same seed gives the same session on both.

It imports the desktop's database. Android 13 ships SQLite 3.32, which cannot read STRICT tables (they need 3.37), and Android's default error handler would then delete the file as corrupt, so the app bundles SQLite 3.50. The import copies the backup to the app's cache, checks its migration version (refusing a newer one), matches profiles and sessions by UUID, copies only what the phone does not have, and runs in one transaction. The phone never writes the desktop's file.

What the phone adds: multi-touch pads in portrait and landscape, haptics, keyboard and gamepad input, daily reminders, a home-screen widget, app shortcuts, and help for Strict sessions (screen pinning and Do Not Disturb). Leaving the app, a call, losing audio focus or unplugging headphones pauses a normal session and forfeits a Strict one.

### Timing on a phone

- Trial onsets land between 8.3 ms early and 8.2 ms late (median 0.7 ms), and 50 of 50 stimuli were drawn in their onset frame.
- The display reported 90 Hz but measured about 60 Hz, so frame length is measured from vsync and sessions run at 60 Hz.
- Bluetooth audio adds about 250 to 300 ms. The app records the audio route for every session and flags it on the results, and compares reaction times only within one input source.
- One 164 ms late frame came from reading the audio timestamp on the main thread while Bluetooth re-routed; the read moved to the audio thread.
- A touch reaches the drawn pad in a median 8.5 ms. A Baseline Profile cut cold start from 628 to 558 ms, 15 seconds of play had 0 janky frames out of 921, and the release APK went from 20.8 to 17.1 MB.

---

## Screenshot

The desktop chart in the screenshot is the dev build's sample history (about two months of made-up sessions), so it shows no real training data. The phone screen is the first page of the built-in tutorial.
