import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import logger from '../utils/logger'

export const register = async (userData) => {
  const { email, password, name, role, skills } = userData
  
  try {
    logger.info('User registration started', { email, role })
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      role: role || 'Developer',
      skills: skills || [],
      portfolio: '',
      bio: '',
      commitmentScore: 50,
      scoreHistory: [],
      projects: [],
      githubUsername: '',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    logger.info('User registered successfully', { uid: user.uid, email })
    logger.logUserAction('user_registered', { role, skillCount: skills?.length || 0 })
    
    return { user: { uid: user.uid, email, name, role } }
  } catch (error) {
    logger.error('Registration failed', error, { email, role })
    throw error
  }
}

export const login = async (email, password) => {
  try {
    logger.info('User login attempt', { email })
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      logger.error('User data not found after login', null, { uid: user.uid, email })
      throw new Error('User data not found')
    }
    
    const userData = userDoc.data()
    
    logger.info('User logged in successfully', { uid: user.uid, email, role: userData.role })
    logger.logUserAction('user_login', { role: userData.role })
    
    return {
      user: {
        uid: user.uid,
        ...userData
      }
    }
  } catch (error) {
    logger.error('Login failed', error, { email })
    throw error
  }
}

export const logout = async () => {
  try {
    const uid = auth.currentUser?.uid
    logger.info('User logout', { uid })
    await signOut(auth)
    logger.logUserAction('user_logout', { uid })
  } catch (error) {
    logger.error('Logout failed', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const user = auth.currentUser
    
    if (!user) return null
    
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      logger.warn('User document not found', { uid: user.uid })
      return null
    }
    
    return {
      uid: user.uid,
      ...userDoc.data()
    }
  } catch (error) {
    logger.error('Error getting current user', error)
    return null
  }
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
