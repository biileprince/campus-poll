import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'campus-poll-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { email: email.toLowerCase(), password: hashedPassword, name: name || null },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });

        const token = generateToken(user.id);

        res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // If user signed up via Google and has no password
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account uses Google sign-in. Please use the "Continue with Google" button.'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
};

// Google OAuth — verify ID token and find/create user
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, error: 'Google credential is required' });
        }

        if (!GOOGLE_CLIENT_ID) {
            return res.status(500).json({ success: false, error: 'Google sign-in is not configured on this server' });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Could not get email from Google account' });
        }

        // Find user by googleId or email
        let user = await prisma.user.findFirst({
            where: { OR: [{ googleId }, { email: email.toLowerCase() }] }
        });

        if (user) {
            // Link Google account if not already linked
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId, name: user.name || name }
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: { email: email.toLowerCase(), name: name || null, googleId, password: null }
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Google sign-in successful',
            data: {
                user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
                token
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);

        if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
            return res.status(401).json({ success: false, error: 'Google sign-in expired. Please try again.' });
        }

        res.status(500).json({ success: false, error: 'Google sign-in failed. Please try again.' });
    }
};

// Get current user
export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { polls: true } } }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: { user } });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user data' });
    }
};

// Get user stats
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const polls = await prisma.poll.findMany({
            where: { creatorId: userId },
            include: { options: { select: { voteCount: true } } }
        });

        const totalPolls = polls.length;
        const totalResponses = polls.reduce((sum, poll) => sum + poll.options.reduce((s, o) => s + o.voteCount, 0), 0);
        const pollsWithVotes = polls.filter(p => p.options.some(o => o.voteCount > 0)).length;
        const engagementRate = totalPolls > 0 ? Math.round((pollsWithVotes / totalPolls) * 100) : 0;

        res.json({ success: true, data: { pollsCreated: totalPolls, totalResponses, engagementRate } });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user stats' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: { email: email.toLowerCase(), NOT: { id: userId } }
            });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { ...(name && { name }), ...(email && { email: email.toLowerCase() }) },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });

        res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Your account uses Google sign-in and does not have a password' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

// Promote a user to admin (protected by ADMIN_SECRET)
export const promoteAdmin = async (req, res) => {
    try {
        const { email, secret } = req.body;
        const adminSecret = process.env.ADMIN_SECRET;

        if (!adminSecret) {
            return res.status(500).json({ success: false, message: 'Admin promotion is not configured on this server' });
        }

        if (!secret || secret !== adminSecret) {
            return res.status(403).json({ success: false, message: 'Invalid admin secret' });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
            select: { id: true, email: true, name: true, role: true }
        });

        res.json({ success: true, message: `${updatedUser.email} is now an admin`, data: updatedUser });
    } catch (error) {
        console.error('Promote admin error:', error);
        res.status(500).json({ success: false, message: 'Failed to promote admin' });
    }
};
