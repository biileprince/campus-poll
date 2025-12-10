import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading states and error handling
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} Object containing data, loading state, error, and execute function
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Custom hook specifically for poll creation
 */
export const useCreatePoll = () => {
  return useApi(async (pollData) => {
    const { createPoll } = await import('../services/api.js');
    return createPoll(pollData);
  });
};

/**
 * Custom hook specifically for getting poll data
 */
export const useGetPoll = () => {
  return useApi(async (voteId) => {
    const { getPoll } = await import('../services/api.js');
    return getPoll(voteId);
  });
};

/**
 * Custom hook specifically for submitting votes
 */
export const useSubmitVote = () => {
  return useApi(async (voteId, optionId) => {
    const { submitVote } = await import('../services/api.js');
    return submitVote(voteId, optionId);
  });
};

/**
 * Custom hook specifically for getting poll results
 */
export const useGetResults = () => {
  return useApi(async (resultsId) => {
    const { getPollResults } = await import('../services/api.js');
    return getPollResults(resultsId);
  });
};