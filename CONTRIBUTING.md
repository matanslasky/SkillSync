# Contributing to SkillSync

Thank you for considering contributing to SkillSync! We welcome contributions from developers of all skill levels.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Guidelines](#issue-guidelines)
8. [Community](#community)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in SkillSync a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project team at conduct@skillsync.com. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

- Node.js v18+ and npm v9+
- Git
- Firebase account
- Code editor (VS Code recommended)

### Fork and Clone

1. **Fork the repository**
   - Click "Fork" button on GitHub

2. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/SkillSync.git
cd SkillSync
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/matanslasky/SkillSync.git
```

### Setup Development Environment

1. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

2. **Configure Firebase**
```bash
# Copy environment example
cp client/.env.example client/.env.development

# Add your Firebase config
# Edit client/.env.development with your Firebase credentials
```

3. **Start development server**
```bash
cd client
npm run dev

# Visit http://localhost:5173
```

4. **Run tests**
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

---

## Development Process

### Branching Strategy

We use **Git Flow** branching model:

- `main` - Production-ready code
- `develop` - Latest development changes
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local repository
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Push to your fork
git push origin feature/your-feature-name
```

### Branch Naming Convention

- `feature/add-user-profile` - New feature
- `bugfix/fix-login-error` - Bug fix
- `hotfix/security-patch` - Urgent fix
- `refactor/improve-api-service` - Code refactoring
- `docs/update-readme` - Documentation only
- `test/add-unit-tests` - Test additions

---

## Coding Standards

### JavaScript/React

**Style Guide:**
- Use ES6+ syntax
- Functional components with hooks
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in objects/arrays

**Example:**
```javascript
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserProfile(userId);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
};

export default UserProfile;
```

### File Organization

```
client/src/
  components/        # Reusable UI components
    ui/             # Basic UI components (Button, Card, etc.)
    [Component].jsx # Feature components
  pages/            # Route components
  services/         # API and Firebase services
  contexts/         # React contexts
  hooks/            # Custom React hooks
  utils/            # Utility functions
  constants/        # Constants and enums
  config/           # Configuration files
```

### Component Guidelines

**Component Structure:**
```javascript
// 1. Imports
import { useState } from 'react';
import { Button } from './ui/Button';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. State and hooks
  const [state, setState] = useState(null);

  // 4. Event handlers
  const handleClick = () => {
    // Handle click
  };

  // 5. Render helpers (if needed)
  const renderContent = () => {
    // Complex render logic
  };

  // 6. Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

// 7. PropTypes (optional)
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

// 8. Default props (optional)
MyComponent.defaultProps = {
  prop2: 0,
};

// 9. Export
export default MyComponent;
```

### CSS/Tailwind Guidelines

- Use Tailwind utility classes
- Create custom components for repeated patterns
- Avoid inline styles unless dynamic
- Use CSS variables for theme values
- Mobile-first responsive design

```javascript
// Good
<button className="btn-primary hover:scale-105 transition-transform">
  Click Me
</button>

// Avoid (unless dynamic)
<button style={{ backgroundColor: 'blue' }}>
  Click Me
</button>
```

### Service Layer

All Firebase/API interactions should go through service files:

```javascript
// services/userService.js
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const userService = {
  async getUserProfile(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');
    return { id: userDoc.id, ...userDoc.data() };
  },

  async updateUserProfile(userId, data) {
    await updateDoc(doc(db, 'users', userId), data);
  },
};
```

### Error Handling

```javascript
// Component level
try {
  await userService.updateUserProfile(userId, data);
  showSuccess('Profile updated successfully');
} catch (error) {
  console.error('Failed to update profile:', error);
  showError('Failed to update profile. Please try again.');
}

// Service level
async fetchData() {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch data');
  }
}
```

### Testing Guidelines

**Unit Tests:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**E2E Tests:**
```javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add email verification"

# Bug fix
git commit -m "fix(dashboard): resolve project card rendering issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple changes
git commit -m "feat(profile): add bio and skills sections

- Add bio textarea field
- Add skills multi-select
- Update profile service
- Add profile validation"

# Breaking change
git commit -m "feat(api)!: change user API response format

BREAKING CHANGE: User API now returns nested profile object
Migration guide in MIGRATION.md"
```

### Commit Best Practices

- Keep commits atomic (one logical change)
- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Reference issues when applicable (#123)
- Don't commit directly to main or develop

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
```bash
git checkout develop
git pull upstream develop
git checkout your-feature-branch
git rebase develop
```

2. **Run tests**
```bash
npm test
npm run test:e2e
npm run lint
```

3. **Build successfully**
```bash
cd client
npm run build
```

### Submitting a Pull Request

1. **Push your branch**
```bash
git push origin your-feature-branch
```

2. **Create PR on GitHub**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Base: `matanslasky/SkillSync:develop`
   - Compare: `your-username/SkillSync:your-feature-branch`

3. **Fill out PR template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List key changes
- Be specific and clear

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Attach before/after screenshots

## Related Issues
Closes #123
Relates to #456

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests passing
```

### PR Review Process

1. **Automated checks** must pass:
   - All tests pass
   - Build succeeds
   - No linting errors
   - Code coverage maintained

2. **Code review** by maintainer:
   - Code quality
   - Adherence to standards
   - Test coverage
   - Documentation

3. **Changes requested** (if needed):
   - Address feedback
   - Push changes to same branch
   - Re-request review

4. **Approval and merge**:
   - Maintainer approves
   - Squash and merge to develop
   - Delete feature branch

### PR Best Practices

- Keep PRs focused and small
- Reference related issues
- Respond to feedback promptly
- Be respectful and professional
- Update PR description if scope changes

---

## Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** - Check if already reported
2. **Check documentation** - Issue might be explained
3. **Reproduce consistently** - Ensure it's reproducible
4. **Gather information** - Browser, OS, steps to reproduce

### Issue Types

**Bug Report Template:**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

**Feature Request Template:**
```markdown
## Feature Description
Clear description of the feature

## Problem it Solves
What problem does this address?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Mockups, examples, etc.
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority
- `status: in progress` - Being worked on
- `status: blocked` - Blocked by something

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Discord** - Real-time chat (discord.gg/skillsync)
- **Email** - contribute@skillsync.com

### Getting Help

- Check [documentation](https://docs.skillsync.com)
- Search existing issues
- Ask in GitHub Discussions
- Join Discord community

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor Discord channel
- Considered for core team (active contributors)

---

## Development Tips

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview prod build
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests
npm run lint             # Lint code
npm run format           # Format code

# Git
git status               # Check status
git diff                 # See changes
git log --oneline        # View commits
git stash                # Stash changes
git stash pop            # Restore stashed changes

# Firebase
firebase emulators:start # Start local emulators
firebase deploy          # Deploy to Firebase
firebase functions:log   # View function logs
```

### Debugging

**React DevTools:**
- Install React DevTools extension
- Inspect component hierarchy
- View props and state

**Firebase Emulator:**
```bash
# Start emulators
firebase emulators:start

# Benefits:
# - Test without affecting production
# - Faster development
# - No costs during testing
```

**Console Logging:**
```javascript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

---

## License

By contributing to SkillSync, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

Don't hesitate to ask! We're here to help:
- Open a GitHub Discussion
- Join our Discord
- Email: contribute@skillsync.com

**Thank you for contributing to SkillSync!** 🎉

---

*Last Updated: February 2026*
*Version: 1.0*
