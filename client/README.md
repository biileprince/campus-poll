# Campus Poll - Frontend

## Overview

The frontend application for Campus Poll, a quick polling platform that enables users to create polls, vote, and view results with a clean, responsive interface.

## Technology Stack

- **Framework**: React 18 or 19
- **Build Tool**: Vite
- **Styling**: CSS3 (with CSS Modules or styled-components)
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios or Fetch API
- **Routing**: React Router v6

## Project Structure

```
client/
├── public/              # Static assets (favicon, images)
├── src/
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable React components
│   │   ├── common/      # Shared components (Button, Input, Card, etc.)
│   │   ├── CreatePoll/  # Poll creation components
│   │   ├── VotePage/    # Voting components
│   │   └── Results/     # Results display components
│   ├── pages/           # Page-level components
│   │   ├── CreatePollPage.jsx
│   │   ├── VotePage.jsx
│   │   └── ResultsPage.jsx
│   ├── services/        # API service functions
│   │   └── api.js
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Helper functions
│   ├── styles/          # Global styles
│   ├── App.jsx          # Root component with routing
│   ├── App.css          # Root styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global CSS
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
└── package.json         # Dependencies and scripts
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Dependencies

### Production Dependencies

| Package            | Version | Purpose                                            |
| ------------------ | ------- | -------------------------------------------------- |
| `react`            | ^18.x   | UI library for building component-based interfaces |
| `react-dom`        | ^18.x   | React renderer for web applications                |
| `react-router-dom` | ^6.x    | Client-side routing for navigation                 |
| `axios`            | ^1.x    | HTTP client for API requests                       |
| `chart.js`         | ^4.x    | Powerful charting library for visualizations       |
| `react-chartjs-2`  | ^5.x    | React wrapper for Chart.js                         |

### Development Dependencies

| Package                | Version | Purpose                         |
| ---------------------- | ------- | ------------------------------- |
| `vite`                 | ^5.x    | Fast build tool and dev server  |
| `@vitejs/plugin-react` | ^4.x    | Vite plugin for React support   |
| `eslint`               | ^8.x    | Code linting and quality checks |

### Installing Dependencies

```bash
cd client
npm install
```

### Required Installations

If not already in package.json, install these:

```bash
# Core routing
npm install react-router-dom

# HTTP client
npm install axios

# Charting
npm install chart.js react-chartjs-2
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `client/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# App Configuration
VITE_APP_TITLE="Campus Poll"
VITE_MAX_POLL_OPTIONS=10
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

### API Base URL

All API calls should use the base URL from environment variables:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Database Structure (from Backend)

The backend uses PostgreSQL with Prisma ORM. Here's the structure you'll be working with:

**Poll Object:**

```
{
  id: string,              // Unique poll identifier (CUID)
  question: string,        // The poll question
  voteId: string,          // Unique ID for voting URL
  resultsId: string,       // Unique ID for results URL
  createdAt: datetime,     // Creation timestamp
  updatedAt: datetime,     // Last update timestamp
  options: Option[]        // Array of poll options
}
```

**Option Object:**

```
{
  id: string,              // Unique option identifier (CUID)
  text: string,            // Option text
  voteCount: number,       // Number of votes (default: 0)
  pollId: string,          // Foreign key to parent poll
  createdAt: datetime      // Creation timestamp
}
```

### API Endpoints Reference

#### 1. Create Poll

- **Endpoint**: `POST /api/polls`
- **Request Body**: `{ question: string, options: string[] }`
- **Response**: `{ id, voteId, resultsId, votingUrl, resultsUrl }`
- **Use Case**: CreatePollPage component

#### 2. Get Poll (for Voting)

- **Endpoint**: `GET /api/poll/:voteId`
- **Response**: `{ id, question, options: [{ id, text, voteCount: 0 }] }`
- **Use Case**: VotePage component
- **Note**: voteCount is hidden (returns 0) until user views results

#### 3. Cast Vote

- **Endpoint**: `POST /api/vote/:optionId`
- **Request Body**: `{ voteId: string }`
- **Response**: `{ success: boolean, message: string, voteCount: number }`
- **Use Case**: VotePage component
- **Note**: Rate limited (10 votes per 15 minutes per IP)

#### 4. Get Results

- **Endpoint**: `GET /api/results/:resultsId`
- **Response**: `{ id, question, totalVotes, createdAt, options: [{ id, text, voteCount }] }`
- **Use Case**: ResultsPage component

### API Service Structure

Create `src/services/api.js` to centralize all API calls:

**Required Functions:**

- `createPoll(question, options)` - Create a new poll
- `getPoll(voteId)` - Get poll data for voting
- `castVote(optionId, voteId)` - Submit a vote
- `getResults(resultsId)` - Get poll results

**Implementation Requirements:**

- Use Axios with base URL from environment
- Handle errors gracefully with try-catch
- Return consistent response format
- Add request/response interceptors for debugging

## Form Validation

### CreatePollPage Validation

**Question:**

- Required field
- Minimum 5 characters
- Maximum 200 characters

**Options:**

- Minimum 2 options required
- Maximum 10 options allowed
- Each option: 1-100 characters
- No duplicate options
- All options must be non-empty

**Validation Timing:**

- Real-time validation on input change
- Show errors after first submission attempt
- Disable submit button if invalid

### VotePage Validation

**Vote Selection:**

- Must select one option
- Check if already voted (localStorage)
- Show error if no option selected

---

## Local Storage Usage

### Duplicate Vote Prevention

**Key:** `votedPolls`
**Value:** `["voteId1", "voteId2", "voteId3"]`

**Functions Needed:**

```
- hasVoted(voteId) → boolean
- markAsVoted(voteId) → void
- getVotedPolls() → string[]
```

**Implementation:**

- Check before showing vote form
- Save after successful vote
- Handle localStorage errors gracefully

---

## Chart.js Integration

### Installation

```bash
npm install chart.js react-chartjs-2
```

### Required Imports

Import and register Chart.js components:

- CategoryScale
- LinearScale
- BarElement
- Title
- Tooltip
- Legend

### Chart Configuration

**Data Structure:**

```
labels: [option1.text, option2.text, ...]
datasets: [{
  label: 'Votes',
  data: [option1.voteCount, option2.voteCount, ...],
  backgroundColor: color,
  borderColor: color,
  borderWidth: 1
}]
```

**Options:**

- Responsive: true
- Maintain aspect ratio
- Hide legend (optional)
- Show title with poll question

---

## Resources

### Official Documentation

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Chart.js Documentation](https://www.chartjs.org/)

### Helpful Guides

- [React Hooks Guide](https://react.dev/reference/react)
- [CSS Modules Guide](https://github.com/css-modules/css-modules)
- [Responsive Design](https://web.dev/responsive-web-design-basics/)
- [Accessibility (a11y)](https://www.w3.org/WAI/fundamentals/accessibility-intro/)

### Video Tutorials (Optional)

- React Crash Course
- Chart.js Tutorial
- React Router v6 Guide
- Vite Setup and Configuration
