# SkillSync API Documentation

Complete API reference for developers working with SkillSync services.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Firebase Services](#firebase-services)
4. [API Services](#api-services)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [Code Examples](#code-examples)

---

## Overview

SkillSync uses a combination of Firebase services and custom REST APIs.

### Base URLs

```
Production: https://skillsync-production.web.app
Development: http://localhost:5173
API Server: https://api.skillsync.com
```

### Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Cloud Storage

---

## Authentication

### Firebase Authentication

All API requests require authentication using Firebase ID tokens.

#### Sign Up

```javascript
import { authService } from './services/authService';

const { user, error } = await authService.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  displayName: 'John Doe',
  role: 'Frontend Developer'
});
```

#### Sign In

```javascript
const { user, error } = await authService.signIn({
  email: 'user@example.com',
  password: 'securePassword123'
});
```

#### Sign Out

```javascript
await authService.signOut();
```

#### Get Current User

```javascript
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.uid);
  } else {
    console.log('User logged out');
  }
});
```

#### Get ID Token

```javascript
const token = await auth.currentUser.getIdToken();

// Use in API requests
fetch('https://api.skillsync.com/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Firebase Services

### Firestore Service

Located in `client/src/services/firestoreService.js`

#### Collections Structure

```
users/
  {userId}/
    - profile data
    - settings
    - stats
    
projects/
  {projectId}/
    - project details
    - team members
    - requirements
    
tasks/
  {taskId}/
    - task details
    - assignee
    - status
    
messages/
  {messageId}/
    - sender
    - recipient
    - content
    
notifications/
  {notificationId}/
    - type
    - recipient
    - data
```

#### Create Document

```javascript
import { firestoreService } from './services/firestoreService';

// Add document with auto-generated ID
const docId = await firestoreService.addDocument('projects', {
  name: 'My Project',
  description: 'Project description',
  createdAt: new Date(),
  ownerId: userId
});

// Set document with custom ID
await firestoreService.setDocument('users', userId, {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Frontend Developer'
});
```

#### Read Document

```javascript
// Get single document
const project = await firestoreService.getDocument('projects', projectId);

// Get all documents in collection
const projects = await firestoreService.getCollection('projects');

// Query with conditions
const myProjects = await firestoreService.queryDocuments('projects', [
  { field: 'ownerId', operator: '==', value: userId }
]);
```

#### Update Document

```javascript
// Update specific fields
await firestoreService.updateDocument('projects', projectId, {
  status: 'In Progress',
  updatedAt: new Date()
});

// Update nested fields
await firestoreService.updateDocument('users', userId, {
  'profile.bio': 'New bio',
  'stats.projectCount': increment(1)
});
```

#### Delete Document

```javascript
await firestoreService.deleteDocument('projects', projectId);
```

#### Real-time Listeners

```javascript
// Listen to document changes
const unsubscribe = firestoreService.onSnapshotDocument(
  'projects',
  projectId,
  (project) => {
    console.log('Project updated:', project);
  }
);

// Listen to collection changes
const unsubscribe = firestoreService.onSnapshotCollection(
  'projects',
  (projects) => {
    console.log('Projects updated:', projects);
  }
);

// Cleanup
unsubscribe();
```

---

### User Service

Located in `client/src/services/userService.js`

#### Get User Profile

```javascript
import { userService } from './services/userService';

const profile = await userService.getUserProfile(userId);
```

#### Update User Profile

```javascript
await userService.updateUserProfile(userId, {
  bio: 'Passionate developer',
  skills: ['React', 'Node.js', 'TypeScript'],
  availability: 20, // hours per week
  location: 'New York, USA'
});
```

#### Search Users

```javascript
const users = await userService.searchUsers({
  role: 'Frontend Developer',
  skills: ['React']
});
```

#### Get User Stats

```javascript
const stats = await userService.getUserStats(userId);
// Returns: { projectCount, taskCount, commitmentScore }
```

---

### Project Service

Located in `client/src/services/projectService.js`

#### Create Project

```javascript
import { projectService } from './services/projectService';

const projectId = await projectService.createProject({
  name: 'E-commerce Platform',
  description: 'Building a modern e-commerce solution',
  category: 'Web Application',
  techStack: ['React', 'Node.js', 'MongoDB'],
  rolesNeeded: ['Frontend Developer', 'Backend Developer'],
  maxTeamSize: 5,
  visibility: 'public',
  status: 'Planning'
});
```

#### Get Project Details

```javascript
const project = await projectService.getProject(projectId);
```

#### Update Project

```javascript
await projectService.updateProject(projectId, {
  status: 'In Progress',
  progress: 45
});
```

#### Delete Project

```javascript
await projectService.deleteProject(projectId);
```

#### Get User Projects

```javascript
// Projects user owns
const ownedProjects = await projectService.getUserProjects(userId);

// Projects user is a member of
const memberProjects = await projectService.getUserProjectsAsMember(userId);
```

#### Add Team Member

```javascript
await projectService.addTeamMember(projectId, {
  userId: memberId,
  role: 'Frontend Developer',
  joinedAt: new Date()
});
```

#### Remove Team Member

```javascript
await projectService.removeTeamMember(projectId, memberId);
```

---

### Task Service

Located in `client/src/services/taskService.js`

#### Create Task

```javascript
import { taskService } from './services/taskService';

const taskId = await taskService.createTask({
  projectId: projectId,
  title: 'Implement login page',
  description: 'Create responsive login form with validation',
  assigneeId: userId,
  priority: 'High',
  status: 'To Do',
  dueDate: new Date('2026-03-01'),
  estimatedHours: 8,
  tags: ['frontend', 'authentication']
});
```

#### Update Task

```javascript
await taskService.updateTask(taskId, {
  status: 'In Progress',
  progress: 50
});
```

#### Move Task

```javascript
await taskService.moveTask(taskId, 'In Progress', 'Review');
```

#### Get Project Tasks

```javascript
const tasks = await taskService.getProjectTasks(projectId);
```

#### Get User Tasks

```javascript
const myTasks = await taskService.getUserTasks(userId);
```

#### Delete Task

```javascript
await taskService.deleteTask(taskId);
```

---

### Message Service

Located in `client/src/services/messageService.js`

#### Send Message

```javascript
import { messageService } from './services/messageService';

await messageService.sendMessage({
  senderId: currentUserId,
  recipientId: recipientUserId,
  content: 'Hello! Interested in collaborating?',
  projectId: projectId, // optional
  timestamp: new Date()
});
```

#### Get Conversations

```javascript
const conversations = await messageService.getConversations(userId);
```

#### Get Messages

```javascript
const messages = await messageService.getMessages(userId, otherUserId);
```

#### Mark as Read

```javascript
await messageService.markAsRead(messageId);
```

#### Real-time Messages

```javascript
const unsubscribe = messageService.subscribeToMessages(
  userId,
  otherUserId,
  (messages) => {
    console.log('New messages:', messages);
  }
);
```

---

### Notification Service

Located in `client/src/services/notificationService.js`

#### Create Notification

```javascript
import { notificationService } from './services/notificationService';

await notificationService.createNotification({
  userId: recipientId,
  type: 'team_invite',
  title: 'Team Invitation',
  message: 'You have been invited to join Project X',
  data: {
    projectId: projectId,
    inviterId: inviterId
  },
  read: false
});
```

#### Get Notifications

```javascript
const notifications = await notificationService.getNotifications(userId);
```

#### Mark as Read

```javascript
await notificationService.markAsRead(notificationId);
```

#### Mark All as Read

```javascript
await notificationService.markAllAsRead(userId);
```

#### Delete Notification

```javascript
await notificationService.deleteNotification(notificationId);
```

#### Real-time Notifications

```javascript
const unsubscribe = notificationService.subscribeToNotifications(
  userId,
  (notifications) => {
    console.log('New notifications:', notifications);
  }
);
```

---

### Storage Service

Located in `client/src/services/storageService.js`

#### Upload File

```javascript
import { storageService } from './services/storageService';

const { url, error } = await storageService.uploadFile(
  file,
  'profile-photos',
  {
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
    }
  }
);
```

#### Upload Profile Photo

```javascript
const photoURL = await storageService.uploadProfilePhoto(userId, file);
```

#### Upload Project File

```javascript
const fileURL = await storageService.uploadProjectFile(projectId, file);
```

#### Delete File

```javascript
await storageService.deleteFile(fileUrl);
```

---

### Commitment Score Service

Located in `client/src/services/commitmentScoreService.js`

#### Calculate Score

```javascript
import { commitmentScoreService } from './services/commitmentScoreService';

const score = await commitmentScoreService.calculateCommitmentScore(userId);
```

#### Update Score

```javascript
await commitmentScoreService.updateScore(userId, {
  action: 'task_completed',
  points: 10
});
```

#### Get Score History

```javascript
const history = await commitmentScoreService.getScoreHistory(userId);
```

---

### Join Request Service

Located in `client/src/services/joinRequestService.js`

#### Submit Join Request

```javascript
import { joinRequestService } from './services/joinRequestService';

await joinRequestService.createJoinRequest({
  projectId: projectId,
  userId: currentUserId,
  role: 'Frontend Developer',
  message: 'I have 5 years of React experience...',
  status: 'pending'
});
```

#### Get Project Requests

```javascript
const requests = await joinRequestService.getProjectRequests(projectId);
```

#### Approve Request

```javascript
await joinRequestService.approveJoinRequest(requestId, projectId);
```

#### Reject Request

```javascript
await joinRequestService.rejectJoinRequest(requestId, 'Position filled');
```

---

### Team Invite Service

Located in `client/src/services/teamInviteService.js`

#### Send Invite

```javascript
import { teamInviteService } from './services/teamInviteService';

await teamInviteService.sendInvite({
  projectId: projectId,
  inviterId: currentUserId,
  inviteeId: userId,
  role: 'Backend Developer',
  message: 'We would love to have you on our team!'
});
```

#### Get User Invites

```javascript
const invites = await teamInviteService.getUserInvites(userId);
```

#### Accept Invite

```javascript
await teamInviteService.acceptInvite(inviteId, projectId);
```

#### Decline Invite

```javascript
await teamInviteService.declineInvite(inviteId);
```

---

## Error Handling

### Error Response Format

```javascript
{
  error: true,
  message: 'Error description',
  code: 'ERROR_CODE',
  details: {} // optional additional info
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | User not authenticated |
| `PERMISSION_DENIED` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `ALREADY_EXISTS` | Resource already exists |
| `INVALID_INPUT` | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

### Error Handling Example

```javascript
try {
  const project = await projectService.getProject(projectId);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.error('Project not found');
  } else if (error.code === 'PERMISSION_DENIED') {
    console.error('No access to this project');
  } else {
    console.error('An error occurred:', error.message);
  }
}
```

---

## Rate Limiting

### Limits

- **Firestore Reads**: 50,000 per day (free tier)
- **Firestore Writes**: 20,000 per day (free tier)
- **Storage Downloads**: 1 GB per day (free tier)
- **Authentication**: 10 requests per second per user

### Best Practices

1. **Cache frequently accessed data**
2. **Use real-time listeners instead of polling**
3. **Implement pagination for large datasets**
4. **Batch writes when possible**
5. **Use Cloud Functions for bulk operations**

---

## Webhooks

### Available Webhooks

Configure webhooks in Firebase Console to receive real-time events.

#### Project Events

```javascript
// project.created
{
  event: 'project.created',
  data: {
    projectId: 'abc123',
    name: 'My Project',
    ownerId: 'user123',
    timestamp: '2026-02-02T10:00:00Z'
  }
}

// project.updated
// project.deleted
```

#### Task Events

```javascript
// task.created
// task.updated
// task.completed
{
  event: 'task.completed',
  data: {
    taskId: 'task123',
    projectId: 'abc123',
    assigneeId: 'user456',
    completedAt: '2026-02-02T10:00:00Z'
  }
}
```

#### Team Events

```javascript
// team.member_added
// team.member_removed
// team.invite_sent
```

---

## Code Examples

### Complete Integration Example

```javascript
import { auth } from './config/firebase';
import { userService } from './services/userService';
import { projectService } from './services/projectService';
import { taskService } from './services/taskService';

// 1. Authenticate user
const user = auth.currentUser;

if (!user) {
  console.error('User not authenticated');
  return;
}

// 2. Get user profile
const profile = await userService.getUserProfile(user.uid);
console.log('User profile:', profile);

// 3. Create a project
const projectId = await projectService.createProject({
  name: 'My Awesome Project',
  description: 'Building something cool',
  category: 'Web Application',
  techStack: ['React', 'Firebase'],
  rolesNeeded: ['Frontend Developer'],
  maxTeamSize: 3,
  visibility: 'public'
});

console.log('Project created:', projectId);

// 4. Create tasks for the project
const taskId = await taskService.createTask({
  projectId: projectId,
  title: 'Setup project structure',
  description: 'Initialize React app with Vite',
  assigneeId: user.uid,
  priority: 'High',
  status: 'To Do',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  estimatedHours: 4
});

console.log('Task created:', taskId);

// 5. Listen for task updates
const unsubscribe = taskService.subscribeToTask(taskId, (task) => {
  console.log('Task updated:', task);
  
  if (task.status === 'Done') {
    console.log('Task completed!');
  }
});

// 6. Update task status
await taskService.updateTask(taskId, {
  status: 'In Progress',
  progress: 50
});

// 7. Cleanup listener
// unsubscribe();
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';

function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const userProjects = await projectService.getUserProjects(currentUser.uid);
        setProjects(userProjects);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  return { projects, loading, error };
}

export default useProjects;
```

---

## Testing

### Mock Data

```javascript
// client/src/data/mockData.js
export const mockProjects = [
  {
    id: 'proj1',
    name: 'E-commerce Platform',
    description: 'Building a modern online store',
    ownerId: 'user1',
    techStack: ['React', 'Node.js', 'MongoDB'],
    status: 'In Progress'
  }
];
```

### Testing with Firebase Emulators

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# Your app connects to:
# - Auth: localhost:9099
# - Firestore: localhost:8080
# - Storage: localhost:9199
```

---

## Best Practices

### Security

1. **Never expose API keys in client code** - Use environment variables
2. **Validate all user input** - Both client and server side
3. **Implement proper Firestore Security Rules**
4. **Use Firebase App Check** - Prevent abuse
5. **Enable audit logging** - Track API usage

### Performance

1. **Minimize Firestore reads** - Cache data when possible
2. **Use pagination** - Limit results per query
3. **Optimize images** - Compress before upload
4. **Lazy load components** - Code splitting
5. **Use indexes** - For complex queries

### Code Organization

1. **Separate concerns** - Services, components, utils
2. **Use TypeScript** - Type safety (future enhancement)
3. **Write reusable functions** - DRY principle
4. **Document complex logic** - Help future developers
5. **Version your API** - Plan for changes

---

## API Versioning

Current version: **v1**

Future versions will be namespaced:
```
/api/v1/projects
/api/v2/projects
```

---

## Support

For API questions or issues:

- 📧 Email: dev@skillsync.com
- 📚 Docs: docs.skillsync.com
- 🐛 Issues: github.com/matanslasky/SkillSync/issues
- 💬 Discord: discord.gg/skillsync

---

*Last Updated: February 2026*
*API Version: 1.0*
