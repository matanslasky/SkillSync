/**
 * Error Tracking Service (Sentry Integration)
 * Captures and reports errors to Sentry for monitoring
 */

import * as Sentry from '@sentry/react';
import { env } from '../config/env';

let isInitialized = false;

/**
 * Initialize Sentry error tracking
 */
export function initErrorTracking() {
  if (!env.enableErrorTracking || !env.sentryDsn || isInitialized) {
    console.log('Error tracking disabled or already initialized');
    return;
  }

  try {
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.sentryEnvironment,
      release: `skillsync@${env.appVersion}`,
      
      // Performance Monitoring
      tracesSampleRate: env.sentryTracesSampleRate,
      
      // Integrations
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^\//],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Session Replay
      replaysSessionSampleRate: env.isProduction ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      
      // Before Send Hook
      beforeSend(event, hint) {
        // Filter out non-error events in development
        if (env.isDevelopment && event.level !== 'error') {
          return null;
        }
        
        // Add custom context
        event.tags = {
          ...event.tags,
          appVersion: env.appVersion,
          environment: env.appEnv,
        };
        
        return event;
      },
      
      // Ignore certain errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        /Loading chunk \d+ failed/,
      ],
    });

    isInitialized = true;
    console.log('✅ Error tracking initialized');
  } catch (error) {
    console.error('Failed to initialize error tracking:', error);
  }
}

/**
 * Capture an exception
 */
export function captureException(error, context = {}) {
  if (!isInitialized) return;
  
  Sentry.captureException(error, {
    tags: context.tags,
    contexts: context.contexts,
    extra: context.extra,
  });
}

/**
 * Capture a message
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (!isInitialized) return;
  
  Sentry.captureMessage(message, {
    level,
    tags: context.tags,
    contexts: context.contexts,
    extra: context.extra,
  });
}

/**
 * Set user context
 */
export function setUser(user) {
  if (!isInitialized) return;
  
  Sentry.setUser(user ? {
    id: user.uid,
    email: user.email,
    username: user.displayName,
  } : null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb) {
  if (!isInitialized) return;
  
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a performance transaction
 */
export function startTransaction(name, op) {
  if (!isInitialized) return null;
  
  return Sentry.startTransaction({ name, op });
}

/**
 * Set context for error reports
 */
export function setContext(key, context) {
  if (!isInitialized) return;
  
  Sentry.setContext(key, context);
}

export default {
  init: initErrorTracking,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  startTransaction,
  setContext,
};
