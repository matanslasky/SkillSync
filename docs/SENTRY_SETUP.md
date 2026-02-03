# Sentry Error Tracking Setup Guide

## Overview
Sentry provides real-time error tracking, performance monitoring, and user session replay for production applications.

## Prerequisites
- A Sentry account (free tier available at https://sentry.io)
- Admin access to create projects

## Setup Steps

### 1. Create Sentry Account & Project
1. Go to https://sentry.io and sign up for a free account
2. Create a new project:
   - Platform: **React**
   - Project name: **SkillSync** (or your preferred name)
   - Team: Default (or create new team)

### 2. Get Your DSN (Data Source Name)
1. After creating the project, you'll see a DSN in the format:
   ```
   https://[hash]@o[org-id].ingest.sentry.io/[project-id]
   ```
2. You can also find it later in: **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**

### 3. Configure Environment Variables
1. Open `client/.env`
2. Update the following variables:
   ```env
   # Enable error tracking
   VITE_ENABLE_ERROR_TRACKING=true
   
   # Add your Sentry DSN
   VITE_SENTRY_DSN=https://your-hash@oXXXXX.ingest.sentry.io/XXXXXX
   
   # Set environment (development, staging, or production)
   VITE_SENTRY_ENVIRONMENT=development
   ```

### 4. Test Error Tracking
1. Start your development server:
   ```bash
   cd client
   npm run dev
   ```

2. Trigger a test error (temporary):
   - Add this to any component:
     ```javascript
     throw new Error('Test error for Sentry');
     ```
   - Or use browser console:
     ```javascript
     throw new Error('Test error from console');
     ```

3. Check Sentry dashboard:
   - Go to https://sentry.io/organizations/[your-org]/issues/
   - You should see your test error appear within seconds

### 5. Configure Alerts (Optional)
1. In Sentry dashboard, go to **Alerts**
2. Create alert rules for:
   - New issue created
   - High error frequency
   - Performance degradation

### 6. Deploy to Production
When deploying to production:

```env
# Production .env
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=https://your-production-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_ENV=production
```

## Features Enabled

### ✅ Error Capture
- All unhandled errors automatically captured
- React ErrorBoundary integration
- Manual error tracking via `captureException()`

### ✅ Performance Monitoring
- Transaction tracing (configurable sample rate)
- API call performance tracking
- Component render times

### ✅ Session Replay
- 10% of sessions recorded in production
- 100% of error sessions recorded
- User interactions captured (with privacy masking)

### ✅ Context & Tags
- User information (when authenticated)
- Environment (dev/staging/production)
- App version
- React component stack traces

## Current Integration Points

### 1. Application Entry (main.jsx)
- Initializes Sentry on app startup
- Configures integrations and sampling rates

### 2. ErrorBoundary Component
- Catches React component errors
- Sends to Sentry with component stack
- Shows user-friendly error UI

### 3. Service Layer (All services)
- API errors tracked with context
- Firestore operation failures
- AI service errors

## Best Practices

### ✅ DO:
- Enable error tracking in **staging** and **production** only
- Set appropriate sample rates for performance (1.0 in dev, 0.1-0.3 in prod)
- Add custom tags for better filtering:
  ```javascript
  captureException(error, {
    tags: { feature: 'ai-wizard', operation: 'generate-project' }
  })
  ```
- Use breadcrumbs for debugging context
- Set user context when available

### ❌ DON'T:
- Enable in development (too noisy)
- Commit DSN to Git (already in .gitignore)
- Capture sensitive data (passwords, tokens)
- Set 100% sampling in production (expensive)

## Troubleshooting

### Errors not appearing in Sentry?
1. Check `VITE_ENABLE_ERROR_TRACKING=true` in .env
2. Verify DSN is correct (no typos)
3. Check browser console for Sentry initialization message
4. Ensure you're not blocking sentry.io in ad blocker

### Too many errors?
1. Adjust `ignoreErrors` in errorTracking.js
2. Lower sample rates
3. Filter by environment/release in Sentry dashboard

### Performance impact?
- Sentry adds <50kb to bundle size
- Minimal runtime overhead (<1% CPU)
- Uses RequestIdleCallback for non-critical work
- Session replay can be disabled if needed

## Cost Management

### Free Tier Limits:
- **5,000 errors/month**
- **10,000 performance transactions/month**
- **50 replays/month**
- 1 user

### Tips to stay under limits:
1. Use environment filters (only prod/staging)
2. Set appropriate sample rates
3. Filter known issues (ignoreErrors)
4. Use rate limiting per user
5. Disable replays if not needed

## Additional Resources
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
- [Best Practices](https://docs.sentry.io/product/best-practices/)
