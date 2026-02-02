# SkillSync Setup Checklist ✅

This checklist covers all external services, credentials, and configurations you need to complete **outside of the code** to get SkillSync fully operational.

---

## 🔥 Firebase (REQUIRED)

### 1. Create Firebase Project
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Add project" or "Create a project"
- [ ] Enter project name: `SkillSync` (or your preferred name)
- [ ] Enable/Disable Google Analytics (your choice)
- [ ] Wait for project creation to complete

### 2. Enable Firebase Authentication
- [ ] In Firebase Console, go to **Authentication** → **Get Started**
- [ ] Click **Sign-in method** tab
- [ ] Enable **Email/Password** authentication
- [ ] (Optional) Enable other providers: Google, GitHub, etc.

### 3. Create Firestore Database
- [ ] In Firebase Console, go to **Firestore Database** → **Create database**
- [ ] Choose **Start in production mode** (we have security rules)
- [ ] Select your preferred location (closest to your users)
- [ ] Wait for database creation

### 4. Deploy Firestore Security Rules
- [ ] In Firestore, click **Rules** tab
- [ ] Copy the rules from `firestore.rules` in your project
- [ ] Paste into the Firebase Console rules editor
- [ ] Click **Publish** to deploy the rules

### 5. Enable Firebase Storage (Optional, for future features)
- [ ] In Firebase Console, go to **Storage** → **Get Started**
- [ ] Click **Next** and select your region
- [ ] Storage is now ready for file uploads

### 6. Get Firebase Credentials
- [ ] In Firebase Console, go to **Project Settings** (gear icon)
- [ ] Scroll down to **Your apps** section
- [ ] Click the **Web** icon (`</>`) to add a web app
- [ ] Register app name: `SkillSync Web`
- [ ] Copy the `firebaseConfig` object values
- [ ] Create `client/.env` file with these values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 🗄️ MongoDB (REQUIRED for server features)

### Option A: MongoDB Atlas (Cloud - Recommended for beginners)
- [ ] Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- [ ] Sign up for a free account
- [ ] Create a new **Free Shared Cluster** (M0 tier)
- [ ] Choose cloud provider and region (closest to you)
- [ ] Wait for cluster creation (~3-5 minutes)

#### Configure Database Access:
- [ ] Click **Database Access** in left sidebar
- [ ] Click **Add New Database User**
- [ ] Choose **Password** authentication
- [ ] Username: `skillsync_admin` (or your choice)
- [ ] Password: Generate a secure password (save it!)
- [ ] User Privileges: **Read and write to any database**
- [ ] Click **Add User**

#### Configure Network Access:
- [ ] Click **Network Access** in left sidebar
- [ ] Click **Add IP Address**
- [ ] Choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development
- [ ] (Production: Add specific IP addresses only)
- [ ] Click **Confirm**

#### Get Connection String:
- [ ] Click **Database** in left sidebar
- [ ] Click **Connect** on your cluster
- [ ] Choose **Connect your application**
- [ ] Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
- [ ] Replace `<password>` with your actual password
- [ ] Replace database name with `skillsync`

### Option B: MongoDB Community Edition (Local)
- [ ] Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- [ ] Install MongoDB Community Server
- [ ] Choose "Complete" installation
- [ ] Enable "Install MongoDB as a Service"
- [ ] Install MongoDB Compass (GUI tool)
- [ ] Verify MongoDB is running on `mongodb://localhost:27017`
- [ ] Connection string: `mongodb://localhost:27017/skillsync`

### 7. Configure Server Environment
- [ ] Create `server/.env` file with MongoDB connection:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skillsync
JWT_SECRET=your_super_secret_random_string_change_this
JWT_EXPIRE=30d
NODE_ENV=development
```

**⚠️ Important**: Generate a secure JWT_SECRET:
```powershell
# Run this in PowerShell to generate a random secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🤖 OpenAI API (OPTIONAL - for AI features)

**Note**: Currently, AI features are not implemented but the architecture supports them.

