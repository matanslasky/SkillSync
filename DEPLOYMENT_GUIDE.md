# SkillSync Deployment Guide

Complete guide for deploying SkillSync to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Production Build](#production-build)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v18+ and npm v9+
- **Firebase CLI** v13+
- **Git** for version control
- **Domain name** (optional, for custom domain)

### Required Accounts

- **Firebase Project** (with Blaze plan for production)
- **GitHub Account** (for CI/CD)
- **Domain registrar** (optional)

### Install Firebase CLI

```bash
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/matanslasky/SkillSync.git
cd SkillSync
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies (if using Express server)
cd server
npm install
cd ..

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 3. Environment Variables

Create environment files for different environments:

#### Client Environment Variables

**client/.env.production**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
VITE_APP_NAME=SkillSync
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.skillsync.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

**client/.env.development**
```bash
# Firebase Configuration (use development project)
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id

# App Configuration
VITE_APP_NAME=SkillSync (Dev)
VITE_API_URL=http://localhost:5001

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
```

#### Server Environment Variables (if using Express)

**server/.env.production**
```bash
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsync

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@skillsync.com
SMTP_PASS=your_email_password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `skillsync-production`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Firebase Services

#### Authentication
```bash
firebase console:projects
# Select your project
# Navigate to Authentication → Sign-in method
# Enable: Email/Password, Google
```

#### Firestore Database
1. Navigate to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Production mode"**
4. Select location (closest to your users)
5. Click **"Enable"**

#### Cloud Storage
1. Navigate to **Storage**
2. Click **"Get started"**
3. Use default security rules (we'll update later)
4. Click **"Done"**

#### Cloud Functions
```bash
firebase init functions
# Select: Use existing project
# Choose: JavaScript or TypeScript
# Install dependencies: Yes
```

### 3. Configure Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId);
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
        (resource.data.createdBy == request.auth.uid ||
         resource.data.assigneeId == request.auth.uid);
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated() &&
        (resource.data.senderId == request.auth.uid ||
         resource.data.recipientId == request.auth.uid);
      allow create: if isAuthenticated() &&
        request.resource.data.senderId == request.auth.uid;
      allow update, delete: if isAuthenticated() &&
        resource.data.senderId == request.auth.uid;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### 4. Configure Storage Security Rules

Update `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile photos
    match /profile-photos/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
    }
    
    // Project files
    match /project-files/{projectId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.resource.size < 10 * 1024 * 1024; // 10MB max
    }
  }
}
```

Deploy storage rules:
```bash
firebase deploy --only storage:rules
```

### 5. Create Firestore Indexes

Update `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "visibility", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## Production Build

### 1. Build Client

```bash
cd client

# Install dependencies
npm install

# Run production build
npm run build

# Output will be in client/dist/
```

### 2. Optimize Build

**Verify Build Output:**
```bash
# Check bundle sizes
ls -lh dist/assets/

# Should see:
# - index.html (~1KB)
# - CSS files (~50KB gzipped)
# - JS chunks (largest should be <500KB gzipped)
```

**Build Configuration (already optimized in vite.config.js):**
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Remove console.logs
      }
    }
  }
});
```

### 3. Test Production Build Locally

```bash
# Serve production build
npm run preview

# Visit http://localhost:4173
# Test all critical features
```

---

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

**Advantages:**
- Free SSL certificate
- Global CDN
- Easy rollback
- Preview channels
- Integrated with Firebase services

**Steps:**

1. **Initialize Firebase Hosting**
```bash
firebase init hosting

# Choose:
# - Use existing project
# - Public directory: client/dist
# - Single-page app: Yes
# - Automatic builds with GitHub: No (we'll use Actions)
```

2. **Update firebase.json**
```json
{
  "hosting": {
    "public": "client/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

3. **Deploy to Firebase**
```bash
# Build client
cd client && npm run build && cd ..

# Deploy everything
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting

# Deploy with message
firebase deploy -m "Initial production deployment"
```

4. **View Deployment**
```bash
# Get hosting URL
firebase hosting:sites:list

# Your app will be at:
# https://your-project-id.web.app
# https://your-project-id.firebaseapp.com
```

### Option 2: Custom Domain

1. **Add Custom Domain**
```bash
firebase hosting:sites:create skillsync-prod

# In Firebase Console:
# Hosting → Add custom domain → Enter your domain
# Follow DNS configuration instructions
```

2. **Update DNS Records**
```
# Add these records at your domain registrar:
Type: A
Name: @
Value: (Firebase provides IP)

Type: A  
Name: www
Value: (Firebase provides IP)

# Or use CNAME:
Type: CNAME
Name: www
Value: your-project-id.web.app
```

3. **SSL Certificate**
- Firebase automatically provisions SSL certificate
- Takes 24-48 hours to activate
- Auto-renewal handled by Firebase

### Option 3: GitHub Actions Auto-Deploy

**.github/workflows/deploy.yml** (already created):
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd client
          npm ci
          
      - name: Build
        run: |
          cd client
          npm run build
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## Post-Deployment

### 1. Verify Deployment

**Check Hosting:**
```bash
# Visit your deployed URL
# https://your-project-id.web.app

# Verify:
✓ Homepage loads
✓ Login/Register works
✓ Firebase connection
✓ All routes accessible
✓ No console errors
```

**Test Core Features:**
- [ ] User registration
- [ ] User login
- [ ] Create project
- [ ] Create task
- [ ] Send message
- [ ] Upload image
- [ ] Notifications
- [ ] Theme toggle

### 2. Configure Analytics

**Enable Google Analytics:**
```bash
# In Firebase Console:
# Analytics → Dashboard → Enable

# Verify tracking in client/src/config/firebase.js
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

### 3. Set Up Monitoring

**Firebase Performance Monitoring:**
```bash
npm install firebase/performance

# Add to client/src/config/firebase.js
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

**Error Tracking (Sentry - Optional):**
```bash
npm install @sentry/react

# Add to client/src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 4. Configure Backup

**Automated Firestore Backups:**
```bash
# In Firebase Console:
# Firestore → Backups → Schedule backup
# Frequency: Daily
# Retention: 30 days
```

---

## Monitoring & Maintenance

### Daily Checks

1. **Error Logs**
```bash
# View Firebase Functions logs
firebase functions:log

# Filter errors only
firebase functions:log --only error
```

2. **Usage Metrics**
- Check Firebase Console → Usage and billing
- Monitor Firestore reads/writes
- Check Storage usage
- Review Authentication activity

### Weekly Tasks

1. **Performance Review**
- Check Firebase Performance tab
- Review slow queries
- Optimize if needed

2. **Security Audit**
- Review Firebase Authentication logs
- Check for suspicious activity
- Update security rules if needed

3. **Backup Verification**
- Verify Firestore backups are running
- Test restore process monthly

### Monthly Tasks

1. **Dependency Updates**
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Test thoroughly before deploying
```

2. **Cost Analysis**
- Review Firebase billing
- Optimize if approaching limits
- Consider upgrading plan if needed

3. **User Feedback**
- Review user reports
- Prioritize bug fixes
- Plan feature updates

---

## Troubleshooting

### Build Errors

**Problem: Build fails with memory error**
```bash
# Solution: Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**Problem: Module not found errors**
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

### Deployment Errors

**Problem: Firebase deploy fails**
```bash
# Solution: Re-authenticate
firebase logout
firebase login
firebase deploy
```

**Problem: Hosting URL not accessible**
```bash
# Check deployment status
firebase hosting:channel:list

# Redeploy
firebase deploy --only hosting
```

### Runtime Errors

**Problem: Firebase connection fails**
```bash
# Check environment variables
echo $VITE_FIREBASE_API_KEY

# Verify .env.production is loaded
```

**Problem: 403 Permission denied**
```bash
# Update Firestore rules
firebase deploy --only firestore:rules

# Check user authentication status
```

### Performance Issues

**Problem: Slow page loads**
- Enable compression in firebase.json
- Optimize images (use WebP format)
- Lazy load components
- Check bundle sizes

**Problem: High Firestore costs**
- Add indexes for complex queries
- Implement caching
- Use pagination
- Optimize listeners

---

## Rollback Procedure

### Quick Rollback

```bash
# List previous deployments
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Rollback to previous version
firebase hosting:rollback
```

### Manual Rollback

```bash
# Checkout previous commit
git log --oneline
git checkout <commit-hash>

# Rebuild and deploy
cd client && npm run build && cd ..
firebase deploy --only hosting
```

---

## Production Checklist

Before going live, ensure:

- [ ] Environment variables configured
- [ ] Firebase security rules deployed
- [ ] Firestore indexes created
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] Custom domain configured (optional)
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Support channels ready

---

## Support Resources

- 📧 **DevOps Support**: devops@skillsync.com
- 📚 **Firebase Docs**: firebase.google.com/docs
- 🐛 **Issue Tracker**: github.com/matanslasky/SkillSync/issues
- 💬 **Team Chat**: Slack/Discord

---

*Last Updated: February 2026*
*Version: 1.0*
