# Timetable Builder: UWI Timetable PDFs Into a Warehouse Students Plan From

## Overview

UWI St. Augustine publishes its timetable as roughly 1,600 CELCAT PDFs: one per course, one per room, one per lecturer. Nothing in that publication lets a student ask "what does my week look like if I take these five courses?" This project extracts every one of those PDFs into a PostgreSQL warehouse and serves three things off it: a read-only explorer for courses, rooms and lecturers, a public JSON API, and a timetable builder that fills a week in from course codes and lets the student drag any class to another sitting.

It has loaded 14 publications of the timetable so far, the latest on 27 October 2026, which holds 3,546 sessions across 1,085 courses, 235 rooms and 358 named lecturers.

**Live:** https://celcat-timetable-extraction.fastapicloud.dev/
**Repository:** https://github.com/firepenguindisopanda/timetable-builder

---

## Tech Stack

- **Python 3.12** with `uv`: core language and package manager
- **FastAPI**: the app, the public `/api/timetable` router and the admin surface
- **pdfplumber** and **PyMuPDF**: geometry-based PDF text extraction
- **PostgreSQL** via **psycopg 3** and a validated connection pool: the warehouse
- **Jinja2**: server-rendered explorer, calendar and tool pages
- **Plain JavaScript**, no build step: the timetable builder's state, grouping, clash and calendar logic, loaded by `<script src>` in a fixed order
- **FullCalendar 7**: draws the builder's week
- **pytest** and Node's built-in test runner: 676 Python and 508 JavaScript tests
- **MongoDB** and **NVIDIA NIM**: the optional calibration workflow only; both imports are lazy and the student-facing path never loads them
- **FastAPI Cloud**: hosting

---

## Key Features

- **Course picker**: a drawer over the week. Search all published courses by code, title, lecturer or room, tick several or paste a whole list (off a registration screen or a message), and the builder fills in the week from the warehouse. A batch is one operation, so one undo takes it all back. The upload path stays for a PDF the university has not published.
- **Drag to another sitting**: every class is an option group (`course | activity type`); a student drags a lecture to any of its alternatives, and anything they place themselves stays put across reloads and republishes.
- **Dated teaching weeks**: the grid shows a real week ("Week 9, 26 Oct to 1 Nov") with a week switcher, so a fortnightly lab, a one-week relocation or an exam appears only in the weeks it runs.
- **Clashes that are real**: two classes clash only if they overlap in time and share a teaching week, so exams and a class booked in two rooms no longer raise false clashes. The panel separates clashes that can be fixed (with a button naming where the class would go) from ones that cannot, and says why.
- **My week**: contact hours, the earliest start, and each gap of two hours or more linked to the free rooms for that day and time.
- **Add to calendar**: an `.ics` download, or a subscription link that keeps a phone's calendar in step with later republishes (below).
- **Republish detection**: a saved timetable records the publication it was built on. When UWI republishes, the student sees what moved and can update while keeping their pins, and undo takes the update back, older timetable included.
- **Phone layout**: a day view in place of seven squeezed columns, with the picker full screen.
- **Free rooms**: rooms with no class timetabled in a given hour of a given week, by building, and until when. It says "no class timetabled", never "open".
- **Campus heatmap**: how many classes are on campus in each hour of a typical teaching week.
- **Changes feed**: `/explore/changes` lists what each republish changed per course: moved classes, confirmed venues, exams, courses added and withdrawn. Sessions are stored per publication and never overwritten, so any two publications can be diffed.
- **Explorer**: course, room and lecturer pages with a week view, a teaching-weeks strip, and a provenance rail on every page stating when UWI published, when it was imported and when it was last checked.
- **Public API**: `GET /api/timetable/sessions?codes=COMP 3605,INFO 3600` returns a course's sessions with a `sourceCount` per session; `/api/timetable/changes` returns the diff. `/explore/ops.json` reports data health.
- **Share and print**: a share link carries only the course codes, so the recipient's copy is placed against current data; a printable week.

---

## How sessions are confirmed

Every session in the warehouse records which PDFs described it. A class that appears in the course timetable, the room timetable and the lecturer's timetable is confirmed three ways; one seen in a single PDF is not. In the current publication **3,322 of 3,546 sessions (94%) are confirmed by two or more independently published timetables**, and the API returns that count on every session.

Before any publication is loaded, `validate_corpus.py` extracts every PDF and cross-references the rooms and course codes it found against the registry UWI publishes in `finder.xml`. It reports files that produced nothing, per-field coverage, malformed or inverted times, blocks that merged two sessions, codes the registry does not publish (a code invented from stray text creates a phantom course and splits a real one in two) and rooms outside the official list. It exits non-zero if any required field drops below 99% or any sanity check fails, and a non-zero exit stops the load.

### The failure the validator is built around

CELCAT's layout drifts between semesters, and the failures are silent: nothing crashes, classes just land on the wrong row. The worked example is `deW` (`Wed` reversed, the way the PDF encodes it) missing from the reversed-day table. In about one PDF in five no Wednesday row was built, and that day's classes were filed under Tuesday. Every field was populated and each PDF looked fine on its own; the only symptom was a corpus-wide histogram reading Tuesday 1,294 / Wednesday 567.

