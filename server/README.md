# Campus Poll - Backend

## Overview

The backend API for Campus Poll, a quick polling application that allows users to create polls, vote, and view results without requiring authentication.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: JavaScript/TypeScript (optional)

## Project Structure

```
server/
├── controllers/       # Request handlers and business logic
├── middlewares/      # Custom middleware (rate limiting, validation, etc.)
├── routes/           # API route definitions
├── utils/            # Helper functions and utilities
├── prisma/           # Prisma schema and migrations
├── package.json      # Dependencies and scripts
└── server.js         # Application entry point
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Dependencies

### Production Dependencies

| Package                | Version | Purpose                                                            |
| ---------------------- | ------- | ------------------------------------------------------------------ |
| `express`              | ^4.18.2 | Fast, minimalist web framework for Node.js                         |
| `@prisma/client`       | ^5.6.0  | Auto-generated database client for type-safe queries               |
| `@paralleldrive/cuid2` | ^2.2.2  | Secure, collision-resistant ID generator (used for poll/admin IDs) |
| `cors`                 | ^2.8.5  | Enable Cross-Origin Resource Sharing for frontend access           |
| `dotenv`               | ^16.3.1 | Load environment variables from .env file                          |
| `express-rate-limit`   | ^7.1.5  | Rate limiting middleware to prevent vote spam                      |
| `helmet`               | ^7.1.0  | Security middleware that sets various HTTP headers                 |
| `morgan`               | ^1.10.0 | HTTP request logger for debugging and monitoring                   |

### Development Dependencies

| Package   | Version | Purpose                                                |
| --------- | ------- | ------------------------------------------------------ |
| `prisma`  | ^5.6.0  | Prisma CLI for migrations and database management      |
| `nodemon` | ^3.0.1  | Auto-restart server on file changes during development |

### Installing Dependencies

All dependencies are already listed in `package.json`. To install:

```bash
cd server
npm install
```

### Dependency Explanations

**Why @paralleldrive/cuid2?**

- Generates collision-resistant IDs that are URL-safe
- More secure than simple UUIDs for public-facing URLs
- Used for `voteId` (voting link) and `adminId` (results link)

**Why express-rate-limit?**

- Prevents abuse by limiting requests from a single IP
- Critical for vote endpoint to prevent poll manipulation
- Configurable window and max request limits

**Why helmet?**

- Sets security-related HTTP headers automatically
- Protects against common vulnerabilities (XSS, clickjacking, etc.)
- Production-ready security with minimal configuration

**Why morgan?**

- Logs all HTTP requests with timestamps
- Helps debug API issues during development
- Can be configured for different log formats in production

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/campus_poll?schema=public"

# Server
PORT=5000
NODE_ENV=development


```

### 3. Database Setup

#### Step 1: Generate Prisma Client

```bash
npm run db:generate
# or
npx prisma generate
```

This creates the type-safe Prisma Client based on your schema.

#### Step 2: Push Schema to Database (Development)

```bash
npm run db:push
# or
npx prisma db push
```

This syncs your schema with the database without creating migration files. Good for rapid prototyping.

#### Step 3: Create Migration (Production-Ready)

```bash
npm run db:migrate
# or
npx prisma migrate dev --name init
```

This creates a migration file and applies it. Use this for production workflows.

#### Step 4: View Database (Optional)

```bash
npm run db:studio
# or
npx prisma studio
```

Opens Prisma Studio in your browser to view and edit data visually.

**Available Database Scripts:**

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (no migration files)
- `npm run db:migrate` - Create and run migrations
- `npm run db:reset` - Reset database and re-run all migrations
- `npm run db:studio` - Open Prisma Studio GUI

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Poll Management

#### Create Poll

```http
POST /api/polls
Content-Type: application/json

{
  "question": "Where should we get food?",
  "options": ["Pizza", "Sushi", "Burgers", "Tacos"]
}

Response: 201 Created
{
  "id": "clhx1234abcd5678efgh",
  "voteId": "xyz123abc",
  "resultsId": "results789xyz",
  "votingUrl": "/poll/xyz123abc",
  "resultsUrl": "/results/results789xyz"
}
```

#### Get Poll (for Voting)

```http
GET /api/poll/:voteId

Response: 200 OK
{
  "id": "clhx1234abcd5678efgh",
  "question": "Where should we get food?",
  "options": [
    { "id": "opt1abc", "text": "Pizza", "voteCount": 0 },
    { "id": "opt2def", "text": "Sushi", "voteCount": 0 },
    { "id": "opt3ghi", "text": "Burgers", "voteCount": 0 },
    { "id": "opt4jkl", "text": "Tacos", "voteCount": 0 }
  ]
}
```

Note: Returns voteCount as 0 to voters (actual counts hidden until they view results)

#### Update Poll

```http
PUT /api/polls/:resultsId
Content-Type: application/json

{
  "question": "Updated question text?",
  "options": ["New Option 1", "New Option 2", "New Option 3"]
}

Response: 200 OK
{
  "id": "clhx1234abcd5678efgh",
  "voteId": "xyz123abc",
  "resultsId": "results789xyz",
  "question": "Updated question text?",
  "options": [
    { "id": "opt5new", "text": "New Option 1" },
    { "id": "opt6new", "text": "New Option 2" },
    { "id": "opt7new", "text": "New Option 3" }
  ],
  "message": "Poll updated successfully"
}

Response: 403 Forbidden (if poll has votes)
{
  "error": "Cannot edit poll that has received votes"
}
```

