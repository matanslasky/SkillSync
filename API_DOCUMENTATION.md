# API Documentation

## Authentication Service

Located in: `client/src/services/authService.js`

### Functions

#### `register(userData)`

Registers a new user with email and password, and creates their Firestore profile.

**Parameters:**
- `userData` (Object):
  - `email` (string, required): User's email address
  - `password` (string, required): User's password (min 8 chars, must include uppercase, lowercase, number)
  - `name` (string, required): User's full name
  - `role` (string, optional): User's role (default: 'Developer')
  - `skills` (array, optional): Array of skill strings

**Returns:**
- `Promise<Object>`: User object with uid, email, name, and role

**Throws:**
- Firebase auth errors (email-already-in-use, weak-password, etc.)

**Example:**
```javascript
import { register } from './services/authService'

const userData = {
  email: 'user@example.com',
  password: 'SecurePass123',
  name: 'John Doe',
  role: 'Developer',
  skills: ['React', 'Node.js']
}

const result = await register(userData)
console.log(result.user.uid)
```

---

#### `login(email, password)`

Authenticates a user and retrieves their Firestore profile.

**Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Returns:**
- `Promise<Object>`: User object with complete profile data

**Throws:**
- `Error`: 'User data not found' if Firestore document doesn't exist
- Firebase auth errors (wrong-password, user-not-found, etc.)

**Example:**
```javascript
import { login } from './services/authService'

const result = await login('user@example.com', 'SecurePass123')
console.log(result.user)
```

---

#### `logout()`

Signs out the current user.

**Returns:**
- `Promise<void>`

**Example:**
```javascript
import { logout } from './services/authService'

await logout()
```

---

#### `getCurrentUser()`

Gets the current authenticated user's full profile.

**Returns:**
- `Promise<Object|null>`: User profile object or null if not authenticated

**Example:**
```javascript
import { getCurrentUser } from './services/authService'

const user = await getCurrentUser()
if (user) {
  console.log(user.name, user.role)
}
```

---

#### `onAuthChange(callback)`

Subscribes to authentication state changes.

**Parameters:**
- `callback` (Function): Called with Firebase user object when auth state changes

**Returns:**
- `Function`: Unsubscribe function

**Example:**
```javascript
import { onAuthChange } from './services/authService'

const unsubscribe = onAuthChange((firebaseUser) => {
  if (firebaseUser) {
    console.log('User logged in:', firebaseUser.uid)
  } else {
    console.log('User logged out')
  }
})

// Later, to unsubscribe:
unsubscribe()
```

---

## Validation Utilities

Located in: `client/src/utils/validation.js`

### Schemas

