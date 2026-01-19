import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

export const register = async (userData) => {
  const { email, password, name, role, skills } = userData
  
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
  
  return { user: { uid: user.uid, email, name, role } }
}

export const login = async (email, password) => {
  // Check for admin credentials
  if (email === 'admin' && password === '12345678') {
    // Return admin user object
    return {
      user: {
        uid: 'admin-user',
        email: 'admin@skillsync.com',
        name: 'Admin',
        role: 'Admin',
        isAdmin: true
      }
    }
  }
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid))
  
  return {
    user: {
      uid: user.uid,
      ...userDoc.data()
    }
  }
}

export const logout = async () => {
  // Clear admin session if exists
  sessionStorage.removeItem('adminUser')
  
  await signOut(auth)
}

export const getCurrentUser = async () => {
  const user = auth.currentUser
  
  // Check if admin is logged in (stored in session)
  const adminUser = sessionStorage.getItem('adminUser')
  if (adminUser) {
    return JSON.parse(adminUser)
  }
  
  if (!user) return null
  
  const userDoc = await getDoc(doc(db, 'users', user.uid))
  return {
    uid: user.uid,
    ...userDoc.data()
  }
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
