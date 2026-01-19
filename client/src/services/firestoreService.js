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
