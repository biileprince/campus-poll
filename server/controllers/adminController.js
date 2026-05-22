import prisma from '../utils/prisma.js';

/**
 * Get platform-wide statistics
 * @route GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalPolls, totalOptions, totalResponses] = await Promise.all([
            prisma.user.count(),
            prisma.poll.count(),
            prisma.option.findMany({ select: { voteCount: true } }),
            prisma.response.count(),
        ]);

        const totalChoiceVotes = totalOptions.reduce((sum, o) => sum + o.voteCount, 0);
        const totalVotes = totalChoiceVotes + totalResponses;

        const activePolls = await prisma.poll.count({
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });

        const recentUsers = await prisma.user.count({
            where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        });

        const recentPolls = await prisma.poll.count({
            where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPolls,
                totalVotes,
                activePolls,
                expiredPolls: totalPolls - activePolls,
                recentUsers,
                recentPolls,
            },
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get admin stats' });
    }
};

/**
 * List all users with pagination
 * @route GET /api/admin/users?page=1&limit=20&search=keyword
 */
export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const search = req.query.search?.trim() || '';
        const skip = (page - 1) * limit;

        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: Object.keys(where).length ? where : undefined,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    googleId: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: { select: { polls: true } },
                },
            }),
            prisma.user.count({ where: Object.keys(where).length ? where : undefined }),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                users: users.map(u => ({
                    ...u,
                    hasGoogleAuth: !!u.googleId,
                    googleId: undefined,
                    pollCount: u._count.polls,
                    _count: undefined,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to get users' });
    }
};

/**
 * List all polls with creator info and pagination
 * @route GET /api/admin/polls?page=1&limit=20&search=keyword&status=active
 */
export const getAdminPolls = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const search = req.query.search?.trim() || '';
        const statusFilter = req.query.status || 'all';
        const skip = (page - 1) * limit;

        const where = {};
        if (search) {
            where.question = { contains: search, mode: 'insensitive' };
        }
        if (statusFilter === 'active') {
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ];
        } else if (statusFilter === 'expired') {
            where.expiresAt = { lt: new Date(), not: null };
        }

        const [polls, total] = await Promise.all([
            prisma.poll.findMany({
                where: Object.keys(where).length ? where : undefined,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    options: { select: { voteCount: true } },
                    questions: {
                        select: {
                            id: true,
                            type: true,
                            options: { select: { voteCount: true } },
                            _count: { select: { responses: true } },
                        },
                    },
                    creator: { select: { id: true, email: true, name: true, role: true } },
                },
            }),
            prisma.poll.count({ where: Object.keys(where).length ? where : undefined }),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                polls: polls.map(poll => {
                    const isMultiQuestion = poll.questions && poll.questions.length > 0;
                    const legacyVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
                    const multiVotes = isMultiQuestion
                        ? poll.questions.reduce((sum, q) => {
                            if (q.type === 'open_ended') return sum + (q._count?.responses || 0);
                            return sum + q.options.reduce((s, o) => s + o.voteCount, 0);
                        }, 0)
                        : 0;
                    const totalVotes = isMultiQuestion ? multiVotes : legacyVotes;
                    const multiOptionCount = isMultiQuestion
                        ? poll.questions.reduce((sum, q) => sum + (q.options?.length || 0), 0)
                        : 0;
                    const optionCount = isMultiQuestion ? multiOptionCount : poll.options.length;
                    const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
                    return {
                        id: poll.id,
                        question: poll.question,
                        voteId: poll.voteId,
                        resultsId: poll.resultsId,
                        createdAt: poll.createdAt,
                        expiresAt: poll.expiresAt,
                        totalVotes,
                        optionCount,
                        isMultiQuestion,
                        questionCount: poll.questions?.length || 0,
                        status: isExpired ? 'Expired' : 'Active',
                        creator: poll.creator,
                    };
                }),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
        });
    } catch (error) {
        console.error('Admin get polls error:', error);
        res.status(500).json({ success: false, message: 'Failed to get polls' });
    }
};

/**
 * Delete any poll (admin override — no ownership check)
 * @route DELETE /api/admin/polls/:id
 */
export const adminDeletePoll = async (req, res) => {
    try {
        const { id } = req.params;

        const poll = await prisma.poll.findUnique({ where: { id } });
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }

        await prisma.poll.delete({ where: { id } });

        res.json({ success: true, message: 'Poll deleted by admin', deletedPollId: id });
    } catch (error) {
        console.error('Admin delete poll error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete poll' });
    }
};

/**
 * Update a user's role
 * @route PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Must be USER or ADMIN' });
        }

        // Prevent self-demotion
        if (id === req.user.id && role !== 'ADMIN') {
            return res.status(400).json({ success: false, message: 'You cannot demote yourself' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, name: true, role: true },
        });

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: updatedUser,
        });
    } catch (error) {
        console.error('Admin update user role error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user role' });
    }
};

/**
 * Delete a user (admin only). Their polls are kept but unlinked (creatorId → null
 * via the schema's onDelete: SetNull rule).
 * @route DELETE /api/admin/users/:id
 */
export const adminDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account from here' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await prisma.user.delete({ where: { id } });

        res.json({ success: true, message: 'User deleted', deletedUserId: id });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};
