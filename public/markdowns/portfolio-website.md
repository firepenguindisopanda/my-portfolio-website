# Portfolio Website

## Overview

This site, designed as a case file. Employers and clients skim a portfolio in well under two minutes, so the work has to be findable in seconds and still be worth staying for. The design answers both: an archive of case files on cool paper, where a highlighter marks what was verified and a stamp red marks what was flagged, and a night stage where the main projects play out as stories.

**Live Site:** https://nicksmith.is-a.dev/
**Repository:** https://github.com/firepenguindisopanda/react-portfolio-website

---

## Tech Stack

- React 18 and React Router 6, built with Vite
- GSAP with ScrollTrigger and Flip for the scroll stories, the index filter and the hover preview
- Plain CSS for every page; Material UI and Recharts for the interactive analyses on the data-science case studies
- react-markdown for the case studies, which are Markdown files like this one
- PostHog for analytics, behind a consent banner and cookieless until a visitor accepts
- EmailJS for the contact form
- Vitest and Testing Library, run in CI on every push; Firebase Hosting

---

## What is on the page

- **The cover** - name, role and the thesis, with three evidence rows that each open the case study behind them.
- **Four cases** - four projects told as stories. On a desktop each chapter pins while its figure plays against the scroll: timetable PDFs cross-checked into a confirmed session, a fraud threshold chosen by cost, a multi-agent graph with its skeptic, a queue of saved tabs getting shorter. Every figure is drawn from the project's real data.
- **Try it** - three projects small enough to use on the page: the Chimp Test, Link Tracker's keyboard triage (Q, R, D and X, as in the real app) and the timetable builder's drag, with clashes marked. They run on example data and work by keyboard and touch.
- **The index** - every featured project, filterable by category. Pointing at a row in "More projects" floats its screenshot beside the cursor.
- Experience, skills, placings and contact, then a case study like this one for every project.

---

## Motion, and turning it off

Everything that moves follows the visitor's reduced-motion setting by default. Windows turns that setting on whenever "Show animations" is off, often for reasons that have nothing to do with websites, so the header has a Motion switch that overrides it and is remembered. With motion off every figure is drawn in its finished state and nothing on the page is lost.

One rule came from a real bug: the reduced-motion override is keyed on the switch's `html.motion-off` class, never on a global rule. A global `transition-duration` turns every GSAP style write into a CSS transition that GSAP then reads back mid-flight, and a delayed entrance once recorded its hidden start state as its destination, leaving the hero invisible.

---

## How it checks itself

- Tests that read the source fail if a GSAP tween starts without a reduced-motion guard, if a CSS transition is not keyed to the Motion switch, or if a gradient or shadow appears outside the stylesheets.
- The Material UI theme mirrors the stylesheet's colour tokens, and a test fails if the two drift apart. Another checks the text colour pairs against WCAG AA contrast.
- Every route is code-split, and the charting and component libraries load only on the three case studies that use them. A test walks each page's imports and fails if Material UI creeps back onto any other page.

---

## Local Setup

- `npm ci`, then `npm start` to run it at http://localhost:5173; `npm test` runs the suite.
