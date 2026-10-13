# Movie App

## Overview

An Angular app for browsing movies. Each movie has a detail view where users can leave comments, which are stored in Supabase.

**Live Demo:** https://movie-game-viewer.pages.dev/
**Repository:** https://github.com/firepenguindisopanda/DCIT-Movie-App

---

## Tech Stack

- Angular (frontend framework)
- Material UI (design system)
- Supabase (database, auth, and real-time)
- Cloudflare Pages (hosting + deployment)
- Cypress (E2E testing)
- GitHub Actions (CI/CD pipeline)

---

## Key Features

- Browse a curated collection of movies with metadata from TMDB and RAWG APIs
- View detailed information for individual movies
- User comments stored in Supabase
- Comment deletion that updates the UI straight away
- CI/CD pipeline via GitHub Actions with automated Cloudflare Pages deployment
- E2E testing with Cypress
- Supabase database with versioned schemas and real-time support
- Per-environment configuration, with API keys injected at build time

---

## Setup

- Clone the repository and run `npm install`
- Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
- Configure TMDB, RAWG, and Supabase API keys
- Run `ng serve` for local development

---

## Deployment

The app is deployed on Cloudflare Pages via GitHub Actions CI/CD. API keys are stored as GitHub secrets and injected during the build by a custom replacement script.

---

It is an Angular single-page app with a Supabase backend, automated CI/CD and production hosting on Cloudflare's edge network.
