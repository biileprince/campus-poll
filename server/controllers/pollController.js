import prisma from '../utils/prisma.js';

/**
 * Create a new poll with options
 * @route POST /api/polls
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createPoll = async (req, res) => {
    try {
        const { question, options } = req.body;

        // Validation
        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                error: 'Question is required and must be a string',
            });
        }

        if (!options || !Array.isArray(options)) {
            return res.status(400).json({
                error: 'Options are required and must be an array',
            });
        }

        if (options.length < 2) {
            return res.status(400).json({
                error: 'At least 2 options are required',
            });
        }

        if (options.length > 10) {
            return res.status(400).json({
                error: 'Maximum 10 options allowed',
            });
        }

        // Filter out empty options and validate
        const validOptions = options.filter(opt => opt && opt.trim().length > 0);

        if (validOptions.length < 2) {
            return res.status(400).json({
                error: 'At least 2 non-empty options are required',
            });
        }

        // Check for duplicate options
        const uniqueOptions = [...new Set(validOptions.map(opt => opt.trim().toLowerCase()))];
        if (uniqueOptions.length !== validOptions.length) {
            return res.status(400).json({
                error: 'Duplicate options are not allowed',
            });
        }

        // Create poll with options using Prisma transaction
        const poll = await prisma.poll.create({
            data: {
                question: question.trim(),
                options: {
                    create: validOptions.map(text => ({
                        text: text.trim(),
                    })),
                },
            },
            include: {
                options: true,
            },
        });

        // Construct response
        const response = {
            id: poll.id,
            voteId: poll.voteId,
            resultsId: poll.resultsId,
            votingUrl: `/poll/${poll.voteId}`,
            resultsUrl: `/results/${poll.resultsId}`,
        };

        return res.status(201).json(response);
    } catch (error) {
        console.error('Error creating poll:', error);
        return res.status(500).json({
            error: 'Internal server error while creating poll',
        });
    }
};

/**
 * Get poll by voteId for voting
 * @route GET /api/poll/:voteId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPollByVoteId = async (req, res) => {
    try {
        const { voteId } = req.params;

        if (!voteId) {
            return res.status(400).json({
                error: 'Vote ID is required',
            });
        }

        // Find poll by voteId
        const poll = await prisma.poll.findUnique({
            where: {
                voteId: voteId,
            },
            include: {
                options: {
                    select: {
                        id: true,
                        text: true,
                        voteCount: true,
                    },
                },
            },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll not found',
            });
        }

        // Return poll data with voteCount set to 0 for all options (hide actual votes)
        const response = {
            id: poll.id,
            question: poll.question,
            options: poll.options.map(option => ({
                id: option.id,
                text: option.text,
                voteCount: 0, // Hide vote counts from voters
            })),
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching poll:', error);
        return res.status(500).json({
            error: 'Internal server error while fetching poll',
        });
    }
};

/**
 * Cast a vote for an option
 * @route POST /api/vote/:optionId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const castVote = async (req, res) => {
    try {
        const { optionId } = req.params;
        const { voteId } = req.body;

        // Validate request
        if (!voteId) {
            return res.status(400).json({
                error: 'voteId is required',
            });
        }

        if (!optionId) {
            return res.status(400).json({
                error: 'optionId is required',
            });
        }

        // 1. Find the poll using the voteId
        const poll = await prisma.poll.findUnique({
            where: { voteId },
            include: { options: true },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll not found or invalid voteId',
            });
        }

        // 2. Ensure the selected option belongs to this poll
        const selectedOption = poll.options.find(opt => opt.id === optionId);

        if (!selectedOption) {
            return res.status(400).json({
                error: 'Option does not belong to this poll',
            });
        }

        // 3. Increment the vote count with Prisma
        const updatedOption = await prisma.option.update({
            where: { id: optionId },
            data: { voteCount: selectedOption.voteCount + 1 },
        });

        // 4. Send the response
        return res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            voteCount: updatedOption.voteCount,
        });
    } catch (error) {
        console.error('Error casting vote:', error);
        return res.status(500).json({
            error: 'Internal server error while casting vote',
        });
    }
};