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

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Poll ID
 *         question:
 *           type: string
 *           description: Poll question
 *         voteId:
 *           type: string
 *           description: Unique voting ID
 *         resultsId:
 *           type: string
 *           description: Unique results ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         allowMultiple:
 *           type: boolean
 *         isExpired:
 *           type: boolean
 *         totalVotes:
 *           type: integer
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *         creator:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *           nullable: true
 *     Option:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         text:
 *           type: string
 *         voteCount:
 *           type: integer
 *     CreatePollRequest:
 *       type: object
 *       required:
 *         - question
 *         - options
 *       properties:
 *         question:
 *           type: string
 *           minLength: 5
 *           example: "What's your favorite programming language?"
 *         options:
 *           type: array
 *           minItems: 2
 *           maxItems: 10
 *           items:
 *             type: string
 *           example: ["JavaScript", "Python", "Java", "TypeScript"]
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-12-31T23:59:59Z"
 *         allowMultiple:
 *           type: boolean
 *           default: false
 *           example: false
 */

/**
 * @swagger
 * /polls:
 *   get:
 *     summary: Get all polls
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: List of polls retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePollRequest'
 *     responses:
 *       201:
 *         description: Poll created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 voteId:
 *                   type: string
 *                 resultsId:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/polls - Get all polls (list)
router.get('/polls', getAllPolls);

/**
 * @swagger
 * /my-polls:
 *   get:
 *     summary: Get polls created by authenticated user
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's polls retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/my-polls - Get polls created by authenticated user
router.get('/my-polls', protect, getMyPolls);

// POST /api/polls - Create a new poll (optionally authenticated)
router.post('/polls', createPollLimiter, optionalAuth, validateCreatePoll, createPoll);

// PUT /api/polls/:resultsId - Update a poll (only if no votes cast, owner only)
router.put('/polls/:resultsId', createPollLimiter, optionalAuth, validateUpdatePoll, updatePoll);

// DELETE /api/polls/:resultsId - Delete a poll (owner only)
router.delete('/polls/:resultsId', createPollLimiter, optionalAuth, validateDeletePoll, deletePoll);

/**
 * @swagger
 * /poll/{voteId}:
 *   get:
 *     summary: Get poll for voting
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *         description: The poll's voting ID
 *     responses:
 *       200:
 *         description: Poll retrieved for voting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Poll not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/poll/:voteId - Get poll for voting
router.get('/poll/:voteId', validateGetPoll, getPollByVoteId);

/**
 * @swagger
 * /vote/{optionId}:
 *   post:
 *     summary: Cast a vote for an option
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The option ID to vote for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voteId
 *             properties:
 *               voteId:
 *                 type: string
 *                 description: The poll's voting ID
 *     responses:
 *       200:
 *         description: Vote cast successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vote recorded successfully"
 *       400:
 *         description: Invalid vote or poll expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Poll or option not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded  
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/vote/:optionId - Cast a vote for an option 
router.post('/vote/:optionId', voteLimiter, validateCastVote, castVote);

/**
 * @swagger
 * /results/{resultsId}:
 *   get:
 *     summary: Get poll results
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: resultsId
 *         required: true
 *         schema:
 *           type: string
 *         description: The poll's results ID
 *     responses:
 *       200:
 *         description: Poll results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Poll not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/results/:resultsId - Get poll results
router.get('/results/:resultsId', resultsLimiter, validateGetResults, getPollResults);

export default router;
