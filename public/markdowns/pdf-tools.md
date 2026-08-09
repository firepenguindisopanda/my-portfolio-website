# PDF Tools - Offline Desktop PDF Utility

## Overview

A cross-platform desktop app for merging, splitting and auditing PDFs, built with **Tauri v2** - a Rust core doing the document work, an Angular 20 UI on top.

The reason it is a desktop app and not a web app is the entire point: the documents it handles are exam claim forms, invoices and internal reports. **Nothing leaves the machine.** No upload, no server, no account, no network call - which is a claim a Tauri binary can actually make, and a browser-based "free PDF merger" cannot.

| | |
|---|---|
| Shell | Tauri v2 (Rust) |
| UI | Angular 20, standalone components, lazy routes |
| PDF engine | `lopdf` 0.44 - direct object-graph manipulation |
| Also parses | DOCX, via `zip` + `quick-xml` |
| Binary size | Single native executable per platform, no runtime |
| Core | ~750 lines of Rust, ~250 lines of TypeScript |

---

## Three tools

### Merge

Pick N PDFs, drag to reorder, choose an output path, merge. Missing files and zero-page documents are reported as **warnings and skipped** rather than aborting the batch - if you queued twelve files and one is broken, you want the other eleven merged and a note about the twelfth.

### Split

One PDF into many, by three different methods:

```rust
enum SplitMethod {
    Every   { pages: u32 },              // fixed-size chunks
    Ranges  { ranges: Vec<PageRange> },  // "1-5, 6-12, 13-"
    AtPages { pages: Vec<u32> },         // break before these pages
}
```

Ranges are clamped and validated against the real page count instead of trusting the input, and `AtPages` sorts, dedupes and inserts the implicit start and end breaks - so a user who types `4, 4, 2` gets three sensible segments rather than an error.

### Claim Form Conflict Detector

The tool the app was really written for. Point it at a folder of claim forms - **PDF or DOCX** - and it extracts every `(date, course code, time range)` entry across all of them and reports overlapping bookings: the same person claiming two sessions at once, across files nobody would cross-check by hand.

Output is a summary of files checked, entries found and conflicts, plus a table of every clash and the file each side came from. Files that fail to parse are collected as per-file warnings, so one malformed document does not blank the report.

---

## The interesting problems

### PDF text extraction produces fragments, not lines

`lopdf`'s text extraction returns whatever the content stream emits, which for a table-heavy claim form is a stream of one-to-four-character fragments split mid-word by kerning operators. A regex over those lines matches nothing.

The fix is a pre-pass that treats any line of ≤4 characters as a fragment and glues consecutive fragments back into a single line before parsing runs. Cheap, and it turns unparseable output into parseable output.

### Two parsing strategies, tried in order

Even after reassembly, the same logical row appears in two shapes depending on how the document was produced:

```
inline:      21/04/26  COMP3613  9:00am – 11:00am
multi-line:  21/04/26
             COMP3613
             9:00am
             –
             11:00am
```

The parser runs the inline regex first, and only falls back to a small state machine over lines - handling `9:00am–`, `9:00am` `–` `11:00am`, and the joined form as separate cases - when inline finds nothing. Preferring the strict pattern keeps the fuzzy path from producing false entries on documents the strict one already handled.

### Overlap detection

Times are normalized to minutes-past-midnight with the 12-hour edge cases handled explicitly (`12:xxpm` stays at noon, `12:xxam` maps to zero), then compared with the standard half-open interval test:

```rust
a_start < b_end && b_start < a_end
```

Conflicts are grouped rather than listed pairwise, so three overlapping entries produce one conflict with three participants instead of three near-duplicate rows.

### Merging PDFs means rebuilding the object graph

Merging is not concatenation. Each source document's objects are renumbered to avoid ID collisions, every object *except* `Catalog`, `Pages` and `Page` is copied across, then a fresh page tree is built - a new `Pages` node with all page references as `Kids`, each page's `Parent` pointer rewritten to it, and a new `Catalog` set as the trailer `Root`. Splitting does the same in reverse, keeping only the wanted page objects.

### DOCX is a zip file

DOCX parsing needs no Word-specific library: open the archive, read `word/document.xml`, stream it with `quick-xml`, accumulate text inside `w:t` elements and emit a newline on every `w:p` close. That last detail matters - without paragraph breaks the whole document collapses into one line and the multi-line parser has nothing to work with.

---

## Architecture

```
src-tauri/src/
├── lib.rs              Tauri builder, command + plugin registration
├── error.rs            AppError -> Display -> serialized to the frontend
├── commands/           Thin Tauri command wrappers (merge, split, detect)
├── pdf/                merge.rs, split.rs - pure functions, no Tauri deps
└── detect/             parser.rs (PDF + DOCX -> entries), checker.rs (overlaps)

src/app/
├── pages/              merge, split, detect - lazy-loaded standalone components
├── services/           pdf.service.ts - typed invoke() wrapper
└── shared/types.ts     TypeScript mirrors of the Rust serde structs
```

The document logic in `pdf/` and `detect/` takes paths and returns values with **no Tauri dependency**, so it is testable as plain Rust and the command layer stays a thin adapter. One `AppError` enum covers file-not-found, PDF, I/O, parse and unsupported-type failures, serializing to a human-readable string that the Angular layer surfaces directly - no error-code mapping table to keep in sync.

Angular uses standalone components with `loadComponent` lazy routes and the modern `@if` / `@for` control-flow syntax; Tauri capabilities are scoped to `dialog:allow-open` and `dialog:allow-save` rather than granted wholesale.

---

## Build

```bash
npm install
npm run tauri dev     # Angular dev server + Rust shell, hot reload
npm run tauri build   # native bundles for Windows, macOS, Linux
```
