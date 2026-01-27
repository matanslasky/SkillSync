import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  limit
} from 'firebase/firestore'
import { db } from '../config/firebase'
import socketService from './socketService'
import logger from '../utils/logger'

// Create or get a conversation between two users
export const getOrCreateConversation = async (currentUserId, otherUserId) => {
  // Create a consistent conversation ID (sorted user IDs)
  const conversationId = [currentUserId, otherUserId].sort().join('_')
  
  const conversationRef = doc(db, 'conversations', conversationId)
  const conversationSnap = await getDoc(conversationRef)
  
  if (!conversationSnap.exists()) {
    // Create new conversation
    await setDoc(conversationRef, {
      participants: [currentUserId, otherUserId],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp()
    })
  }
  
  return conversationId
}

// Send a message
export const sendMessage = async (conversationId, senderId, text) => {
  try {
    // Add message to messages subcollection
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false
    })
    
    // Update conversation's last message
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

// Listen to messages in a conversation
export const subscribeToMessages = (conversationId, callback) => {
  const messagesQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(messages)
  })
}

// Get all conversations for a user
export const subscribeToConversations = (userId, callback) => {
  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  )
  
  return onSnapshot(conversationsQuery, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(conversations)
  })
}

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('senderId', '!=', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(messagesQuery)
    
    const updatePromises = snapshot.docs.map(docSnapshot =>
      updateDoc(doc(db, 'conversations', conversationId, 'messages', docSnapshot.id), {
        read: true
      })
    )
    
    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Get user info from users collection
export const getUserInfo = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user info:', error)
    return null
  }
}
// ===== PROJECT-BASED MESSAGING =====

/**
 * Send a message in a project chat room
 * @param {string} projectId - The project ID
 * @param {string} userId - The sender's user ID
 * @param {string} userName - The sender's name
 * @param {string} text - The message text
 * @param {string} type - Message type (text, file, system)
 */
export const sendProjectMessage = async (projectId, userId, userName, text, type = 'text') => {
  try {
    const messageData = {
      projectId,
      userId,
      userName,
      text,
      type,
      createdAt: serverTimestamp(),
      read: []
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'projectMessages'), messageData)
    
    // Broadcast via Socket.io for real-time delivery
    if (socketService.isSocketConnected()) {
      socketService.sendMessage(projectId, {
        id: docRef.id,
        ...messageData,
        createdAt: new Date()
      })
    }

    logger.logUserAction('project_message_sent', { projectId, messageLength: text.length })
    return { success: true, id: docRef.id }
  } catch (error) {
    logger.error('Error sending project message', error, { projectId, userId })
    throw error
  }
}

/**
 * Subscribe to project messages
 * @param {string} projectId - The project ID
 * @param {Function} callback - Callback function to handle messages
 * @returns {Function} Unsubscribe function
 */
export const subscribeToProjectMessages = (projectId, callback) => {
  const messagesQuery = query(
    collection(db, 'projectMessages'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'asc'),
    limit(100) // Limit to last 100 messages
  )

  // Firestore subscription
  const unsubscribeFirestore = onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(messages)
  })

  // Socket.io subscription for real-time updates
  socketService.onMessage((data) => {
    if (data.projectId === projectId) {
      callback((prevMessages) => [...prevMessages, data.message])
    }
  })

  // Return combined unsubscribe function
  return () => {
    unsubscribeFirestore()
    socketService.off('project-message')
  }
}

/**
 * Mark project messages as read
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID
 */
export const markProjectMessagesAsRead = async (projectId, userId) => {
  try {
    const messagesQuery = query(
      collection(db, 'projectMessages'),
      where('projectId', '==', projectId),
      where('userId', '!=', userId)
    )

    const snapshot = await getDocs(messagesQuery)
    
    const updatePromises = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data()
      const readArray = data.read || []
      
      if (!readArray.includes(userId)) {
        return updateDoc(doc(db, 'projectMessages', docSnapshot.id), {
          read: [...readArray, userId]
        })
      }
      return Promise.resolve()
    })

    await Promise.all(updatePromises)
    logger.info('Marked project messages as read', { projectId, userId })
  } catch (error) {
    logger.error('Error marking project messages as read', error, { projectId, userId })
  }
}

/**
 * Get unread message count for a project
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Count of unread messages
 */
export const getUnreadProjectMessageCount = async (projectId, userId) => {
  try {
    const messagesQuery = query(
      collection(db, 'projectMessages'),
      where('projectId', '==', projectId),
      where('userId', '!=', userId)
    )

    const snapshot = await getDocs(messagesQuery)
    
    let unreadCount = 0
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const readArray = data.read || []
      if (!readArray.includes(userId)) {
        unreadCount++
      }
    })

    return unreadCount
  } catch (error) {
    logger.error('Error getting unread message count', error, { projectId, userId })
    return 0
  }
}

/**
 * Delete a message (mark as deleted)
 * @param {string} messageId - The message ID
 * @param {string} userId - The user ID attempting to delete
 */
export const deleteMessage = async (messageId, userId) => {
  try {
    const messageRef = doc(db, 'projectMessages', messageId)
    const messageSnap = await getDoc(messageRef)
    
    if (!messageSnap.exists()) {
      throw new Error('Message not found')
    }

    const messageData = messageSnap.data()
    
    // Only allow sender to delete
    if (messageData.userId !== userId) {
      throw new Error('Unauthorized to delete this message')
    }

    await updateDoc(messageRef, {
      text: '[Message deleted]',
      deleted: true,
      deletedAt: serverTimestamp()
    })

    logger.logUserAction('message_deleted', { messageId, projectId: messageData.projectId })
    return { success: true }
  } catch (error) {
    logger.error('Error deleting message', error, { messageId, userId })
    throw error
  }
}