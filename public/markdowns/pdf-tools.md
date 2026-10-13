# PDF Tools: Offline Desktop PDF Utility

## Overview

A cross-platform desktop app for merging, splitting and auditing PDFs, built with **Tauri v2**: a Rust core does the document work and an Angular 20 UI sits on top.

I made it a desktop app because the documents it handles are exam claim forms, invoices and internal reports. **Nothing leaves the machine.** There is no upload, server, account or network call. A Tauri binary can make that claim; a browser-based "free PDF merger" cannot.

| | |
|---|---|
| Shell | Tauri v2 (Rust) |
| UI | Angular 20, standalone components, lazy routes |
| PDF engine | `lopdf` 0.44 (direct object-graph manipulation) |
| Also parses | DOCX, via `zip` + `quick-xml` |
| Binary size | Single native executable per platform, no runtime |
| Core | ~750 lines of Rust, ~250 lines of TypeScript |

---

## Three tools

### Merge

Pick N PDFs, drag to reorder, choose an output path, merge. Missing files and zero-page documents are reported as **warnings and skipped** instead of aborting the batch. If you queued twelve files and one is broken, you get the other eleven merged and a note about the twelfth.

### Split

One PDF into many, by three different methods:

```rust
enum SplitMethod {
    Every   { pages: u32 },              // fixed-size chunks
    Ranges  { ranges: Vec<PageRange> },  // "1-5, 6-12, 13-"
    AtPages { pages: Vec<u32> },         // break before these pages
}
```

Ranges are clamped and validated against the document's page count. `AtPages` sorts and dedupes the input and adds the implicit start and end breaks, so a user who types `4, 4, 2` gets three sensible segments and no error.

### Claim Form Conflict Detector

This is the tool I wrote the app for. Point it at a folder of claim forms (**PDF or DOCX**) and it extracts every `(date, course code, time range)` entry across all of them and reports overlapping bookings: the same person claiming two sessions at once, in files nobody would cross-check by hand.

The output is a summary of files checked, entries found and conflicts, plus a table of every clash and the file each side came from. Files that fail to parse are collected as per-file warnings, so one malformed document does not blank the report.

---

## Problems I had to solve

### PDF text extraction returns fragments

`lopdf`'s text extraction returns whatever the content stream emits. For a table-heavy claim form that is a stream of one-to-four-character fragments, split mid-word by kerning operators, and a regex over those lines matches nothing.

I added a pre-pass that treats any line of 4 characters or fewer as a fragment and joins consecutive fragments back into a single line before parsing runs. It is cheap, and it made the output parseable.

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

The parser runs the inline regex first. Only when that finds nothing does it fall back to a small state machine over lines, which handles `9:00am–`, `9:00am` `–` `11:00am`, and the joined form as separate cases. Trying the strict pattern first stops the looser path from producing false entries on documents the strict one already handled.

### Overlap detection

Times are converted to minutes past midnight, with the 12-hour edge cases handled explicitly (`12:xxpm` stays at noon, `12:xxam` maps to zero), then compared with the standard half-open interval test:

```rust
a_start < b_end && b_start < a_end
```

Conflicts are grouped, so three overlapping entries produce one conflict with three participants instead of three near-duplicate pairwise rows.

### Merging PDFs means rebuilding the object graph

You cannot merge PDFs by concatenating them. Each source document's objects are renumbered to avoid ID collisions, and every object *except* `Catalog`, `Pages` and `Page` is copied across. Then a fresh page tree is built: a new `Pages` node with all page references as `Kids`, each page's `Parent` pointer rewritten to it, and a new `Catalog` set as the trailer `Root`. Splitting does the same in reverse, keeping only the wanted page objects.

### DOCX is a zip file

DOCX parsing needs no Word-specific library. The code opens the archive, reads `word/document.xml`, streams it with `quick-xml`, collects text inside `w:t` elements and emits a newline on every `w:p` close. The newline matters: without paragraph breaks the whole document collapses into one line and the multi-line parser has nothing to work with.

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

The document logic in `pdf/` and `detect/` takes paths and returns values with **no Tauri dependency**, so I can test it as plain Rust and the command layer stays a thin adapter. One `AppError` enum covers file-not-found, PDF, I/O, parse and unsupported-type failures. It serializes to a readable string that the Angular layer shows directly, so there is no error-code mapping table to keep in sync.

Angular uses standalone components with `loadComponent` lazy routes and the `@if` / `@for` control-flow syntax. Tauri capabilities are limited to `dialog:allow-open` and `dialog:allow-save`.

---

## Build

```bash
npm install
npm run tauri dev     # Angular dev server + Rust shell, hot reload
npm run tauri build   # native bundles for Windows, macOS, Linux
```
