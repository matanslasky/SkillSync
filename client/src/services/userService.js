import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Get a single user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() }
    } else {
      throw new Error('User not found')
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

// Get multiple user profiles by IDs
export const getUserProfiles = async (userIds) => {
  try {
    const profiles = []
    
    for (const userId of userIds) {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        profiles.push({ uid: userDoc.id, ...userDoc.data() })
      }
    }
    
    return profiles
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    throw error
  }
}

// Get all users with optional filters
export const getAllUsers = async (filters = {}) => {
  try {
    let userQuery = collection(db, 'users')
    const constraints = []
    
    // Apply filters
    if (filters.role) {
      constraints.push(where('role', '==', filters.role))
    }
    
    // Order by creation date
    constraints.push(orderBy('createdAt', 'desc'))
    
    if (constraints.length > 0) {
      userQuery = query(userQuery, ...constraints)
    }
    
    const querySnapshot = await getDocs(userQuery)
    const users = []
    
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() })
    })
    
    return users
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
    
    return { uid: userId, ...updates }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Update profile picture URL
export const updateProfilePicture = async (userId, photoURL) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      photoURL,
      updatedAt: Timestamp.now()
    })
    
    return { success: true, photoURL }
  } catch (error) {
    console.error('Error updating profile picture:', error)
    throw error
  }
}

// Search users by name or skills
export const searchUsers = async (searchTerm) => {
  try {
    // Get all users and filter client-side
    // For production, consider using Algolia or similar
    const allUsers = await getAllUsers()
    
    const searchLower = searchTerm.toLowerCase()
    const filtered = allUsers.filter(user => 
      user.name?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.skills?.some(skill => skill.toLowerCase().includes(searchLower))
    )
    
    return filtered
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const userQuery = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('commitmentScore', 'desc')
    )
    
    const querySnapshot = await getDocs(userQuery)
    const users = []
    
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() })
    })
    
    return users
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw error
  }
}
