# SkillSync - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js (v18 or higher)** - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
3. **Git** - [Download here](https://git-scm.com/)

## Quick Start

### Step 1: Install Node.js

If you haven't installed Node.js yet:

1. Download from https://nodejs.org/ (LTS version recommended)
2. Run the installer
3. Verify installation:
```bash
node --version
npm --version
```

### Step 2: Install Dependencies

Navigate to the project root and install all dependencies:

```bash
cd C:\Users\matan\OneDrive\Documents\GitHub\SkillSync

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ..\server
npm install

# Return to root
cd ..
```

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
```bash
# Windows (run as Administrator)
net start MongoDB

# Or use MongoDB Compass (GUI)
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string

### Step 4: Configure Environment Variables

**Client Environment (.env)**
```bash
cd client
copy .env.example .env
```

Edit `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Server Environment (.env)**
```bash
cd ..\server
copy .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=your_super_secret_key_change_in_production_12345
JWT_EXPIRE=30d
NODE_ENV=development
```

### Step 5: Start the Application

From the project root:

```bash
# Start both client and server simultaneously
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### Step 6: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Project Structure

```
SkillSync/
├── client/              # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── contexts/    # React Context providers
│   │   ├── services/    # API service layers
│   │   └── App.jsx
│   └── package.json
├── server/              # Node.js Backend (Express)
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error handling
│   ├── config/          # Database config
│   └── server.js
└── package.json         # Root package (workspaces)
```

## Available Scripts

### Root Level
- `npm run dev` - Start both client and server
- `npm run client` - Start only frontend
- `npm run server` - Start only backend

### Client
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## Testing the Application

### 1. Register a New User
- Navigate to http://localhost:5173/register
- Fill in the form:
  - Name: Your Name
  - Email: your@email.com
  - Password: (min 6 characters)
  - Role: Developer/Designer/Marketer
- Click "Create Account"

### 2. Login
- Navigate to http://localhost:5173/login
- Use your registered credentials
- You'll be redirected to the Dashboard

### 3. Explore the Dashboard
The dashboard includes:
- **Sidebar Navigation**: Projects, Team, Messages, Settings
- **Project Overview**: Active project with progress bar
- **Commitment Score Gauge**: Visual score representation
- **Team List**: Squad members with live status
- **Activity Feed**: Recent actions

## Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different ports in .env files
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `server/.env`
- For Atlas: Whitelist your IP address

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### React Import Errors
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Now that the foundation is set up, you can:

1. **Create Projects** - Implement the Marketplace page
2. **Add Kanban Board** - Build drag-and-drop task management
3. **Integrate Commitment Score** - Add GitHub API and scoring logic
4. **Add Real-time Features** - Implement Socket.io notifications
5. **AI Mentor Integration** - Connect OpenAI API for roadmap generation

## Development Workflow

1. Make changes to code
2. Check browser for hot-reload (client)
3. Check terminal for server errors
4. Test API endpoints with tools like Postman or Thunder Client
5. Commit changes to Git

## Support

For issues or questions:
- Check the [PLAN.md](PLAN.md) for detailed architecture
- Review MongoDB logs
- Check browser console for frontend errors
- Check terminal for backend errors

Happy coding! 🚀
