# Movie App

## Overview

Interactive movie discovery platform built with Angular, featuring movie browsing, detailed views, user comments, and Supabase-powered persistence.

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
- User comments system with Supabase persistence
- Comment deletion with instant UI updates
- CI/CD pipeline via GitHub Actions with automated Cloudflare Pages deployment
- E2E testing with Cypress
- Supabase database with versioned schemas and real-time capabilities
- Environment-specific configuration with secure API key injection

---

## Setup

- Clone the repository and run `npm install`
- Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
- Configure TMDB, RAWG, and Supabase API keys
- Run `ng serve` for local development

---

## Deployment

The app is deployed on Cloudflare Pages via GitHub Actions CI/CD. API keys are injected as GitHub secrets during the build pipeline using a custom replacement script.

---

This project demonstrates a modern Angular single-page application with Supabase backend integration, CI/CD automation, and production deployment on Cloudflare's edge network.
