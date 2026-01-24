/**
 * Logger Utility for SkillSync
 * Centralized logging with levels and optional external service integration
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
}

const isDevelopment = import.meta.env.DEV

class Logger {
  constructor() {
    this.enabled = true
    this.level = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
  }

  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or additional context
   * @param {Object} context - Additional context
   */
  error(message, error = null, context = {}) {
    if (!this.enabled) return

    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...context,
      timestamp: new Date().toISOString()
    })

    // TODO: Send to external error tracking service (e.g., Sentry)
    // this.sendToErrorTracking('error', message, error, context)
  }

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    if (!this.enabled || this.level === LOG_LEVELS.ERROR) return

    console.warn(`[WARN] ${message}`, {
      ...context,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    if (!this.enabled || [LOG_LEVELS.ERROR, LOG_LEVELS.WARN].includes(this.level)) return

    console.info(`[INFO] ${message}`, {
      ...context,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log debug messages (only in development)
   * @param {string} message - Debug message
   * @param {Object} context - Additional context
   */
  debug(message, context = {}) {
    if (!this.enabled || !isDevelopment) return

    console.log(`[DEBUG] ${message}`, {
      ...context,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log user actions for analytics
   * @param {string} action - Action name
   * @param {Object} properties - Action properties
   */
  logUserAction(action, properties = {}) {
    if (!this.enabled) return

    this.info(`User Action: ${action}`, properties)

    // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel)
    // this.sendToAnalytics(action, properties)
  }

  /**
   * Log performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} context - Additional context
   */
  logPerformance(metric, value, context = {}) {
    if (!this.enabled) return

    this.debug(`Performance: ${metric}`, {
      value,
      unit: 'ms',
      ...context
    })

    // TODO: Send to performance monitoring service
    // this.sendToPerformanceMonitoring(metric, value, context)
  }

  /**
   * Disable logging (e.g., for testing)
   */
  disable() {
    this.enabled = false
  }

  /**
   * Enable logging
   */
  enable() {
    this.enabled = true
  }

  /**
   * Set log level
   * @param {string} level - Log level
   */
  setLevel(level) {
    if (Object.values(LOG_LEVELS).includes(level)) {
      this.level = level
    } else {
      this.warn('Invalid log level', { attemptedLevel: level })
    }
  }

  // Future: Integration methods for external services
  /*
  sendToErrorTracking(level, message, error, context) {
    // Sentry.captureException(error, { level, tags: { message }, extra: context })
  }

  sendToAnalytics(action, properties) {
    // analytics.track(action, properties)
  }

  sendToPerformanceMonitoring(metric, value, context) {
    // performanceMonitor.record(metric, value, context)
  }
  */
}

// Export singleton instance
const logger = new Logger()

export default logger
export { LOG_LEVELS }
