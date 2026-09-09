# Timetable Builder: UWI Timetable PDFs Into a Warehouse Students Plan From

## Overview

UWI St. Augustine publishes its timetable as roughly 1,600 CELCAT PDFs: one per course, one per room, one per lecturer. Nothing lets a student ask "what does my week look like if I take these five courses?" This project extracts every one of those PDFs into a PostgreSQL warehouse and serves three things off it: a read-only explorer for courses, rooms and lecturers, a public JSON API, and a timetable builder that fills a week in from course codes and lets the student drag any class to another sitting.

It has been live through seven republished timetables. The current publication holds 3,684 sessions across 1,098 courses, 231 rooms and 360 named lecturers.

**Live:** https://celcat-timetable-extraction.fastapicloud.dev/
**Repository:** https://github.com/firepenguindisopanda/timetable-builder

---

## Tech Stack

- **Python 3.12** with `uv` - core language and package manager
- **FastAPI** - the app, the public `/api/timetable` router and the admin surface
- **pdfplumber** and **PyMuPDF** - geometry-based PDF text extraction
- **PostgreSQL** via **psycopg 3** and a validated connection pool - the warehouse
- **Jinja2** - server-rendered explorer, calendar and tool pages
- **Plain JavaScript**, no build step - the timetable builder's state, grouping and grid logic, loaded by `<script src>` in a fixed order
- **pytest** and Node's built-in test runner - 444 Python and 308 JavaScript tests
- **MongoDB** and **NVIDIA NIM** - the optional calibration workflow only; both imports are lazy and the student-facing path never loads them
- **FastAPI Cloud** - hosting

---

## Key Features

- **Course picker** - search all published courses by code, title, lecturer or room, tick several or paste a whole semester, and the week fills itself in from the warehouse. The upload path stays for a PDF the university has not published.
- **Drag to another sitting** - every class is an option group (`course | activity type`); a student drags a lecture to any of its alternatives, and anything they place themselves stays put across reloads and republishes.
- **Conflict detection, undo and redo** - clashes are marked on the grid, and every placement, removal and refresh is undoable.
- **Republish detection** - when UWI publishes a new timetable, a saved timetable notices it is behind, tells the student what moved, and offers to update their courses while keeping their pins.
- **Changes feed** - `/explore/changes` lists what the last republish changed per course: moved classes, confirmed venues, courses added and withdrawn. Sessions are stored per publication and never overwritten, so any two publications can be diffed.
- **Explorer** - course, room and lecturer pages with a week view, a teaching-weeks strip, and a provenance rail on every page stating when UWI published, when it was imported and when it was last checked.
- **Public API** - `GET /api/timetable/sessions?codes=COMP 3605,INFO 3600` returns a course's sessions with a `sourceCount` per session; `/api/timetable/changes` returns the diff. `/explore/ops.json` reports data health.
- **Print export** - a printable week from the builder.

---

## How it knows

Every session in the warehouse records which PDFs described it. A class that appears in the course timetable, the room timetable and the lecturer's timetable is confirmed three ways; one seen in a single PDF is not. In the current publication **3,438 of 3,684 sessions (93%) are confirmed by two or more independently published timetables**, and the API exposes that count on every session rather than hiding it.

Before any publication is loaded, `validate_corpus.py` extracts every PDF and cross-references the rooms and course codes it found against the registry UWI publishes in `finder.xml`. It reports files that produced nothing, per-field coverage, malformed or inverted times, blocks that merged two sessions, codes the registry does not publish - a code invented from stray text creates a phantom course and splits a real one in two - and rooms outside the official list. It exits non-zero if any required field drops below 99% or any sanity check fails, so it gates the load rather than commenting on it.

### The failure it is built around

CELCAT's layout drifts between semesters, and the failures are silent: nothing crashes, classes just land on the wrong row. The worked example is `deW` - `Wed` reversed, the way the PDF encodes it - missing from the reversed-day table. In about one PDF in five no Wednesday row was built, and that day's classes were filed under Tuesday. Every field was populated. Every PDF looked individually fine. The only symptom was a corpus-wide histogram reading Tuesday 1,294 / Wednesday 567.

Fixing it moved the counts to 788 / 821 and lifted cross-PDF agreement from 83% to 94%. The telemetry was then built around that class of failure: extraction returns a `diagnostics` block naming near-misses (`day_label_unmatched` is the one to read first), a weekday-skew gate sits in the validator, and structured logs carry correlation ids.

### The guard rail that has already fired

Publication identity is the SHA-256 of `finder.xml`. If a partial pull replaced the registry, the next load would silently attach hundreds of changed resources to the *previous* publication, `current_sessions` would never flip, and no saved timetable would ever be prompted. So `sync pull` writes the registry only after walking every link without a download error. On the sixth republish it refused twice - once killed mid-walk, once on a read timeout for a single room PDF - and said exactly why. Re-running until it completed was the whole fix.

### Rule-based, checked against an LLM

A comparison over sample PDFs put the deterministic extractor against a vision model reading the page image. On a ten-PDF sample the model missed twelve entries the extractor found, added eight that were not in the timetable, and read every block as one hour long regardless of its real duration. The vision model is kept for what it is good at: an admin-only calibration tool that describes an awkward PDF's layout so the deterministic extractor can be taught it, never the extractor itself.

---

## Architecture

- `timetable_extractor/` - extraction (`extract.py`, `day_map.py`, `text_parser.py`, `time_parser.py`, `blocks.py`), `sync.py` for detecting and pulling a republish, `observability.py`, and the `database/`, `config/` and `calibration/` subpackages
- `timetable_extractor/database/` - schema, loader, and plain query functions taking a `psycopg.Connection`; reads go through the `current_sessions` view, scoped to the latest publication
- `main.py` - the FastAPI app, routes and admin auth; `explore_router.py` - the explorer pages and the public API
- `assets/js/` - `timetable-state.js` (placements, auto-place, move, remove, undo/redo), `option-groups.js`, `calendar-utils.js`; tested in a `vm` context in the same order the browser loads them
- `validate_corpus.py` - the gate before any load

One rule lives in code rather than data: a student attends one lecture, one lab and one tutorial per course per week. The publication cannot distinguish "the same lecture offered five times" from "five different lectures", two rounds of analysis went looking for a signal that was not there, so `option-groups.js` states the rule and the student can add extra sittings by hand.

---

## Operations

- `/extract/batch`, `/evaluate`, `/download` and everything under `/admin` require an API key; leaving the key unset closes them with a 503 rather than opening them. CORS allows cross-origin reads of public data and never credentials.
- Every asset URL carries a content-hash version stamp, after a deploy that changed a script without changing its URL served new HTML against a cached old script and rendered a blank calendar over a perfectly good saved timetable.
- Saved timetables are versioned in `localStorage`; the v1 and v2 readers are kept and still migrate.
- The runbook for a republish - check, pull, validate, load, verify `ops.json` - is recorded in the repo with the outcome of every import so far.
