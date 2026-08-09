# UWI Scraper: Cache-Aware Web Crawler & Link Catalog

## Overview

A production-grade, cache-aware web crawler that systematically indexes web pages across the University of the West Indies' multi-campus domains. It extracts rich page metadata, classifies content by campus/category/type using rule-based URL pattern matching, and presents everything in a searchable, filterable web directory with inline editing and automated crawl scheduling.

**Live Demo:** https://uwi-scraper.fastapicloud.dev/
**Repository:** https://github.com/firepenguindisopanda

---

## Tech Stack

- **Python** 3.13+ - core language
- **FastAPI** - async web framework with Jinja2 templating
- **PostgreSQL** (Neon) - primary database with full-text search via tsvector
- **SQLModel** - SQLAlchemy-based ORM with Alembic migrations
- **Upstash Redis** - caching layer for pages, robots.txt, and admin sessions
- **HTMX** 2.x - server-driven interactivity for inline editing
- **Alpine.js** 3.x - client-side state management for batch editing
- **BeautifulSoup4 + lxml** - HTML parsing and metadata extraction
- **APScheduler** - async cron-based job scheduling
- **httpx** - async HTTP client for crawling

---

## Key Features

- **Polite, Cache-Aware Crawling** - respects robots.txt with Crawl-Delay, uses ETag/If-Modified-Since conditional requests, Upstash Redis caching, async semaphore throttling (3 concurrent requests per domain), retries on transient errors, and 2MB page size limits
- **Rich Metadata Extraction** - page titles, meta descriptions, body text, links with anchor text, and external resources (CSS, JS, images, fonts, documents)
- **Rule-Based URL Classification** - detects 7 campuses (Mona, St. Augustine, Cave Hill, Five Islands, Global, Open, UWI Global), 10 content categories (portal, admissions, academic, library, student services, administration, research, news/events, careers, about), and link types (PDF, document, portal, video)
- **Browsable Link Catalog** - paginated grid view (24 per page), faceted filtering by campus/category/domain/status, detail pages with related links
- **PostgreSQL Full-Text Search** - tsvector indexing with ts_rank relevance ordering
- **Inline & Batch Editing** - click-to-edit individual fields via HTMX, Alpine.js-powered modal for bulk category/campus/type updates
- **Admin Dashboard** - hidden login URL, bcrypt password auth, Redis-backed sessions (24h sliding TTL), rate-limited login, aggregate metrics
- **Scheduled Crawl Jobs** - APScheduler with hourly/daily/weekly/monthly cron schedules, persistent job records, background health-check runs

---

## Architecture

The system follows a modular FastAPI structure:

- `app/modules/scraper/` - Core crawler engine with polite crawling, HTML parsing, URL classification, and robots.txt checking
- `app/modules/pages/` - Page catalog routers and service layer
- `app/modules/search/` - PostgreSQL full-text search integration
- `app/modules/domains/` - SeedDomain registry
- `app/modules/jobs/` - Crawl job scheduling via APScheduler
- `app/modules/tags/` - Tagging system with many-to-many relationships
- `app/modules/resources/` - External page resource management
- `app/core/` - Authentication, caching, session management, structured logging

Data flows: Crawler to Parser to Classifier to Database to Catalog UI (server-rendered Jinja2 templates with HTMX interactivity).

---

## Setup & Development

- Python 3.13+ with `uv` package manager
- PostgreSQL for database, Upstash Redis for caching
- Environment variables for database URL, Redis credentials, and auth configuration
- Alembic migrations for schema management
- Run with `fastapi dev` for local development

---

## Deployment

Deployed via `fastapi-cloud-cli` on a cloud FastAPI hosting platform with Neon PostgreSQL and Upstash Redis.
