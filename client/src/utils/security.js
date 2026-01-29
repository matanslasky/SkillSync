/**
 * Security Headers Configuration
 * Implements Content Security Policy and other security headers
 */

import { env } from '../config/env';

/**
 * Content Security Policy configuration
 */
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite HMR in dev
    "'unsafe-eval'", // Required for Vite HMR in dev (remove in production)
    'https://www.gstatic.com',
    'https://www.googleapis.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://firebasestorage.googleapis.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.firebase.com',
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'wss://*.firebaseio.com',
  ],
  'frame-src': [
    "'self'",
    'https://*.firebaseapp.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate CSP header string
 */
export function generateCSP() {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) return directive;
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers for production
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Apply security headers to the document (for client-side enforcement)
 */
export function applySecurityHeaders() {
  if (!env.isProduction) {
    console.log('Security headers skipped in development');
    return;
  }

  // Add meta tags for CSP
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSP();
  document.head.appendChild(meta);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidRedirectUrl(url) {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Generate nonce for inline scripts
 */
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  generateCSP,
  applySecurityHeaders,
  sanitizeInput,
  isValidRedirectUrl,
  generateNonce,
  SECURITY_HEADERS,
};
