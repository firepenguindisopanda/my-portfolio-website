# PDF Tools: Offline Desktop PDF Utility

## Overview

A desktop app for the paperwork that comes with part-time teaching: merging and splitting PDFs, editing them, cleaning their metadata, filling and signing a semester's forms, and checking claim forms for double-booked sessions. It is built with **Tauri v2**: a Rust core does the document work and an Angular 20 UI sits on top.

I made it a desktop app because the documents it handles are claim forms, HR forms and internal reports. **Nothing leaves the machine.** There is no upload, server, account or network call.

| | |
|---|---|
| Shell | Tauri v2 (Rust) |
| UI | Angular 20, standalone components, lazy routes |
| PDF engines | `lopdf` 0.44 for structure, Pdfium (via `pdfium-render`, a pinned bundled build) for drawing and rendering |
| Also parses | DOCX, via `zip` + `quick-xml` |
| Size | About 13,900 lines of Rust and 3,000 of TypeScript |
| Tests | 274 Rust tests |

---

## Seven tabs

| Tab | What it does |
|---|---|
| **Merge** | Combine PDFs in an order you set by dragging |
| **Split** | Every N pages, by ranges, or at chosen pages |
| **Editor** | Change or delete existing text; add text, images and shapes; move, resize, replace or delete pictures already in the file; rotate, reorder, delete and insert pages; highlight, underline, strike out, comment and draw. Saves a copy |
| **Metadata** | View, change or strip a PDF's properties, keeping the XMP copy in step |
| **Pack** | Fill and sign a whole semester's forms from saved details |
| **Profile** | The details and signature Pack uses |
| **Detect** | Check a folder of claim forms for overlapping sessions |

### Merge and Split

Missing files and zero-page documents are reported as **warnings and skipped** instead of aborting the batch: queue twelve files with one broken and you get the other eleven merged and a note about the twelfth. Split takes one of three methods:

```rust
enum SplitMethod {
    Every   { pages: u32 },              // fixed-size chunks
    Ranges  { ranges: Vec<PageRange> },  // "1-5, 6-12, 13-"
    AtPages { pages: Vec<u32> },         // break before these pages
}
```

Ranges are clamped to the document's page count. `AtPages` sorts and dedupes the input and adds the implicit start and end breaks, so typing `4, 4, 2` gives three sensible segments and no error.

You cannot merge PDFs by concatenating them. Each source document's objects are renumbered to avoid ID collisions, and every object except `Catalog`, `Pages` and `Page` is copied across. Then a fresh page tree is built: a new `Pages` node with all page references as `Kids`, each page's `Parent` pointer rewritten to it, and a new `Catalog` set as the trailer `Root`. Splitting does the same in reverse, keeping only the wanted pages.

### Detect

This is the tool I first wrote the app for. Point it at a folder of claim forms (**PDF or DOCX**) and it extracts every `(date, course code, time range)` entry across all of them and reports overlapping bookings, in files nobody would cross-check by hand. Files that fail to parse become per-file warnings, so one malformed document does not blank the report.

### Pack

Pack reads a folder of forms, says what it recognised and what it would write, and only on a second click fills each one from the Profile, stamps the signature and date, and writes `_FILLED` and `_SIGNED` copies **beside the originals, which are never modified**. Forms it does not recognise are listed and skipped. Which forms it knows is data: one JSON template per form maps each field to where its value comes from and where the signature goes, so a changed form is a JSON edit. Profile details are saved in plain text in the app's data folder; encrypted storage is not built yet, and the README says so.

---

## The Editor

### Two libraries, each doing what it does well

| Stage | Library | Handles |
|---|---|---|
| Content | Pdfium | What is drawn on a page: text, images, shapes |
| Structure | lopdf | Everything around the pages: page order, rotation, insertion, annotations, metadata, encryption, the save |

The pipeline is original bytes, then the content stage in memory, then the structure stage, then the Metadata tab's safe writer. Pdfium writes non-conforming annotations and cannot reorder pages through the Rust bindings; lopdf cannot lay out text in an embedded font. Splitting the work by "on the page" and "around the page" avoids both.

### Edits are a list of commands

The editor never changes the PDF while you work. Each action becomes a small operation (`ReplaceText`, `AddImage`, `Highlight`, `MovePage` and so on) in an undoable list, and **Save a copy** replays the list against the untouched original. That gives undo and redo for free, makes every edit testable as "this file plus these commands gives this result", and shows the pending changes so any one can be removed. Content commands name pages by where they came from ("original page 3"), and page moves are applied last, so editing a page and then moving it cannot point an edit at the wrong page.

The preview runs the same pipeline in memory, so it cannot show something the saved file will not contain.

### Changing existing text without damaging the page

