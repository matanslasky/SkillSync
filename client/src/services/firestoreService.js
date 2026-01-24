import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import logger from '../utils/logger'

// Projects Collection
export const createProject = async (projectData) => {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    status: 'Active',
    meetingsLog: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() }
}

export const getProjects = async () => {
  const q = query(
    collection(db, 'projects'),
    where('status', '==', 'Active'),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const getProjectById = async (projectId) => {
  const docRef = doc(db, 'projects', projectId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  throw new Error('Project not found')
}

export const updateProject = async (projectId, updates) => {
  const docRef = doc(db, 'projects', projectId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
  
  return getProjectById(projectId)
}

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, 'projects', projectId))
}

// Tasks Collection
export const createTask = async (taskData) => {
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...taskData,
    status: taskData.status || 'To Do',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() }
}

export const getTasksByProject = async (projectId) => {
  const q = query(
    collection(db, 'tasks'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updateTask = async (taskId, updates) => {
  const docRef = doc(db, 'tasks', taskId)
  
  // Auto-set completedAt when status changes to Done
  if (updates.status === 'Done' && !updates.completedAt) {
    updates.completedAt = serverTimestamp()
  }
  
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
  
  const updated = await getDoc(docRef)
  return { id: updated.id, ...updated.data() }
}

export const deleteTask = async (taskId) => {
  await deleteDoc(doc(db, 'tasks', taskId))
}

// Users Collection
export const getUserById = async (userId) => {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  throw new Error('User not found')
}

export const updateUser = async (userId, updates) => {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
  
  return getUserById(userId)
}

export const searchUsersBySkills = async (skills) => {
  const q = query(
    collection(db, 'users'),
    where('skills', 'array-contains-any', skills.slice(0, 10)) // Firestore limit: 10 items
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Find projects matching user's skills
export const findProjectsForUser = async (userSkills) => {
  if (!userSkills || userSkills.length === 0) {
    return []
  }
  
  try {
    // Get all active projects
    const allProjects = await getProjects()
    
    // Score each project based on skill matches
    const scoredProjects = allProjects.map(project => {
      let matchScore = 0
      const projectSkills = project.rolesNeeded || []
      
      // Check if user skills match any required roles
      projectSkills.forEach(role => {
        userSkills.forEach(skill => {
          if (role.toLowerCase().includes(skill.toLowerCase()) || 
              skill.toLowerCase().includes(role.toLowerCase())) {
            matchScore++
          }
        })
      })
      
      return { ...project, matchScore }
    })
    
    // Return projects with at least one skill match, sorted by match score
    return scoredProjects
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
  } catch (error) {
    logger.error('Error finding projects for user', error, { userId })
    return []
  }
}

// Notifications
export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    })
    
    const newDoc = await getDoc(docRef)
    return { id: newDoc.id, ...newDoc.data() }
  } catch (error) {
    logger.error('Error creating notification', error, notificationData)
    throw error
  }
}

export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    logger.error('Error getting notifications', error, { userId })
    return []
  }
}

export const markNotificationRead = async (notificationId) => {
  try {
    const docRef = doc(db, 'notifications', notificationId)
    await updateDoc(docRef, { read: true })
  } catch (error) {
    logger.error('Error marking notification read', error, { notificationId })
    throw error
  }
}
