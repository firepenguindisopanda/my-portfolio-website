# Game Rentals Platform: Full Stack Application

## Overview

A game rental system built on the MERN stack (MongoDB, Express, React, Next.js) with Redis for caching. Customers rent games to each other (peer-to-peer), and the platform handles JWT authentication, role-based access control, real-time availability tracking and automatic late fee calculation.

---

## Tech Stack

### Backend
- **Node.js & Express.js**: RESTful API server
- **MongoDB & Mongoose**: Document database with schema validation
- **Redis**: Session management and response caching
- **JWT (jsonwebtoken)**: Authentication with refresh tokens
- **bcryptjs**: Password hashing
- **Joi**: Request validation
- **Swagger/OpenAPI**: API documentation

### Frontend
- **Next.js 14** (App Router): React framework with server-side rendering
- **TypeScript**: Type checking
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client with interceptors

### External APIs
- **RAWG Video Games Database**: Source of the game catalog, 200+ games

---

## Key Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Customer vs Staff)
- Password hashing with bcrypt
- Redis-backed session management and token blacklisting

### Game Catalog Management
- Game metadata pulled from the RAWG API
- 200+ games seeded with 20+ data points per game (ratings, platforms, genres, screenshots, etc.)
- Filtering by platform, genre and search terms
- Availability and pricing aggregated per game

### Rental System
- **Listing Management:** Users can list their games for rent with custom pricing
- **Rental Lifecycle:** Create rentals, track due dates, process returns
- **Late Fee Calculation:** 10% of the rental price for each day past the due date, calculated automatically on return
- **Collateral Limits:** Customer-specific rental limits to manage risk
- **Status Tracking:** Real-time rental status (ongoing, overdue, returned)

### Admin Dashboard
- Staff-only pages for running the platform
- View all listings, with filters
- Process rentals and returns
- Create rentals on behalf of customers
- View active, overdue, and historical rentals

### Caching & Performance
- Redis caching for frequently accessed game data
- Fewer database reads and faster responses for cached data
- Cache invalidation to keep cached data consistent with the database

---

## Data Model Summary

### User Model (Discriminator Pattern)
**Base User:**
- Email, name, password (hashed)
- Role-based type: Customer or Staff

**Customer (extends User):**
- `depositBalance`: Prepaid funds for rentals
- `collateralLimit`: Max concurrent rentals allowed
- `status`: Account standing (active/suspended)
- `submittedListings`: Games they've listed

**Staff (extends User):**
- `title`: Job role (e.g., "Store Manager")
- `permissions`: Array of granted permissions

### Game Model
Stores game catalog from RAWG API:
- Basic info: title, slug, description
- Metadata: rating, metacritic score, release date
- Media: background image, screenshots array
- Categorization: platforms, genres, tags
- Stats: playtime, ratings count, suggestions count

### Listing Model
Represents a specific game copy available for rent:
- `game`: Reference to Game document
- `owner`: Reference to Customer who owns it
- `platform`: Console/PC platform
- `condition`: new, good, fair
- `pricePerPeriod`: Rental cost (14-day period)
- `status`: available, rented, unavailable
- `location`: Physical location of game

### Rental Model
Tracks rental transactions:
- `listing`: Reference to Listing being rented
- `renter`: Reference to Customer renting it
- `rentalDate`: Start date
- `dueDate`: Expected return date (14 days from rental)
- `returnDate`: Actual return date (null if ongoing)
- `amountCharged`: Base rental fee
- `lateFeesAccrued`: Calculated late fees
- `status`: ongoing, returned, late

### Payment Model (Discriminator Pattern)
Base payment ledger with discriminators:
- **RentalPayment:** Links to rental, tracks rental fees and late charges
- Payments are simulated for now; the model is set up for a Stripe or other payment gateway integration

---

## Architecture Highlights

### Discriminator Inheritance
Uses Mongoose discriminators for polymorphic data models:
- **User, extended by Customer and Staff:** Shared authentication, specialized fields
- **Payment, extended by RentalPayment:** Other payment types can be added later

### Service Layer Pattern
Business logic lives in services, separate from the routes:
- `authService.js`: User registration, login, token refresh
- `rawgService.js`: RAWG API integration, game syncing
- `rentalService.js`: Rental creation, return processing, late fee calculations
- `cacheService.js`: Redis caching operations

### Middleware Stack
- `auth.js`: JWT validation and user extraction
- `requireRole.js`: Role-based route protection
- `rateLimit.js`: Redis-backed rate limiting
- Error handling middleware for consistent responses

