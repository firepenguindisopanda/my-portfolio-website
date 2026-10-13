# FastAPIMocker: A Mock API That Behaves Like a Real One

## Overview

Most mock APIs are read-only: you can `GET /posts`, and a `POST` returns success but changes nothing. A client written against one never sees a 401, a 429, a 503 or a pagination edge case until it meets the real backend.

FastAPIMocker persists writes, uses cookie-based auth with refresh-token rotation, enforces per-IP rate limits, and fails the way a real service does when its dependencies go down. A frontend built against it meets those error paths during development, when they are cheap to handle.

**Live:** [https://fastapimocker.fastapicloud.dev/](https://fastapimocker.fastapicloud.dev/)

| | |
|---|---|
| Framework | FastAPI + SQLModel, Python 3.13 |
| Database | Neon (Postgres) in production, SQLite locally with zero configuration |
| Cache and limiter | Upstash Redis over REST |
| Deployment | FastAPI Cloud |
| Seed data | 5 teams, 1,000 users, 50 discussions, 5,000 comments, 1,000 posts, 2,000 todos |
| Tests | 213 tests, ~28 seconds (~5s excluding full-seed tests) |

---

## Design goals

I wanted the mock to behave like the environment the client code will run in, without the consequences of breaking production. Each part of the project follows from that:

- If the mock never rate-limits, the client never learns to read `Retry-After`. The limiter here enforces real limits, is shared across instances, and its headers are CORS-exposed so a browser can read them.
- If the mock's auth is a header you make up, the client never exercises cookie semantics, refresh rotation, or replay rejection. Auth here is cookie-based JWT with rotating refresh tokens.
- If the mock is stateless, the client never has to handle a stale list after a delete. Writes persist.
- If the mock never fails, the client has no 503 path. Dependency failures are modelled explicitly.

---

## Resilience: what happens when the dependencies are down

Both third-party dependencies sit behind circuit breakers, so an outage costs microseconds per request instead of a full connection timeout.

| Dependency | Failure behaviour |
|---|---|
| **Neon** (Postgres) | Connect failures retry with exponential backoff, since a compute waking from autosuspend usually recovers on the second try. Persistent errors return `503` plus `Retry-After`; after N of them the circuit opens and requests fail fast until a probe succeeds. |
| **Upstash** (Redis) | Rate limiting **fails open**. The limiter falls back to per-instance in-memory counters and requests keep succeeding. |

The two dependencies fail in opposite directions on purpose. Without the database the API cannot serve anything correctly, so it fails closed. The rate limiter only guards against abuse, and failing closed there would turn a short Redis outage into a full API outage, which does more damage than the abuse it is there to prevent.

### Connecting the session eagerly

```python
# get_session acquires its connection eagerly, so the retry has a
# connect failure to catch. This costs no extra round trip: it is the
# same BEGIN the first query would have issued anyway.
```

A lazily-acquired session waits for the first query to connect, so a connect failure surfaces deep inside request handling, outside the retry wrapper. Acquiring the connection up front puts the failure where the retry can catch it, at no extra cost.

### Health that distinguishes degraded from down

```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptime": 42,
  "database": {"status": "connected"},
  "redis": {"status": "connected"},
  "circuit_breakers": [{"name": "neon-postgres", "state": "closed"}]
}
```

`status` is one of `ok`, `degraded` (Redis down, API still serving) or `unhealthy` (database down, and the endpoint also returns `503`). I used three states because a Redis outage and a Postgres outage call for different responses and should not page the same way.

Liveness (`/health/live`) touches nothing, readiness (`/health/ready`) checks the database, and `/metrics` reports per-endpoint count, average, p95 and max latency.

---

## Making Neon's connection string work with asyncpg

Neon gives out libpq connection strings, which asyncpg cannot use as they are: it raises `TypeError` on `sslmode`, `channel_binding` and a dozen other libpq-only parameters. `normalize_database_url` translates the string once, at the boundary, so nobody has to edit it by hand.

**What `sslmode=require` means.** libpq's `require` establishes TLS without validating the certificate chain. Mapping it onto Python's `ssl.create_default_context()` would switch on certificate verification, which libpq never did, and connections would then fail on any host whose certificate does not validate. The translation keeps libpq's behaviour:

```python
if sslmode in ("require", "prefer", "allow"):
    # libpq's `require` means encrypt, not verify. Keep those semantics.
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
```

**The pooled endpoint.** Neon's `-pooler` endpoint is PgBouncer in transaction mode, where asyncpg's server-side prepared statements collide across backends. Left alone, that shows up as intermittent query errors under concurrency that are hard to reproduce. The code detects the pooled host from the hostname (or an explicit `pgbouncer` flag) and disables statement caching.

With both handled, the connection string can be pasted unchanged from the Neon dashboard.

---

## Rate limiting

The limiter uses fixed-window counters in Upstash, shared across all instances and keyed by client IP (it reads `X-Forwarded-For`). Reads and writes have separate budgets, because a frontend browsing data and a write-heavy test script need different ceilings.

| Scope | Default |
|---|---|
| Read | 1,000 per 900s |
| Write | 100 per 86,400s |

Every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` and `X-RateLimit-Scope`; a `429` adds `Retry-After`. All of them are CORS-exposed; without that, code running in a browser could not read them at all.

Health, docs and metrics endpoints are exempt, so monitoring never consumes a caller's budget.

### Middleware order

```
CORS              outermost, so 429/503 responses are readable by browsers
Rate limiter      Upstash-backed, per-IP, read/write scopes
Performance       records latency, adds X-Response-Time-Ms
Request logging   structured JSON logs with X-Trace-Id
Error handler     consistent bodies, no stack traces in production
```

CORS sits outermost because a `429` from an inner middleware without CORS headers reaches the browser as an opaque network error, and the developer sees "Failed to fetch" instead of a rate-limit response. `test_startup.py` asserts the middleware order so it cannot drift.

---

## Production startup checks

When `APP_ENVIRONMENT=production`, the app will not start with the default JWT secret or a SQLite database, and it switches auth cookies to `SameSite=None; Secure` so browsers on other origins send them.

I made this a hard failure because a service running with the default secret looks healthy until someone forges a token. A crash at startup shows up in the deploy log, which you are already reading during a deploy.

---

## Seeding ~9,000 rows under autoscaling

First boot seeds an empty database in about ten seconds; later boots skip it. Under autoscaling that is a race, since several instances starting at once would each find an empty database and each begin seeding.

Seeding takes a Postgres advisory lock, so parallel instances cannot double-seed. The others wait, find a populated database, and skip seeding.

The nightly auto-reset is off by default for a similar reason: under autoscaling, every replica would wipe the shared database on its own schedule. Resetting is a manual command instead:

```bash
APP_DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
    uv run python -m app.scripts.reset
```

It prints the target database and its current row counts, then asks you to type `reset` before deleting anything, so you can confirm it is pointed at the mock and not at another database. `--yes` skips the prompt for cron or CI.

---

## API surface

Auth is cookie-based JWT with refresh rotation, followed by a familiar set of resources. Seeded users all use the password `password`, for example `alice.johnson0@example.com`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register; creates a team if none given |
| POST | `/auth/login` | Log in, sets auth and refresh cookies |
| POST | `/auth/refresh` | Rotate the access token |
| POST | `/auth/logout` | Clear cookies |
| GET | `/auth/me` | Current user |

### Resources
| Method | Path | Query |
|---|---|---|
| GET | `/users`, `/users/{id}` | `page`, `limit` |
| PATCH, DELETE | `/users/profile`, `/users/{id}` | none |
| GET | `/teams`, `/teams/{id}` | none |
| GET, POST | `/discussions` | `page`, `limit` |
| GET, PATCH, DELETE | `/discussions/{id}` | none |
| GET, POST | `/comments` | `discussionId`, `page`, `limit` |
| GET, POST | `/posts` | `userId`, `page`, `limit` |
| GET, PUT, PATCH, DELETE | `/posts/{id}` | none |
| GET, POST | `/todos` | `userId`, `completed`, `page`, `limit` |
| GET, PUT, PATCH, DELETE | `/todos/{id}` | none |

`PUT` does a full replacement and `PATCH` a partial update, so a client built against the mock will already handle a backend that enforces the difference.

### Ops
| Method | Path | Description |
|---|---|---|
| GET | `/` | Tutorial page: auth, envelopes, paging, limits, per-framework examples |
| GET | `/health` | Full dependency health (503 when the database is down) |
| GET | `/healthcheck`, `/health/live` | Liveness only, touches nothing |
| GET | `/health/ready` | Readiness, database reachable |
| GET | `/metrics` | Per-endpoint count, average, p95 and max latency |

The root path serves a tutorial page with copy-paste examples for each frontend framework. `test_home.py` asserts that the endpoint tables on that page match the registered routes, so the documentation cannot drift from the API.

---

## Testing

The 213 tests run in roughly 28 seconds, and none of them touch a real Neon or Upstash instance. `tests/conftest.py` pins the environment before any app module imports, so a developer's local `.env` cannot leak into a run and make the result depend on their machine. Upstash is exercised through `httpx.MockTransport`.

| File | Covers |
|---|---|
| `test_auth.py` | Register, login, cookie session, refresh rotation **and replay**, logout |
| `test_users.py`, `test_teams.py` | Listing, pagination, profile updates, cascade delete |
| `test_posts.py`, `test_todos.py` | Full CRUD, PUT vs PATCH semantics, filters |
| `test_comments.py`, `test_discussions.py` | Threaded content, auth requirements, cascades |
| `test_integration.py` | Signup to discussion to comment flows, CORS and preflight |
| `test_config.py` | Production guardrails; unprefixed `UPSTASH_*` env vars |
| `test_database_url.py` | Neon URL normalisation, PgBouncer detection, SSL semantics |
| `test_circuit_breaker.py` | Full state machine including half-open probes |
| `test_rate_limit.py`, `test_upstash.py` | Limits, 429s, fail-open, REST client |
| `test_errors.py` | 404/422/503 body shapes, no internal detail leaked |
| `test_seed.py`, `test_startup.py` | Seeding, reset job, lifespan, **middleware order** |
| `test_home.py` | Tutorial rendering, Host escaping, endpoint tables matching real routes |

The tests for the circuit breaker's half-open probe, the middleware order and the documentation matching the routes cover failures that would otherwise not show up until production.

---

## Project structure

```
app/
  static/        the tutorial page served at /
  core/          circuit breaker, retry, logger, dependencies
  middleware/    error handler, logging, performance, rate limiter
  models/        SQLModel: User, Team, Discussion, Comment, Post, Todo, RefreshToken
  routers/       route handlers (request/response models live with them)
  services/      Upstash client, rate limiting
  scripts/       database reset job
  auth/          JWT, password hashing, refresh tokens
  config.py      settings via pydantic-settings
  database.py    engine, Neon URL normalisation, guarded sessions
  main.py        app factory, lifespan, exception handlers
  seed.py        seed data
```

---

## Running it

```bash
uv sync
uv run fastapi dev        # SQLite by default, no configuration needed
open http://localhost:8000/       # tutorial
open http://localhost:8000/docs   # OpenAPI
```

`fastapi dev` needs no arguments, since the entrypoint is pinned in `pyproject.toml` under `[tool.fastapi]`. Deployment is `uv run fastapi deploy`, with secrets set once through `fastapi cloud env set --secret` and excluded from the upload bundle by `.fastapicloudignore`.
