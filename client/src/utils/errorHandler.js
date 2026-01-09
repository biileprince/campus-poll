/**
 * Format error messages for user display
 * @param {Error|string} error - Error object or message
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         error?.message?.includes('timeout');
};

/**
 * Get user-friendly error message based on error type
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyError = (error) => {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  const message = formatErrorMessage(error);
  
  // Handle common API errors
  if (message.includes('Poll not found')) {
    return 'This poll could not be found. Please check the link and try again.';
  }
  
  if (message.includes('Invalid option')) {
    return 'Please select a valid option before submitting your vote.';
  }
  
  if (message.includes('required')) {
    return 'Please fill in all required fields.';
  }
  
  return message;
};