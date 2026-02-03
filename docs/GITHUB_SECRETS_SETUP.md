# GitHub Secrets Configuration Guide

## Overview
GitHub Secrets are encrypted environment variables used in CI/CD workflows to store sensitive data like API keys and deployment tokens.

## Required Secrets

### Firebase Configuration (from client/.env)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Firebase Deployment Tokens
```
FIREBASE_TOKEN               # Service account token for CLI deployments
FIREBASE_SERVICE_ACCOUNT     # JSON service account key (full JSON string)
```

### API Keys
```
VITE_GEMINI_API_KEY         # Google Gemini API key (staging)
VITE_GEMINI_API_KEY_PROD    # Google Gemini API key (production)
```

### Error Tracking (Sentry)
```
VITE_SENTRY_DSN             # Sentry DSN for staging
VITE_SENTRY_DSN_PROD        # Sentry DSN for production
```

## Setup Instructions

### 1. Get Firebase Service Account Token

#### Method A: Using Firebase CLI
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate CI token
firebase login:ci
```

Copy the generated token and save it as `FIREBASE_TOKEN` secret.

#### Method B: Service Account JSON (Recommended for GitHub Actions)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (skillsync-2dc94)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy the **entire JSON content** (not the file)
7. Save as `FIREBASE_SERVICE_ACCOUNT` secret

### 2. Configure GitHub Secrets

#### Navigate to GitHub Secrets
1. Go to your repository: https://github.com/[username]/SkillSync
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

#### Add Each Secret
For each secret listed above:
1. Click **New repository secret**
2. Enter **Name** (exact name from list above)
3. Enter **Secret** (the value)
4. Click **Add secret**

### 3. Copy Values from .env

Your current `.env` file contains these values:

```bash
# Copy from client/.env
VITE_FIREBASE_API_KEY=AIzaSyDL7U41rOzUWw0q6YZp0p3UzJ_l-tzp9GU
VITE_FIREBASE_AUTH_DOMAIN=skillsync-2dc94.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skillsync-2dc94
VITE_FIREBASE_STORAGE_BUCKET=skillsync-2dc94.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=920871379359
VITE_FIREBASE_APP_ID=1:920871379359:web:1063fa340303bef46b9daa
VITE_GEMINI_API_KEY=AIzaSyCLEW2Bmuw6Lpnccea9VtQqxoMN_UiZGiU
```

Add each as a GitHub Secret with the same name and value.

### 4. Verify Secrets

After adding all secrets:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify you have at least 10 secrets configured
3. Secrets should be listed (values are hidden)

## Environment-Specific Configuration

### Development
- Uses local `.env` file
- No GitHub Secrets needed

### Staging (Auto-deploy on `main` branch push)
- Uses staging Sentry DSN
- Deploys to Firebase Hosting live channel
- Environment: `staging`

### Production (Manual workflow trigger)
- Uses production Sentry DSN (`VITE_SENTRY_DSN_PROD`)
- Uses production Gemini key (`VITE_GEMINI_API_KEY_PROD`)
- Requires version tag input
- Creates GitHub Release
- Environment: `production`

## Testing Workflows

### Test CI Workflow
1. Create a new branch: `git checkout -b test-ci`
2. Make a small change: `echo "test" >> README.md`
3. Commit and push: `git add . && git commit -m "test: CI workflow" && git push origin test-ci`
4. Create a Pull Request
5. Check **Actions** tab for workflow run

### Test Staging Deployment
1. Merge PR to `main` branch
2. Check **Actions** tab for auto-deployment
3. Visit: https://skillsync-2dc94.web.app

### Test Production Deployment
1. Go to **Actions** tab
2. Click **Deploy to Production**
3. Click **Run workflow**
4. Enter version (e.g., `v1.0.0`)
5. Click **Run workflow**
6. Monitor deployment
7. Visit: https://skillsync-2dc94.firebaseapp.com

## Security Best Practices

### ✅ DO:
- Rotate secrets periodically (every 90 days)
- Use different API keys for staging/production
- Limit secret access to necessary workflows only
- Use GitHub Environments for additional protection
- Enable required reviewers for production deployments

### ❌ DON'T:
- Commit secrets to Git (even in `.env`)
- Share secrets in plain text (Slack, email, etc.)
- Use production secrets in development
- Print/log secrets in workflow outputs
- Reuse the same secret across multiple projects

## Troubleshooting

### Workflow fails with "Secret not found"
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is added at repository level (not environment)
3. Check workflow file uses correct secret name: `${{ secrets.SECRET_NAME }}`

### Firebase deployment fails
1. Verify `FIREBASE_TOKEN` or `FIREBASE_SERVICE_ACCOUNT` is valid
2. Check Firebase project ID matches: `skillsync-2dc94`
3. Ensure service account has correct permissions (Firebase Hosting Admin)

### Build fails with "Invalid API key"
1. Verify all `VITE_FIREBASE_*` secrets are added
2. Check for typos in secret values
3. Ensure no extra spaces or newlines in secret values

### Sentry integration not working
1. Verify `VITE_SENTRY_DSN` is correct format: `https://[hash]@[org].ingest.sentry.io/[id]`
2. Check Sentry project exists and DSN is active
3. Ensure `VITE_ENABLE_ERROR_TRACKING=true` in workflow env

## Additional Resources

- [GitHub Actions Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase CI/CD Guide](https://firebase.google.com/docs/hosting/github-integration)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Sentry CI/CD Integration](https://docs.sentry.io/product/cli/configuration/)
