# FastAPIMocker: A Mock API That Behaves Like a Real One

## Overview

Every frontend developer has built against a mock API. Most mocks are read-only fictions: you can `GET /posts`, and a `POST` politely pretends to work and changes nothing. So the client gets written against a world with no 401s, no 429s, no 503s, and no pagination edge cases, and every one of those turns up for the first time against the real backend.

FastAPIMocker is the other kind of mock: **real persistence, real cookie-based auth with refresh-token rotation, real per-IP rate limits, and real failure modes.** A frontend built against it meets the unhappy paths during development, which is the only time they are cheap to handle.

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

## The design bet

A mock API's job is not to return plausible JSON. It is to be **the environment your client code will actually run in**, minus the consequences.

That reframing decides everything else in the project:

- If the mock never rate-limits, the client never learns to read `Retry-After`. So the limiter is real, shared across instances, and its headers are CORS-exposed so a browser can actually read them.
- If the mock's auth is a header you make up, the client never exercises cookie semantics, refresh rotation, or replay rejection. So auth is cookie-based JWT with rotating refresh tokens.
- If the mock is stateless, the client never handles a stale list after a delete. So writes persist.
- If the mock never fails, the client has no 503 path. So dependency failure is modelled explicitly rather than hidden.

---

## Resilience: what happens when the dependencies are down

Both third-party dependencies sit behind circuit breakers, so an outage costs microseconds per request instead of a full connection timeout.

| Dependency | Failure behaviour |
|---|---|
| **Neon** (Postgres) | Connect failures retry with exponential backoff, since a compute waking from autosuspend usually recovers on the second try. Persistent errors return `503` plus `Retry-After`; after N of them the circuit opens and requests fail fast until a probe succeeds. |
| **Upstash** (Redis) | Rate limiting **fails open**. The limiter falls back to per-instance in-memory counters and requests keep succeeding. |

Those two rows encode a deliberate and opposite judgement about each dependency. **The database is load-bearing, so failing closed is honest.** **The rate limiter is a guardrail, so failing closed would convert a Redis blip into a total outage.** An unavailable limiter must never be more damaging than the abuse it exists to prevent.

### One subtle piece of wiring

```python
# get_session acquires its connection eagerly, so the retry has a
# connect failure to catch. This costs no extra round trip: it is the
# same BEGIN the first query would have issued anyway.
```

A lazily-acquired session defers the connection until the first query, which means the connect failure surfaces deep inside request handling where the retry wrapper can no longer see it. Acquiring eagerly moves the failure to where it can be handled, for free.

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

`status` is one of `ok`, `degraded` (Redis down, API still serving) or `unhealthy` (database down, and the endpoint also returns `503`). Three states rather than two, because "Redis is down" and "Postgres is down" are not the same operational event and should not page the same way.

Liveness (`/health/live`) touches nothing, readiness (`/health/ready`) checks the database, and `/metrics` reports per-endpoint count, average, p95 and max latency.

---

## Making Neon's connection string work with asyncpg

Neon hands out libpq connection strings. asyncpg cannot consume them verbatim: it raises `TypeError` on `sslmode`, `channel_binding` and a dozen other libpq-only parameters. Rather than making every developer edit the string by hand, `normalize_database_url` translates it once, at the boundary.

Three details in there are the kind that cost an afternoon each.

**`sslmode=require` means encrypt, not verify.** libpq's `require` establishes TLS without validating the certificate chain. Naively mapping it onto Python's `ssl.create_default_context()` silently *upgrades* the security posture and then fails on any host whose certificate does not validate. The translation preserves libpq's semantics deliberately:

```python
if sslmode in ("require", "prefer", "allow"):
    # libpq's `require` means encrypt, not verify. Keep those semantics.
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
```

**Neon's `-pooler` endpoint is PgBouncer in transaction mode**, where asyncpg's server-side prepared statements collide across backends. The pooled host is detected from the hostname (or an explicit `pgbouncer` flag) and statement caching disabled accordingly, a failure that otherwise appears as intermittent, unreproducible query errors under concurrency.

