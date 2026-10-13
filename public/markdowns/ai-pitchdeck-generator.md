# AI Pitch Deck Generator: Full Stack Application

## Overview

A web app for drafting pitch decks. The user describes the deck in a prompt, and a NestJS backend sends it to a generative model through NVIDIA's API, which returns the slide structure, slide content and speaker notes. The frontend is built with Next.js, and the app also has deck management, real-time editing, version control and PDF export.

---

## Tech Stack

### Backend
- **NestJS**: Node.js server framework
- **PostgreSQL & TypeORM**: Relational database with object-relational mapping
- **OpenAI SDK (NVIDIA API)**: Integration with LLMs (e.g., Google Gemma) for content generation
- **Passport & JWT**: Authentication
- **PDFKit**: Programmatic PDF generation
- **Socket.io**: Real-time events in both directions between client and server
- **Pino**: Structured logging
- **Docker**: Containers for development and deployment

### Frontend
- **Next.js 16** (App Router): React framework with server-side rendering and static site generation
- **TypeScript**: Type checking
- **Tailwind CSS 4**: Utility-first styling
- **TanStack Query**: Asynchronous state management
- **TanStack Form & Zod**: Type-safe form validation
- **@dnd-kit**: Drag-and-drop interface for slide reordering
- **Lucide React**: Icons

### External APIs
- **NVIDIA NIM API**: Hosted models such as `google/gemma-3-1b-it`

---

## Key Features

### Authentication & Security
- User registration and login
- JWT-based session management
- Password hashing with bcrypt
- Rate limiting via `@nestjs/throttler` to limit abuse
- Helmet middleware to set security-related HTTP headers

### Content Generation
- **Prompt-to-Deck:** Generates complete pitch deck structures from a single text description
- **Slide Content:** Fills in titles, bullet points and speaker notes
- **Model Choice:** The model is set in configuration and can be any LLM available through NVIDIA's API

### Deck Management
- **Dashboard:** Lists all of the user's pitch decks
- **CRUD Operations:** Create, read, update, and delete decks
- **Status Tracking:** Manage decks through 'Draft' and 'Published' states
- **Versioning:** Automatic snapshots of deck versions (`PitchDeckVersion`) to track history

### Slide Editor
- **Rich Text Editing:** Edit slide content and speaker notes
- **Drag-and-Drop Reordering:** Rearrange slides by dragging them
- **Image Support:** Associate images with slides (URL-based)

### Export & Output
- **PDF Generation:** Export a finished deck to PDF
- **JSON Snapshots:** Store and retrieve structured data of deck versions

---

## Data Model Summary

### User Model
- `id`: UUID
- `email`: Unique identifier
- `password`: Hashed credential
- `pitchDecks`: One-to-many relationship with PitchDeck

### PitchDeck Model
Represents a presentation project:
- `title`: Name of the deck
- `description`: Brief summary
- `status`: Enum (draft, published)
- `user`: Owner of the deck
- `slides`: One-to-many relationship with Slide
- `versions`: One-to-many relationship with PitchDeckVersion

### Slide Model
Individual slides within a deck:
- `title`: Slide header
- `content`: Main body text
- `speakerNotes`: Private notes for the presenter
- `imageUrl`: Link to slide visual
- `order`: Integer for sequencing
- `pitchDeck`: Reference to parent deck

### PitchDeckVersion Model
Historical snapshots for version control:
- `pitchDeck`: Reference to the parent deck
- `versionData`: JSONB column storing the complete state of the deck at that point in time
- `versionNumber`: Sequential version identifier

---

## Architecture Highlights

### Modular Backend Structure
The NestJS application is split into modules by domain:
- `AiGenModule`: Handles interaction with external AI services
- `PitchdecksModule` & `SlidesModule`: Core business logic for deck management
- `AuthModule`: Authentication logic
- `DatabaseModule`: Manages connections and migrations

### Monorepo Setup
- **Turborepo:** Build system for the frontend (`apps/web`) and shared packages
- **Shared Config:** One set of TypeScript and ESLint configurations

### Service-Repository Pattern
- **Controllers:** Handle HTTP requests and validation
- **Services:** Contain business logic and orchestrate data flow
- **Entities:** Define database schema and relationships

---

## Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL
- NVIDIA API Key (for AI features)

### Backend Setup
```bash
cd pitch-deck-generator
npm install

# Configure environment variables
cp .env.example .env
# Set DATABASE_URL, NVIDIA_API_KEY, JWT_SECRET, etc.

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Frontend Setup
```bash
cd my-better-t-app
npm install

# Configure environment variables
# Create .env.local in apps/web with NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

---

## API Documentation

The backend provides a Swagger UI for interactive API documentation (typically available in development mode).

### Key Endpoints

**AI Generation:**
- `POST /ai-gen/generate`: Generate a new deck draft from a prompt

**Pitch Decks:**
- `GET /pitchdecks`: List all user decks
- `POST /pitchdecks`: Create a new deck
- `GET /pitchdecks/:id`: Get full deck details

**Slides:**
- `POST /slides`: Add a slide
- `PATCH /slides/:id`: Update slide content
- `PUT /slides/reorder`: Update slide order

---

## Technical Challenges & Solutions

### Challenge 1: AI Response Structuring
**Problem:** LLMs output unstructured text, but the application needs structured JSON for slides.
**Solution:** `AiGenService` prompts the model through the NVIDIA API for output in a strict JSON schema and parses the reply against it, so generated content maps onto `Slide` entities.

### Challenge 2: Version Control for Complex Data
**Problem:** A deck has many slides and properties, so tracking its changes is awkward.
**Solution:** Each version is a `PitchDeckVersion` entity with a `jsonb` column in PostgreSQL that holds a complete snapshot of the deck's state, so history needs no extra join tables.

### Challenge 3: Real-time Slide Reordering
**Problem:** Reordering slides had to feel fast on the frontend and stay consistent on the backend.
**Solution:** `@dnd-kit` handles dragging on the frontend, and a batch update endpoint on the backend updates the `order` fields in one transaction.

---

## Future Enhancements

- [ ] **Collaborative Editing:** Real-time multi-user editing using WebSockets
- [ ] **Theme System:** Multiple visual themes for exported PDFs
- [ ] **Image Generation:** Integrate Stable Diffusion or DALL-E to generate slide images
- [ ] **Analytics:** Track views and engagement for published decks
- [ ] **PPTX Export:** Support export to editable PowerPoint files

---

## Contact & Links

**Developer:** Nicholas Smith  
**Email:** nicosmith.smith3@gmail.com  
**GitHub:** [\[GitHub Profile\]](https://github.com/firepenguindisopanda?tab=repositories)  
**LinkedIn:** [[LinkedIn](https://www.linkedin.com/in/nicholas-smith-933125148/)]  
**Portfolio:** [\[Portfolio URL\]](https://portfolio-website-11217.web.app/)
