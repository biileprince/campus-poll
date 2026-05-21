import prisma from '../utils/prisma.js';
import { generateAdminToken } from '../middlewares/authMiddleware.js';

// ============ USER MANAGEMENT ============

/**
 * Get all users with pagination
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                include: {
                    _count: {
                        select: { polls: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            pollCount: user._count.polls,
            createdAt: user.createdAt,
        }));

        return res.status(200).json({
            users: formattedUsers,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * Create a new user
 * @route POST /api/admin/users
 */
export const createUser = async (req, res) => {
    try {
        const { email, name, role = 'user' } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const user = await prisma.user.create({
            data: { email, name, role }
        });

        return res.status(201).json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Failed to create user' });
    }
};

/**
 * Update user details
 * @route PUT /api/admin/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(role && { role })
            }
        });

        return res.status(200).json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
};

/**
 * Delete a user and their polls
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await prisma.user.delete({ where: { id } });

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
};

// ============ POLL MANAGEMENT ============

/**
 * Get all polls with admin details
 * @route GET /api/admin/polls
 */
export const getAllPollsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? {
            question: { contains: search, mode: 'insensitive' }
        } : {};

        const [polls, total] = await Promise.all([
            prisma.poll.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                include: {
                    options: { select: { id: true, text: true, voteCount: true } },
                    user: { select: { id: true, name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.poll.count({ where })
        ]);

        const formattedPolls = polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
            return {
                id: poll.id,
                question: poll.question,
                voteId: poll.voteId,
                resultsId: poll.resultsId,
                createdBy: poll.user ? { id: poll.user.id, name: poll.user.name, email: poll.user.email } : null,
                totalVotes,
                optionCount: poll.options.length,
                createdAt: poll.createdAt,
            };
        });

        return res.status(200).json({
            polls: formattedPolls,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching polls:', error);
        return res.status(500).json({ error: 'Failed to fetch polls' });
    }
};

/**
 * Get poll details with full statistics
 * @route GET /api/admin/polls/:id
 */
export const getPollDetailsAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const poll = await prisma.poll.findUnique({
            where: { id },
            include: {
                options: { select: { id: true, text: true, voteCount: true } },
                user: { select: { id: true, name: true, email: true } }
            }
        });

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

        return res.status(200).json({
            id: poll.id,
            question: poll.question,
            voteId: poll.voteId,
            resultsId: poll.resultsId,
            createdBy: poll.user ? { id: poll.user.id, name: poll.user.name, email: poll.user.email } : null,
            options: poll.options,
            totalVotes,
            createdAt: poll.createdAt,
            updatedAt: poll.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching poll:', error);
        return res.status(500).json({ error: 'Failed to fetch poll' });
    }
};

/**
 * Delete a poll
 * @route DELETE /api/admin/polls/:id
 */
export const deletePollAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const poll = await prisma.poll.findUnique({ where: { id } });
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        await prisma.poll.delete({ where: { id } });

        return res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Error deleting poll:', error);
        return res.status(500).json({ error: 'Failed to delete poll' });
    }
};

/**
 * Reset poll votes
 * @route POST /api/admin/polls/:id/reset
 */
export const resetPollVotes = async (req, res) => {
    try {
        const { id } = req.params;

        const poll = await prisma.poll.findUnique({
            where: { id },
            include: { options: true }
        });

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        // Reset all option vote counts to 0
        await Promise.all(
            poll.options.map(option =>
                prisma.option.update({
                    where: { id: option.id },
                    data: { voteCount: 0 }
                })
            )
        );

        return res.status(200).json({ message: 'Poll votes reset successfully' });
    } catch (error) {
        console.error('Error resetting poll votes:', error);
        return res.status(500).json({ error: 'Failed to reset poll votes' });
    }
};

// ============ ADMIN DASHBOARD ============

/**
 * Get dashboard statistics
 * @route GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        const [userCount, pollCount, optionCount] = await Promise.all([
            prisma.user.count(),
            prisma.poll.count(),
            prisma.option.count()
        ]);

        const totalVotes = await prisma.option.aggregate({
            _sum: { voteCount: true }
        });

        const recentPolls = await prisma.poll.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                question: true,
                createdAt: true,
                _count: { select: { options: true } }
            }
        });

        return res.status(200).json({
            stats: {
                totalUsers: userCount,
                totalPolls: pollCount,
                totalOptions: optionCount,
                totalVotes: totalVotes._sum.voteCount || 0,
            },
            recentPolls
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// ============ AUTHENTICATION ============

/**
 * Admin login
 * @route POST /api/admin/login
 * @body { username, password }
 */
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Simple demo authentication - in production, use bcrypt and proper user management
        // For demo: username = 'admin', password = 'admin123'
        if (username === 'admin' && password === 'admin123') {
            const token = generateAdminToken({
                id: 'admin-001',
                username: 'admin'
            });

            return res.status(200).json({
                token,
                admin: {
                    id: 'admin-001',
                    username: 'admin',
                    role: 'admin'
                },
                message: 'Login successful'
            });
        }

        return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * Verify admin token
 * @route GET /api/admin/verify
 * @headers { Authorization: Bearer <token> }
 */
export const verifyAdminToken = async (req, res) => {
    try {
        // If we reach here, the token is valid (verified by middleware)
        return res.status(200).json({
            valid: true,
            admin: req.admin,
            message: 'Token is valid'
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ valid: false, error: 'Token verification failed' });
    }
};
