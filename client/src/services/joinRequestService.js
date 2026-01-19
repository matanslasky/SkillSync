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
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { notifyProjectInvite } from './notificationService'
import { addTeamMember } from './projectService'

/**
 * Join request status types
 */
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

/**
 * Send a request to join a project team
 * @param {Object} requestData - The request data
 * @returns {Promise<string>} The request ID
 */
export const sendJoinRequest = async (requestData) => {
  const { projectId, projectName, userId, userName, message = '', skills = [] } = requestData
  
  try {
    // Check if request already exists
    const existingRequest = await checkRequestExists(projectId, userId)
    if (existingRequest) {
      throw new Error('You already have a pending request for this project')
    }

    // Get project details to find owner
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await getDoc(projectRef)
    
    if (!projectSnap.exists()) {
      throw new Error('Project not found')
    }

    const project = projectSnap.data()
    const projectOwnerId = project.creatorId

    // Create join request
    const requestRef = await addDoc(collection(db, 'joinRequests'), {
      projectId,
      projectName,
      userId,
      userName,
      message,
      skills,
      status: REQUEST_STATUS.PENDING,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // Send notification to project owner
    await notifyProjectInvite(
      projectOwnerId,
      projectId,
      projectName,
      `${userName} requested to join your team`
    )

    return requestRef.id
  } catch (error) {
    console.error('Error sending join request:', error)
    throw error
  }
}

/**
 * Get all join requests for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of join requests
 */
export const getProjectJoinRequests = async (projectId) => {
  try {
    const q = query(
      collection(db, 'joinRequests'),
      where('projectId', '==', projectId),
      where('status', '==', REQUEST_STATUS.PENDING),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching join requests:', error)
    return []
  }
}

/**
 * Get join requests sent by a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of join requests
 */
export const getUserJoinRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'joinRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user join requests:', error)
    return []
  }
}

/**
 * Approve a join request and add user to team
 * @param {string} requestId - The request ID
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID to add
 * @returns {Promise<void>}
 */
export const approveJoinRequest = async (requestId, projectId, userId) => {
  try {
    // Update request status
    const requestRef = doc(db, 'joinRequests', requestId)
    await updateDoc(requestRef, {
      status: REQUEST_STATUS.APPROVED,
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    
    // Add user to project team
    await addTeamMember(projectId, userId)
    
    // Send notification to user
    const requestSnap = await getDoc(requestRef)
    const request = requestSnap.data()
    
    await notifyProjectInvite(
      userId,
      projectId,
      request.projectName,
      'Your join request was approved! Welcome to the team! 🎉'
    )
  } catch (error) {
    console.error('Error approving join request:', error)
    throw error
  }
}

/**
 * Reject a join request
 * @param {string} requestId - The request ID
 * @param {string} reason - Optional rejection reason
 * @returns {Promise<void>}
 */
export const rejectJoinRequest = async (requestId, reason = '') => {
  try {
    const requestRef = doc(db, 'joinRequests', requestId)
    await updateDoc(requestRef, {
      status: REQUEST_STATUS.REJECTED,
      rejectionReason: reason,
      rejectedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error rejecting join request:', error)
    throw error
  }
}

/**
 * Cancel a join request
 * @param {string} requestId - The request ID
 * @returns {Promise<void>}
 */
export const cancelJoinRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'joinRequests', requestId)
    await updateDoc(requestRef, {
      status: REQUEST_STATUS.CANCELLED,
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error cancelling join request:', error)
    throw error
  }
}

/**
 * Check if a join request already exists
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} True if request exists
 */
export const checkRequestExists = async (projectId, userId) => {
  try {
    const q = query(
      collection(db, 'joinRequests'),
      where('projectId', '==', projectId),
      where('userId', '==', userId),
      where('status', '==', REQUEST_STATUS.PENDING)
    )
    
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Error checking request existence:', error)
    return false
  }
}

/**
 * Subscribe to real-time join requests for a project
 * @param {string} projectId - The project ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToProjectRequests = (projectId, callback) => {
  const q = query(
    collection(db, 'joinRequests'),
    where('projectId', '==', projectId),
    where('status', '==', REQUEST_STATUS.PENDING),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(requests)
  }, (error) => {
    console.error('Error subscribing to join requests:', error)
    callback([])
  })
}
