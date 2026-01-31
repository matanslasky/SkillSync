# SkillSync

SkillSync is a team collaboration platform built for students who want to work on real projects together. Whether you're a developer, designer, or marketer, you can find teammates, manage tasks, and track your progress all in one place.

## What It Does

The platform helps student teams collaborate on projects by providing everything they need in one spot. You can create projects, invite team members, break work into tasks using a kanban board, and see how everyone's contributing. There's also a commitment scoring system that keeps everyone accountable based on their activity and completion of tasks.

## Built With

**Frontend**
- React 18 with Vite for fast development
- Tailwind CSS for styling (with dark mode support)
- React Router for navigation
- Firebase for authentication and data storage

**Backend & Infrastructure**
- Firebase Authentication (email/password and social logins)
- Cloud Firestore for the database
- Firebase Storage for file uploads
- GitHub Actions for automated testing and deployment
- Docker support for containerized deployments

**Testing & Quality**
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for end-to-end testing across browsers
- Sentry for error tracking in production

## Getting It Running

You'll need Node.js 18 or higher and a Firebase account.

**1. Clone and install**
```bash
git clone https://github.com/matanslasky/SkillSync.git
cd SkillSync
npm install
cd client && npm install
```

**2. Firebase setup**

Create a Firebase project at console.firebase.google.com. Enable Authentication (email/password) and create a Firestore database. Check out `FIREBASE-SETUP.md` for the full walkthrough.

**3. Environment variables**

Copy `client/.env.example` to `client/.env` and fill in your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**4. Start developing**
```bash
cd client
npm run dev
```

Open http://localhost:5173 and you're good to go.

## Running Tests

```bash
# Unit and component tests
npm test

# E2E tests (requires the dev server running)
npm run test:e2e

# Just accessibility tests
npm run test:e2e:accessibility

# All tests
npm run test:all
```

Check out `E2E_TESTING.md` for more details on the testing setup.

## Deployment

The project includes GitHub Actions workflows for CI/CD. Every push to main triggers automated tests and deployment to Firebase Hosting. See `DEPLOYMENT.md` for production deployment instructions.

```bash
# Build for production
cd client && npm run build

# Deploy to Firebase (requires Firebase CLI)
firebase deploy
```

## Project Structure

```
SkillSync/
├── client/                         # Frontend React app
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── contexts/              # React context providers
│   │   ├── services/              # Firebase and API services
│   │   ├── utils/                 # Helper functions
│   │   └── config/                # App configuration
├── e2e/                           # Playwright E2E tests
├── functions/                     # Firebase Cloud Functions
├── .github/workflows/             # CI/CD pipelines
├── playwright.config.js           # E2E test configuration
└── firebase.json                  # Firebase project config
```

## Contributing

This is a student project, but if you want to contribute or report issues, feel free to open an issue or pull request.

## License

ISC
