# UWI Handbook Parser

## Overview

I turned eight UWI faculty handbooks (45 MB of PDF, each laid out by a different person to a different convention) into a normalized SQLite database of courses, degree programmes and the mapping between them.

The university does not publish this as data. It exists only as prose inside the PDFs, so a question like *"which degrees require MATH1141?"* or *"what are the Level II Engineering electives?"* meant someone scrolling through handbooks by hand. With the database it is a SQL query.

| Output | Rows |
|---|---|
| Courses | **2,195** |
| Degree programmes | **141** |
| Degree-to-course mappings | **3,867** |
| Source PDFs | 8 faculties, ~45 MB |
| Pipeline | ~4,200 lines of Python |

Distribution across faculties, from the parsed database:

| Faculty | Courses | Degrees |
|---|---|---|
| Humanities & Education | 484 | 12 |
| Medical Sciences | 377 | 12 |
| Science & Technology | 311 | 42 |
| Social Sciences | 302 | 33 |
| Food & Agriculture | 272 | 22 |
| Engineering | 262 | 16 |
| Sport | 118 | 2 |
| Law | 69 | 2 |

---

## Tech Stack

- **Python 3.13+** with **uv**
- **pdfplumber**: page-level text and table extraction
- **pypdf**: document handling
- **pandas** + **openpyxl**: tabular intermediates and Excel export
- **SQLite**: normalized final store with foreign keys and indexes

---

## What makes the handbooks hard to parse

There is no schema. Each faculty's handbook is shaped differently, and the parser has to handle all eight:

- **Course descriptions** appear as labelled blocks (`COURSE CODE:`, `LEVEL:`, `SEMESTER:`, `NUMBER OF CREDITS`, `PREREQUISITES:`, `SYLLABUS:`) in most faculties, and as numbered sections in others.
- **Degree programmes** sit under three different heading conventions: numbered sections (`SECTION 6: COURSE DESCRIPTIONS`), Roman-numeral sections (`SECTION VII`), and freeform degree names with no section marker at all.
- **Humanities & Education and Law needed their own extractors.** The generic strategy produced garbage on them, so I wrote `extract_degrees_fhe` and `_extract_llb_degree` for their layouts.
- **Most pages are not content.** Staff listings, plagiarism declaration forms, regulations, blank spacers and "Return to Table of Contents" pages all extract as text, and all have to be discarded before they get into the output.

---

## Pipeline

```
PDFs -> page classification -> faculty/department context
     -> course extraction  -> degree extraction -> dedup
     -> Excel (3 workbooks) -> SQLite (normalized, indexed)
```

**1. Page classification.** Every page is sorted before extraction. Staff pages are detected by proportion: if more than 30% of a page's lines match academic-rank markers (`PROFESSORS EMERITI`, `SENIOR LECTURERS`, `PART-TIME LECTURERS`, ...), the page is treated as a staff listing. A plain keyword match would have thrown away course pages that happen to mention a lecturer.

**2. Context tracking.** Faculty is read from page headers with a filename fallback. Department context is carried forward from `DEPARTMENT OF ...` headings, and course-code prefixes map to departments through a lookup built from subject headings (`ACCOUNTING: ACCT`) and `DEPARTMENT RESPONSIBLE` fields.

**3. Course extraction.** Both labelled blocks and numbered sections are handled, plus a table-attachment pass for handbooks that list courses in tables.

**4. Degree extraction.** Several strategies run in order (section-numbered headings, freeform degree names, per-faculty extractors), and `_is_likely_degree` and `_normalize_degree_name` filter out headings that only look like programme names.

**5. Deduplication.** Courses are merged by code, **keeping the entry with the fuller description**. The same course often appears in several handbooks, as a bare title in one and a full syllabus in another, and taking the first match would have lost the better version without any warning.

---

## The verification script

I wanted to be able to back up the extraction numbers, so `verify.py` (~1,000 lines) makes up roughly a quarter of the codebase. It re-reads the source PDF independently of the parser and compares:

- **Course codes found in the raw PDF vs. codes in the output**: the direct miss rate.
- **Field-level completeness**: how many extracted courses are missing credits, level, semester or prerequisites.
- **Degree-listing courses vs. the course master**: codes referenced by a programme but never described anywhere.
- **Section boundaries**: located independently, so a shifted section heading shows up as a boundary mismatch instead of as missing data nobody notices.
- **Sample side-by-side comparisons**: raw block against parsed record, for checking by eye.

```bash
python verify.py ScienceTechUndergrad.pdf --output report.txt
```

I kept the audit separate from the parser on purpose. If it shared the extraction code, it would repeat the parser's mistakes and agree with them.

---

## Database

`build_db.py` turns the Excel intermediates into a normalized SQLite database with real constraints: `UNIQUE(course_code)`, `degree_courses.degree_id` as a foreign key with `ON DELETE CASCADE`, and eleven indexes on the columns that get filtered on (code, faculty, department, source file, degree id).

I stored `degree_courses.course_code` as a plain text reference instead of a foreign key. Programmes regularly list a course whose full description is missing from that faculty's handbook, and a strict FK would have meant either dropping real curriculum rows or inventing course records.

```bash
python parse_handbooks.py     # PDFs -> Excel + stats JSON
python build_db.py            # Excel -> handbooks.db
python build_db.py --reparse  # both, in one pass
```

```sql
-- Which degrees require a given course?
SELECT d.degree_name, d.faculty
FROM degrees d
JOIN degree_courses dc ON dc.degree_id = d.id
WHERE dc.course_code = 'COMP2611';
```

---

## Outputs

| File | Contents |
|---|---|
| `handbook_courses.xlsx` | Master course list: code, title, credits, level, semester, faculty, department, description, prerequisites |
| `handbook_degrees.xlsx` | Master degree list: name, type, total credits, faculty, department, major/minor flags |
| `handbook_degree_courses.xlsx` | Degree-to-course mapping |
| `handbook_stats.json` | Totals per faculty and department, degree and course counts, source PDFs |
| `handbooks.db` | Normalized SQLite database with constraints and indexes |

