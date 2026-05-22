import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN_KEY = 'adminToken';

/**
 * Admin Authentication Service
 */

// Create axios instance for auth requests
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
authApi.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      clearAdminToken();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Store admin token in localStorage
 * @param {string} token - JWT token
 */
export const setAdminToken = (token) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

/**
 * Get admin token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

/**
 * Clear admin token from localStorage
 */
export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

/**
 * Check if admin is authenticated
 * @returns {boolean} True if token exists
 */
export const isAdminAuthenticated = () => {
  return !!getAdminToken();
};

/**
 * Admin login
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} Login response with token
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await authApi.post('/admin/login', credentials);
    const { token } = response.data;
    setAdminToken(token);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

/**
 * Admin logout
 */
export const adminLogout = () => {
  clearAdminToken();
};

/**
 * Verify admin token
 * @returns {Promise<boolean>} True if token is valid
 */
export const verifyAdminToken = async () => {
  try {
    if (!getAdminToken()) {
      return false;
    }
    const response = await authApi.get('/admin/verify');
    return response.data.valid === true;
  } catch (error) {
    clearAdminToken();
    return false;
  }
};

export default authApi;