Note: Both question and options are optional. Can update either or both. Poll cannot be edited after votes are cast.

#### Delete Poll

```http
DELETE /api/polls/:resultsId

Response: 200 OK
{
  "message": "Poll deleted successfully",
  "deletedPollId": "clhx1234abcd5678efgh"
}

Response: 404 Not Found
{
  "error": "Poll not found"
}
```

Note: Deletes the poll and all associated options (cascade delete). Can delete at any time, even after votes are cast.

#### Cast Vote

```http
POST /api/vote/:optionId
Content-Type: application/json

{
  "voteId": "xyz123abc"
}

Response: 200 OK
{
  "success": true,
  "message": "Vote recorded successfully",
  "voteCount": 1
}
```

Note: Rate limited to prevent spam (10 votes per 15 minutes per IP)

#### Get Results

```http
GET /api/results/:resultsId

Response: 200 OK
{
  "id": "clhx1234abcd5678efgh",
  "question": "Where should we get food?",
  "totalVotes": 42,
  "createdAt": "2025-11-14T10:30:00.000Z",
  "options": [
    { "id": "opt1abc", "text": "Pizza", "voteCount": 15 },
    { "id": "opt2def", "text": "Sushi", "voteCount": 10 },
    { "id": "opt3ghi", "text": "Burgers", "voteCount": 12 },
    { "id": "opt4jkl", "text": "Tacos", "voteCount": 5 }
  ]
}
```

## Database Schema

### Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Poll {
  id          String   @id @default(cuid())
  question    String
  voteId      String   @unique @default(cuid())  // Unique ID for voting link
  resultsId   String   @unique @default(cuid())  // Unique ID for results link
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  options     Option[]

  @@map("polls")
}

model Option {
  id        String   @id @default(cuid())
  text      String
  voteCount Int      @default(0)
  pollId    String
  poll      Poll     @relation(fields: [pollId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@map("options")
}
```

### Schema Explanation

**Poll Model:**

- `id`: Primary key using CUID (collision-resistant unique identifier)
- `question`: The poll question text
- `voteId`: Unique identifier for the public voting URL (e.g., `/poll/xyz123`)
- `resultsId`: Unique identifier for the results URL (e.g., `/results/abc987`)
- `createdAt`: Timestamp when poll was created
- `updatedAt`: Automatically updated timestamp on any change
- `options`: One-to-many relationship with Option model
- `@@map("polls")`: Maps to "polls" table in database

**Option Model:**

- `id`: Primary key using CUID
- `text`: The option text (e.g., "Pizza", "Sushi")
- `voteCount`: Number of votes for this option (defaults to 0)
- `pollId`: Foreign key linking to parent Poll
- `poll`: Relation field to access parent Poll
- `onDelete: Cascade`: When a poll is deleted, all its options are automatically deleted
- `createdAt`: Timestamp when option was created
- `@@map("options")`: Maps to "options" table in database

**Key Design Decisions:**

1. **CUID vs UUID**: Using `cuid()` instead of `uuid()` for better security and URL-friendliness
2. **Separate IDs**: `voteId` for public voting, `resultsId` for results viewing (prevents guessing)
3. **Cascade Delete**: Ensures orphaned options are automatically cleaned up
4. **Table Mapping**: Using `@@map()` for conventional plural table names
5. **voteCount**: Stored directly in Option model for fast retrieval (denormalized for performance)

#

**Testing the Schema:**

After creating the schema, validate it:

```bash
# Check for syntax errors
npx prisma validate

# Format the schema file
npx prisma format

# Generate client to catch any issues
npx prisma generate
```

## Development Guidelines

### Code Organization

1. **Controllers**: Place all business logic in `controllers/` directory

   - `pollController.js` - Poll creation and retrieval
   - `voteController.js` - Vote handling
   - `resultsController.js` - Results retrieval

2. **Routes**: Define API routes in `routes/` directory

   - `pollRoutes.js` - Poll-related endpoints
   - `voteRoutes.js` - Voting endpoints
   - `resultsRoutes.js` - Results endpoints

3. **Middleware**: Create reusable middleware in `middlewares/` directory

   - `rateLimiter.js` - Rate limiting for vote endpoint
   - `validatePoll.js` - Poll data validation
   - `errorHandler.js` - Centralized error handling

4. **Utils**: Add helper functions in `utils/` directory
   - `idGenerator.js` - Generate unique IDs
   - `validators.js` - Data validation helpers

### Coding Standards

- Use meaningful variable and function names
- Add JSDoc comments for all functions
- Handle errors gracefully with try-catch blocks
- Use async/await for asynchronous operations
- Return consistent response formats

### Example Controller Structure

```javascript
/**
 * Create a new poll
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    // Validation
    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        error: "Question and at least 2 options required",
      });
    }

    // Business logic here

    res.status(201).json({
      /* response data */
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Internal server error" });
  }





## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)


```
