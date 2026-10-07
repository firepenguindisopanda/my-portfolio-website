# specs before code: A System-Design Learning Platform

> A model proposes a system design and code decides whether it holds. Every
> design is first settled as a typed plan that parser rules check, then written
> up once by a writer whose document is checked against that plan. The status a
> design ends with is set by code, never by the model.

**[Source on GitHub](https://github.com/firepenguindisopanda/idea-sprinter)**

## The problem

The first version of this project had eleven specialist agents (product owner,
architect, security analyst and so on) each write part of a software
specification. It looked thorough and read badly. Measured against answer keys
for real system-design exercises, the documents passed **12 of 65** checks, and
each one carried around eleven contradictions: eleven authors restating one
design from eleven partial views.

The second version starts from that measurement. Decide the design once, in a
structured plan. Check the plan in code. Write it up once, from the whole plan.
Check the writing against the plan. The agents, the graph that ran them and the
retrieval stack behind them were removed: more than 30,000 lines.

## What it does

It is a place to practise system design, with a generator as the evidence for
what good looks like.

| Part | What happens |
|---|---|
| **Workshop** | A one-line idea goes in. "Check my idea" scores how vague it is on five dimensions; clarifying questions and a chosen direction follow; "Write the spec" produces a design spec and streams each stage live. Export as Markdown, PDF or JSON. |
| **Practise** | Five exercises with answer keys. You draft a design, take hints, then reveal the key. A grader marks the draft against it, labelled provisional, and missed checks link to reading. A keyed exercise cannot be generated in the Workshop until you have revealed it. |
| **Architecture Studio** | Architecture options with diagrams. You can contest an assumption, ask for the case against the recommendation, and draft a decision record that is only saved when you save it. |
| **PRD** | A requirements conversation tailored to four kinds of user, which can hand its result to the Workshop. |

A design spec has ten required sections: requirements, estimates, the core
decision, architecture, APIs, data model, promises, failure modes, tests and
open questions.

## How a design is made

A run is a few model calls, against 18 to 25 in the first version. Each model
call is followed by checks that run in code.

| Stage | The model | Then code checks |
|---|---|---|
| **1. The plan (ledger)** | Writes the design as one structured object in seven fields: numbers, workloads, decisions, data access, capacity, promises and replicated state. | About twenty parser rules, such as a decision with no stated cost, a reference to a number that does not exist, capacity in mismatched units, or sensitive data read outside its readers. Each finding names its rule and field, such as `decision_no_cost` on the second decision, and goes back to the model, for up to two revisions. |
| **2. The document (writer)** | Writes the spec once, from the whole plan, with every reference already replaced by its value. | Every estimate must trace to a number in the plan; every stated sum is recomputed; comparisons must hold; the core decision must be named with its cost; every component must appear in the architecture; all ten sections must be present, within 2,500 words. Findings get one revision. |
| **3. The status** | Nothing. | Set in code from what is left: **checked against its plan**, **plan unresolved**, **document unresolved** or **not written**. An unresolved plan is stated at the top of the document itself. |

The checks are built precision first. A finding costs a revision and, if it
survives, marks the design unresolved, so a check that cries wolf teaches people
to ignore it. Where a rule cannot tell, it says nothing: unit conversions are
accepted rather than guessed at.

## A claim has to come from the person

The same rule runs through the learning side: the model may trim what you said,
not supply it.

- **The grader.** A "yes" on an answer-key check only counts if the quote it
  gives is really in your draft and long enough to be evidence. Otherwise it is
  listed as unverified, not passed.
- **Contesting the Studio.** An option only changes when the new fact is at
  least 80% your own words. If you stated nothing new, it says so and leaves the
  recommendation alone. Whether the recommendation changed is derived in code
  from the model's structured answer, not asked for as a verdict.
- **The keys.** Answer keys are split on the server, so the grader never sees
  the explanation meant for the learner and the learner never sees the grader's
  pass conditions.

## Results

Measured on five keyed exercises (10 to 15 yes/no checks each, 65 in all):

| | Answer-key checks passed | Core checks passed |
|---|---|---|
| First version (eleven agents) | 12 of 65 | |
| Plan, then one writer | **24 of 65** | 12 of 18 |

Twice the first version, and still well short of a good design. Every generated
document passes its own code checks, and the contradictions that remain are
mostly ones a parser cannot see: of 70 number contradictions found across 30
written designs, 60 were about what two numbers mean (a per-instance rate used
as a system-wide one, a threshold met with "<" in one place and "<=" in
another), while each number agreed with the plan. The checks say nothing where
they cannot tell, rather than guess.

## Grounding

There is no vector store. A corpus of 143 reference chunks, each with its
source, licence and link (Azure architecture patterns and antipatterns, the
System Design Primer, nine sets of book rules and notes written for the
project), backs the
Studio and the reading links. An optional context pack lets one call choose up
to five chunks for a run; code drops unknown ids, anything that would give away
an exercise, and anything over budget.

## Engineering

- **Durable runs.** A run is a database row that owns the work; its events are
  stored with sequence numbers, so a page that reloads mid-run replays from where
  it left off, and a run can be cancelled.
- **Prompt injection.** Anything that came from outside is marked as data, and a
  suite of 24 canary cases checks it by string search, not by asking a model.
- **Cost.** Token budgets are checked whenever a model is built, and a budget
  refusal ends a run cleanly.
- **Resilience.** Retries and circuit breakers around every model call.
- **The rest.** Google sign-in with JWT sessions, SQLAlchemy and Alembic on
  Postgres, Docker on a Hugging Face Space for the API, the frontend on Vercel.

| | |
|---|---|
| Backend | About 19,600 lines of Python, 64 test modules |
| Frontend | About 15,300 lines of TypeScript, 34 Vitest test files and a Playwright suite |
| API | 16 routers |

## Limitations

- A design takes 14 to 28 minutes and 80,000 to 150,000 tokens on the current
  model, which is slow for a learner waiting on it.
- The generator passes 37% of the answer-key checks. The code checks keep it
  consistent with its own plan; they cannot make the plan right.
- The grader's marks are labelled provisional, and its model is still an open
  choice.
- The injection suite and the 2,500-word limit have not yet been measured on
  live runs of the new path.

## Stack

FastAPI, Python 3.12, LangChain (messages and the NVIDIA connector), NVIDIA NIM,
SQLAlchemy, Alembic, PostgreSQL, Upstash Redis, Docker; Next.js 16, React 19,
TypeScript, Tailwind CSS v4, Vitest, Playwright.
