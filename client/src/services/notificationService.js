import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  PROJECT_INVITE: 'project_invite',
  PROJECT_UPDATE: 'project_update',
  MESSAGE: 'message',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  MILESTONE_REACHED: 'milestone_reached',
  TEAM_JOIN: 'team_join',
  TEAM_LEAVE: 'team_leave',
  COMMENT: 'comment',
  MENTION: 'mention',
  SYSTEM: 'system'
}

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<string>} The notification ID
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      read: false,
      createdAt: Timestamp.now(),
    }
    
    const docRef = await addDoc(collection(db, 'notifications'), notification)
    return docRef.id
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Get notifications for a user
 * @param {string} userId - The user ID
 * @param {number} limitCount - Maximum number of notifications to fetch
 * @returns {Promise<Array>} Array of notifications
 */
export const getUserNotifications = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Get unread notification count
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.length
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Promise<void>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
export const markAllAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: Timestamp.now()
      })
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error marking all as read:', error)
    throw error
  }
}

/**
 * Subscribe to real-time notifications
 * @param {string} userId - The user ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(notifications)
  }, (error) => {
    console.error('Error subscribing to notifications:', error)
    // If index error, provide instructions
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('⚠️  Firestore Index Required')
      console.warn('Create the index by clicking the link above, or notifications will be disabled.')
      console.warn('This is a one-time setup. After creating the index, refresh the page.')
    }
    // Call callback with empty array so UI doesn't break
    callback([])
  })
}

/**
 * Helper function to send project invite notification
 */
export const notifyProjectInvite = async (recipientId, projectId, projectName, invitedBy) => {
  return createNotification({
    recipientId,
    type: NOTIFICATION_TYPES.PROJECT_INVITE,
    title: 'Project Invitation',
    message: `${invitedBy} invited you to join ${projectName}`,
    data: {
      projectId,
      projectName,
      invitedBy
    }
  })
}

/**
 * Helper function to send message notification
 */
export const notifyNewMessage = async (recipientId, senderId, senderName, preview) => {
  return createNotification({
    recipientId,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: 'New Message',
    message: `${senderName}: ${preview}`,
    data: {
      senderId,
      senderName
    }
  })
}

/**
 * Helper function to send task assignment notification
 */
export const notifyTaskAssigned = async (recipientId, taskId, taskTitle, projectName, assignedBy) => {
  return createNotification({
    recipientId,
    type: NOTIFICATION_TYPES.TASK_ASSIGNED,
    title: 'Task Assigned',
    message: `${assignedBy} assigned you "${taskTitle}" in ${projectName}`,
    data: {
      taskId,
      taskTitle,
      projectName,
      assignedBy
    }
  })
}

/**
 * Helper function to send milestone notification
 */
export const notifyMilestoneReached = async (recipientId, projectId, projectName, milestoneName) => {
  return createNotification({
    recipientId,
    type: NOTIFICATION_TYPES.MILESTONE_REACHED,
    title: 'Milestone Reached! 🎉',
    message: `${projectName} reached milestone: ${milestoneName}`,
    data: {
      projectId,
      projectName,
      milestoneName
    }
  })
}

/**
 * Helper function to send team join notification
 */
export const notifyTeamJoin = async (recipientId, projectId, projectName, userName) => {
  return createNotification({
    recipientId,
    type: NOTIFICATION_TYPES.TEAM_JOIN,
    title: 'Team Update',
    message: `${userName} joined ${projectName}`,
    data: {
      projectId,
      projectName,
      userName
    }
  })
}
