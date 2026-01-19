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
  await signOut(auth)
}

export const getCurrentUser = async () => {
  const user = auth.currentUser
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
