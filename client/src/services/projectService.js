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
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Create a new project
export const createProject = async (projectData) => {
  try {
    const projectRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: projectData.status || 'active',
      teamMembers: projectData.teamMembers || [],
      lookingFor: projectData.lookingFor || [],
      progress: projectData.progress || 0
    })
    
    return { id: projectRef.id, ...projectData }
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

// Get a single project by ID
export const getProject = async (projectId) => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId))
    
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() }
    } else {
      throw new Error('Project not found')
    }
  } catch (error) {
    console.error('Error fetching project:', error)
    throw error
  }
}

// Get all projects with optional filters
export const getProjects = async (filters = {}) => {
  try {
    let projectQuery = collection(db, 'projects')
    const constraints = []
    
    // Apply filters
    if (filters.status) {
      constraints.push(where('status', '==', filters.status))
    }
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category))
    }
    
    if (filters.creatorId) {
      constraints.push(where('creatorId', '==', filters.creatorId))
    }
    
    // Order by creation date (newest first)
    constraints.push(orderBy('createdAt', 'desc'))
    
    // Apply limit if specified
    if (filters.limit) {
      constraints.push(limit(filters.limit))
    }
    
    if (constraints.length > 0) {
      projectQuery = query(projectQuery, ...constraints)
    }
    
    const querySnapshot = await getDocs(projectQuery)
    const projects = []
    
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() })
    })
    
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

// Get projects where user is a team member
export const getUserProjects = async (userId) => {
  try {
    const projectQuery = query(
      collection(db, 'projects'),
      where('teamMembers', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(projectQuery)
    const projects = []
    
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() })
    })
    
    return projects
  } catch (error) {
    console.error('Error fetching user projects:', error)
    throw error
  }
}

// Update a project
export const updateProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
    
    return { id: projectId, ...updates }
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId))
    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

// Add a team member to a project
export const addTeamMember = async (projectId, userId) => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    
    await updateDoc(projectRef, {
      teamMembers: arrayUnion(userId),
      updatedAt: Timestamp.now()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error adding team member:', error)
    throw error
  }
}

// Remove a team member from a project
export const removeTeamMember = async (projectId, userId) => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    
    await updateDoc(projectRef, {
      teamMembers: arrayRemove(userId),
      updatedAt: Timestamp.now()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error removing team member:', error)
    throw error
  }
}

// Search projects by name or description
export const searchProjects = async (searchTerm) => {
  try {
    // Firestore doesn't support full-text search, so we get all projects
    // and filter client-side. For production, consider Algolia or similar.
    const allProjects = await getProjects()
    
    const searchLower = searchTerm.toLowerCase()
    const filtered = allProjects.filter(project => 
      project.name?.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower) ||
      project.category?.toLowerCase().includes(searchLower)
    )
    
    return filtered
  } catch (error) {
    console.error('Error searching projects:', error)
    throw error
  }
}
