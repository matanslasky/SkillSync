# Deployment Guide

## Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Get your Firebase configuration values

2. **GitHub Repository**
   - Push code to GitHub
   - Set up repository secrets (see below)

3. **Domain (Optional)**
   - Purchase and configure a custom domain
   - Add to Firebase Hosting

## Environment Variables

### Required Secrets (GitHub Actions)

Add these secrets to your GitHub repository settings:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT=<your_service_account_json>
FIREBASE_TOKEN=<firebase_ci_token>
FIREBASE_PROJECT_ID=your_project_id
```

### Get Firebase CI Token

```bash
npm install -g firebase-tools
firebase login:ci
# Copy the token and add it to GitHub secrets as FIREBASE_TOKEN
```

## Deployment Methods

### 1. Automatic Deployment (Recommended)

**On every push to main branch:**
```bash
git push origin main
```
- Runs tests automatically
- Builds production bundle
- Deploys to Firebase Hosting
- Deploys Firebase Functions

**Preview deployments on PRs:**
- Automatically creates preview URLs for pull requests
- Comments on PR with preview link
- Preview expires after 7 days

### 2. Manual Deployment

**Using Firebase CLI:**
```bash
cd client
npm run build
firebase deploy --only hosting

# Deploy functions
cd ../functions
firebase deploy --only functions
```

**Using GitHub Actions (Manual Trigger):**
- Go to Actions tab in GitHub
- Select "CD - Deploy to Firebase"
- Click "Run workflow"

### 3. Docker Deployment

**Build Docker image:**
```bash
docker build -t skillsync:latest .
```

**Run container:**
```bash
docker run -p 3000:3000 \
  -e VITE_FIREBASE_API_KEY=your_key \
  -e VITE_FIREBASE_AUTH_DOMAIN=your_domain \
  # ... other env vars
  skillsync:latest
```

**Using Docker Compose:**
```bash
docker-compose up -d
```

## CI/CD Pipeline

### Workflows

1. **CI (Continuous Integration)**
   - Triggers: Push to main/develop, Pull requests
   - Steps:
     - Run linter
     - Run tests
     - Security scan
     - Build Docker image
   - File: `.github/workflows/ci.yml`

2. **CD (Continuous Deployment)**
   - Triggers: Push to main branch
   - Steps:
     - Build production bundle
     - Deploy to Firebase Hosting
     - Deploy Firebase Functions
   - File: `.github/workflows/deploy.yml`

3. **Preview Deployment**
   - Triggers: Pull requests
   - Creates preview URL for testing
   - File: `.github/workflows/preview.yml`

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Visit production URL
- [ ] Test authentication (login/register)
- [ ] Test core features (projects, tasks, teams)
- [ ] Check error tracking dashboard (Sentry)
- [ ] Verify analytics data (Firebase Analytics)

### 2. Performance Optimization
- [ ] Run Lighthouse audit
- [ ] Check bundle size (should be < 500KB)
- [ ] Verify lazy loading works
- [ ] Test on slow 3G connection
- [ ] Check Core Web Vitals

### 3. Security
- [ ] Verify HTTPS is enforced
- [ ] Check security headers (CSP, HSTS)
- [ ] Test rate limiting
- [ ] Review Firestore security rules
- [ ] Check authentication flows

### 4. Monitoring
- [ ] Set up Sentry alerts
- [ ] Configure Firebase Performance Monitoring
- [ ] Enable uptime monitoring
- [ ] Set up error notifications

## Rollback Procedure

If something goes wrong:

### Using Firebase CLI:
```bash
firebase hosting:rollback
```

### Using GitHub:
1. Revert the problematic commit
2. Push to main branch
3. Wait for automatic deployment

### Manual Rollback:
1. Checkout previous working commit
2. Build: `npm run build`
3. Deploy: `firebase deploy --only hosting`

## Monitoring & Logs

### Firebase Hosting Logs
```bash
firebase hosting:logs
```

### Firebase Functions Logs
```bash
firebase functions:log
```

### GitHub Actions Logs
- Go to Actions tab in repository
- Click on workflow run
- View detailed logs

## Performance Optimization

### Bundle Analysis
```bash
npm run build:analyze
```
Opens visualization of bundle sizes

### Recommended Optimizations
1. **Code Splitting**: Automatically configured in vite.config.js
2. **Lazy Loading**: Use React.lazy() for routes
3. **Image Optimization**: Use WebP format, lazy load images
4. **Caching**: Configured in firebase.json
5. **Compression**: Gzip and Brotli enabled

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for missing environment variables

### Deployment Fails
- Verify Firebase CLI is authenticated: `firebase login`
- Check project ID: `firebase use --project your-project-id`
- Verify GitHub secrets are set correctly

### Runtime Errors
- Check browser console for errors
- Review Sentry error reports
- Check Firebase Functions logs
- Verify environment variables are set

## Support

- Documentation: [README.md](../README.md)
- Issues: GitHub Issues
- Firebase Support: https://firebase.google.com/support

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure CDN (if needed)
3. Set up monitoring alerts
4. Plan for scaling
5. Regular security audits
