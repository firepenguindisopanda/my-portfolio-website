# python_ocr: Document Extraction with a Diagnostics Surface

## Overview

Point a camera at a till receipt, a handwritten grocery list, or a scanned multiple-choice quiz, and get structured data back. That much is a solved-looking problem - Tesseract is one `pip install` away. The part that is not solved is knowing whether the output is right, and this project is built around that question rather than around the extraction itself.

Three domain modules sit on one shared OCR core, and the whole thing ships as a single container: FastAPI backend, React and Vite frontend, Tesseract 5 through pytesseract, OpenCV for preprocessing and mark reading, pypdfium2 for PDFs.

| | |
|---|---|
| Backend | FastAPI, Python 3.12 |
| Frontend | React 19 + Vite + TypeScript, one container with the API |
| Recognition | Tesseract 5 via pytesseract (`image_to_data`, never `image_to_string`) |
| Vision | OpenCV for preprocessing, registration and mark density |
| Tests | 101 tests, ~11 seconds |
| Deployment | Hugging Face Spaces (Docker SDK), port 7860 |

---

## The claim the project is built to defend

**Optical character recognition and optical mark recognition are different problems, and confusing them is the most common way an answer-sheet reader gets built wrong.**

Tesseract does not read shaded bubbles. Point it at one and you get nothing back, or a stray `@` or `O`. Deciding which circle a student filled in is a question about pixel density, which is OpenCV's job, not a language model's. Tesseract still has work to do on that page, reading the question text and the printed labels. It just has no part in reading the marks.

That distinction is why the answer-sheet module exists as its own module rather than as another parser hanging off the text pipeline.

---

## Architecture: a modular monolith with one rule

```
backend/app/
  core/              pixels, words, geometry. No domain concepts.
    preprocess.py    named, composable OpenCV steps and presets
    engine.py        pytesseract to OcrDocument, plus the page preview
    documents.py     PDF and image loading, one upload to many pages
    models.py        BBox, Word, Line, OcrDocument, PagePreview
    http.py          shared upload validation and OCR query params
    router.py        /api/ocr diagnostics
  modules/
    receipt/         line items, prices, totals, arithmetic reconciliation
    grocery/         item names, quantities, strikethrough, columns
    omr/             shaded bubbles, registration, scoring, CSV export
  api.py             the only file that knows every module exists
```

One rule makes this a modular monolith rather than a folder convention: **modules may import from `core`, never from each other.** The receipt and grocery modules have no idea the other exists.

### Why receipts and grocery lists are separate modules

The pipeline is identical for both: decode, preprocess, recognise, get words with boxes and scores. That half is genuinely shared, so it lives in `core` and is written once.

What differs is interpretation. A receipt is a two-column structure where the right column is money and the bottom rows are keyword-addressed totals, and it can be verified with arithmetic. A grocery list has no prices at all, but it has crossed-out entries and multi-column layouts, which a receipt never has. Their output schemas share almost no fields.

So the split follows the domain logic, not the plumbing. The evidence that the boundary is in the right place: **adding the answer-sheet module was one new folder plus one line in `api.py`.** The receipt and grocery modules did not change at all.

---

## Preprocessing is most of the accuracy

`core/preprocess.py` keeps every step as a separate named function so they can be composed and compared. The presets are starting points, not answers.

| Preset | For | Notable choice |
|---|---|---|
| `raw` | baseline | grayscale only, the control group |
| `printed` | till receipts, documents | Otsu binarisation |
| `handwriting` | ink on paper | no hard threshold |
| `handwriting_binarised` | neat block capitals | adaptive threshold, large block |

**`remove_shadow` is the step people miss.** It dilates and median-blurs the image to estimate background illumination, then divides the original by that estimate, flattening the lighting gradient across a photographed page. On real-world images it is usually worth more than any other single step.

**`handwriting` deliberately omits thresholding.** Pen strokes are thin and low-contrast, and binarising tends to break each stroke into disconnected fragments Tesseract cannot resolve. The sweep endpoint exists so that claim can be checked rather than believed.

### Segmentation mode matters more than expected

Page segmentation mode tells Tesseract what layout to assume, and getting it wrong routinely costs more accuracy than any amount of image cleanup. Mode 6 (uniform block) and 4 (single column) suit receipts; 11 (sparse text) suits scattered labels.

