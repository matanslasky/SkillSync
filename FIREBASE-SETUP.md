# 🔥 Firebase Setup Guide for SkillSync

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project" or "Create a project"
   - Enter project name: `SkillSync` (or your preferred name)
   - Click "Continue"
   
3. **Google Analytics** (Optional)
   - Toggle off for faster setup (you can enable later)
   - Click "Create project"
   - Wait for project creation (~30 seconds)
   - Click "Continue" when ready

## Step 2: Register Web App

1. **Add Web App**
   - In your Firebase project dashboard
   - Click the **Web icon** (`</>`) to add a web app
   - App nickname: `SkillSync Web`
   - ✅ Check "Also set up Firebase Hosting" (optional, for future deployment)
   - Click "Register app"

2. **Copy Firebase Configuration**
   - You'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "skillsync-xxxxx.firebaseapp.com",
     projectId: "skillsync-xxxxx",
     storageBucket: "skillsync-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```
   - **Keep this tab open** - you'll need these values!

## Step 3: Enable Authentication

1. **Navigate to Authentication**
   - In left sidebar, click "Authentication"
   - Click "Get started"

2. **Enable Email/Password**
   - Click "Sign-in method" tab
   - Click "Email/Password"
   - Toggle **Enable** to ON
   - Click "Save"

3. **(Optional) Enable Other Providers**
   - Google, GitHub, etc. (for future features)

## Step 4: Create Firestore Database

1. **Navigate to Firestore Database**
   - In left sidebar, click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules**
   - Select **"Start in test mode"** (for development)
   - ⚠️ Note: Test mode allows anyone to read/write for 30 days
   - You'll secure this later with proper rules
   - Click "Next"

3. **Select Location**
   - Choose a region close to you (e.g., `us-central`, `europe-west`)
   - ⚠️ This cannot be changed later!
   - Click "Enable"
   - Wait for database creation (~1 minute)

## Step 5: Configure Storage (Optional)

1. **Navigate to Storage**
   - In left sidebar, click "Storage"
   - Click "Get started"
   
2. **Security Rules**
   - Start in test mode
   - Click "Next"
   
3. **Location**
   - Use same location as Firestore
   - Click "Done"

## Step 6: Update Environment Variables

1. **Open your project**
   - Navigate to: `c:\Users\matan\OneDrive\Documents\GitHub\SkillSync\client\.env`

2. **Replace placeholders with your Firebase config:**
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Example (with fake values):**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyDxKL8h3F9mPQrTvWxYz
   VITE_FIREBASE_AUTH_DOMAIN=skillsync-abc123.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=skillsync-abc123
   VITE_FIREBASE_STORAGE_BUCKET=skillsync-abc123.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
   VITE_FIREBASE_APP_ID=1:987654321:web:abcdef123456
   ```

## Step 7: Restart Development Server

1. **Stop the current server**
   - Press `Ctrl + C` in the terminal running `npm run dev`

2. **Start server again**
   ```powershell
   cd c:\Users\matan\OneDrive\Documents\GitHub\SkillSync\client
   npm run dev
   ```

3. **Test the app**
   - Open http://localhost:5173
   - Try registering a new account
   - Check Firebase Console > Authentication > Users to see if it worked!

## Step 8: Set Up Firestore Security Rules (Later)

Once you've tested everything, secure your database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects - anyone authenticated can read, team members can write
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid in resource.data.team;
    }
    
    // Tasks - team members of the project can access
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check that your API key is correct in `.env`
- Make sure you're using `VITE_` prefix for all variables
- Restart the dev server after changing `.env`

### Error: "Missing or insufficient permissions"
- Make sure Firestore is in **test mode** (for now)
- Later, update security rules as shown in Step 8

### Can't see registered users
- Go to Firebase Console > Authentication > Users
- If empty, check browser console for errors
- Verify `.env` file has correct values

### Database operations timeout
- Check internet connection
- Verify Firestore is enabled (Step 4)
- Check Firestore location/region is set

## Next Steps

✅ Once Firebase is configured and working:
1. Test registration and login
2. Create a test project from the Marketplace
3. Add tasks to the Kanban board
4. Verify data appears in Firebase Console > Firestore Database

🎉 **You're all set!** Your SkillSync app is now running on Firebase with no backend server needed!
