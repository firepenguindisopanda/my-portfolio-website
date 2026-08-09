# UWI Handbook Parser

## Overview

Eight UWI faculty handbooks - 45 MB of PDF, laid out by eight different people to eight different conventions - turned into a normalized, queryable SQLite database of courses, degree programmes and the mapping between them.

Nobody publishes this as data. It exists only as prose inside PDFs, which means questions like *"which degrees require MATH1141?"* or *"what are the Level II Engineering electives?"* are answerable only by a human with a scroll wheel and patience. This makes them a SQL query.

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
- **pdfplumber** - page-level text and table extraction
- **pypdf** - document handling
- **pandas** + **openpyxl** - tabular intermediates and Excel export
- **SQLite** - normalized final store with foreign keys and indexes

---

## Why it is harder than "parse the PDF"

There is no schema. Each faculty's handbook is a differently-shaped document, and the parser has to survive all eight:

- **Course descriptions** appear as labelled blocks (`COURSE CODE:`, `LEVEL:`, `SEMESTER:`, `NUMBER OF CREDITS`, `PREREQUISITES:`, `SYLLABUS:`) in most faculties - and as numbered sections in others.
- **Degree programmes** hide behind three different heading conventions: numbered sections (`SECTION 6: COURSE DESCRIPTIONS`), Roman-numeral sections (`SECTION VII`), and freeform degree names with no section marker at all.
- **Humanities & Education and Law needed dedicated extractors.** The generic strategy produced garbage on them, so `extract_degrees_fhe` and `_extract_llb_degree` handle their layouts specifically rather than pretending one regex fits everything.
- **Most pages are not content.** Staff listings, plagiarism declaration forms, regulations, blank spacers and "Return to Table of Contents" pages all extract as text and all need to be discarded before they pollute the output.

---

## Pipeline

```
PDFs -> page classification -> faculty/department context
     -> course extraction  -> degree extraction -> dedup
     -> Excel (3 workbooks) -> SQLite (normalized, indexed)
```

**1. Page classification.** Every page is triaged before extraction. Staff pages are detected statistically rather than by keyword - if more than 30% of a page's lines match academic-rank markers (`PROFESSORS EMERITI`, `SENIOR LECTURERS`, `PART-TIME LECTURERS`, ...), it is a staff listing, not content. A keyword match alone would have thrown away real course pages that merely mention a lecturer.

**2. Context tracking.** Faculty is read from page headers with a filename fallback; department context is carried forward from `DEPARTMENT OF ...` headings, and course-code prefixes map to departments via a lookup built from subject headings (`ACCOUNTING: ACCT`) and `DEPARTMENT RESPONSIBLE` fields.

**3. Course extraction.** Labelled blocks and numbered-section formats are both handled, plus a table-attachment pass for handbooks that list courses as tables rather than prose.

**4. Degree extraction.** Multiple strategies run in order - section-numbered headings, freeform degree names, per-faculty extractors - with `_is_likely_degree` and `_normalize_degree_name` filtering out headings that merely look like programme names.

**5. Deduplication.** Courses are merged by code, **preferring the entry with the richer description**. The same course appears in several handbooks, often as a bare title in one and a full syllabus in another; taking the first match would silently lose the good version.

---

## The verification script is the point

Extraction accuracy claims are worthless without an audit, so `verify.py` (~1,000 lines) is roughly a quarter of the codebase. It re-reads the source PDF independently of the parser and compares:

- **Course codes found in the raw PDF vs. codes in the output** - the direct miss-rate.
- **Field-level completeness** - how many extracted courses are missing credits, level, semester or prerequisites.
- **Degree-listing courses vs. the course master** - codes referenced by a programme but never described anywhere.
- **Section boundaries** - independently located, so a shifted section heading shows up as a boundary mismatch rather than as quietly missing data.
- **Sample side-by-side comparisons** - raw block against parsed record, for eyeballing.

```bash
python verify.py ScienceTechUndergrad.pdf --output report.txt
```

Building the audit separately from the parser is the whole design: if it shared the extraction code it would agree with itself and prove nothing.

---

## Database

`build_db.py` turns the Excel intermediates into a normalized SQLite database with real constraints - `UNIQUE(course_code)`, `degree_courses.degree_id` as a foreign key with `ON DELETE CASCADE`, and eleven indexes covering the columns that get filtered on (code, faculty, department, source file, degree id).

`degree_courses.course_code` is stored as a text reference rather than a foreign key, deliberately: a programme routinely lists a course whose full description does not appear anywhere in that faculty's handbook, and a strict FK would force a choice between dropping real curriculum rows and inventing course records.

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
| `handbook_courses.xlsx` | Master course list - code, title, credits, level, semester, faculty, department, description, prerequisites |
| `handbook_degrees.xlsx` | Master degree list - name, type, total credits, faculty, department, major/minor flags |
| `handbook_degree_courses.xlsx` | Degree-to-course mapping |
| `handbook_stats.json` | Totals per faculty and department, degree and course counts, source PDFs |
| `handbooks.db` | Normalized SQLite database with constraints and indexes |

