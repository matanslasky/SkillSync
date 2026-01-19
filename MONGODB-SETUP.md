# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### 1. Sign Up for MongoDB Atlas (Free)
Visit: https://www.mongodb.com/cloud/atlas/register

### 2. Create a Free Cluster
- Click "Build a Database"
- Choose **M0 FREE** tier
- Select a cloud provider (AWS recommended)
- Choose region closest to you
- Click "Create Cluster"

### 3. Create Database User
- Click "Database Access" in left menu
- Click "Add New Database User"
- Authentication Method: Password
- Username: `skillsync`
- Password: Generate a secure password (save it!)
- Database User Privileges: **Read and write to any database**
- Click "Add User"

### 4. Whitelist Your IP
- Click "Network Access" in left menu
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

### 5. Get Connection String
- Click "Database" in left menu
- Click "Connect" on your cluster
- Click "Connect your application"
- Copy the connection string, it looks like:
```
mongodb+srv://skillsync:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 6. Update Your .env File
Replace `<password>` with your actual password:

```env
MONGODB_URI=mongodb+srv://skillsync:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/skillsync?retryWrites=true&w=majority
```

### 7. Restart Your App
```powershell
# Stop current app (Ctrl+C if running)
npm run dev
```

---

## Quick Alternative: Use MongoDB Compass (Local Install)

If you prefer local MongoDB:

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install and open it
3. Connect to: `mongodb://localhost:27017`
4. MongoDB will start automatically

---

## Current Status

✅ Your app is configured for: `mongodb://localhost:27017/skillsync`
⚠️ MongoDB is not running locally

Choose one option above to get your database running!
