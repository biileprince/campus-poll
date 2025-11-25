import express from 'express';
import { createPoll, getPollByVoteId } from '../controllers/pollController.js';

const router = express.Router();

// POST /api/polls - Create a new poll
router.post('/polls', createPoll);

// GET /api/poll/:voteId - Get poll for voting
router.get('/poll/:voteId', getPollByVoteId);

export default router;
