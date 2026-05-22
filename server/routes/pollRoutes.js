import express from 'express';
import { getAllPolls, getMyPolls, createPoll, getPollByVoteId, castVote, submitResponse, getPollResults, updatePoll, deletePoll } from '../controllers/pollController.js';
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

// ========================
//  POLLS CRUD
// ========================

/**
 * @swagger
 * /polls:
 *   get:
 *     summary: Browse all polls
 *     description: Returns a paginated, searchable, filterable list of polls. Supports status filtering and sorting.
 *     tags: [Polls]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 50 }
 *         description: Results per page
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive search by poll question
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, active, expired] }
 *         description: Filter by poll status
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, most_votes, least_votes] }
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of polls
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPolls'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/polls', getAllPolls);

/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Create a new poll
 *     description: |
 *       Create a poll with either a simple options list (legacy) or multiple questions with different types.
 *
 *       **Legacy format:** Send `question` + `options[]`
 *       **Multi-question format:** Send `question` + `questions[{ text, type, options[] }]`
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePollRequest'
 *           examples:
 *             single_question:
 *               summary: Simple single-question poll
 *               value:
 *                 question: "What's your favorite subject?"
 *                 options: ["Math", "Science", "English"]
 *             multi_question:
 *               summary: Multi-question poll with mixed types
 *               value:
 *                 question: "Campus Feedback Survey"
 *                 questions:
 *                   - text: "Rate the cafeteria food"
 *                     type: "single"
 *                     options: ["Great", "Good", "Average", "Poor"]
 *                   - text: "Which facilities do you use?"
 *                     type: "multiple"
 *                     options: ["Library", "Gym", "Lab", "Cafeteria"]
 *                   - text: "Any suggestions for improvement?"
 *                     type: "open_ended"
 *     responses:
 *       201:
 *         description: Poll created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePollResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/polls', createPollLimiter, optionalAuth, validateCreatePoll, createPoll);

/**
 * @swagger
 * /my-polls:
 *   get:
 *     summary: Get your polls
 *     description: Returns all polls created by the authenticated user. Requires a valid JWT token.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's polls with stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 polls: { type: array, items: { $ref: '#/components/schemas/PollListItem' } }
 *                 total: { type: integer }
 *       401:
 *         description: Not authenticated
 */
router.get('/my-polls', protect, getMyPolls);

/**
 * @swagger
 * /polls/{resultsId}:
 *   put:
 *     summary: Update a poll
 *     description: Update the question, options, or expiry date. Only the poll creator can do this. If votes have been cast, only the expiry can be changed.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultsId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePollRequest'
 *     responses:
 *       200:
 *         description: Poll updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not the poll owner / poll has votes
 *       404:
 *         description: Poll not found
 */
router.put('/polls/:resultsId', createPollLimiter, optionalAuth, validateUpdatePoll, updatePoll);

/**
 * @swagger
 * /polls/{resultsId}:
 *   delete:
 *     summary: Delete a poll
 *     description: Permanently delete a poll and all its votes, questions, and responses. Only the poll creator can do this.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultsId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Poll deleted
 *       403:
 *         description: Not the poll owner
 *       404:
 *         description: Poll not found
 */
router.delete('/polls/:resultsId', createPollLimiter, optionalAuth, validateDeletePoll, deletePoll);

// ========================
//  VOTING
// ========================

/**
 * @swagger
 * /poll/{voteId}:
 *   get:
 *     summary: Get a poll for voting
 *     description: Fetch a poll by its unique vote ID. Returns the question, options (with vote counts hidden), and multi-question data if applicable.
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema: { type: string }
 *         description: The poll's unique voting ID
 *     responses:
 *       200:
 *         description: Poll data for voting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Poll not found
 */
router.get('/poll/:voteId', validateGetPoll, getPollByVoteId);

/**
 * @swagger
 * /vote/{optionId}:
 *   post:
 *     summary: Cast a vote
 *     description: Vote for a specific option in a poll. The option's vote count is incremented by 1.
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoteRequest'
 *     responses:
 *       200:
 *         description: Vote recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoteResponse'
 *       400:
 *         description: Invalid option or poll expired
 *       404:
 *         description: Poll not found
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/vote/:optionId', voteLimiter, validateCastVote, castVote);

/**
 * @swagger
 * /respond/{questionId}:
 *   post:
 *     summary: Submit an open-ended response
 *     description: Submit a text response for an open-ended question. Only works for questions with type "open_ended". Maximum 1000 characters.
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitResponseRequest'
 *     responses:
 *       201:
 *         description: Response submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Response submitted" }
 *                 response: { $ref: '#/components/schemas/Response' }
 *       400:
 *         description: Invalid question type or poll closed
 *       404:
 *         description: Question not found
 */
router.post('/respond/:questionId', voteLimiter, submitResponse);

// ========================
//  RESULTS
// ========================

/**
 * @swagger
 * /results/{resultsId}:
 *   get:
 *     summary: View poll results
 *     description: Get the full results for a poll including all option vote counts, questions, and text responses for open-ended questions.
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: resultsId
 *         required: true
 *         schema: { type: string }
 *         description: The poll's unique results ID
 *     responses:
 *       200:
 *         description: Poll results with vote counts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PollResults'
 *       404:
 *         description: Poll not found
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/results/:resultsId', resultsLimiter, validateGetResults, getPollResults);

export default router;