**The result is that the connection string can be pasted verbatim from the Neon dashboard**, which is the whole point of doing the work.

---

## Rate limiting

Fixed-window counters in Upstash, shared across all instances, keyed by client IP and `X-Forwarded-For`-aware. Reads and writes have **separate budgets**, because a browsing frontend and a write-heavy test script are different traffic and deserve different ceilings.

| Scope | Default |
|---|---|
| Read | 1,000 per 900s |
| Write | 100 per 86,400s |

Every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` and `X-RateLimit-Scope`; a `429` adds `Retry-After`. All of them are CORS-exposed, so a browser frontend can read them. Headers a browser cannot see are headers that do not exist as far as the client is concerned.

Health, docs and metrics endpoints are exempt, so monitoring never consumes a caller's budget.

### Middleware order is load-bearing

```
CORS              outermost, so 429/503 responses are readable by browsers
Rate limiter      Upstash-backed, per-IP, read/write scopes
Performance       records latency, adds X-Response-Time-Ms
Request logging   structured JSON logs with X-Trace-Id
Error handler     consistent bodies, no stack traces in production
```

CORS sits outermost for a specific reason: a `429` emitted by an inner middleware and *not* wrapped in CORS headers reaches the browser as an opaque network error. The developer sees "Failed to fetch" instead of "you are rate limited", which is precisely the debugging experience this project exists to avoid. Middleware ordering is asserted in `test_startup.py` so it cannot drift.

---

## Production guardrails that refuse to boot

When `APP_ENVIRONMENT=production`, the app **refuses to start** with the default JWT secret or a SQLite database, and switches auth cookies to `SameSite=None; Secure` so browsers on other origins actually send them.

Refusing to boot is the right severity. A misconfigured secret that starts successfully is a service that appears healthy and is not, and it will keep appearing healthy right up until someone forges a token. A crash at startup is discovered in the deploy log, which is where you are already looking.

---

## Seeding ~9,000 rows without racing itself

First boot seeds an empty database in about ten seconds; later boots skip it. Under autoscaling that is a race, since several instances starting at once would each find an empty database and each begin seeding.

**Seeding takes a Postgres advisory lock**, so parallel instances cannot double-seed. The losers wait, observe a populated database, and skip.

The nightly auto-reset is **off by default** for the same class of reason: under autoscaling every replica would independently wipe the shared database on its own schedule. Resetting is a deliberate operation instead:

```bash
APP_DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
    uv run python -m app.scripts.reset
```

It prints the target and the current row counts, then requires you to type `reset` before deleting anything. `--yes` skips the prompt for cron or CI. A destructive script that names its target before acting is the difference between resetting the mock and resetting something else.

---

## API surface

Cookie-based JWT with refresh rotation, then the familiar resource set. Seeded users all use the password `password`, for example `alice.johnson0@example.com`.

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

`PUT` and `PATCH` have genuinely different semantics, full replacement versus partial update, rather than being aliases. A client that learns the difference here will not be surprised by a backend that enforces it.

### Ops
| Method | Path | Description |
|---|---|---|
| GET | `/` | Tutorial page: auth, envelopes, paging, limits, per-framework examples |
| GET | `/health` | Full dependency health (503 when the database is down) |
| GET | `/healthcheck`, `/health/live` | Liveness only, touches nothing |
| GET | `/health/ready` | Readiness, database reachable |
| GET | `/metrics` | Per-endpoint count, average, p95 and max latency |

The root path serves a tutorial rather than a JSON banner, with copy-paste examples per frontend framework. **`test_home.py` asserts the endpoint tables on that page match the real registered routes**, so the documentation cannot quietly drift away from the API it documents.

---

## Testing

213 tests, roughly 28 seconds, and **none of them touch a real Neon or Upstash instance.** `tests/conftest.py` pins the environment before any app module imports, so a developer's local `.env` cannot leak into a run and make a passing suite depend on their machine. Upstash is exercised through `httpx.MockTransport`.

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

Three of those rows test things most projects never assert at all: the circuit breaker's half-open probe, the middleware ordering, and the documentation matching the routes. Each exists because it is a failure that is invisible until production.

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
