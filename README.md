# SkillSync 🚀

[![CI/CD](https://github.com/matanslasky/SkillSync/actions/workflows/ci.yml/badge.svg)](https://github.com/matanslasky/SkillSync/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-Deployed-orange)](https://skillsync-production.web.app)

> A modern collaborative project management platform connecting creators, developers, designers, and innovators to work together on amazing projects.

SkillSync is a team collaboration platform that brings talented individuals together. Whether you're a developer, designer, project manager, or marketer, find your perfect team, manage tasks efficiently, and build something incredible.

## ✨ Key Features

- **🤖 AI-Powered Recommendations** - Gemini AI suggests perfect projects based on your skills
- **🧙 AI Project Wizard** - Create complete projects from natural language descriptions
- **🎯 Smart Task Assignment** - AI recommends the best team member for each task
- **📊 Sentiment Analysis** - Monitor team health and collaboration quality
- **🔍 Smart Marketplace** - Discover projects that match your skills and interests
- **👥 Team Building** - Send invitations, manage join requests, and build your dream team
- **📋 Kanban Boards** - Visual task management with drag-and-drop functionality
- **💬 Built-in Messaging** - Communicate seamlessly with team members
- **📈 Commitment Scores** - Track team member reliability and engagement
- **🤝 Synergy Meter** - Monitor team compatibility and collaboration effectiveness
- **🔔 Real-time Notifications** - Stay updated on project activities
- **🎨 Modern UI/UX** - Polished interface with smooth animations and dark mode
- **📱 Responsive Design** - Works beautifully on desktop, tablet, and mobile

## 🎯 Perfect For

- Students working on class projects
- Open source contributors finding collaborators
- Indie developers building side projects
- Designers seeking development partners
- Anyone looking to build something together!

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling with custom design system
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **Heroicons** - Beautiful SVG icons

### Backend & Services
- **Firebase Authentication** - Secure user authentication (email/password, social logins)
- **Cloud Firestore** - NoSQL database with real-time sync
- **Firebase Cloud Storage** - File and image storage
- **Firebase Hosting** - Global CDN with SSL
- **Firebase Cloud Functions** - Serverless backend logic
- **Google Gemini AI** - Intelligent features and recommendations

### DevOps & Testing
- **GitHub Actions** - CI/CD pipeline with automated deployments
- **Playwright** - E2E testing across all browsers (92 tests ✓)
- **Vitest** - Fast unit testing
- **ESLint & Prettier** - Code quality and formatting
- **Docker** - Containerization support

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm v9+
- **Firebase account** (free tier is fine)
- **Git** for version control

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/matanslasky/SkillSync.git
cd SkillSync
```

**2. Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

**3. Firebase Configuration**

Create a Firebase project:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Enable Cloud Storage

See [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for detailed instructions.

**4. Environment Setup**

Copy the example environment file:
```bash
cd client
cp .env.example .env
```

Add your Firebase and Gemini AI credentials to `client/.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini AI (Optional - enables AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Get your Gemini API key (free):** https://ai.google.dev/
```bash
cp client/.env.example client/.env.development
```

Add your Firebase configuration to `client/.env.development`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**5. Start Development Server**
```bash
cd client
npm run dev
```

Visit **http://localhost:5173** 🎉

## 📖 Documentation

- **[User Guide](USER_GUIDE.md)** - Complete guide for end users
- **[AI Features Guide](docs/AI_FEATURES.md)** - AI capabilities and setup
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Developer API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- **[Launch Checklist](LAUNCH_CHECKLIST.md)** - Pre-launch verification

## 🧪 Testing

### Run All Tests
```bash
# Unit and component tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Accessibility tests
npm run test:e2e:accessibility

# Run everything
npm run test:all
```

### Test Coverage

- **92 E2E tests** covering all critical user flows
- **Authentication & Authorization** - Login, registration, password reset
- **Project Management** - Create, edit, delete projects
- **Task Management** - Kanban board operations
- **Team Collaboration** - Invites, join requests, messaging
- **Accessibility** - WCAG 2.1 compliance

See [E2E_TESTING.md](E2E_TESTING.md) for detailed testing documentation.

## 🚢 Deployment

### Production Build

```bash
# Build optimized production bundle
cd client
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy with message
firebase deploy -m "Release v1.0.0"
```

### Automated Deployment

GitHub Actions automatically:
- ✅ Runs all tests on every push
- ✅ Builds production bundle
- ✅ Deploys to Firebase on main branch
- ✅ Sends deployment notifications

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 📁 Project Structure

```
SkillSync/
├── client/                         # Frontend React application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ui/               # Base UI components (Button, Card, Input, etc.)
│   │   │   ├── KanbanBoard.jsx   # Task management board
│   │   │   ├── NotificationBell.jsx
│   │   │   └── ...
│   │   ├── pages/                 # Route-level components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectView.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   └── ...
│   │   ├── contexts/              # React Context providers
│   │   │   ├── AuthContext.jsx   # Authentication state
│   │   │   └── ThemeContext.jsx  # Theme management
│   │   ├── services/              # Firebase & API services
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   ├── taskService.js
│   │   │   └── ...
│   │   ├── utils/                 # Helper functions
│   │   │   └── animations.js     # Animation utilities
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── constants/             # Constants and enums
│   │   └── config/                # Configuration files
│   │       └── firebase.js       # Firebase initialization
│   ├── public/                    # Static assets
│   └── dist/                      # Production build output
├── functions/                      # Firebase Cloud Functions
├── e2e/                           # Playwright E2E tests
├── .github/workflows/             # CI/CD pipelines
│   ├── ci.yml                    # Continuous Integration
│   ├── deploy.yml                # Deployment workflow
│   └── ...
├── docs/                          # Additional documentation
├── firebase.json                  # Firebase configuration
├── firestore.rules               # Firestore security rules
├── playwright.config.js          # E2E test configuration
└── package.json                   # Project dependencies
```

## 🎨 UI Component Library

SkillSync includes a comprehensive UI component library:

- **Button** - 6 variants (primary, secondary, danger, outline, ghost, glass) with loading states
- **Card** - Flexible card component with header, content, and footer sections
- **Input** - Form inputs with validation states, icons, and password toggle
- **Badge** - 8 variants for status indicators and labels
- **Toast** - Context-based notification system
- **Loading Skeletons** - Shimmer animations for loading states

All components support:
- Dark mode
- Accessibility (ARIA labels, keyboard navigation)
- Responsive design
- Smooth animations

## 🔐 Security

Security is a top priority:

- ✅ Firebase Authentication with secure token management
- ✅ Firestore Security Rules enforce proper access control
- ✅ Input validation on client and server
- ✅ XSS and CSRF protection
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced (Firebase Hosting)
- ✅ Regular security audits

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## 🤝 Contributing

We welcome contributions from developers of all skill levels!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** (follow coding standards)
4. **Write/update tests**
5. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages (Conventional Commits)
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

### Good First Issues

Looking for a place to start? Check out issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improve docs

## 📊 Project Stats

- **Lines of Code**: ~18,000+
- **Components**: 45+
- **Services**: 15
- **E2E Tests**: 92
- **AI Features**: 6
- **Development Time**: 6+ months
- **Contributors**: Open to all!

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ User authentication and profiles
- ✅ Project and team management
- ✅ Task management with Kanban board
- ✅ Real-time messaging
- ✅ Notifications system
- ✅ Commitment scoring
- ✅ Marketplace for discovering projects
- ✅ Comprehensive E2E testing
- ✅ **AI-powered team matching (NEW!)**
- ✅ **AI project wizard (NEW!)**
- ✅ **Smart task assignment (NEW!)**
- ✅ **Team sentiment analysis (NEW!)**

### Upcoming Features (v1.1+)
- 🔄 Semantic search implementation
- 🔄 Video conferencing integration
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app (React Native)
- 🔄 GitHub integration
- 🔄 Slack/Discord webhooks
- 🔄 Team calendar and scheduling
- 🔄 File versioning and history

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Matan Slasky** - Creator & Lead Developer
- GitHub: [@matanslasky](https://github.com/matanslasky)
- Email: matanslasky@example.com

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Heroicons](https://heroicons.com/) - Icon library
- [Playwright](https://playwright.dev/) - E2E testing
- All contributors and supporters

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/matanslasky/SkillSync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/matanslasky/SkillSync/discussions)
- **Email**: support@skillsync.com
- **Twitter**: [@SkillSyncApp](https://twitter.com/SkillSyncApp)

---

<div align="center">

**Made with ❤️ by the SkillSync Team**

[⭐ Star us on GitHub](https://github.com/matanslasky/SkillSync) | [🐛 Report Bug](https://github.com/matanslasky/SkillSync/issues) | [💡 Request Feature](https://github.com/matanslasky/SkillSync/issues)

</div>
