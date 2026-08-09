# AI Pitch Deck Generator - Full Stack Application

## Overview

A sophisticated AI-powered platform designed to streamline the creation of professional pitch decks. Built with a robust NestJS backend and a modern Next.js frontend, this application leverages Generative AI (via NVIDIA's API) to automatically generate slide content, structure, and speaker notes based on user prompts. It features a comprehensive deck management system, real-time editing, version control, and PDF export capabilities.

**Frontend Repository:** [GitHub link]  
**Backend Repository:** [GitHub link]

---

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework for building efficient, scalable server-side applications
- **PostgreSQL & TypeORM** - Relational database with object-relational mapping
- **OpenAI SDK (NVIDIA API)** - Integration with LLMs (e.g., Google Gemma) for content generation
- **Passport & JWT** - Secure authentication strategy
- **PDFKit** - Programmatic PDF generation
- **Socket.io** - Real-time bidirectional event-based communication
- **Pino** - Structured logging
- **Docker** - Containerization for consistent development and deployment environments

### Frontend
- **Next.js 16** (App Router) - React framework with server-side rendering and static site generation
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with modern CSS features
- **TanStack Query** - Powerful asynchronous state management
- **TanStack Form & Zod** - Type-safe form validation
- **@dnd-kit** - Drag-and-drop interface for slide reordering
- **Lucide React** - Consistent icon set

### External APIs
- **NVIDIA NIM API** - Access to high-performance AI models like `google/gemma-3-1b-it`

---

## Key Features

### Authentication & Security
- Secure user registration and login flows
- JWT-based session management
- Password hashing with bcrypt
- Rate limiting via `@nestjs/throttler` to prevent abuse
- Helmet middleware for setting secure HTTP headers

### AI-Powered Content Generation
- **Prompt-to-Deck:** Generates complete pitch deck structures from a single text description
- **Smart Slide Content:** Automatically populates titles, bullet points, and speaker notes
- **Model Flexibility:** Configurable to use different LLMs via NVIDIA's API

### Deck Management
- **Dashboard:** Centralized view of all user pitch decks
- **CRUD Operations:** Create, read, update, and delete decks
- **Status Tracking:** Manage decks through 'Draft' and 'Published' states
- **Versioning:** Automatic snapshots of deck versions (`PitchDeckVersion`) to track history

### Slide Editor
- **Rich Text Editing:** Edit slide content and speaker notes
- **Drag-and-Drop Reordering:** Intuitive interface to rearrange slides
- **Image Support:** Associate images with slides (URL-based)

### Export & Output
- **PDF Generation:** Export completed decks to professional PDF format
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
The NestJS application is organized into domain-specific modules for better maintainability:
- `AiGenModule`: Handles interaction with external AI services
- `PitchdecksModule` & `SlidesModule`: Core business logic for deck management
- `AuthModule`: Encapsulates security logic
- `DatabaseModule`: Manages connections and migrations

### Monorepo Setup
- **Turborepo:** High-performance build system managing the frontend (`apps/web`) and shared packages
- **Shared Config:** Centralized TypeScript and ESLint configurations

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
- `POST /ai-gen/generate` - Generate a new deck draft from a prompt

**Pitch Decks:**
- `GET /pitchdecks` - List all user decks
- `POST /pitchdecks` - Create a new deck
- `GET /pitchdecks/:id` - Get full deck details

**Slides:**
- `POST /slides` - Add a slide
- `PATCH /slides/:id` - Update slide content
- `PUT /slides/reorder` - Update slide order

---

## Technical Challenges & Solutions

### Challenge 1: AI Response Structuring
**Problem:** LLMs output unstructured text, but the application needs structured JSON for slides.
**Solution:** Implemented robust prompt engineering and parsing logic within `AiGenService` to enforce a strict JSON schema output from the NVIDIA API, ensuring generated content maps correctly to `Slide` entities.

### Challenge 2: Version Control for Complex Data
**Problem:** Tracking changes in a deck with multiple slides and properties is complex.
**Solution:** Utilized the `PitchDeckVersion` entity with a `jsonb` column in PostgreSQL. This allows storing complete snapshots of the deck's state efficiently without complex join tables for history.

### Challenge 3: Real-time Slide Reordering
**Problem:** Reordering slides needs to be snappy on the frontend and consistent on the backend.
**Solution:** Used `@dnd-kit` for a smooth frontend experience and a batch update endpoint on the backend to update `order` fields transactionally.

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

---

*Built with modern web technologies*
