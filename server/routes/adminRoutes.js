import express from 'express';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllPollsAdmin,
    getPollDetailsAdmin,
    deletePollAdmin,
    resetPollVotes,
    getDashboardStats,
    adminLogin,
    verifyAdminToken as verifyAdminTokenController
} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============ AUTHENTICATION (No protection needed) ============
router.post('/login', adminLogin);
router.get('/verify', verifyAdminToken, verifyAdminTokenController);

// ============ ADMIN DASHBOARD (Protected) ============
router.get('/stats', verifyAdminToken, getDashboardStats);

// ============ USER MANAGEMENT (Protected) ============
router.get('/users', verifyAdminToken, getAllUsers);
router.post('/users', verifyAdminToken, createUser);
router.put('/users/:id', verifyAdminToken, updateUser);
router.delete('/users/:id', verifyAdminToken, deleteUser);

// ============ POLL MANAGEMENT (Protected) ============
router.get('/polls', verifyAdminToken, getAllPollsAdmin);
router.get('/polls/:id', verifyAdminToken, getPollDetailsAdmin);
router.delete('/polls/:id', verifyAdminToken, deletePollAdmin);
router.post('/polls/:id/reset', verifyAdminToken, resetPollVotes);

export default router;