To change an existing object, Pdfium rewrites the page's whole content stream from its own model, and that rewrite turns CMYK colours and patterns black and drops shadings. On a form with a CMYK background, replacing one picture turned the whole page black.

Pictures are now changed by lopdf, which reads the content stream but never writes it. Each edit repoints the picture's resource name at a small wrapper form: the same image data through a new matrix (move, resize), a new picture (replace, keeping the stacking order) or an empty form (delete). Resources are copied onto the page first, so pages that share them are unaffected.

Text has its own stage that edits the content stream directly. A lexer reads the stream keeping each operator's byte range, and only the bytes of the operators that drew the edited line are replaced. New text keeps the line's own font and colour only when every character is already drawn in that font on the page; otherwise the line is drawn in a standard font, and Arial is embedded only when even that lacks a character. Every edit is then proven: the other text objects must be unchanged in text and position, the edited line must read the new text, and the page must render the same outside the edited lines. If any check fails, the page is restored and handed to Pdfium's rewrite, which is itself guarded by a before-and-after render comparison and refuses the edit with a message rather than save a damaged page.

One fix came from my own file: editing a bulleted item was refused because Pdfium infers spaces from neighbouring text, so the bullet read with a trailing space beside its item and without one once the item was removed, which looked like a change to the bullet. Untouched text is now compared ignoring whitespace (positions still exactly), with a regression test.

### Annotations carry their own appearance

Highlights, underlines, comments and ink are written as standalone annotation objects with their own appearance streams, so every viewer and printer draws them the same way. The author field stays blank unless you type a name; it is never taken from the Profile.

### Removed Pdfium objects are never freed

Freeing a removed Pdfium object aborts the process. Every removal goes through one function that deliberately never frees it, with a test that removes many objects and saves.

---

## Metadata

Many PDFs describe themselves twice, in the info dictionary and in an XMP packet. Each edit updates both and keeps the rest of the packet, so PDF/A claims and unknown properties survive, and the tab shows where the two already disagree. Saves go to `<name>_EDITED.pdf` by default: written to a temporary file, read back and checked, then renamed, so a failure never leaves a half-written file. Encrypted files keep their encryption and password, signed or certified files need explicit consent, and every save prunes unreferenced objects so old values do not linger in the file. The Editor saves through this same writer.

---

## Problems I had to solve in Detect

### PDF text extraction returns fragments

`lopdf`'s text extraction returns whatever the content stream emits. For a table-heavy claim form that is a stream of one-to-four-character fragments, split mid-word by kerning operators, and a regex over those lines matches nothing. A pre-pass treats any line of 4 characters or fewer as a fragment and joins consecutive fragments back into one line before parsing.

### Two parsing strategies, tried in order

The same row appears in two shapes depending on how the document was produced:

```
inline:      21/04/26  COMP3613  9:00am – 11:00am
multi-line:  21/04/26
             COMP3613
             9:00am
             –
             11:00am
```

The parser runs the inline regex first and falls back to a small state machine over lines only when that finds nothing, so the looser path cannot add false entries to documents the strict one already handled.

### Overlap detection

Times become minutes past midnight, with `12:xxpm` kept at noon and `12:xxam` mapped to zero, then compared with the half-open interval test `a_start < b_end && b_start < a_end`. Three overlapping entries produce one conflict with three participants instead of three pairwise rows.

### DOCX is a zip file

DOCX parsing needs no Word library. The code opens the archive, streams `word/document.xml` with `quick-xml`, collects text inside `w:t` elements and emits a newline on every `w:p` close. Without those paragraph breaks the multi-line parser has nothing to work with.

---

## Architecture

```
src-tauri/src/
├── lib.rs, engine.rs   Tauri builder; the one shared, locked Pdfium binding
├── commands/           Thin Tauri wrappers (merge, split, editor, metadata, pack, detect)
├── pdf/                merge, split, forms, stamp
│   ├── edit/           lexer, text, images, content, fonts, pages, annotate
│   └── metadata/       info dictionary, XMP, dates, the safe writer
├── pack/               profile, form templates, the run
└── detect/             parser (PDF + DOCX to entries), checker (overlaps)

src/app/
├── pages/, editor/     one lazy-loaded standalone component per tab
├── services/           pdf.service.ts, a typed invoke() wrapper
└── shared/             TypeScript mirrors of the Rust types, the metadata form, the save flow
```

The document logic takes paths and bytes and returns values with **no Tauri dependency**, so it is tested as plain Rust and the command layer stays a thin adapter. Pdfium sets up process-wide state and fails if two documents load at once, so the app holds one shared instance behind a lock for the whole of each job.

---

## Build

```bash
npm install
npm run tauri dev     # Angular dev server + Rust shell, hot reload
npm run tauri build   # native installer
```
