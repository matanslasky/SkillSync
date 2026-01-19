# Plan: Build SkillSync MVP from Scratch

Starting from an empty workspace, you'll build a full-stack collaborative platform for students to form project teams, tracked by a "Commitment Score" system, with integrated meeting tools and AI mentorship. This plan prioritizes the foundational architecture, core Dashboard UI, and authentication before layering in advanced features like scoring algorithms and AI integration.

## Steps

1. **Initialize monorepo structure** - Create root with `client/` (React + Vite + Tailwind) and `server/` (Node + Express), configure `package.json`, TypeScript, ESLint, and `.gitignore`

2. **Build authentication system** - Implement JWT-based auth in `server/routes/auth.js`, create User model in `server/models/User.js` with MongoDB/Mongoose, add protected route middleware

3. **Create Dashboard shell** - Build `client/src/components/Dashboard.jsx` with left sidebar navigation, center project overview with neon progress bars, and right column commitment score gauge using Tailwind's dark theme (#050505 bg, #00ff9d/#00b8ff/#ff4757 accents)

4. **Develop project and team formation** - Create Project model with team members array, build `client/src/pages/Marketplace.jsx` for posting/browsing project ideas, implement skill-based filtering logic in `server/controllers/matchingController.js`

5. **Implement Kanban board** - Build drag-and-drop task board in `client/src/components/KanbanBoard.jsx`, create Task model, add API endpoints for task CRUD with deadline tracking to feed Commitment Score

6. **Integrate Commitment Score engine** - Create `server/services/commitmentScore.js` with scoring algorithm (GitHub API commits, deadline compliance, meeting attendance), display live score in Dashboard with historical trend chart

## Further Considerations

1. **Socket.io setup** - Should real-time features (chat, notifications, live score updates) be implemented in Phase 1 or deferred to post-MVP? Recommendation: Add basic Socket.io scaffolding now for meeting notifications, full chat in Phase 2.

2. **AI Mentor integration** - Use OpenAI API or Anthropic Claude? Budget constraints? Recommendation: Start with OpenAI GPT-4 for roadmap generation, create `server/services/aiMentor.js` with prompt engineering for skill gap analysis.

3. **Video conferencing approach** - Build custom WebRTC or integrate third-party (Zoom SDK, Daily.co, Agora)? Recommendation: Use Daily.co embed for MVP (faster, includes recording hooks for attendance tracking).

## Tech Stack Confirmed

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide-React
- **State Management**: Context API + React Query (for server state)
- **Routing**: React Router v6
- **Drag & Drop**: @dnd-kit/core
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken + bcrypt)
- **Real-time**: Socket.io
- **API Integration**: Axios (for GitHub API, AI APIs)
- **Validation**: Express-validator

### External Services
- **AI**: OpenAI GPT-4 API
- **Video**: Daily.co API (embedded)
- **Version Control**: GitHub API for commit tracking

## Detailed Folder Structure