All schemas use [Zod](https://zod.dev/) for validation.

#### `loginSchema`

Validates login form data.

**Fields:**
- `email`: Valid email format, required
- `password`: Non-empty string, required

#### `registerSchema`

Validates registration form data.

**Fields:**
- `name`: 2-50 characters, letters and spaces only
- `email`: Valid email format (lowercase)
- `password`: Min 8 chars, must include uppercase, lowercase, and number
- `confirmPassword`: Must match password
- `role`: One of predefined roles
- `skills`: Array with at least one skill

#### `projectSchema`

Validates project creation data.

**Fields:**
- `name`: 3-100 characters
- `description`: 20-1000 characters
- `category`: One of predefined categories
- `requiredRoles`: Array with 1-10 roles
- `techStack`: Array with 1-15 technologies
- `maxTeamSize`: Integer between 2-20
- `duration`: Non-empty string
- `difficulty`: 'Beginner', 'Intermediate', or 'Advanced'

### Functions

#### `validateData(schema, data)`

Validates data against a schema and returns formatted errors.

**Parameters:**
- `schema` (ZodSchema): Zod schema to validate against
- `data` (Object): Data to validate

**Returns:**
- `Object`: `{ success: boolean, errors: Object }`

**Example:**
```javascript
import { validateData, loginSchema } from './utils/validation'

const result = validateData(loginSchema, {
  email: 'invalid-email',
  password: ''
})

if (!result.success) {
  console.log(result.errors)
  // { email: 'Please enter a valid email address', password: 'Password is required' }
}
```

---

## Admin Utilities

Located in: `client/src/utils/adminUtils.js`

### Functions

#### `isAdmin(user)`

Checks if a user has admin role.

**Parameters:**
- `user` (Object): User object with role field

**Returns:**
- `boolean`: True if user is admin

**Example:**
```javascript
import { isAdmin } from './utils/adminUtils'

if (isAdmin(currentUser)) {
  // Show admin features
}
```

---

#### `grantAdminRole(userId, currentUser)`

Promotes a user to admin (must be called by existing admin).

**Parameters:**
- `userId` (string): ID of user to promote
- `currentUser` (Object): Current admin user

**Returns:**
- `Promise<void>`

**Throws:**
- `Error`: If current user is not admin or trying to modify own status

**Example:**
```javascript
import { grantAdminRole } from './utils/adminUtils'

await grantAdminRole('user123', currentUser)
```

---

#### `revokeAdminRole(userId, currentUser, newRole = 'Developer')`

Demotes an admin to regular user.

**Parameters:**
- `userId` (string): ID of admin to demote
- `currentUser` (Object): Current admin user
- `newRole` (string, optional): New role to assign (default: 'Developer')

**Returns:**
- `Promise<void>`

**Example:**
```javascript
import { revokeAdminRole } from './utils/adminUtils'

await revokeAdminRole('admin123', currentUser, 'Developer')
```

---

## Logger Utility

Located in: `client/src/utils/logger.js`

### Functions

#### `logger.error(message, error, context)`

Logs error messages.

**Parameters:**
- `message` (string): Error message
- `error` (Error|Object, optional): Error object
- `context` (Object, optional): Additional context

**Example:**
```javascript
import logger from './utils/logger'

try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', error, { userId: user.id })
}
```

---

#### `logger.info(message, context)`

Logs informational messages.

**Example:**
```javascript
logger.info('User profile updated', { userId: '123' })
```

---

#### `logger.logUserAction(action, properties)`

Logs user actions for analytics.

**Example:**
```javascript
logger.logUserAction('project_created', { 
  projectId: 'proj-123', 
  teamSize: 5 
})
```

---

## Component Props Documentation

### `<ProtectedRoute>`

Located in: `client/src/components/ProtectedRoute.jsx`

Wrapper component for routes that require authentication.

**Props:**
- `children` (ReactNode, required): Content to render if authenticated
- `requireAdmin` (boolean, optional): If true, requires admin role (default: false)

**Example:**
```jsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

---

### `<ErrorBoundary>`

Located in: `client/src/components/ErrorBoundary.jsx`

Catches React errors and displays fallback UI.

**Props:**
- `children` (ReactNode, required): Content to render

**Example:**
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Firestore Collections

### `users`

**Structure:**
```javascript
{
  uid: string,
  email: string,
  name: string,
  role: string, // 'Developer' | 'Designer' | 'Product Manager' | 'Marketing' | 'Data Scientist' | 'Business Analyst' | 'Admin' | 'Other'
  skills: string[],
  portfolio: string,
  bio: string,
  commitmentScore: number,
  scoreHistory: object[],
  projects: string[],
  githubUsername: string,
  linkedinUrl?: string,
  portfolioUrl?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `projects`

**Structure:**
```javascript
{
  name: string,
  description: string,
  category: string,
  creatorId: string,
  team: string[],
  requiredRoles: string[],
  techStack: string[],
  maxTeamSize: number,
  duration: string,
  difficulty: string,
  status: string,
  deadline?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `notifications`

**Structure:**
```javascript
{
  recipientId: string,
  type: string,
  title: string,
  message: string,
  read: boolean,
  actionUrl?: string,
  createdAt: Timestamp
}
```

---

## Security Rules

See `firestore.rules` for complete Firestore security rules.

**Key Points:**
- All operations require authentication
- Users can only modify their own data
- Admin role required for user/project deletion
- Data validation enforced on all writes
- Field-level validation for emails, names, roles
