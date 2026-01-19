# SkillSync - Quick Start (No Node.js Yet)

## 🚨 Node.js Not Detected

Your system doesn't have Node.js installed or it's not in your PATH. Follow these steps to get started:

---

## Step 1: Install Node.js

### Option A: Official Installer (Recommended)
1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - Choose Windows Installer (.msi) - 64-bit

2. **Run the Installer**
   - Double-click the downloaded file
   - Click "Next" through the setup wizard
   - ✅ **Important**: Check "Automatically install the necessary tools"
   - Complete the installation
   - **Restart your computer** (or at least your terminal)

3. **Verify Installation**
   Open PowerShell or Command Prompt and run:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.11.0 and 10.2.4)

### Option B: Using Chocolatey (Windows Package Manager)
If you have Chocolatey installed:
```powershell
# Run as Administrator
choco install nodejs-lts
```

---

## Step 2: Install MongoDB

### Option A: MongoDB Community Edition (Local)
1. **Download**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows, latest version
   - Download the MSI installer

2. **Install**
   - Run the installer
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass" (GUI tool)

3. **Verify**
   - MongoDB should start automatically as a service
   - Open MongoDB Compass to test connection
   - Default connection: `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud - No Local Install)
1. **Sign Up** (Free)
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Create a free account

2. **Create a Cluster**
   - Choose "Free Shared" tier
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster"

3. **Set Up Access**
   - Create a database user (username + password)
   - Add your IP address to whitelist (or allow from anywhere: `0.0.0.0/0`)
   - Get your connection string (looks like `mongodb+srv://...`)

---

## Step 3: Install SkillSync Dependencies

Once Node.js is installed, open PowerShell/Terminal in the SkillSync folder:

```powershell
# Navigate to project
cd C:\Users\matan\OneDrive\Documents\GitHub\SkillSync

# Install all dependencies (this will take a few minutes)
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Return to root
cd ..
```

---

## Step 4: Configure Environment Variables

### Client Configuration
```powershell
cd client
copy .env.example .env
notepad .env
```

Paste this into `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Server Configuration
```powershell
cd ../server
copy .env.example .env
notepad .env
```

Edit `server/.env`:

**For Local MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=my_super_secret_key_change_this_in_production_12345
JWT_EXPIRE=30d
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsync?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_change_this_in_production_12345
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## Step 5: Start the Application

From the project root:

```powershell
# Start both client and server
npm run dev
```

You should see:
```
[server] 🚀 Server running on port 5000
[server] ✅ MongoDB Connected: localhost
[client] VITE ready in 500ms
[client] ➜ Local: http://localhost:5173/
```

---

## Step 6: Open in Browser

1. Navigate to: **http://localhost:5173**
2. You should see the SkillSync login page
3. Click "Create one" to register
4. Fill in your details and start exploring!

---

## 🐛 Troubleshooting

### "npm is not recognized"
**Solution**: Node.js not in PATH
1. Restart your terminal/computer after installing Node.js
2. Or manually add Node.js to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\Program Files\nodejs\`

### "Cannot connect to MongoDB"
**Solution A** (Local): Start MongoDB service
```powershell
# Run as Administrator
net start MongoDB
```

**Solution B** (Atlas): Check connection string
- Ensure username/password are correct
- Replace `<password>` with actual password
- IP address is whitelisted

### Port 5000 or 5173 Already in Use
**Solution**: Kill the process
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Module Not Found Errors
**Solution**: Reinstall dependencies
```powershell
rm -rf node_modules
npm install
```

---

## 📚 What's Next?

Once everything is running:

1. **Explore the Dashboard** - Check out the UI
2. **Read PLAN.md** - Understand the architecture
3. **Read SUMMARY.md** - See what's been built
4. **Start Building** - Follow Phase 2 in PLAN.md

---

## 🆘 Still Having Issues?

### System Requirements
- Windows 10 or 11
- 8GB RAM minimum
- 2GB free disk space
- Internet connection

### Recommended Tools
- **VS Code**: https://code.visualstudio.com/
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **Postman**: https://www.postman.com/ (API testing)

### Check Your Setup
```powershell
# Verify all tools are installed
node --version    # Should show v18+ or v20+
npm --version     # Should show 9+ or 10+
mongod --version  # Should show 6+ or 7+ (if local)
```

---

## ✅ Ready to Code!

You're all set! Follow the main [INSTALLATION.md](INSTALLATION.md) for detailed development workflows.

**Welcome to SkillSync!** 🚀
