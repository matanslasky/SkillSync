# SkillSync Messaging System

## Overview
Real-time messaging system built with Firebase Firestore, allowing team members to communicate directly within the platform.

## Features

### ✅ Implemented
- **Real-time messaging**: Messages appear instantly using Firestore real-time listeners
- **Conversation management**: Automatic conversation creation between users
- **Message history**: All messages are persisted in Firestore
- **Read receipts**: Messages are automatically marked as read when viewed
- **Online status**: Visual indicators for online team members
- **Search**: Search conversations by user name
- **Auto-scroll**: Messages automatically scroll to bottom on new message
- **Timestamps**: Relative timestamps (e.g., "2m ago") and absolute time display

### 🔒 Security
- Firestore security rules ensure users can only:
  - Read conversations they're participating in
  - Send messages in their own conversations
  - Update their own messages or mark received messages as read

### 📊 Data Structure

#### Conversations Collection
```
conversations/{conversationId}
├── participants: [userId1, userId2]
├── lastMessage: string
├── lastMessageTime: timestamp
└── createdAt: timestamp
```

#### Messages Subcollection
```
conversations/{conversationId}/messages/{messageId}
├── senderId: string
├── text: string
├── createdAt: timestamp
└── read: boolean
```

## Setup Instructions

### 1. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 2. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Testing
- Login with two different accounts in separate browsers
- Navigate to Messages tab
- Start a conversation by clicking on a team member
- Send messages back and forth to test real-time updates

## Usage

### Starting a Conversation
1. Navigate to the Messages page
2. Click on a team member from the sidebar (or from available users if no conversations exist)
3. Type your message and press Enter or click Send

### Viewing Messages
- Select a conversation from the left sidebar
- Messages are loaded automatically
- Scroll to view message history
- New messages appear in real-time

### Message Features
- **Send**: Type message and press Enter or click Send button
- **Read status**: Messages are marked as read when you view the conversation
- **Timestamps**: Hover over messages to see exact send time
- **Auto-scroll**: New messages automatically scroll into view

## API Methods

### `messageService.js`

#### `getOrCreateConversation(currentUserId, otherUserId)`
Creates or retrieves a conversation between two users.

#### `sendMessage(conversationId, senderId, text)`
Sends a message in a conversation.

#### `subscribeToMessages(conversationId, callback)`
Real-time listener for messages in a conversation.

#### `subscribeToConversations(userId, callback)`
Real-time listener for all conversations involving a user.

#### `markMessagesAsRead(conversationId, userId)`
Marks all unread messages in a conversation as read.

#### `getUserInfo(userId)`
Retrieves user information from Firestore.

## Future Enhancements
- [ ] File attachments (images, documents)
- [ ] Message reactions (emoji)
- [ ] Message editing and deletion
- [ ] Typing indicators
- [ ] Group conversations
- [ ] Voice/video calls
- [ ] Message notifications
- [ ] Unread message count badge
- [ ] Message search within conversations
- [ ] Message formatting (bold, italic, code blocks)

## Troubleshooting

### Messages not appearing
- Check Firebase console for any security rule violations
- Ensure user is authenticated
- Verify Firestore indexes are deployed

### Can't send messages
- Check browser console for errors
- Verify Firebase configuration in `.env`
- Ensure security rules allow the operation

### Conversations not loading
- Check that `subscribeToConversations` is being called with valid userId
- Verify Firestore composite index for conversations is created

## Performance Considerations
- Messages are paginated by default (load on scroll can be added)
- Conversations are sorted by last message time
- Real-time listeners are automatically unsubscribed when component unmounts
- User info is cached after first fetch to reduce reads
