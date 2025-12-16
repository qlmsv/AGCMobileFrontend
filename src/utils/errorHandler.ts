import { AxiosError } from 'axios';

/**
 * Utility function to safely extract error message from Axios errors
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Try to get detailed error message from API response
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Fallback to axios error message
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && error.code === 'ERR_NETWORK';
  }
  return false;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyError = (error: unknown): string => {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }

  if (isAuthError(error)) {
    return 'Session expired. Please login again.';
  }

  return getErrorMessage(error);
};
