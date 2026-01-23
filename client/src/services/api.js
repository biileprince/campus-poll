import axios from 'axios';

// Determine API base URL based on environment
// In production (Render), use relative path since frontend is served by same server
// In development, use localhost with appropriate port
const getApiBaseUrl = () => {
  // Check if we're in production mode
  if (import.meta.env.MODE === 'production') {
    return '/api';
  }
  
  // Development mode - use env variable or default localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for loading states
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Get all polls
 * @returns {Promise<Object>} List of polls
 */
export const getAllPolls = async () => {
  try {
    const response = await api.get('/polls');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new poll
 * @param {Object} pollData - Poll data containing question and options
 * @returns {Promise<Object>} Poll creation response
 */
export const createPoll = async (pollData) => {
  try {
    const response = await api.post('/polls', pollData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get poll data for voting
 * @param {string} voteId - Vote ID of the poll
 * @returns {Promise<Object>} Poll data
 */
export const getPoll = async (voteId) => {
  try {
    const response = await api.get(`/poll/${voteId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit a vote for a poll option
 * @param {string} voteId - Vote ID of the poll
 * @param {number} optionId - ID of the selected option
 * @returns {Promise<Object>} Vote submission response
 */
export const submitVote = async (voteId, optionId) => {
  try {
    const response = await api.post(`/vote/${optionId}`, { voteId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get poll results
 * @param {string} resultsId - Results ID of the poll
 * @returns {Promise<Object>} Poll results data
 */
export const getPollResults = async (resultsId) => {
  try {
    const response = await api.get(`/results/${resultsId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's polls
 * @returns {Promise<Object>} User's polls
 */
export const getMyPolls = async () => {
  try {
    const response = await api.get('/my-polls');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a poll
 * @param {string} resultsId - Results ID of the poll
 * @param {Object} pollData - Updated poll data
 * @returns {Promise<Object>} Updated poll
 */
export const updatePoll = async (resultsId, pollData) => {
  try {
    const response = await api.put(`/polls/${resultsId}`, pollData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a poll
 * @param {string} resultsId - Results ID of the poll
 * @returns {Promise<Object>} Deletion response
 */
export const deletePoll = async (resultsId) => {
  try {
    const response = await api.delete(`/polls/${resultsId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;