Fixing it moved the counts to 788 / 821 and lifted cross-PDF agreement from 83% to 94%. I then built the telemetry around that kind of failure: extraction returns a `diagnostics` block naming near-misses (`day_label_unmatched` is the one to read first), a weekday-skew gate sits in the validator, and structured logs carry correlation ids.

### The registry guard

Publication identity is the SHA-256 of `finder.xml`. If a partial pull replaced the registry, the next load would silently attach hundreds of changed resources to the *previous* publication, `current_sessions` would never flip, and no saved timetable would ever be prompted. To prevent that, `sync pull` writes the registry only after walking every link without a download error. On the sixth republish it stopped twice (once killed mid-walk, once on a read timeout for a single room PDF), each time reporting the reason, and re-running it until it completed was all the fix needed.

### Rule-based, checked against an LLM

A comparison over sample PDFs put the deterministic extractor against a vision model reading the page image. On a ten-PDF sample the model missed twelve entries the extractor found, added eight that were not in the timetable, and read every block as one hour long regardless of its real duration. The vision model is used only in an admin calibration tool, where it describes an awkward PDF's layout so the deterministic extractor can be taught it. It does not extract sessions.

### Weeks that have passed

CELCAT exports each timetable from the current teaching week on, and says so in every PDF title (`Wks W9-W12` in week 9). Loaded as printed, every class would lose a week per republish. The loader reads that horizon and takes each session's earlier weeks back from the previous publication's sitting in the same slot, so a W1-W12 class stays W1-W12 all semester. A class with no earlier sitting in its slot (new, or moved) keeps what the PDF prints, and a slot where several earlier sittings could be the source is logged and left as printed.

---

## Checking the heatmap against the room timetables

The campus heatmap's first version said campus peaked at "190 classes at once" on Monday at 5pm. I checked it against the room timetables, which list every booking in every room: in week 7 there were 126 distinct in-person classes in that hour and 128 rooms in use. None of the 67 busy cells was within 10% of the reference, and it called Wednesday the busiest day when Tuesday is.

Three causes, each measured: one class booked under two course codes or in two rooms was counted once per code and once per room; exams and short-run classes were counted as if they ran every week; and Remote Teaching was counted as on campus. Together they inflated the grid by 47%. The fix collapses rows to one per class, drops Remote Teaching (but keeps classes with no published room, whose venue is unknown rather than off campus), counts each teaching week and takes the median per cell. It now peaks at 130 on Tuesday at 5pm, and its ranking of the busy hours matches the reference. The page says what it counts: classes in a typical teaching week, with exams and one-off sessions left out.

---

## A calendar feed with nothing stored

The subscription link (`/api/timetable/calendar.ics?t=<token>`) keeps no state on the server: the token is the timetable, an encoded list of the student's courses and the slot of each class they chose, plus the publication it was made against. Each time a calendar app fetches it, the server resolves those choices against the current publication.

- The server follows a class that moved using the same slot rules as the browser, and both are held to one shared fixture file, so a phone and a browser cannot disagree about which lab a student takes. The calendar text matches the browser's `.ics` download byte for byte, checked against a golden file.
- A choice that cannot be resolved becomes an all-day note in the calendar instead of a guess. Every exam on the student's courses is included, so new exams arrive by themselves.
- The same publication always produces the same bytes, so the `ETag` is the body's hash and a repeat fetch gets a 304. A bad token is a plain 400; no database is a 503, through which calendar apps keep their last good copy.
- The token is redacted from the server's access log, because it is a course list logged next to an IP address.

---

## Architecture

- `timetable_extractor/`: extraction (`extract.py`, `day_map.py`, `text_parser.py`, `time_parser.py`, `blocks.py`), `sync.py` for detecting and pulling a republish, `observability.py`, and the `database/`, `config/` and `calibration/` subpackages
- `timetable_extractor/database/`: schema, loader, and plain query functions taking a `psycopg.Connection`; reads go through the `current_sessions` view, scoped to the latest publication
- `main.py`: the FastAPI app, routes and admin auth; `explore_router.py`: the explorer pages and the public API
- `assets/js/`: `timetable-state.js` (placements, auto-place, move, remove, undo/redo), `option-groups.js`, `calendar-utils.js`; tested in a `vm` context in the same order the browser loads them
- `validate_corpus.py`: the gate before any load

One rule is written into the code because the data cannot supply it: a student attends one lecture, one lab and one tutorial per course per week. The publication does not distinguish "the same lecture offered five times" from "five different lectures", and two rounds of analysis found no signal that would, so `option-groups.js` states the rule and the student can add extra sittings by hand.

---

## Operations

- `/extract/batch`, `/evaluate`, `/download` and everything under `/admin` require an API key; if the key is unset they return a 503 and stay closed. CORS allows cross-origin reads of public data and never credentials.
- Every asset URL carries a content-hash version stamp. I added it after a deploy changed a script without changing its URL: browsers got the new HTML with the cached old script, and the calendar rendered blank over a saved timetable that was fine.
- Saved timetables are versioned in `localStorage` (now v3); the older readers are kept and still migrate.
- The runbook for a republish (check, pull, validate, load, verify `ops.json`) is recorded in the repo with the outcome of every import so far.