```bash
make sweep IMG=samples/printed_receipt.png
```

The sweep scores every preset against every segmentation mode, so preprocessing choices are measured rather than guessed.

---

## Never use `image_to_string`

`core/engine.py` uses `image_to_data`, which returns one row per word with a bounding box and a confidence score. That extra data is what makes real extraction possible:

- The receipt parser finds prices **by position**, the right-most token on a line, rather than by regex over a flat blob of text.
- The grocery parser clusters line positions to detect columns.
- The UI draws every word box over the page, tinted by confidence, so a suspect value can be traced back to the pixels it came from.

`image_to_string` throws all of that away, and with it any possibility of a diagnostics surface.

---

## Confidence is necessary but not sufficient

Tesseract's confidence score catches illegible text. It does not catch **plausible misreads**. It will happily return a clean, confident `8` where the paper said `3`.

So the receipt module reconciles arithmetic. If the line items do not sum to the printed subtotal, something was misread whatever the confidence score says. That check is the single most valuable validation in the project, because it is the only one that can catch a high-confidence error.

### Strikethrough detection

Tesseract has no concept of a word being crossed out. `modules/grocery/parser.py` looks at the pixels instead: a wide horizontal morphological opening over the middle band of each line box asks whether the surviving ink spans most of the width. That is what a pen stroke through a word looks like, and what a normal letter never produces.

---

## Reading answer sheets

### The two-step flow

Calibrate once against a blank form, then read every marked sheet from the positions that produced.

```bash
curl -X POST "http://127.0.0.1:8000/api/omr/calibrate?name=quiz" \
     -F "file=@samples/quiz_blank.png" > template.json

curl -X POST http://127.0.0.1:8000/api/omr/read.csv \
     -F "file=@samples/quiz_batch.pdf" \
     -F "template=@template.json" \
     -F "answer_key=Q1,A
Q2,A
Q3,A"
```

**Detection runs exactly once, on the blank page.** That ordering is the whole trick: on a marked sheet a filled bubble merges with its own printed outline, so bubble detection gets least reliable precisely when accuracy matters most.

### Registration marks

Four solid squares in the page corners let each scan be warped onto the template before a single bubble is sampled. The sample batch includes a page rotated by 1.4 degrees, and it reads identically to the square one, asserted in `test_skewed_page_reads_identically`.

Without registration, one degree of rotation moves the foot of a page by roughly fifteen pixels, which is enough to read a mark against the wrong row.

If a form has no corner marks, the module falls back to deskewing and cropping to the printed content, reports `registration: fallback`, and says so in the response. It works, but adding four squares to the form is the highest-value change available.

### Four outcomes, never three

A row is reported as `marked`, `blank`, `multiple` or `ambiguous`, and these are never collapsed into a single best guess. Grading has consequences, so a sheet that cannot be read confidently has to say so.

Confidence here is **not** a Tesseract score. It is the margin between the darkest bubble in a row and the next darkest, so a row whose top two bubbles read 0.62 and 0.58 is ambiguous even though it has a clear winner.

A confidently blank row is a legitimate skipped question and is not flagged. A faintly marked one reads as blank with lower certainty and *is* flagged, because that is the case where a student did answer and the scan nearly lost it.

### Tuning

Two knobs live on the template. `fill_threshold` (default 0.32) is the fraction of a bubble that must be dark before it counts as marked, the first thing to change if students use pencil rather than pen. `margin_threshold` (default 0.14) is how far ahead the darkest bubble must be before the row is trusted.

---

## Knowing what the tool cannot do

**Tesseract cannot read cursive handwriting.** Its models are trained on printed text. This is not a preprocessing problem and no parameter fixes it.

A real handwritten list is included in the samples so the failure is visible rather than theoretical. Best case across the full sweep:

```
preset                  psm3        psm4        psm6        psm11
raw                      0.0/0      29.6/5      27.4/65     24.7/51
printed                  7.0/2      16.4/5      32.7/57     32.9/34
handwriting             29.8/41     27.9/99     23.5/191    25.6/182
handwriting_binarised   22.3/100    25.9/154    25.4/2264   30.0/1242
```

About 33 percent confidence, and the text is noise. The printed receipt sample scores 93 percent through exactly the same code.

**How the app responds is the point.** The grocery module sets `likely_handwritten` and returns a warning instead of presenting garbage as data. An OCR system that fails loudly is far more useful than one that fails silently.

