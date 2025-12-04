import express from 'express';
import { createPoll, getPollByVoteId, castVote, getPollResults, updatePoll, deletePoll } from '../controllers/pollController.js';
import { createPollLimiter, voteLimiter, resultsLimiter } from '../middlewares/rateLimiter.js';
import {
    validateCreatePoll,
    validateGetPoll,
    validateSubmitVote,
    validateGetResults,
    validateCastVote,
    validateUpdatePoll,
    validateDeletePoll
} from '../middlewares/validator.js';

const router = express.Router();

// POST /api/polls - Create a new poll
router.post('/polls', createPollLimiter, validateCreatePoll, createPoll);

// PUT /api/polls/:resultsId - Update a poll (only if no votes cast)
router.put('/polls/:resultsId', createPollLimiter, validateUpdatePoll, updatePoll);

// DELETE /api/polls/:resultsId - Delete a poll
router.delete('/polls/:resultsId', createPollLimiter, validateDeletePoll, deletePoll);

// GET /api/poll/:voteId - Get poll for voting
router.get('/poll/:voteId', validateGetPoll, getPollByVoteId);



// POST /api/vote/:optionId - Cast a vote for an option 
router.post('/vote/:optionId', voteLimiter, validateCastVote, castVote);

// GET /api/results/:resultsId - Get poll results
router.get('/results/:resultsId', resultsLimiter, validateGetResults, getPollResults);

export default router;
