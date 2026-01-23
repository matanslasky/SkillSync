import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

// Get user settings from Firestore
export const getUserSettings = async (userId) => {
  try {
    const settingsDoc = await getDoc(doc(db, 'userSettings', userId))
    
    if (settingsDoc.exists()) {
      return settingsDoc.data()
    }
    
    // Return default settings if none exist
    return {
      profile: {
        name: '',
        role: 'Developer',
        bio: '',
        skills: [],
        github: '',
        linkedin: ''
      },
      notifications: {
        emailNotifications: true,
        projectUpdates: true,
        taskAssignments: true,
        teamMessages: true,
        weeklyDigest: false,
        marketingEmails: false
      },
      appearance: {
        theme: 'dark',
        accentColor: 'green'
      },
      privacy: {
        profileVisibility: 'everyone',
        showOnlineStatus: true,
        showCommitmentScore: true
      }
    }
  } catch (error) {
    console.error('Error fetching user settings:', error)
    throw error
  }
}

// Save all user settings to Firestore
export const saveUserSettings = async (userId, settings) => {
  try {
    await setDoc(doc(db, 'userSettings', userId), {
      ...settings,
      updatedAt: new Date()
    }, { merge: true })
    
    return { success: true }
  } catch (error) {
    console.error('Error saving user settings:', error)
    throw error
  }
}

// Update specific settings section (profile, notifications, etc.)
export const updateSettingsSection = async (userId, section, data) => {
  try {
    await updateDoc(doc(db, 'userSettings', userId), {
      [section]: data,
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error updating settings section:', error)
    throw error
  }
}

// Update user profile in main users collection (for display purposes)
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    // Check if user document exists
    const userDoc = await getDoc(userRef)
    
    const updates = {
      updatedAt: new Date()
    }
    
    // Only update fields that are provided
    if (profileData.name) updates.name = profileData.name
    if (profileData.role) updates.role = profileData.role
    if (profileData.bio) updates.bio = profileData.bio
    if (profileData.skills) updates.skills = profileData.skills
    if (profileData.github) updates.githubUsername = profileData.github
    if (profileData.linkedin) updates.linkedinUrl = profileData.linkedin
    
    // Use setDoc with merge if document doesn't exist, updateDoc if it does
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...updates,
        createdAt: new Date()
      }, { merge: true })
    } else {
      await updateDoc(userRef, updates)
    }
    
    // Also save to settings
    await updateSettingsSection(userId, 'profile', profileData)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}