### Frontend Architecture
- **Context API:** Global auth state management
- **API Client:** Centralized Axios instance with token refresh interceptors
- **Protected Routes:** Admin layout guards staff-only pages
- **Reusable Components:** Button, Card, Input, LoadingSpinner, Navbar

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- RAWG API key (free at [rawg.io](https://rawg.io/apidocs))

### Backend Setup
```bash
cd mongo-express
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB, Redis, and RAWG credentials

# Seed database with 200 games and sample data
npm run seed -- --refresh

# Start API server (port 3003)
npm run dev
```

### Frontend Setup
```bash
cd nextjs-mongo-redis-express-frontend
npm install

# Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:3003" > .env.local

# Start Next.js dev server (port 3000)
npm run dev
```

### Test Accounts
**Staff Account:**
- Email: `staff@gamerentals.dev`
- Password: `StaffPass123!`

**Customer Accounts:**
- Email: `ari@gamerentals.dev` / Password: `Password123!`
- Email: `bailey@gamerentals.dev` / Password: `Password123!`
- Email: `cass@gamerentals.dev` / Password: `Password123!`

---

## API Documentation

Interactive Swagger documentation available at:
```
http://localhost:3003/api/docs
```

### Key Endpoints

**Authentication:**
- `POST /api/auth/register`: Create new user
- `POST /api/auth/login`: Login and receive tokens
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/logout`: Invalidate tokens

**Games:**
- `GET /api/games`: Browse games with filters
- `GET /api/games/:id`: Get game details
- `POST /api/games/sync`: Sync from RAWG (staff only)

**Listings:**
- `GET /api/listings`: View all listings with filters
- `POST /api/listings`: Create new listing (customer only)
- `GET /api/listings/mine`: View own listings
- `PATCH /api/listings/:id/status`: Update listing status

**Rentals:**
- `GET /api/rentals`: View rentals (mine or all for staff)
- `POST /api/rentals`: Create new rental
- `POST /api/rentals/:id/return`: Process return with late fees

---

## Technical Challenges & Solutions

### Challenge 1: Managing Game Availability
**Problem:** Multiple copies of the same game needed independent availability tracking.  
**Solution:** Separated Game (catalog entry) from Listing (specific copy). Each game can have several listings with different owners, conditions and prices. An aggregation pipeline calculates the `availableListings` count and `minPrice` in real time.

### Challenge 2: Late Fee Calculation
**Problem:** A late fee is charged for each day past the due date, at a flat 10% of the rental price per day, and a renter must never be charged twice.  
**Solution:** Store `amountCharged` (original fee) and `lateFeesAccrued` separately. Calculate late fees on return using `(daysLate × 10% × pricePerPeriod)`. Rental status tracks 'ongoing' vs 'returned' to prevent re-processing.

### Challenge 3: Role-Based Access
**Problem:** Different permissions for customers, staff, and unauthenticated users.  
**Solution:** Mongoose discriminators for User model with userType field. Middleware `requireRole(['Customer', 'Staff'])` protects routes. Frontend guards admin pages with useAuth context checks.

### Challenge 4: Token Security
**Problem:** JWTs needed a way to be refreshed without weakening security.  
**Solution:** Two tokens: a short-lived access token and a long-lived refresh token. Axios interceptors refresh expired tokens automatically, and logged-out tokens go on a Redis blacklist.

---

## Future Enhancements

- [ ] **Payment Integration:** Replace fictional payments with Stripe/WiPay
- [ ] **Review System:** Let renters rate games and owners
- [ ] **Notification System:** Email/SMS reminders for due dates
- [ ] **Search Optimization:** Elasticsearch for faster game discovery
- [ ] **Image Uploads:** Allow custom game/profile images
- [ ] **Analytics Dashboard:** Rental trends, revenue reports for staff
- [ ] **Mobile App:** React Native companion app
- [ ] **Social Features:** Friend lists, recommendations, wishlists

---

## Performance Metrics

- **API Response Time:** <100ms (cached), <500ms (uncached)
- **Database Size:** 200 games, 180 listings (10 copies per game)
- **Redis Hit Rate:** ~85% for game catalog queries
- **Concurrent Users:** Tested with 50+ simultaneous requests

---

## Lessons Learned

1. **Discriminators:** Mongoose discriminators gave clean polymorphic models without complex joins
2. **Service layer:** Separating business logic from routes made testing and debugging much easier
3. **Redis caching:** 5x improvement in response times for frequently accessed game data
4. **TypeScript:** Type checking on the frontend caught many bugs during development
5. **Seed data:** 200 seeded games gave more realistic test scenarios than a minimal dataset would

---

## Contact & Links

**Developer:** Nicholas Smith  
**Email:** nicosmith.smith3@gmail.com  
**GitHub:** [\[GitHub Profile\]](https://github.com/firepenguindisopanda?tab=repositories)  
**LinkedIn:** [[LinkedIn](https://www.linkedin.com/in/nicholas-smith-933125148/)]  
**Portfolio:** [\[Portfolio URL\]](https://portfolio-website-11217.web.app/)
