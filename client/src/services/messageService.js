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
  getDoc
} from 'firebase/firestore'
import { db } from '../config/firebase'

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
