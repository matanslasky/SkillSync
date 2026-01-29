/**
 * Logging Service
 * Centralized logging with different levels and context
 */

import { env } from '../config/env';
import { captureMessage, captureException, addBreadcrumb } from './errorTracking';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LEVEL = env.isProduction ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Log object with context
 */
class Logger {
  constructor(context = '') {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext) {
    return new Logger(this.context ? `${this.context}:${childContext}` : childContext);
  }

  /**
   * Format log message with context
   */
  format(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = this.context ? `[${this.context}]` : '';
    return {
      timestamp,
      level,
      context: this.context,
      message: `${prefix} ${message}`,
      data,
    };
  }

  /**
   * Debug level logging
   */
  debug(message, data) {
    if (CURRENT_LEVEL > LOG_LEVELS.DEBUG) return;
    
    const log = this.format('DEBUG', message, data);
    console.debug(log.message, data || '');
    
    addBreadcrumb({
      category: this.context || 'app',
      message,
      level: 'debug',
      data,
    });
  }

  /**
   * Info level logging
   */
  info(message, data) {
    if (CURRENT_LEVEL > LOG_LEVELS.INFO) return;
    
    const log = this.format('INFO', message, data);
    console.info(log.message, data || '');
    
    addBreadcrumb({
      category: this.context || 'app',
      message,
      level: 'info',
      data,
    });
  }

  /**
   * Warning level logging
   */
  warn(message, data) {
    if (CURRENT_LEVEL > LOG_LEVELS.WARN) return;
    
    const log = this.format('WARN', message, data);
    console.warn(log.message, data || '');
    
    addBreadcrumb({
      category: this.context || 'app',
      message,
      level: 'warning',
      data,
    });
    
    if (env.enableErrorTracking) {
      captureMessage(message, 'warning', {
        extra: { context: this.context, data },
      });
    }
  }

  /**
   * Error level logging
   */
  error(message, error, data) {
    const log = this.format('ERROR', message, data);
    console.error(log.message, error, data || '');
    
    addBreadcrumb({
      category: this.context || 'app',
      message,
      level: 'error',
      data: { ...data, error: error?.message },
    });
    
    if (env.enableErrorTracking && error) {
      captureException(error, {
        tags: { context: this.context },
        extra: { message, data },
      });
    }
  }

  /**
   * Log API request
   */
  logRequest(method, url, params) {
    this.debug(`API ${method} ${url}`, params);
    
    addBreadcrumb({
      type: 'http',
      category: 'api',
      data: { method, url, params },
    });
  }

  /**
   * Log API response
   */
  logResponse(method, url, status, duration) {
    this.debug(`API ${method} ${url} - ${status} (${duration}ms)`);
    
    addBreadcrumb({
      type: 'http',
      category: 'api',
      data: { method, url, status, duration },
      level: status >= 400 ? 'error' : 'info',
    });
  }

  /**
   * Log user action
   */
  logAction(action, data) {
    this.info(`User action: ${action}`, data);
    
    addBreadcrumb({
      type: 'user',
      category: 'action',
      message: action,
      data,
    });
  }

  /**
   * Log navigation
   */
  logNavigation(from, to) {
    this.debug(`Navigation: ${from} → ${to}`);
    
    addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      data: { from, to },
    });
  }
}

// Create default logger instance
const logger = new Logger();

// Export logger functions
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const logRequest = logger.logRequest.bind(logger);
export const logResponse = logger.logResponse.bind(logger);
export const logAction = logger.logAction.bind(logger);
export const logNavigation = logger.logNavigation.bind(logger);

// Export Logger class for creating contextual loggers
export { Logger };

export default logger;
