import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { notifyProjectInvite } from './notificationService'

/**
 * Invitation status types
 */
export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

/**
 * Send a team invitation
 * @param {Object} inviteData - The invitation data
 * @returns {Promise<string>} The invitation ID
 */
export const sendTeamInvite = async (inviteData) => {
  try {
    const invitation = {
      ...inviteData,
      status: INVITE_STATUS.PENDING,
      createdAt: Timestamp.now(),
    }
    
    const docRef = await addDoc(collection(db, 'teamInvitations'), invitation)
    
    // Send notification to recipient
    if (inviteData.recipientId && inviteData.projectId) {
      await notifyProjectInvite(
        inviteData.recipientId,
        inviteData.projectId,
        inviteData.projectName,
        inviteData.senderName
      )
    }
    
    return docRef.id
  } catch (error) {
    console.error('Error sending team invite:', error)
    throw error
  }
}

/**
 * Get invitations for a user (received)
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of invitations
 */
export const getUserInvitations = async (userId) => {
  try {
    const q = query(
      collection(db, 'teamInvitations'),
      where('recipientId', '==', userId),
      where('status', '==', INVITE_STATUS.PENDING),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return []
  }
}

/**
 * Get sent invitations (sent by user)
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of sent invitations
 */
export const getSentInvitations = async (userId) => {
  try {
    const q = query(
      collection(db, 'teamInvitations'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching sent invitations:', error)
    return []
  }
}

/**
 * Accept a team invitation
 * @param {string} inviteId - The invitation ID
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID accepting
 * @returns {Promise<void>}
 */
export const acceptInvitation = async (inviteId, projectId, userId) => {
  try {
    // Update invitation status
    const inviteRef = doc(db, 'teamInvitations', inviteId)
    await updateDoc(inviteRef, {
      status: INVITE_STATUS.ACCEPTED,
      acceptedAt: Timestamp.now()
    })
    
    // Add user to project team (assuming you have this function in projectService)
    const { addTeamMember } = await import('./projectService')
    await addTeamMember(projectId, userId)
  } catch (error) {
    console.error('Error accepting invitation:', error)
    throw error
  }
}

/**
 * Reject a team invitation
 * @param {string} inviteId - The invitation ID
 * @returns {Promise<void>}
 */
export const rejectInvitation = async (inviteId) => {
  try {
    const inviteRef = doc(db, 'teamInvitations', inviteId)
    await updateDoc(inviteRef, {
      status: INVITE_STATUS.REJECTED,
      rejectedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error rejecting invitation:', error)
    throw error
  }
}

/**
 * Cancel a sent invitation
 * @param {string} inviteId - The invitation ID
 * @returns {Promise<void>}
 */
export const cancelInvitation = async (inviteId) => {
  try {
    const inviteRef = doc(db, 'teamInvitations', inviteId)
    await updateDoc(inviteRef, {
      status: INVITE_STATUS.CANCELLED,
      cancelledAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    throw error
  }
}

/**
 * Subscribe to real-time invitations
 * @param {string} userId - The user ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToInvitations = (userId, callback) => {
  const q = query(
    collection(db, 'teamInvitations'),
    where('recipientId', '==', userId),
    where('status', '==', INVITE_STATUS.PENDING),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const invitations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(invitations)
  }, (error) => {
    console.error('Error subscribing to invitations:', error)
  })
}

/**
 * Check if an invitation already exists
 * @param {string} senderId - The sender's user ID
 * @param {string} recipientId - The recipient's user ID
 * @param {string} projectId - The project ID
 * @returns {Promise<boolean>} True if invitation exists
 */
export const checkInvitationExists = async (senderId, recipientId, projectId) => {
  try {
    const q = query(
      collection(db, 'teamInvitations'),
      where('senderId', '==', senderId),
      where('recipientId', '==', recipientId),
      where('projectId', '==', projectId),
      where('status', '==', INVITE_STATUS.PENDING)
    )
    
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Error checking invitation:', error)
    return false
  }
}