Because the recogniser sits behind `core/engine.py`, swapping it for TrOCR or a cloud handwriting API touches that one file and nothing else.

Other limits, all visible in the running app:

- **Tables.** There is no table model. Columns are reconstructed from geometry, as the grocery module does.
- **Character confusions.** `1` against `l` against `I`, and `0` against `O`. The printed sample reads "Tomatoes 1kg" as "Tomatoes lkg" at 92 percent confidence.
- **Low resolution.** Below roughly 200 DPI equivalent accuracy collapses, which is what the `upscale` step exists for.

---

## API

| Endpoint | Purpose |
|---|---|
| `POST /api/receipt/parse` | Merchant, date, line items, totals, reconciliation |
| `POST /api/grocery/parse` | Items, quantities, strikethrough, columns |
| `POST /api/omr/calibrate` | Build a template from a blank form |
| `POST /api/omr/read` | Read marked sheets, optionally scored |
| `POST /api/omr/read.csv` | The same, one CSV row per sheet |
| `POST /api/ocr/raw` | Recognition with no domain parsing |
| `POST /api/ocr/sweep` | Score every preset against every segmentation mode |
| `POST /api/ocr/preview` | The page after each preprocessing step |
| `GET /api/ocr/capabilities` | Languages, presets, segmentation modes |
| `GET /api/health` | Tesseract version and language check |

Parsing endpoints accept `?lang=`, `?psm=`, `?preset=`, `?steps=` and `?min_word_confidence=`.

Both parse responses include a `page` object: the preprocessed image as a data URI plus every word box in **full-resolution coordinates**. The frontend positions boxes as percentages of the reported size, so the transported image can be downscaled without the overlay drifting.

---

## Testing approach

101 tests in about 11 seconds, in three layers:

- **Pure parser tests** construct an `OcrDocument` by hand. Fast, deterministic, and they fail only when the parsing logic is wrong.
- **Endpoint tests** run real Tesseract but assert only on *structure*: confidence above a floor, at least N items, dates parsed. They never assert exact OCR strings, because Tesseract output shifts between versions and string fixtures turn every upgrade into a rewrite.
- **Property tests** assert the claims the project makes, such as `test_preprocessing_improves_a_bad_photo` and `test_shadow_removal_flattens_the_gradient`.

The OMR tests are deliberately stricter than the OCR ones. Reading a bubble is deterministic given the same pixels, so they assert exact answers rather than only structure.

### Four tests that came from real bugs

| Test | The bug |
|---|---|
| `test_time_is_not_a_price` | The `14:32` in a receipt header parsed as a $32.00 purchase |
| `test_subtotal_does_not_land_in_total` | "subtotal" contains "total", so the order of keyword checks is load-bearing |
| `test_page_preview_keeps_full_resolution_coordinates` | Reporting the downscaled size put every overlay box in the wrong place |
| `test_anchors_are_not_read_as_bubbles` | A solid square scores 0.785 circularity, exactly the same as a circle, so the four corner registration marks were being calibrated as answer options |

---

## Deployment

Hugging Face Spaces fits this project because the Docker SDK allows `apt install` of the Tesseract binary, which hosts that accept only a `requirements.txt` cannot do. Spaces runs containers as uid 1000 without root, so the Dockerfile creates a `user` and installs Python packages with `pip install --user`.

| Host | Works | Notes |
|---|---|---|
| HF Spaces (Docker) | yes | free tier, 2 vCPU, sleeps when idle |
| Fly.io, Render, Railway | yes | same Dockerfile, change 7860 to 8080 |
| AWS Lambda (container) | with caveats | cold starts carry ~100 MB of tessdata |
| Vercel, Netlify functions | no | no way to install a system binary |

---

## Where it goes next

1. `--user-words` and `--user-patterns` for a product vocabulary. Tesseract accepts a wordlist and it measurably helps on domain text.
2. Emit a searchable PDF via `image_to_pdf_or_hocr`, carrying a real text layer rather than a picture of one.
3. Read the question text beside each answer row and attach it to the result, so an exported CSV is readable without the original form.
4. Browser-editable templates, dragging a bubble into place, for forms where calibration gets a row wrong.
5. Swap the recogniser for the handwriting case and measure how much of `core` survives. It should be only `engine.py`.
