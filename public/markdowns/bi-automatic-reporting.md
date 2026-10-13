# Automated BI Reporting System

## Overview

You paste a company's URL and get back a researched business analysis (profile, market, competitors, SWOT, marketing strategy) as a PDF and a DOCX, sent to you by email. A single LLM call could produce something that *looks* like that report in thirty seconds, so half of this project is the tooling for checking whether the output is any good.

**Repository:** [https://github.com/firepenguindisopanda/bi-automatic-reporting](https://github.com/firepenguindisopanda/bi-automatic-reporting)

| | |
|---|---|
| Backend | ~6,200 lines of Python (FastAPI, 3.13+) |
| Frontend | ~1,800 lines of TypeScript (React 19, Vite) |
| Tests | 125 tests across 14 files |
| Pipelines | 2 (BI report, market research) |
| Deployment | Docker Compose on a Raspberry Pi behind nginx |

---

## Problems with v1

The v1 system ran from URL to email, but it was hard to trust or operate:

- A failing stage emitted **no event at all**, so the UI spun forever with no explanation.
- The job flipped to `complete` *before* email was attempted, so there was no way to see whether delivery, the stage users care most about, had worked.
- Stage events were `{type, agent}`, with no timestamp, duration, model or quality signal.
- Six agent classes each carried their system prompt twice (a sync and an async twin): 691 lines, roughly half of it verbatim duplication, with no retry and no output checking.
- A refresh mid-run lost the entire run's state, because it only existed in the browser.

I rebuilt it as v2 from a written specification that addresses each of these.

---

## Stage observability

### Two-level state model

Job status is coarse, and the stage rows hold the detail.

```
Job:    queued -> running -> completed
                          -> partial      (report produced, delivery failed)
                          -> failed       (no report)
                          -> interrupted  (process died mid-run; set at startup recovery)

Stage:  pending -> running -> succeeded
                           -> failed
                           -> skipped
```

`partial` is the most important addition. It covers a report that generated but failed to send: the user can still download it or resend it, and the status shows what happened.

`interrupted` is set by startup recovery, so a job whose container is killed mid-run shows `interrupted` after the restart and does not sit on `running` forever.

### Storage

In v1, every event did a read-modify-write on the `jobs.events` JSON blob, which was racy and O(n) per write. I replaced it with a `job_stages` table keyed `UNIQUE (job_id, stage)`, recording `duration_ms`, `model`, `prompt_version`, `attempts`, token counts, `completeness`, `confidence`, `warnings`, `error` and `error_kind`, indexed on `(stage, model)` so it can also answer "how long does this stage normally take?".

### One stage registry

Stages are defined once, in `app/pipeline/stages.py`, and served from `GET /api/pipelines/{kind}/stages`. The frontend used to keep its own copies in `AGENT_ORDER` and `STAGE_LABELS`, which could drift out of step with the backend without anyone noticing.

| slug | display | LLM |
|---|---|---|
| `scrape` | Scraper | no |
| `profile` | Business Profile | yes |
| `market` | Market Analysis | yes |
| `competitive` | Competitive Analysis | yes |
| `swot` | SWOT Analysis | yes |
| `marketing` | Marketing Analysis | yes |
| `report` | Report Writer | yes |
| `render` | Render (PDF + DOCX) | no |
| `deliver` | Email Delivery | no |

---

## Scoring the output, twice

Every stage gets two independent quality numbers.

**`completeness`: deterministic, 0-100, free.** Each stage declares a `StageContract`: required non-empty fields, minimum list lengths, and grounding checks.

| Stage | Contract highlights |
|---|---|
| `profile` | `company_name`, `industry`, `value_proposition` non-empty; 3+ offerings; company name must appear in the scraped text |
| `market` | 3+ trends, 2+ segments; `market_size` matches a range-ish pattern |
| `competitive` | 3-5 direct and 2-3 indirect competitors, each with a name and an offering, no duplicates |
| `swot` | 5+ items per quadrant (the prompt asks for it; nothing used to check) |
| `marketing` | 2-4 personas with 2+ pain points each; 5-8 FAQ entries |
| `report` | 5+ recommendations, 3+ risk factors, executive summary 400+ chars |

Universal checks run on every stage: placeholder leakage (`"<string>"`, `"..."`, `"N/A"`, echoed schema keys; a known failure mode of example-schema prompting), duplicate list entries, and truncation markers.

Contracts are scored and never block a run. A thin result still produces a report, with a low score and a warning.

**`confidence`: LLM critic, 0-100, optional.** A small model scores each stage on groundedness, specificity and actionability, returning `{score, verdict, issues}`. Below `CRITIC_RETRY_THRESHOLD` (default 60) the stage re-runs **once** with the critic's specific issues appended to the prompt. Both scores are kept, and the retry is recorded as an attempt.

---

## Agent runtime

I replaced the six near-identical agent classes with one `AgentSpec` dataclass and one runner. Each prompt is defined once, as a module constant in `app/analysis/prompts.py`, and tagged with a `prompt_version` that is recorded per stage, so an evaluation result can be traced to a specific prompt.

`AgentRunner.run(spec, ctx)` runs a **retry ladder** that handles each kind of failure differently:

1. **Attempt 1**: normal call.
2. **Attempt 2** (parse or validation failure) is a *repair turn*: it sends back the model's own raw output with the specific parse error and asks for corrected JSON only.
3. **Attempt 3**: retry with a reduced, depth-2 schema hint.
4. **Transport errors** (timeout, 5xx, connection reset) retry on exponential backoff with jitter, on a separate budget from parse retries.

When the ladder runs out, it raises `StageError(stage, error_kind, message, raw_excerpt)`, so the UI can show the stage and the reason it failed. v1 raised a bare `RuntimeError("... returned None")`.

---

## Progress transport

- **SSE** at `GET /api/jobs/{job_id}/events`, emitting a `stage` event on every transition and a `job` event on status change, with a comment heartbeat every 15s so idle connections survive proxy timeouts.
- **Polling** at `GET /api/bi/progress/{job_id}` serves the *same payload*, so a client that loses the stream can fall back to polling and still get the same detail.
- `GET /api/bi/status/{job_id}` returns the **full stage array**, including stages that have not started. After a refresh, one request rebuilds the timeline, timings and scores, and the timeline does not jump around as rows appear.

The ETA comes from a rolling median `duration_ms` per `(stage, model)` over the last 20 successful runs; remaining time is the sum of medians for unfinished stages. It stays hidden until there are at least 3 historical samples.

---

## Evals for prompt changes

`evals/` measures whether a prompt change helped, a question that otherwise gets settled by eyeballing a single run. Scraping is stubbed with saved HTML so the input never varies; everything after the fetch (the same agents, prompts, contracts and critic) runs for real.

```bash
uv run python -m evals.run --stages profile    # fast iteration
uv run python -m evals.run --check             # fail on regression
uv run python -m evals.run --update-baseline
```

There are seven fixtures, each chosen for a different failure mode:

| Case | Why it's in the set |
|---|---|
| stripe | Dense marketing site, broad product range |
| ghost | Open-source project with a commercial hosted tier |
| eleventy | Free tool, no revenue model: **must not invent pricing** |
| linear | Script-heavy site; the copy lives in the markup |
| basecamp | Very little text: behaviour when starved of input |
| flyio | Jargon-heavy developer infrastructure |
| govuk | **Not a business at all**: the hallucination canary |

Each case scores `completeness - 15 x failed assertions`, so a factual miss (wrong company, invented competitor, forbidden string) costs more than a slightly thin list. A manual CI workflow runs the same suite and publishes the table to the run summary.

---

## Safety and portability

**SSRF guard.** The scraper fetches user-supplied URLs from inside the deployment network, which is a standard SSRF risk. It refuses loopback, private, link-local, multicast, reserved and carrier-grade-NAT addresses (including the `100.64.0.0/10` range Tailscale uses) and **re-validates after every redirect**, capped at 5 hops.

**Rate limiting.** 10 submits per 60s per caller, identified via `X-Real-IP` / `X-Forwarded-For` when behind a trusted proxy, backed by Upstash.

**Email provider registry.** Email depended on a SendGrid trial, which ended on 2026-09-01. Five providers now sit behind one interface: `smtp` (default, with auth and TLS), `sendgrid`, `resend`, `console`, `file`. A misconfigured provider **raises at startup**. v1 fell back without warning to unauthenticated `localhost:25`, so mail disappeared and the only trace was one log line.

**Database.** PostgreSQL is the main database. SQLite still works for local development, and I fixed it so it no longer silently loses jobs on restart.

---

## Second pipeline: market research

Market research used to be one call asking a single model for PESTEL, Porter's Five Forces, TAM/SAM/SOM, a SWOT and six categories of resources in one response, with no progress reported while it ran. It now runs as three conditioned stages (`macro`, `sizing`, `resources`, then `render`), each recorded like a BI stage, so the page shows progress and each step is scored on its own.

---

## Design rules checked in CI

The frontend uses an editorial look (warm paper, ink text, serif headings, one rust accent) in place of the default indigo Tailwind look the v1 UI had.

Those rules are easy to break by habit, through a component-library snippet or a generated style, so `scripts/check-design-rules.sh` runs in CI: no CSS gradients, no gradients hidden in SVG assets, radii kept to 4-6px, design tokens instead of raw hex.

---

## Deployment

Docker Compose on a Raspberry Pi behind an existing nginx, sharing the box with Jenkins and a news service. The runbook covers the known problems: nginx needs `proxy_buffering off` or SSE silently buffers and the UI looks frozen, read timeouts must exceed the 2-3 minutes an LLM chain takes, the SQLite path has to live on the mounted volume, and `JOB_CONCURRENCY` stays at 1 on Pi-class hardware.

---

## Quality gates

```bash
pytest tests/ --cov=app -v
ruff check .
mypy app
./scripts/check-design-rules.sh
```