```
SkillSync/
├── client/                           # React Frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                   # Images, fonts, static files
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CommitmentGauge.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── TeamCard.jsx
│   │   ├── pages/                    # Route-level components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── ProjectView.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useCommitmentScore.js
│   │   ├── services/                 # API service layers
│   │   │   ├── api.js                # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   └── taskService.js
│   │   ├── utils/                    # Helper functions
│   │   │   ├── formatDate.js
│   │   │   └── scoreCalculator.js
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global + Tailwind imports
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                           # Node.js Backend
│   ├── config/
│   │   ├── db.js                     # MongoDB connection
│   │   └── socket.js                 # Socket.io setup
│   ├── models/
│   │   ├── User.js                   # User schema (skills, score, bio)
│   │   ├── Project.js                # Project schema (team, roadmap)
│   │   ├── Task.js                   # Task schema (Kanban)
│   │   └── Meeting.js                # Meeting logs
│   ├── routes/
│   │   ├── auth.js                   # POST /login, /register
│   │   ├── users.js                  # GET/PUT /users/:id
│   │   ├── projects.js               # CRUD for projects
│   │   ├── tasks.js                  # CRUD for tasks
│   │   └── scores.js                 # GET commitment scores
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── matchingController.js     # Skill-based matching logic
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── errorHandler.js
│   │   └── validate.js               # Request validation
│   ├── services/
│   │   ├── commitmentScore.js        # Score calculation engine
│   │   ├── aiMentor.js               # OpenAI API integration
│   │   └── githubService.js          # GitHub API calls
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── logger.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                     # Express app entry point
│
├── .gitignore                        # Root-level gitignore
├── README.md                         # Project documentation
└── package.json                      # Root package.json (workspace)
```

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['Developer', 'Designer', 'Marketer'],
  skills: [String],                    // e.g., ['React', 'Node.js', 'MongoDB']
  portfolio: String (URL),
  bio: String,
  commitmentScore: Number (0-100),
  scoreHistory: [{
    date: Date,
    score: Number
  }],
  projects: [ObjectId] (ref: Project),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  tags: [String],                      // e.g., ['Web App', 'MVP', 'SaaS']
  techStack: [String],                 // e.g., ['React', 'Express', 'MongoDB']
  teamMembers: [{
    user: ObjectId (ref: User),
    role: String,
    joinedAt: Date
  }],
  owner: ObjectId (ref: User),
  roadmap: {                           // Generated by AI Mentor
    phases: [{
      title: String,
      tasks: [String],
      estimatedDuration: String
    }]
  },
  meetingsLog: [ObjectId] (ref: Meeting),
  status: Enum ['Active', 'Completed', 'Archived'],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  project: ObjectId (ref: Project),
  title: String,
  description: String,
  assignee: ObjectId (ref: User),
  status: Enum ['To Do', 'In Progress', 'Done'],
  deadline: Date,
  priority: Enum ['Low', 'Medium', 'High'],
  createdBy: ObjectId (ref: User),
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Meeting Model
```javascript
{
  project: ObjectId (ref: Project),
  scheduledAt: Date,
  duration: Number (minutes),
  participants: [{
    user: ObjectId (ref: User),
    attended: Boolean,
    joinedAt: Date,
    leftAt: Date
  }],
  recordingUrl: String,
  notes: String,
  createdAt: Date
}
```

## Phase-by-Phase Implementation

### Phase 1: Foundation (Week 1-2)
**Goal**: Get the basic infrastructure running with authentication and navigation

- [ ] Initialize monorepo with Vite + Express
- [ ] Configure Tailwind with custom dark theme colors
- [ ] Set up MongoDB connection and User model
- [ ] Build JWT authentication (register, login, logout)
- [ ] Create protected route middleware
- [ ] Build basic Dashboard shell with Sidebar navigation
- [ ] Add React Router with private routes
- [ ] Create AuthContext for global auth state

**Deliverable**: Users can sign up, log in, and see an empty Dashboard

### Phase 2: Project & Team Formation (Week 3-4)
**Goal**: Users can create/browse projects and form teams

- [ ] Create Project and Task models
- [ ] Build Marketplace page with project listings
- [ ] Implement "Create Project" form with skill requirements
- [ ] Add skill-based filtering/search
- [ ] Create "Join Team" request system
- [ ] Build Project Detail view with team roster
- [ ] Add user profile pages with skill display

**Deliverable**: Users can post projects, browse by skills, and request to join teams

### Phase 3: Kanban & Commitment Score (Week 5-6)
**Goal**: Task management with automated scoring

- [ ] Build drag-and-drop Kanban board with @dnd-kit
- [ ] Create task CRUD API endpoints
- [ ] Implement deadline tracking logic
- [ ] Build Commitment Score calculation engine:
  - Track task completion rate vs. deadlines
  - Integrate GitHub API for commit counting
  - Add peer review collection form
- [ ] Display Commitment Score gauge on Dashboard
- [ ] Create score history chart with trend line

**Deliverable**: Teams manage tasks on Kanban, scores update automatically

### Phase 4: Real-Time Features (Week 7)
**Goal**: Add Socket.io for live updates

- [ ] Set up Socket.io on server and client
- [ ] Create SocketContext in React
- [ ] Implement real-time notifications:
  - New team member joins
  - Task status changes
  - Meeting reminders
- [ ] Add live score updates (broadcast when score changes)
- [ ] Build basic in-app messaging (optional for MVP)

**Deliverable**: Dashboard updates live without refresh

### Phase 5: Meeting Integration (Week 8)
**Goal**: Embed video conferencing with attendance tracking

