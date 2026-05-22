import { getAdminToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to get headers with auth token
 */
const getHeaders = () => {
    const token = getAdminToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

// ============ USER MANAGEMENT ============

export const getUsers = async (page = 1, limit = 10, search = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to create user');
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to update user');
        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to delete user');
        return await response.json();
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// ============ POLL MANAGEMENT ============

export const getAdminPolls = async (page = 1, limit = 10, search = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/admin/polls?${params}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to fetch polls');
        return await response.json();
    } catch (error) {
        console.error('Error fetching polls:', error);
        throw error;
    }
};

export const getPollDetailsAdmin = async (pollId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/polls/${pollId}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to fetch poll details');
        return await response.json();
    } catch (error) {
        console.error('Error fetching poll details:', error);
        throw error;
    }
};

export const deletePollAdmin = async (pollId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/polls/${pollId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to delete poll');
        return await response.json();
    } catch (error) {
        console.error('Error deleting poll:', error);
        throw error;
    }
};

export const resetPollVotes = async (pollId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/polls/${pollId}/reset`, {
            method: 'POST',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to reset poll votes');
        return await response.json();
    } catch (error) {
        console.error('Error resetting poll votes:', error);
        throw error;
    }
};

// ============ DASHBOARD STATISTICS ============

export const getDashboardStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
        }
        if (!response.ok) throw new Error('Failed to fetch dashboard statistics');
        return await response.json();
    } catch (error) {
        console.error('Error fetching statistics:', error);
        throw error;
    }
};
