import prisma from '../utils/prisma.js';

/**
 * Get all polls with pagination, search, status filter, and sort
 * @route GET /api/polls?page=1&limit=12&search=keyword&status=active&sort=newest
 */
export const getAllPolls = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
        const search = req.query.search?.trim() || '';
        const statusFilter = req.query.status || 'all'; // all, active, expired
        const sortBy = req.query.sort || 'newest'; // newest, oldest, most_votes, least_votes

        // Build where clause
        const where = {};
        if (search) {
            where.question = { contains: search, mode: 'insensitive' };
        }
        // Status filter via expiry
        if (statusFilter === 'active') {
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ];
        } else if (statusFilter === 'expired') {
            where.expiresAt = { lt: new Date(), not: null };
        }

        // Determine sort order
        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };

        // Get total count for pagination
        const total = await prisma.poll.count({ where: Object.keys(where).length ? where : undefined });
        const skip = (page - 1) * limit;

        const polls = await prisma.poll.findMany({
            where: Object.keys(where).length ? where : undefined,
            orderBy,
            skip,
            take: limit,
            include: {
                options: { select: { id: true, text: true, voteCount: true } },
                questions: { select: { id: true, type: true } },
            },
        });

        let pollsWithStats = polls.map(poll => {
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
                totalVotes,
                optionCount: poll.options.length,
                questionCount: poll.questions?.length || 0,
                hasOpenEnded: poll.questions?.some(q => q.type === 'open_ended') || false,
                status: isExpired ? 'Expired' : 'Active',
            };
        });

        // Client-side sort for vote-based ordering (can't do this at DB level easily)
        if (sortBy === 'most_votes') {
            pollsWithStats.sort((a, b) => b.totalVotes - a.totalVotes);
        } else if (sortBy === 'least_votes') {
            pollsWithStats.sort((a, b) => a.totalVotes - b.totalVotes);
        }

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            polls: pollsWithStats,
            total,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        });
    } catch (error) {
        console.error('Error fetching polls:', error);
        return res.status(500).json({ error: 'Internal server error while fetching polls' });
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
 * Create a new poll — supports single-question (legacy) and multi-question format
 * @route POST /api/polls
 *
 * Legacy body: { question, options: string[], expiresAt?, allowMultiple? }
 * Multi-question body: { question, questions: [{ text, type, options: string[] }], expiresAt? }
 */
export const createPoll = async (req, res) => {
    try {
        const { question, options, questions, expiresAt, chartType, allowMultiple } = req.body;

        // Validate poll title/question
        if (!question || typeof question !== 'string' || question.trim().length < 5) {
            return res.status(400).json({ error: 'Poll question is required (at least 5 characters)' });
        }

        // Multi-question format
        if (questions && Array.isArray(questions) && questions.length > 0) {
            // Validate each question
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.text || q.text.trim().length < 3) {
                    return res.status(400).json({ error: `Question ${i + 1} is too short (at least 3 characters)` });
                }
                const type = q.type || 'single';
                if (!['single', 'multiple', 'open_ended'].includes(type)) {
                    return res.status(400).json({ error: `Question ${i + 1} has an invalid type. Use: single, multiple, or open_ended` });
                }
                // Choice-based questions need at least 2 options
                if (type !== 'open_ended') {
                    const validOpts = (q.options || []).filter(o => o && o.trim().length > 0);
                    if (validOpts.length < 2) {
                        return res.status(400).json({ error: `Question ${i + 1} needs at least 2 choices` });
                    }
                }
            }

            // Create poll with questions
            const poll = await prisma.poll.create({
                data: {
                    question: question.trim(),
                    creatorId: req.user?.id || null,
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    chartType: chartType || 'pie',
                    allowMultiple: false,
                    questions: {
                        create: questions.map((q, idx) => ({
                            text: q.text.trim(),
                            type: q.type || 'single',
                            order: idx,
                            options: {
                                create: (q.type === 'open_ended' ? [] : (q.options || []))
                                    .filter(o => o && o.trim().length > 0)
                                    .map(text => ({ text: text.trim() })),
                            },
                        })),
                    },
                },
                include: { questions: { include: { options: true }, orderBy: { order: 'asc' } } },
            });

            return res.status(201).json({
                id: poll.id,
                voteId: poll.voteId,
                resultsId: poll.resultsId,
                votingUrl: `/poll/${poll.voteId}`,
                resultsUrl: `/results/${poll.resultsId}`,
            });
        }

        // Legacy single-question format (backward compatible)
        if (!options || !Array.isArray(options)) {
            return res.status(400).json({ error: 'Options are required and must be an array' });
        }

        const validOptions = options.filter(opt => opt && opt.trim().length > 0);
        if (validOptions.length < 2) {
            return res.status(400).json({ error: 'At least 2 non-empty options are required' });
        }
        if (validOptions.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 options allowed' });
        }

        const uniqueOptions = [...new Set(validOptions.map(opt => opt.trim().toLowerCase()))];
        if (uniqueOptions.length !== validOptions.length) {
            return res.status(400).json({ error: 'Duplicate options are not allowed' });
        }

        const poll = await prisma.poll.create({
            data: {
                question: question.trim(),
                creatorId: req.user?.id || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                chartType: chartType || 'pie',
                allowMultiple: allowMultiple || false,
                options: {
                    create: validOptions.map(text => ({ text: text.trim() })),
                },
            },
            include: { options: true },
        });

        return res.status(201).json({
            id: poll.id,
            voteId: poll.voteId,
            resultsId: poll.resultsId,
            votingUrl: `/poll/${poll.voteId}`,
            resultsUrl: `/results/${poll.resultsId}`,
        });
    } catch (error) {
        console.error('Error creating poll:', error);
        return res.status(500).json({ error: 'Internal server error while creating poll' });
    }
};