- [ ] Integrate Daily.co API (or alternative)
- [ ] Build Meeting Room component with embed
- [ ] Create Meeting model and logging system
- [ ] Track participant join/leave times
- [ ] Update Commitment Score based on attendance
- [ ] Add meeting scheduling UI

**Deliverable**: Teams can hold meetings that count toward scores

### Phase 6: AI Mentor (Week 9-10)
**Goal**: LLM generates roadmaps and suggestions

- [ ] Set up OpenAI API client
- [ ] Create aiMentor service with prompts:
  - Skill gap analysis
  - Roadmap generation based on project description
  - "Next steps" suggestions when progress stalls
- [ ] Build AI Mentor UI panel
- [ ] Integrate roadmap generation into project creation
- [ ] Add "Ask AI Mentor" chat interface (simple Q&A)

**Deliverable**: AI generates project roadmaps and provides guidance

### Phase 7: Polish & Testing (Week 11-12)
**Goal**: Production-ready MVP

- [ ] Add comprehensive error handling
- [ ] Implement loading states and skeletons
- [ ] Add form validation (client + server)
- [ ] Write integration tests for critical flows
- [ ] Optimize bundle size and performance
- [ ] Add responsive design for mobile
- [ ] Create deployment scripts (Docker, CI/CD)
- [ ] Write API documentation

**Deliverable**: Stable, deployed MVP ready for user testing

## Commitment Score Algorithm (Detailed)

```javascript
// Pseudo-code for server/services/commitmentScore.js
function calculateCommitmentScore(userId, projectId) {
  const weights = {
    githubActivity: 0.30,      // 30% weight
    deadlineCompliance: 0.35,   // 35% weight
    peerReviews: 0.20,          // 20% weight
    meetingAttendance: 0.15     // 15% weight
  };

  // 1. GitHub Activity (0-100)
  const commits = getGitHubCommitsLastMonth(userId);
  const githubScore = Math.min((commits / 20) * 100, 100);  // 20 commits = max score

  // 2. Deadline Compliance (0-100)
  const tasks = getTasksForUser(userId, projectId);
  const onTime = tasks.filter(t => t.completedAt <= t.deadline).length;
  const deadlineScore = tasks.length ? (onTime / tasks.length) * 100 : 50;

  // 3. Peer Reviews (0-100)
  const reviews = getPeerReviews(userId, projectId);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const peerScore = avgRating * 20;  // Assuming 5-star scale

  // 4. Meeting Attendance (0-100)
  const meetings = getMeetingsForProject(projectId);
  const attended = meetings.filter(m => m.participants.some(p => 
    p.user == userId && p.attended
  )).length;
  const attendanceScore = meetings.length ? (attended / meetings.length) * 100 : 50;

  // Weighted average
  const finalScore = Math.round(
    githubScore * weights.githubActivity +
    deadlineScore * weights.deadlineCompliance +
    peerScore * weights.peerReviews +
    attendanceScore * weights.meetingAttendance
  );

  return Math.max(0, Math.min(finalScore, 100));  // Clamp 0-100
}
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (protected)
- `GET /api/users/:id/score` - Get commitment score history

### Projects
- `GET /api/projects` - List all projects (with filters)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Archive project (protected)
- `POST /api/projects/:id/join` - Request to join team
- `POST /api/projects/:id/roadmap` - Generate AI roadmap

### Tasks
- `GET /api/tasks?projectId=:id` - Get tasks for project
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Meetings
- `GET /api/meetings?projectId=:id` - Get meetings for project
- `POST /api/meetings` - Schedule meeting (protected)
- `PUT /api/meetings/:id/attendance` - Log attendance

### AI Mentor
- `POST /api/ai/analyze` - Analyze skill gaps
- `POST /api/ai/suggest` - Get next steps suggestions

## Environment Variables

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_DAILY_CO_DOMAIN=your-daily-subdomain
```

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=30d

OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
DAILY_CO_API_KEY=...

NODE_ENV=development
```

## Next Immediate Actions

1. **Run initialization command** - Create folder structure and install dependencies
2. **Configure Tailwind theme** - Set up custom colors (#050505, #00ff9d, #00b8ff, #ff4757)
3. **Build Dashboard component** - Start with the visual shell before wiring up data
4. **Set up MongoDB connection** - Ensure database is accessible
5. **Create User model and auth routes** - Foundation for all protected features

Ready to start? Confirm the tech choices or request modifications to the plan.
