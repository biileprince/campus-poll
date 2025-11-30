# API Integration Documentation

## Overview
This document outlines the complete API integration implementation for the Campus Poll application, including services, error handling, and loading states.

## Project Structure

```
src/
├── components/
│   ├── CreatePoll.jsx      # Poll creation component
│   ├── VotePoll.jsx        # Voting component
│   └── PollResults.jsx     # Results display component
├── hooks/
│   └── useApi.js           # Custom hooks for API calls
├── services/
│   └── api.js              # API service layer
├── utils/
│   └── errorHandler.js     # Error handling utilities
└── .env                    # Environment variables
```

## API Endpoints

### Backend Routes (Server)
- `POST /api/polls` - Create a new poll
- `GET /api/poll/:voteId` - Get poll for voting
- `POST /api/poll/:voteId/vote` - Submit a vote
- `GET /api/results/:resultsId` - Get poll results

### Frontend API Functions
- `createPoll(pollData)` - Create a new poll
- `getPoll(voteId)` - Fetch poll data for voting
- `submitVote(voteId, optionId)` - Submit a vote
- `getPollResults(resultsId)` - Get poll results

## Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Usage Examples

### 1. Creating a Poll

```jsx
import { useCreatePoll } from '../hooks/useApi';

const MyComponent = () => {
  const { data, loading, error, execute } = useCreatePoll();

  const handleCreate = async () => {
    try {
      const result = await execute({
        question: "What's your favorite color?",
        options: ["Red", "Blue", "Green"]
      });
      console.log('Poll created:', result);
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Creating...' : 'Create Poll'}
    </button>
  );
};
```

### 2. Voting on a Poll

```jsx
import { useGetPoll, useSubmitVote } from '../hooks/useApi';

const VoteComponent = ({ voteId }) => {
  const { data: poll, execute: fetchPoll } = useGetPoll();
  const { loading, execute: submitVote } = useSubmitVote();

  useEffect(() => {
    fetchPoll(voteId);
  }, [voteId]);

  const handleVote = async (optionId) => {
    try {
      await submitVote(voteId, optionId);
      alert('Vote submitted!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h3>{poll?.question}</h3>
      {poll?.options.map(option => (
        <button 
          key={option.id} 
          onClick={() => handleVote(option.id)}
          disabled={loading}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};
```

### 3. Viewing Results

```jsx
import { useGetResults } from '../hooks/useApi';

const ResultsComponent = ({ resultsId }) => {
  const { data: results, loading, error, execute } = useGetResults();

  useEffect(() => {
    execute(resultsId);
  }, [resultsId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>{results?.question}</h3>
      <p>Total Votes: {results?.totalVotes}</p>
      {results?.options.map(option => (
        <div key={option.id}>
          {option.text}: {option.voteCount} votes ({option.percentage}%)
        </div>
      ))}
    </div>
  );
};
```

## Error Handling

The API integration includes comprehensive error handling:

- **Network errors**: Automatic detection and user-friendly messages
- **Validation errors**: Server-side validation with clear error messages
- **Loading states**: Built-in loading indicators for all API calls
- **Error recovery**: Ability to retry failed requests

## Features Implemented

✅ **Complete API Integration**
- All CRUD operations for polls
- Vote submission functionality
- Results retrieval with statistics

✅ **Error Handling + Loading States**
- Custom hooks with built-in loading states
- Comprehensive error handling utilities
- User-friendly error messages

✅ **Reusable Service Functions**
- Modular API service layer
- Axios interceptors for request/response handling
- Environment-based configuration

✅ **Environment Variables Management**
- Proper .env configuration
- Development/production environment support

## Installation & Setup

1. Install dependencies:
```bash
npm install axios
```

2. Create `.env` file with API base URL

3. Start the development server:
```bash
npm run dev
```

4. Ensure the backend server is running on port 5000

## Testing the Integration

1. **Create Poll**: Use the CreatePoll component to create a new poll
2. **Vote**: Use the returned voteId to test voting functionality
3. **Results**: Use the returned resultsId to view poll results

The App.jsx file includes a demo interface to test all API functionality.