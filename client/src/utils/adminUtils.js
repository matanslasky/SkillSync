/**
 * Admin Role Utilities for SkillSync
 * 
 * Provides helper functions for admin role management
 */

import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Check if a user has admin role
 * @param {Object} user - User object with role field
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  return user?.role === 'Admin'
}

/**
 * Check if a user has permission for admin-only features
 * @param {Object} user - User object
 * @returns {boolean} - True if user can access admin features
 */
export const hasAdminAccess = (user) => {
  return isAdmin(user)
}

/**
 * Grant admin role to a user (must be called by existing admin)
 * @param {string} userId - User ID to grant admin role
 * @param {Object} currentUser - Current user performing the action
 * @returns {Promise<void>}
 */
export const grantAdminRole = async (userId, currentUser) => {
  if (!isAdmin(currentUser)) {
    throw new Error('Only admins can grant admin role')
  }

  if (userId === currentUser.uid) {
    throw new Error('Cannot modify your own admin status')
  }

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: 'Admin',
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error granting admin role:', error)
    throw new Error('Failed to grant admin role')
  }
}

/**
 * Revoke admin role from a user (must be called by existing admin)
 * @param {string} userId - User ID to revoke admin role
 * @param {Object} currentUser - Current user performing the action
 * @param {string} newRole - New role to assign (default: 'Developer')
 * @returns {Promise<void>}
 */
export const revokeAdminRole = async (userId, currentUser, newRole = 'Developer') => {
  if (!isAdmin(currentUser)) {
    throw new Error('Only admins can revoke admin role')
  }

  if (userId === currentUser.uid) {
    throw new Error('Cannot modify your own admin status')
  }

  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error revoking admin role:', error)
    throw new Error('Failed to revoke admin role')
  }
}

/**
 * Get list of available roles (including admin)
 * @returns {Array<string>} - List of role names
 */
export const getAllRoles = () => {
  return [
    'Developer',
    'Designer',
    'Product Manager',
    'Marketing',
    'Data Scientist',
    'Business Analyst',
    'Admin',
    'Other'
  ]
}

/**
 * Get list of non-admin roles
 * @returns {Array<string>} - List of role names
 */
export const getNonAdminRoles = () => {
  return [
    'Developer',
    'Designer',
    'Product Manager',
    'Marketing',
    'Data Scientist',
    'Business Analyst',
    'Other'
  ]
}
