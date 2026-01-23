import prisma from '../utils/prisma.js';

/**
 * Get all polls (recent polls list)
 * @route GET /api/polls
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllPolls = async (req, res) => {
    try {
        const polls = await prisma.poll.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to 50 most recent polls
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

        // Calculate total votes for each poll
        const pollsWithStats = polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
            const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
            return {
                id: poll.id,
                question: poll.question,
                voteId: poll.voteId,
                resultsId: poll.resultsId,
                createdAt: poll.createdAt,
                expiresAt: poll.expiresAt,
                chartType: poll.chartType,
                totalVotes: totalVotes,
                optionCount: poll.options.length,
                status: isExpired ? 'Expired' : 'Active',
            };
        });

        return res.status(200).json({
            polls: pollsWithStats,
            total: pollsWithStats.length,
        });
    } catch (error) {
        console.error('Error fetching polls:', error);
        return res.status(500).json({
            error: 'Internal server error while fetching polls',
        });
    }
};

/**
 * Get polls created by the authenticated user
 * @route GET /api/my-polls
 */
export const getMyPolls = async (req, res) => {
    try {
        const userId = req.user.id;

        const polls = await prisma.poll.findMany({
            where: {
                creatorId: userId,
            },
            orderBy: {
                createdAt: 'desc',
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

        const pollsWithStats = polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
            const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
            return {
                id: poll.id,
                question: poll.question,
                voteId: poll.voteId,
                resultsId: poll.resultsId,
                createdAt: poll.createdAt,
                expiresAt: poll.expiresAt,
                chartType: poll.chartType,
                totalVotes: totalVotes,
                optionCount: poll.options.length,
                status: isExpired ? 'Expired' : 'Active',
                canEdit: totalVotes === 0,
            };
        });

        return res.status(200).json({
            polls: pollsWithStats,
            total: pollsWithStats.length,
        });
    } catch (error) {
        console.error('Error fetching user polls:', error);
        return res.status(500).json({
            error: 'Internal server error while fetching your polls',
        });
    }
};

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
                creatorId: req.user?.id || null, // Link to creator if authenticated
                expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
                chartType: req.body.chartType || 'pie',
                allowMultiple: req.body.allowMultiple || false,
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
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll not found',
            });
        }

        // Check if poll is expired
        const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

        // Calculate total votes
        const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);

        // Return poll data with voteCount set to 0 for all options (hide actual votes)
        const response = {
            id: poll.id,
            question: poll.question,
            voteId: poll.voteId,
            resultsId: poll.resultsId,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            isExpired: isExpired,
            allowMultiple: poll.allowMultiple,
            totalVotes: totalVotes,
            creator: poll.creator ? {
                name: poll.creator.name,
            } : null,
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
 */
export const castVote = async (req, res) => {
    try {
        const { optionId } = req.params;
        const { voteId } = req.body;

        if (!voteId || !optionId) {
            return res.status(400).json({
                error: 'voteId and optionId are required',
            });
        }

        const poll = await prisma.poll.findUnique({
            where: { voteId },
            include: { options: true },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll not found or invalid voteId',
            });
        }

        const selectedOption = poll.options.find(opt => opt.id === optionId);
        if (!selectedOption) {
            return res.status(400).json({
                error: 'Option does not belong to this poll',
            });
        }

        const updatedOption = await prisma.option.update({
            where: { id: optionId },
            data: { voteCount: selectedOption.voteCount + 1 },
        });

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


/**
 * Get poll results by resultsId
 * @route GET /api/results/:resultsId
 */
export const getPollResults = async (req, res) => {
    try {
        const { resultsId } = req.params;

        if (!resultsId) {
            return res.status(400).json({
                error: 'Results ID is required',
            });
        }

        const poll = await prisma.poll.findUnique({
            where: { resultsId },
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
                error: 'Poll results not found',
            });
        }

        const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);

        // Check if poll is expired
        const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
        let status = 'Active';
        if (isExpired) {
            status = 'Expired';
        } else if (totalVotes === 0) {
            status = 'No votes yet';
        }

        const response = {
            id: poll.id,
            question: poll.question,
            totalVotes,
            status,
            chartType: poll.chartType || 'pie',
            expiresAt: poll.expiresAt,
            createdAt: poll.createdAt,
            options: poll.options.map(option => ({
                id: option.id,
                text: option.text,
                voteCount: option.voteCount,
                percentage: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0,
            })),
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching poll results:', error);
        return res.status(500).json({
            error: 'Internal server error while fetching results',
        });
    }
};

/**
 * Update an existing poll
 * @route PUT /api/polls/:resultsId
 */
export const updatePoll = async (req, res) => {
    try {
        const { resultsId } = req.params;
        const { question, options, expiresAt, chartType } = req.body;

        // Find the poll by resultsId
        const existingPoll = await prisma.poll.findUnique({
            where: { resultsId },
            include: { options: true },
        });

        if (!existingPoll) {
            return res.status(404).json({
                error: 'Poll not found',
            });
        }

        // Check ownership - only creator can edit their polls
        if (existingPoll.creatorId && req.user?.id !== existingPoll.creatorId) {
            return res.status(403).json({
                error: 'You are not authorized to edit this poll',
            });
        }

        // Check if poll has votes - only allow editing question/options if no votes cast
        const totalVotes = existingPoll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
        if (totalVotes > 0 && (question || options)) {
            return res.status(403).json({
                error: 'Cannot edit question or options after votes have been cast. You can still update expiration date and chart type.',
            });
        }

        // Validate new data if provided
        const updatedQuestion = question ? question.trim() : existingPoll.question;

        let updatedOptions = existingPoll.options;
        if (options && Array.isArray(options)) {
            const validOptions = options.filter(opt => opt && opt.trim().length > 0);

            // Check for duplicates
            const uniqueOptions = [...new Set(validOptions.map(opt => opt.trim().toLowerCase()))];
            if (uniqueOptions.length !== validOptions.length) {
                return res.status(400).json({
                    error: 'Duplicate options are not allowed',
                });
            }

            // Delete old options and create new ones
            await prisma.option.deleteMany({
                where: { pollId: existingPoll.id },
            });

            updatedOptions = validOptions.map(text => ({ text: text.trim() }));
        }

        // Update poll
        const updatedPoll = await prisma.poll.update({
            where: { id: existingPoll.id },
            data: {
                question: updatedQuestion,
                expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existingPoll.expiresAt,
                chartType: chartType || existingPoll.chartType,
                ...(options && {
                    options: {
                        create: updatedOptions,
                    },
                }),
            },
            include: {
                options: true,
            },
        });

        return res.status(200).json({
            id: updatedPoll.id,
            voteId: updatedPoll.voteId,
            resultsId: updatedPoll.resultsId,
            question: updatedPoll.question,
            options: updatedPoll.options.map(opt => ({
                id: opt.id,
                text: opt.text,
            })),
            message: 'Poll updated successfully',
        });
    } catch (error) {
        console.error('Error updating poll:', error);
        return res.status(500).json({
            error: 'Internal server error while updating poll',
        });
    }
};

/**
 * Delete a poll
 * @route DELETE /api/polls/:resultsId
 */
export const deletePoll = async (req, res) => {
    try {
        const { resultsId } = req.params;

        // Find the poll
        const poll = await prisma.poll.findUnique({
            where: { resultsId },
            include: { options: true },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll not found',
            });
        }

        // Check ownership - only creator can delete their polls
        if (poll.creatorId && req.user?.id !== poll.creatorId) {
            return res.status(403).json({
                error: 'You are not authorized to delete this poll',
            });
        }

        // Delete the poll (options will be cascade deleted due to schema)
        await prisma.poll.delete({
            where: { id: poll.id },
        });

        return res.status(200).json({
            message: 'Poll deleted successfully',
            deletedPollId: poll.id,
        });
    } catch (error) {
        console.error('Error deleting poll:', error);
        return res.status(500).json({
            error: 'Internal server error while deleting poll',
        });
    }
};
