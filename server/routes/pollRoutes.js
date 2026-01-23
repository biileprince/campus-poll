import express from 'express';
import { getAllPolls, getMyPolls, createPoll, getPollByVoteId, castVote, getPollResults, updatePoll, deletePoll } from '../controllers/pollController.js';
import { createPollLimiter, voteLimiter, resultsLimiter } from '../middlewares/rateLimiter.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';
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

// GET /api/polls - Get all polls (list)
router.get('/polls', getAllPolls);

// GET /api/my-polls - Get polls created by authenticated user
router.get('/my-polls', protect, getMyPolls);

// POST /api/polls - Create a new poll (optionally authenticated)
router.post('/polls', createPollLimiter, optionalAuth, validateCreatePoll, createPoll);

// PUT /api/polls/:resultsId - Update a poll (only if no votes cast, owner only)
router.put('/polls/:resultsId', createPollLimiter, optionalAuth, validateUpdatePoll, updatePoll);

// DELETE /api/polls/:resultsId - Delete a poll (owner only)
router.delete('/polls/:resultsId', createPollLimiter, optionalAuth, validateDeletePoll, deletePoll);

// GET /api/poll/:voteId - Get poll for voting
router.get('/poll/:voteId', validateGetPoll, getPollByVoteId);



// POST /api/vote/:optionId - Cast a vote for an option 
router.post('/vote/:optionId', voteLimiter, validateCastVote, castVote);

// GET /api/results/:resultsId - Get poll results
router.get('/results/:resultsId', resultsLimiter, validateGetResults, getPollResults);

export default router;
