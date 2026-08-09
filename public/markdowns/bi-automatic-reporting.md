# Automated BI Reporting System

## Overview

Paste a company's URL, get back a researched business analysis - profile, market, competitors, SWOT, marketing strategy - rendered as a PDF and a DOCX and emailed to you. A single LLM call would produce something that *looks* like that report in thirty seconds. The interesting half of this project is everything built to know whether the output is actually any good.

**Repository:** [https://github.com/firepenguindisopanda/bi-automatic-reporting](https://github.com/firepenguindisopanda/bi-automatic-reporting)

| | |
|---|---|
| Backend | ~6,200 lines of Python (FastAPI, 3.13+) |
| Frontend | ~1,800 lines of TypeScript (React 19, Vite) |
| Tests | 125 tests across 14 files |
| Pipelines | 2 (BI report, market research) |
| Deployment | Docker Compose on a Raspberry Pi behind nginx |

---

## The problem with LLM pipelines

The v1 system worked end to end and was still hard to trust or operate:

- A failing stage emitted **no event at all**, so the UI span forever with no explanation.
- The job flipped to `complete` *before* email was attempted, which made delivery structurally unobservable - the one stage users care most about.
- Stage events were `{type, agent}`. No timestamp, no duration, no model, no quality signal.
- Six agent classes each carried their system prompt twice (a sync and an async twin) - 691 lines, roughly half verbatim duplication - with no retry and no output checking.
- A refresh mid-run lost the entire run's state, because it only existed in the browser.

The v2 rebuild is a specification-driven answer to each of those.

---

## Stage observability

### Two-level state model

Job status is coarse; stage rows carry the detail.

```
Job:    queued -> running -> completed
                          -> partial      (report produced, delivery failed)
                          -> failed       (no report)
                          -> interrupted  (process died mid-run; set at startup recovery)

Stage:  pending -> running -> succeeded
                           -> failed
                           -> skipped
```

`partial` is the load-bearing addition. A report that generated fine but failed to send is not a failure and not a success - it is downloadable, resendable, and honest about what happened.

`interrupted` is set by startup recovery, so killing the container mid-job leaves a job that reads `interrupted` rather than one stuck on `running` forever.

### Storage

The v1 `jobs.events` JSON blob was read-modify-write on every event - racy, and O(n) per write. It was replaced with a proper `job_stages` table keyed `UNIQUE (job_id, stage)`, recording `duration_ms`, `model`, `prompt_version`, `attempts`, token counts, `completeness`, `confidence`, `warnings`, `error` and `error_kind`, indexed on `(stage, model)` so it can also answer "how long does this stage normally take?".

### One stage registry

Stages are defined once, in `app/pipeline/stages.py`, and served from `GET /api/pipelines/{kind}/stages`. The frontend previously kept its own `AGENT_ORDER` and `STAGE_LABELS` copies, which is exactly the sort of duplication that drifts silently.

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

**`completeness` - deterministic, 0-100, free.** Each stage declares a `StageContract`: required non-empty fields, minimum list lengths, and grounding checks.

| Stage | Contract highlights |
|---|---|
| `profile` | `company_name`, `industry`, `value_proposition` non-empty; 3+ offerings; company name must appear in the scraped text |
| `market` | 3+ trends, 2+ segments; `market_size` matches a range-ish pattern |
| `competitive` | 3-5 direct and 2-3 indirect competitors, each with a name and an offering, no duplicates |
| `swot` | 5+ items per quadrant (the prompt asks for it; nothing used to check) |
| `marketing` | 2-4 personas with 2+ pain points each; 5-8 FAQ entries |
| `report` | 5+ recommendations, 3+ risk factors, executive summary 400+ chars |

Universal checks run on every stage: placeholder leakage (`"<string>"`, `"..."`, `"N/A"`, echoed schema keys - a known failure mode of example-schema prompting), duplicate list entries, and truncation markers.

Contracts are **scored, not enforced**. A thin result still produces a report; it just scores low and warns.

**`confidence` - LLM critic, 0-100, optional.** A small model scores each stage on groundedness, specificity and actionability, returning `{score, verdict, issues}`. Below `CRITIC_RETRY_THRESHOLD` (default 60) the stage re-runs **once** with the critic's specific issues appended to the prompt. Both scores are kept, and the retry is recorded as an attempt.

---

## Agent runtime

Six near-identical agent classes became one `AgentSpec` dataclass plus one runner. Prompts live once, as module constants in `app/analysis/prompts.py`, each tagged with a `prompt_version` recorded per stage - which is what makes evaluation results attributable to a specific prompt.

`AgentRunner.run(spec, ctx)` executes a **retry ladder** that distinguishes failure modes rather than blindly retrying:

1. **Attempt 1** - normal call.
2. **Attempt 2** (parse or validation failure) - a *repair turn*: feed back the model's own raw output plus the specific parse error, ask for corrected JSON only.
3. **Attempt 3** - retry with a reduced, depth-2 schema hint.
4. **Transport errors** (timeout, 5xx, connection reset) retry on exponential backoff with jitter, on a separate budget from parse retries.

Exhausting the ladder raises `StageError(stage, error_kind, message, raw_excerpt)`, so the UI names the stage and the actual reason instead of v1's bare `RuntimeError("... returned None")`.

---

## Progress transport

- **SSE** at `GET /api/jobs/{job_id}/events`, emitting a `stage` event on every transition and a `job` event on status change, with a comment heartbeat every 15s so idle connections survive proxy timeouts.
- **Polling** at `GET /api/bi/progress/{job_id}` serves the *same payload*, so a client that loses the stream degrades without losing detail.
- `GET /api/bi/status/{job_id}` returns the **full stage array**, including stages that have not started. A refresh reconstructs the exact timeline, timings and scores from one request, and the timeline does not jump around as rows appear.

**ETA** comes from a rolling median `duration_ms` per `(stage, model)` over the last 20 successful runs; remaining time is the sum of medians for unfinished stages. It stays hidden until at least 3 historical samples exist rather than guessing from one.

---

## Evals: did that prompt change actually help?

`evals/` answers the question that otherwise gets settled by eyeballing a single run. Scraping is stubbed with saved HTML so the input never varies; everything after the fetch - same agents, prompts, contracts, critic - is real.

```bash
uv run python -m evals.run --stages profile    # fast iteration
uv run python -m evals.run --check             # fail on regression
uv run python -m evals.run --update-baseline
```

Seven fixtures, each chosen for a different failure mode:

| Case | Why it's in the set |
|---|---|
| stripe | Dense marketing site, broad product range |
| ghost | Open-source project with a commercial hosted tier |
| eleventy | Free tool, no revenue model - **must not invent pricing** |
| linear | Script-heavy site; the copy lives in the markup |
| basecamp | Very little text - behaviour when starved of input |
| flyio | Jargon-heavy developer infrastructure |
| govuk | **Not a business at all** - the hallucination canary |

Scoring is `completeness - 15 x failed assertions`. A factual miss (wrong company, invented competitor, forbidden string) should outweigh a slightly thin list, so it does. A manual CI workflow runs the same suite and publishes the table to the run summary.

---

## Safety and portability

**SSRF guard.** The scraper fetches user-supplied URLs from inside the deployment network, which is a textbook SSRF surface. It refuses loopback, private, link-local, multicast, reserved and carrier-grade-NAT addresses - including the `100.64.0.0/10` range Tailscale uses - and **re-validates after every redirect**, capped at 5 hops.

**Rate limiting.** 10 submits per 60s per caller, identified via `X-Real-IP` / `X-Forwarded-For` when behind a trusted proxy, backed by Upstash.

**Email provider registry.** SendGrid was load-bearing on a trial that expires 2026-09-01. Five providers now sit behind one interface - `smtp` (default, with auth and TLS), `sendgrid`, `resend`, `console`, `file` - and a misconfigured provider **raises at startup**. The v1 behaviour was to silently fall back to unauthenticated `localhost:25`, so mail vanished with one log line nobody read.

**Database.** PostgreSQL is primary; the SQLite path stays working for local development and was fixed so it no longer silently loses jobs on restart.

---

## Second pipeline: market research

Market research used to be one call asking a single model for PESTEL, Porter's Five Forces, TAM/SAM/SOM, a SWOT and six categories of resources in one response - reporting no progress at all while it worked. It now runs as three conditioned stages (`macro`, `sizing`, `resources`, then `render`), recorded like any BI stage, so the page shows real progress and each step is scored independently.

---

## Design as a checked constraint

The frontend follows a deliberate editorial direction - warm paper, ink text, serif headings, one rust accent - against the indigo-Tailwind-default look the v1 UI had.

Those rules are easy to reintroduce by habit, via a component-library snippet or a generated style, so `scripts/check-design-rules.sh` runs in CI: no CSS gradients, no gradients hidden in SVG assets, radii kept to 4-6px, design tokens instead of raw hex.

---

## Deployment

Docker Compose on a Raspberry Pi behind an existing nginx, sharing the box with Jenkins and a news service. The runbook covers the things that bite: nginx needs `proxy_buffering off` or SSE silently buffers and the UI looks frozen, read timeouts must exceed the 2-3 minutes an LLM chain takes, the SQLite path has to live on the mounted volume, and `JOB_CONCURRENCY` stays at 1 on Pi-class hardware.

---

## Quality gates

```bash
pytest tests/ --cov=app -v
ruff check .
mypy app
./scripts/check-design-rules.sh
```
