/**
 * Error Tracking Utilities
 * Provides consistent error reporting across the application
 */

import { captureException, captureMessage } from './errorTracking';
import { logger } from '../utils/logger';

/**
 * Reports an error to monitoring services
 * @param {Error} error - The error object
 * @param {Object} context - Additional context
 * @param {string} context.service - Service name (e.g., 'aiService', 'projectService')
 * @param {string} context.operation - Operation name (e.g., 'createProject', 'fetchTasks')
 * @param {Object} context.data - Additional data for debugging
 */
export function reportError(error, context = {}) {
  const { service, operation, data } = context;
  
  // Log to console/logger
  logger.error(`[${service}] ${operation} failed:`, error, data);
  
  // Send to Sentry with structured context
  if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
    captureException(error, {
      tags: {
        service,
        operation,
        errorType: error.name || 'UnknownError',
      },
      contexts: {
        operation: {
          service,
          operation,
          timestamp: new Date().toISOString(),
        },
      },
      extra: {
        ...data,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }
}

/**
 * Reports a warning message to monitoring
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
export function reportWarning(message, context = {}) {
  const { service, operation, data } = context;
  
  logger.warn(`[${service}] ${operation}: ${message}`, data);
  
  if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
    captureMessage(message, 'warning', {
      tags: {
        service,
        operation,
        level: 'warning',
      },
      extra: data,
    });
  }
}

/**
 * Reports an informational message (only in development)
 * @param {string} message - Info message
 * @param {Object} context - Additional context
 */
export function reportInfo(message, context = {}) {
  const { service, operation, data } = context;
  
  logger.info(`[${service}] ${operation}: ${message}`, data);
  
  // Only send info to Sentry in development mode with specific flag
  if (import.meta.env.VITE_SENTRY_DEBUG === 'true') {
    captureMessage(message, 'info', {
      tags: { service, operation },
      extra: data,
    });
  }
}

/**
 * Wraps an async function with error tracking
 * @param {Function} fn - Async function to wrap
 * @param {Object} context - Error context
 * @returns {Function} Wrapped function
 */
export function withErrorTracking(fn, context) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error, context);
      throw error;
    }
  };
}