- [ ] Go to [OpenAI API](https://platform.openai.com/)
- [ ] Sign up or log in
- [ ] Go to **API keys** section
- [ ] Click **Create new secret key**
- [ ] Copy the key (starts with `sk-...`)
- [ ] Add to `server/.env`:
```env
OPENAI_API_KEY=sk-proj-...
```

**Pricing**: Pay-as-you-go, ~$0.002 per 1K tokens (GPT-3.5-turbo)

---

## 🔗 GitHub Integration (OPTIONAL)

**Note**: For displaying GitHub profiles in user profiles.

- [ ] Go to [GitHub Settings → Developer settings](https://github.com/settings/tokens)
- [ ] Click **Personal access tokens** → **Tokens (classic)**
- [ ] Click **Generate new token** → **Generate new token (classic)**
- [ ] Token name: `SkillSync GitHub Integration`
- [ ] Scopes: Select `read:user` and `user:email`
- [ ] Click **Generate token**
- [ ] Copy the token (starts with `ghp_...`)
- [ ] Add to `server/.env`:
```env
GITHUB_TOKEN=ghp_...
```

---

## 📹 Daily.co Video API (OPTIONAL - for future video meetings)

**Note**: Video meeting features are not implemented yet.

- [ ] Go to [Daily.co](https://www.daily.co/)
- [ ] Sign up for free account
- [ ] Go to **Developers** section
- [ ] Copy your API key
- [ ] Add to `server/.env`:
```env
DAILY_CO_API_KEY=your_daily_api_key
```

**Free Tier**: 10,000 minutes/month, up to 20 participants

---

## 🌐 Domain & Hosting (for production deployment)

### When Ready to Deploy:

#### Client (Frontend):
- [ ] Choose hosting platform:
  - **Vercel** (recommended for Vite/React) - [vercel.com](https://vercel.com)
  - **Netlify** - [netlify.com](https://netlify.com)
  - **Firebase Hosting** - [firebase.google.com/docs/hosting](https://firebase.google.com/docs/hosting)
- [ ] Connect GitHub repository
- [ ] Configure build command: `cd client && npm run build`
- [ ] Configure output directory: `client/dist`
- [ ] Add environment variables (VITE_FIREBASE_*)

#### Server (Backend):
- [ ] Choose hosting platform:
  - **Railway** - [railway.app](https://railway.app) (easiest)
  - **Render** - [render.com](https://render.com)
  - **Heroku** - [heroku.com](https://heroku.com)
  - **AWS/DigitalOcean** (advanced)
- [ ] Connect GitHub repository
- [ ] Configure start command: `cd server && npm start`
- [ ] Add environment variables (PORT, MONGODB_URI, JWT_SECRET, etc.)

#### Custom Domain (Optional):
- [ ] Purchase domain from Namecheap, GoDaddy, or Google Domains
- [ ] Configure DNS records in your hosting platform
- [ ] Enable SSL/HTTPS (usually automatic with modern hosts)

---

## 📧 Email Service (for future notifications)

**Note**: Not currently implemented, but consider for Phase 3.

Options:
- **SendGrid** - [sendgrid.com](https://sendgrid.com) - 100 emails/day free
- **Mailgun** - [mailgun.com](https://mailgun.com) - 1,000 emails/month free
- **AWS SES** - [aws.amazon.com/ses](https://aws.amazon.com/ses) - Very cheap

---

## 🔐 Security Checklist

### Before Going Live:
- [ ] Change all default passwords and secrets
- [ ] Use strong JWT_SECRET (64+ characters, random)
- [ ] Enable CORS only for your production domain
- [ ] Set `NODE_ENV=production` on server
- [ ] Review Firestore security rules
- [ ] Restrict MongoDB network access to server IP only
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring (Firebase Analytics, Sentry, etc.)
- [ ] Configure HTTPS/SSL certificates
- [ ] Add .env files to .gitignore (already done)

---

## ✅ Quick Verification

After setup, verify everything works:

### 1. Firebase Connection
```powershell
# Run client dev server
cd client
npm run dev
```
- [ ] Open http://localhost:5173
- [ ] Try to register a new user
- [ ] Check Firebase Console → Authentication (new user should appear)
- [ ] Check Firestore → users collection (user document should exist)

### 2. Server Connection
```powershell
# Run server
cd server
npm start
```
- [ ] Server should start on http://localhost:5000
- [ ] Check console for "Connected to MongoDB" message
- [ ] Check console for "Server running on port 5000"

### 3. Full Stack Test
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Create a project
- [ ] Invite team members
- [ ] Create a task in Kanban board
- [ ] Check notifications
- [ ] Toggle dark/light theme

---

## 📚 Helpful Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **MongoDB Atlas Tutorial**: https://www.mongodb.com/docs/atlas/getting-started/
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Express.js Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html

---

## 💬 Need Help?

If you get stuck:
1. Check the console logs (browser DevTools & server terminal)
2. Verify all environment variables are set correctly
3. Ensure Firebase rules are deployed
4. Check MongoDB connection string format
5. Review the main README.md for troubleshooting

---

**Last Updated**: January 22, 2026
**SkillSync Version**: Phase 2 Complete
