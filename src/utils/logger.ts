/* eslint-disable no-console */
/**
 * Logger utility for development and production
 * In production, logs should be sent to error tracking service (e.g., Sentry)
 */

const IS_DEV = __DEV__;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]): void => {
    if (IS_DEV) {
      console.log('[LOG]', ...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]): void => {
    if (IS_DEV) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log information messages (only in development)
   */
  info: (...args: any[]): void => {
    if (IS_DEV) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log warning messages (development and production)
   */
  warn: (...args: any[]): void => {
    if (IS_DEV) {
      console.warn('[WARN]', ...args);
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureMessage(String(args[0]), 'warning');
    }
  },

  /**
   * Log error messages (development and production)
   */
  error: (...args: any[]): void => {
    if (IS_DEV) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureException(args[0]);
    }
  },
};
