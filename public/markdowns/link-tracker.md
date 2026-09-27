# Link Tracker - 100+ Browser Tabs Into a Queue That Shrinks

## Overview

A self-owned Windows tool for one specific habit: keeping a hundred tabs open "to read later". One keystroke in Chrome or Edge saves tabs and closes them. A keyboard-first desktop app then gives every saved link a decision - **Queue**, **Reference** or **Drop** - and the Queue is meant to get *shorter*.

Everything lives in **one local SQLite file**. No account, no server, no cloud.

![Link Tracker's Queue view: six queued links, oldest first, with video lengths on the right. The selected talk shows its channel, its length, where playback stopped and how much is left, its thumbnail, and the triage buttons with their keys.](/portfolio_data/link_tracker/queue.webp)

*The Queue, with example links. The selected talk was saved 21 minutes in, so Enter reopens it there - 40:38 left.*

| | |
|---|---|
| Capture | Manifest V3 extension for Chrome and Edge - plain JavaScript, no build step |
| Bridge | .NET native-messaging host, started by the browser for each save |
| App | WPF on .NET 10, MVVM with CommunityToolkit.Mvvm |
| Storage | SQLite in WAL mode via Dapper, six migrations |
| Video details | YouTube Data API v3, 50 videos per request |
| Tests | 765 .NET tests (xUnit v3 on Microsoft.Testing.Platform) and 89 extension tests (Node's built-in runner) |
| Decisions | 25 ADRs, 8 specs with numbered acceptance criteria |

---

## The problem was never storage

Before writing anything, I dumped my open tabs to text. Two dumps held **164 entries but only 99 unique pages** - the same video open in three tabs, the same article in two windows - and **34 of the 99 were YouTube videos**.

That set the design. A bookmark manager would have stored all 164 faithfully and changed nothing. What was missing was a *decision* per link, and a place that made keeping a link cost something. So every link enters an **Inbox**, and the only ways out are:

- **Q** - Queue: I will actually do this.
- **R** - Reference: worth keeping, not a to-do.
- **D** - Drop: close it without guilt.

Links are never hard-deleted. Dropped and archived links stay in the file, and saving one again brings it back to the Inbox - so dropping is safe, which is what makes people willing to do it.

---

## How the parts fit

```
  Chrome / Edge                     Windows
 ┌──────────────┐  native      ┌──────────────────┐
 │ MV3 extension │─ messaging ─▶│ LinkTracker.Host  │──┐
 │ Alt+Shift+S/W │  (stdio)     │ one process/save │  │ one transaction
 └──────────────┘              └──────────────────┘  ▼
                                               ┌────────────┐
 ┌──────────────┐                              │ links.db   │
 │ LinkTracker  │◀────────── reads/writes ─────│ SQLite/WAL │
 │ .App (WPF)   │                              └────────────┘
 └──────────────┘                                     ▲
 ┌──────────────┐   import · enrich · check           │
 │ .Cli         │─────────────────────────────────────┘
 └──────────────┘
```

Seven projects in the solution, with a dependency rule that keeps saving fast: `Core ← Data ← Cli / App / Host`, and **the host never references the YouTube or link-checking projects**, so a save never waits on the network.

---

## The interesting problems

### Why native messaging and not a local server

A browser extension cannot write files, so something on the machine has to. The obvious answer - a little HTTP server on localhost - means an open port, a process that has to be running, and an authentication story. Native messaging has none of those: the browser starts `LinkTracker.Host.exe` for one message, talks to it over stdin/stdout with 4-byte length-prefixed JSON, and **only the extension IDs listed in the host's manifest can connect at all**. It also works when the app is closed.

The gotcha that shapes the host: **stdout belongs to the protocol.** A single stray log line corrupts the message stream, so logging goes to a file and nothing else is allowed near stdout. Serialization is source-generated to keep the start-up of a process that lives for one message short.

### Save-and-close is a race

"Save these tabs, then close them" sounds like two steps. It is actually a race: between sending the save and hearing back, a tab can navigate somewhere else, or the user can close it themselves. Closing it anyway would lose a page that was never saved.

So the rule, which lives in one pure function in the extension (`planClose`) with its own tests, is that a tab closes only if:

1. the host's reply says **its** link was stored (one result per link, in order - a reply that does not line up one-to-one with the request closes nothing), **and**
2. when the window is **read again after the reply**, that tab still shows the same page and is not loading.

Pinned tabs and pages that are not web links always stay. If the save would empty the window, a new tab opens first so the browser does not quit. And each save is **one transaction**: if the host fails, nothing was written and nothing closes.

### One link, many URLs

The same YouTube video arrives as `watch?v=`, `youtu.be/`, `/shorts/` and `/embed/`, usually with tracking parameters attached. Identity is a normalized URL with a `UNIQUE` constraint: all four video forms become `youtube:<id>`, `utm_*`, `fbclid`, `gclid` and `si` are stripped, and a `t=` timestamp becomes a **resume point** on the existing link instead of a second link. That is how 164 tab entries became 99 rows on the first real import - 99 added, 65 merged, none skipped.

### Reading the video player without breaking it

When a YouTube tab is saved, the extension reads where playback stopped and how long the video is, so Enter in the app reopens it at that point. That means injecting code into someone else's page, so it is done carefully: a function is injected **only at save time**, into the extension's isolated world, all reads share a one-second limit, nothing is read while an ad is playing, and a live stream reports no length rather than a wrong one. Optional data fails soft - a save never fails because the player could not be read.

### A queue has to shrink

A queue that only grows is a bookmark folder. Two features push the other way:

- **"I have N minutes"** (the **M** key) picks the **oldest** queued video whose remaining time fits. Deliberately not a knapsack optimiser: predictable beats clever when you are deciding what to watch.
- **"Still want this?"** appears once a day with the three links that have waited longest. **Keep** sends a link to the back of the line (a `reviewed_at` date, kept separate from when its status last changed), **X** marks it done, **D** drops it.

Inbox links nobody has touched in 30 days (configurable, 1-365) are archived at start-up - not deleted.

### Link checking that never cries wolf

The piece in progress: finding links that have died. The failure mode to design against is not a missed dead link, it is **my own outage looking like link rot** - a laptop on bad Wi-Fi would otherwise mark half the database dead in one run. So:

- every check sorts into one of **six outcomes**, and a link is only **gone** after **three failed checks over at least seven days**;
- if the first five checks of a run all fail to connect, **the run writes nothing**;
- requests are serial and polite - 500 ms apart, 2 s apart on the same site, a 15 s timeout, an honest User-Agent - and use `ResponseHeadersRead` so a body is never downloaded;
- YouTube videos are checked through the Data API, after measuring that oEmbed answers **400, not 404**, for a deleted video.

The rules, the classifier, the checker and the `linktracker check` command are built and tested; wiring it into the app is next.

---

## Measured, not assumed

| What | Result |
|---|---|
| App start-up, 1,000-link database (Release, 9 runs) | 157-232 ms |
| Triage keystroke, same database | 1.3-1.7 ms median, p95 ≤ 2.5 ms |
| Filter keystroke | ~1 ms median |
| Host: save 1 link / 200 links | 232-245 ms / 255-265 ms median |
| Real browser: 1 tab / a 53-tab window | 414 ms / 1,245 ms |

The 1,000 links come from a script that writes the same synthetic dump every time, so the numbers can be re-run rather than remembered.

---

## How it was built

Every decision has an **ADR** - 25 of them, from "single local SQLite file" to "never let my own failures look like link rot". Every module has a **spec** whose acceptance criteria are numbered, and **every test is named after the criterion it proves** (`L16_…`, `R2_…`), so a failing test points straight at the promise it broke. Along the way I broke code on purpose to confirm the right test failed - making a timeout count as "gone", for instance, fails the liveness test written for exactly that case.

## Status

- Link store and tab-dump importer - done
- Browser extension and native host - done, checked in Chrome and Edge
- YouTube details and "I have N minutes" - done
- Triage app - built, final pass on real data pending
- Link checking - core, rules and CLI done; app integration next
