/**
 * Environment Configuration Manager
 * Validates and provides typed access to environment variables
 */

const ENV_SCHEMA = {
  // Firebase
  VITE_FIREBASE_API_KEY: { required: true, type: 'string' },
  VITE_FIREBASE_AUTH_DOMAIN: { required: true, type: 'string' },
  VITE_FIREBASE_PROJECT_ID: { required: true, type: 'string' },
  VITE_FIREBASE_STORAGE_BUCKET: { required: true, type: 'string' },
  VITE_FIREBASE_MESSAGING_SENDER_ID: { required: true, type: 'string' },
  VITE_FIREBASE_APP_ID: { required: true, type: 'string' },
  
  // App Config
  VITE_APP_ENV: { required: false, type: 'string', default: 'development' },
  VITE_APP_VERSION: { required: false, type: 'string', default: '1.0.0' },
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: { required: false, type: 'boolean', default: false },
  VITE_ENABLE_ERROR_TRACKING: { required: false, type: 'boolean', default: false },
  VITE_ENABLE_PERFORMANCE_MONITORING: { required: false, type: 'boolean', default: false },
  
  // Sentry
  VITE_SENTRY_DSN: { required: false, type: 'string' },
  VITE_SENTRY_ENVIRONMENT: { required: false, type: 'string', default: 'development' },
  VITE_SENTRY_TRACES_SAMPLE_RATE: { required: false, type: 'number', default: 1.0 },
};

class EnvConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnvConfigError';
  }
}

/**
 * Validates environment variables against schema
 * @throws {EnvConfigError} If required variables are missing or invalid
 */
export function validateEnv() {
  const errors = [];
  
  Object.entries(ENV_SCHEMA).forEach(([key, config]) => {
    const value = import.meta.env[key];
    
    // Check required fields
    if (config.required && (value === undefined || value === '')) {
      errors.push(`Missing required environment variable: ${key}`);
      return;
    }
    
    // Type validation
    if (value !== undefined && value !== '') {
      if (config.type === 'boolean' && !['true', 'false'].includes(String(value).toLowerCase())) {
        errors.push(`${key} must be a boolean (true/false)`);
      }
      if (config.type === 'number' && isNaN(Number(value))) {
        errors.push(`${key} must be a number`);
      }
    }
  });
  
  if (errors.length > 0) {
    throw new EnvConfigError(
      `Environment configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Gets a typed environment variable
 */
function getEnvVar(key, type, defaultValue) {
  const value = import.meta.env[key];
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  switch (type) {
    case 'boolean':
      return String(value).toLowerCase() === 'true';
    case 'number':
      return Number(value);
    default:
      return value;
  }
}

/**
 * Environment configuration object with typed getters
 */
export const env = {
  // Environment
  get isDevelopment() { return this.appEnv === 'development'; },
  get isProduction() { return this.appEnv === 'production'; },
  get isStaging() { return this.appEnv === 'staging'; },
  get isTest() { return import.meta.env.MODE === 'test'; },
  
  // App
  get appEnv() { return getEnvVar('VITE_APP_ENV', 'string', 'development'); },
  get appVersion() { return getEnvVar('VITE_APP_VERSION', 'string', '1.0.0'); },
  get appName() { return getEnvVar('VITE_APP_NAME', 'string', 'SkillSync'); },
  
  // Firebase
  get firebaseApiKey() { return getEnvVar('VITE_FIREBASE_API_KEY', 'string'); },
  get firebaseAuthDomain() { return getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'string'); },
  get firebaseProjectId() { return getEnvVar('VITE_FIREBASE_PROJECT_ID', 'string'); },
  get firebaseStorageBucket() { return getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'string'); },
  get firebaseMessagingSenderId() { return getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', 'string'); },
  get firebaseAppId() { return getEnvVar('VITE_FIREBASE_APP_ID', 'string'); },
  get firebaseMeasurementId() { return getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', 'string'); },
  
  // Features
  get enableAnalytics() { return getEnvVar('VITE_ENABLE_ANALYTICS', 'boolean', false); },
  get enableErrorTracking() { return getEnvVar('VITE_ENABLE_ERROR_TRACKING', 'boolean', false); },
  get enablePerformanceMonitoring() { return getEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', 'boolean', false); },
  get enableDebugMode() { return getEnvVar('VITE_ENABLE_DEBUG_MODE', 'boolean', false); },
  
  // Sentry
  get sentryDsn() { return getEnvVar('VITE_SENTRY_DSN', 'string'); },
  get sentryEnvironment() { return getEnvVar('VITE_SENTRY_ENVIRONMENT', 'string', 'development'); },
  get sentryTracesSampleRate() { return getEnvVar('VITE_SENTRY_TRACES_SAMPLE_RATE', 'number', 1.0); },
  
  // API
  get apiUrl() { return getEnvVar('VITE_API_URL', 'string', 'http://localhost:3000'); },
  get apiTimeout() { return getEnvVar('VITE_API_TIMEOUT', 'number', 30000); },
};

// Validate on import in production
if (import.meta.env.MODE !== 'development') {
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment Configuration Error:', error.message);
    if (import.meta.env.MODE === 'production') {
      throw error;
    }
  }
}

export default env;
