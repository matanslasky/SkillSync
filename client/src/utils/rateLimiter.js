/**
 * Rate Limiter
 * Prevents abuse by limiting the number of requests/actions
 */

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if action is rate limited
   * @param {string} key - Unique identifier (user ID, IP, etc.)
   * @returns {boolean} - true if rate limit exceeded
   */
  isRateLimited(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Filter out old requests outside the time window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return true;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    // Cleanup old entries periodically
    if (this.requests.size > 1000) {
      this.cleanup();
    }
    
    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Get time until rate limit resets
   */
  getResetTime(key) {
    const userRequests = this.requests.get(key) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    const resetTime = oldestRequest + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Reset rate limit for a key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validRequests = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  /**
   * Clear all rate limits
   */
  clear() {
    this.requests.clear();
  }
}

// Create default rate limiters for different actions
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 login attempts per 5 minutes
export const uploadRateLimiter = new RateLimiter(10, 60000); // 10 uploads per minute

/**
 * Rate limit decorator for async functions
 */
export function rateLimit(limiter, getUserKey) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const key = getUserKey ? getUserKey(...args) : 'default';
      
      if (limiter.isRateLimited(key)) {
        const resetTime = limiter.getResetTime(key);
        const error = new Error('Rate limit exceeded');
        error.code = 'RATE_LIMIT_EXCEEDED';
        error.resetTime = resetTime;
        error.remaining = 0;
        throw error;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export { RateLimiter };
export default RateLimiter;