/**
 * Get poll by voteId for voting (supports both legacy and multi-question)
 * @route GET /api/poll/:voteId
 */
export const getPollByVoteId = async (req, res) => {
    try {
        const { voteId } = req.params;

        if (!voteId) {
            return res.status(400).json({ error: 'Vote ID is required' });
        }

        const poll = await prisma.poll.findUnique({
            where: { voteId },
            include: {
                options: { select: { id: true, text: true, voteCount: true } },
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        options: { select: { id: true, text: true, voteCount: true } },
                    },
                },
                creator: { select: { id: true, name: true, email: true } },
            },
        });

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
        const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
        const isMultiQuestion = poll.questions && poll.questions.length > 0;

        const response = {
            id: poll.id,
            question: poll.question,
            voteId: poll.voteId,
            resultsId: poll.resultsId,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            isExpired,
            allowMultiple: poll.allowMultiple,
            totalVotes,
            isMultiQuestion,
            creator: poll.creator ? { name: poll.creator.name } : null,
            // Legacy options (for single-question polls)
            options: poll.options.map(o => ({ id: o.id, text: o.text, voteCount: 0 })),
            // Multi-question data
            questions: isMultiQuestion ? poll.questions.map(q => ({
                id: q.id,
                text: q.text,
                type: q.type,
                order: q.order,
                options: q.options.map(o => ({ id: o.id, text: o.text, voteCount: 0 })),
            })) : [],
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching poll:', error);
        return res.status(500).json({ error: 'Internal server error while fetching poll' });
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
            include: {
                options: true,
                questions: { include: { options: true } },
            },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll not found or invalid voteId',
            });
        }

        // Block voting on expired polls
        if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
            return res.status(400).json({ error: 'This poll is closed' });
        }

        // Check both legacy options and question-level options
        const legacyOption = poll.options.find(opt => opt.id === optionId);
        const questionOption = !legacyOption && poll.questions
            ? poll.questions.flatMap(q => q.options).find(opt => opt.id === optionId)
            : null;

        if (!legacyOption && !questionOption) {
            return res.status(400).json({
                error: 'Option does not belong to this poll',
            });
        }

        const updatedOption = await prisma.option.update({
            where: { id: optionId },
            data: { voteCount: { increment: 1 } },
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
 * Submit a text response for an open-ended question
 * @route POST /api/respond/:questionId
 */
export const submitResponse = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { text, voteId } = req.body;

        if (!questionId || !text || !text.trim()) {
            return res.status(400).json({ error: 'Question ID and text are required' });
        }

        // Verify the question exists and belongs to the poll
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { poll: true },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        if (question.type !== 'open_ended') {
            return res.status(400).json({ error: 'This question does not accept text responses' });
        }

        // Check if poll is expired
        if (question.poll.expiresAt && new Date(question.poll.expiresAt) < new Date()) {
            return res.status(400).json({ error: 'This poll is closed' });
        }

        const response = await prisma.response.create({
            data: {
                text: text.trim().slice(0, 1000), // Limit to 1000 chars
                questionId,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Response submitted',
            response: { id: response.id, text: response.text },
        });
    } catch (error) {
        console.error('Error submitting response:', error);
        return res.status(500).json({ error: 'Failed to submit response' });
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
                    select: { id: true, text: true, voteCount: true },
                },
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        options: { select: { id: true, text: true, voteCount: true } },
                        responses: {
                            select: { id: true, text: true, createdAt: true },
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });

        if (!poll) {
            return res.status(404).json({
                error: 'Poll results not found',
            });
        }

        const isMultiQuestion = poll.questions && poll.questions.length > 0;

        // Compute totals
        const legacyVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
        const multiVotes = isMultiQuestion
            ? poll.questions.reduce((sum, q) => {
                if (q.type === 'open_ended') return sum + q.responses.length;
                return sum + q.options.reduce((s, o) => s + o.voteCount, 0);
            }, 0)
            : 0;
        const totalVotes = isMultiQuestion ? multiVotes : legacyVotes;

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
            isMultiQuestion,
            // Legacy: top-level options for single-question polls
            options: poll.options.map(option => ({
                id: option.id,
                text: option.text,
                voteCount: option.voteCount,
                percentage: legacyVotes > 0 ? Math.round((option.voteCount / legacyVotes) * 100) : 0,
            })),
            // Multi-question data
            questions: isMultiQuestion ? poll.questions.map(q => {
                const qTotal = q.type === 'open_ended'
                    ? q.responses.length
                    : q.options.reduce((s, o) => s + o.voteCount, 0);
                return {
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    order: q.order,
                    totalVotes: qTotal,
                    options: q.options.map(o => ({
                        id: o.id,
                        text: o.text,
                        voteCount: o.voteCount,
                        percentage: qTotal > 0 ? Math.round((o.voteCount / qTotal) * 100) : 0,
                    })),
                    responses: q.type === 'open_ended'
                        ? q.responses.map(r => ({ id: r.id, text: r.text, createdAt: r.createdAt }))
                        : [],
                };
            }) : [],
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
