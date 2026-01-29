/**
 * App Initialization
 * Sets up monitoring, error tracking, and security on app startup
 */

import { initErrorTracking, setUser } from './services/errorTracking';
import { applySecurityHeaders } from './utils/security';
import { info, error as logError } from './services/logger';
import { env } from './config/env';

/**
 * Initialize the application
 */
export async function initializeApp() {
  try {
    info('🚀 Initializing SkillSync...', {
      version: env.appVersion,
      environment: env.appEnv,
    });

    // Apply security headers
    if (env.isProduction) {
      applySecurityHeaders();
      info('✅ Security headers applied');
    }

    // Initialize error tracking
    if (env.enableErrorTracking) {
      initErrorTracking();
      info('✅ Error tracking initialized');
    }

    // Log performance metrics
    if (env.enablePerformanceMonitoring && window.performance) {
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      info('📊 Page load time', { loadTime: `${loadTime}ms` });
    }

    info('✅ Application initialized successfully');
  } catch (error) {
    logError('❌ Failed to initialize application', error);
    throw error;
  }
}

/**
 * Set user context for monitoring
 */
export function setUserContext(user) {
  if (user && env.enableErrorTracking) {
    setUser(user);
    info('👤 User context set', { userId: user.uid });
  }
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  if (env.enableErrorTracking) {
    setUser(null);
    info('👤 User context cleared');
  }
}

export default {
  initializeApp,
  setUserContext,
  clearUserContext,
};
