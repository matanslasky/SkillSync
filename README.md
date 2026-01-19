# SkillSync - The Portfolio Revolution Platform

A collaborative platform where students (Developers, Designers, Marketers) form teams to build real-world micro-startups.

## Features

- **Dynamic Team Formation**: Marketplace for project ideas with skill-based matching
- **Commitment Score Engine**: 0-100 scoring based on GitHub activity, deadlines, peer reviews, and meeting attendance
- **Integrated Meeting & Workspace**: Built-in video conferencing with automated attendance tracking
- **AI Project Mentor**: LLM-powered roadmap generation and project guidance
- **Real-time Collaboration**: Socket.io for live updates and notifications
- **Kanban Board**: Drag-and-drop task management

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS v3 with custom dark theme
- Lucide-React icons
- React Router v6
- Firebase SDK (Auth, Firestore, Storage)

### Backend
- Firebase Authentication (email/password, social auth)
- Cloud Firestore (NoSQL database)
- Firebase Storage (file uploads)
- Future: Cloud Functions for serverless API

## Getting Started

### Prerequisites
- Node.js 18+ 
- Google account for Firebase
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/skillsync.git
cd skillsync
```

2. **Install dependencies**
```bash
npm install
cd client
npm install
```

3. **Set up Firebase** (see [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for detailed guide)
   - Create Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Create Firestore database in test mode
   - Copy config values

4. **Configure environment variables**

Create `client/.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. **Run the application**
```bash
cd client
npm run dev
```

Visit http://localhost:5173 to see the app!

## Project Structure

```
SkillSync/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # Firebase services
│   │   └── config/           # Firebase config
│   └── .env                  # Environment variables
├── PLAN.md                    # Detailed development plan
├── FIREBASE-SETUP.md          # Firebase setup guide
└── README.md                  # This file
```

## Development Phases

See [PLAN.md](PLAN.md) for detailed phase-by-phase implementation guide.

## License

ISC
