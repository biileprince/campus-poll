import express from 'express';
import { createPoll, getPollByVoteId, submitVote, getPollResults } from '../controllers/pollController.js';

const router = express.Router();

// POST /api/polls - Create a new poll
router.post('/polls', createPoll);

// GET /api/poll/:voteId - Get poll for voting
router.get('/poll/:voteId', getPollByVoteId);

// POST /api/poll/:voteId/vote - Submit a vote
router.post('/poll/:voteId/vote', submitVote);

// GET /api/results/:resultsId - Get poll results
router.get('/results/:resultsId', getPollResults);

export default router;
