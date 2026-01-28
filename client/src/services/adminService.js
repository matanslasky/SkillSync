/**
 * Admin Service
 * Handles admin-level operations for user management and system monitoring
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get all users with optional filters
 */
export const getAllUsers = async (filters = {}) => {
  try {
    let q = query(collection(db, 'users'));
    
    if (filters.role) {
      q = query(q, where('role', '==', filters.role));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Get system statistics
 */
export const getSystemStats = async () => {
  try {
    const [usersSnapshot, projectsSnapshot, tasksSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'tasks'))
    ]);
    
    const users = usersSnapshot.docs.map(doc => doc.data());
    const projects = projectsSnapshot.docs.map(doc => doc.data());
    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    
    // Active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = users.filter(u => {
      const lastLogin = u.lastLogin?.toDate ? u.lastLogin.toDate() : new Date(u.lastLogin);
      return lastLogin > sevenDaysAgo;
    });
    
    // Active projects
    const activeProjects = projects.filter(p => p.status === 'Active');
    
    // Completed tasks this week
    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'done') return false;
      const completedAt = t.completedAt?.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      return completedAt > sevenDaysAgo;
    });
    
    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalTasks: tasks.length,
      completedTasksThisWeek: completedThisWeek.length,
      userGrowth: calculateGrowth(users),
      projectGrowth: calculateGrowth(projects),
      averageTeamSize: activeProjects.length > 0 
        ? Math.round(activeProjects.reduce((sum, p) => sum + (p.team?.length || 0), 0) / activeProjects.length)
        : 0
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return null;
  }
};

/**
 * Calculate growth percentage
 */
const calculateGrowth = (items) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentItems = items.filter(item => {
    const created = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    return created > thirtyDaysAgo;
  });
  
  const previousTotal = items.length - recentItems.length;
  if (previousTotal === 0) return 100;
  
  return Math.round((recentItems.length / previousTotal) * 100);
};

/**
 * Update user status (active, suspended, banned)
 */
export const updateUserStatus = async (userId, status) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'deleted',
      deletedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get user activity logs
 */
export const getUserActivity = async (userId, daysBack = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    // Get user's tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignee', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'task',
      ...doc.data()
    }));
    
    // Get user's projects
    const projectsQuery = query(
      collection(db, 'projects'),
      where('team', 'array-contains', userId)
    );
    
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'project',
      ...doc.data()
    }));
    
    return {
      tasks: tasks.filter(t => {
        const created = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        return created > cutoffDate;
      }),
      projects: projects.filter(p => {
        const created = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return created > cutoffDate;
      })
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return { tasks: [], projects: [] };
  }
};

/**
 * Bulk update user statuses
 */
export const bulkUpdateUserStatus = async (userIds, status) => {
  try {
    const promises = userIds.map(userId => 
      updateDoc(doc(db, 'users', userId), {
        status,
        updatedAt: Timestamp.now()
      })
    );
    
    await Promise.all(promises);
    return { success: true, updated: userIds.length };
  } catch (error) {
    console.error('Error bulk updating users:', error);
    throw error;
  }
};

/**
 * Get audit logs (track admin actions)
 */
export const getAuditLogs = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Create audit log entry
 */
export const createAuditLog = async (action, details, adminUserId) => {
  try {
    const { addDoc } = await import('firebase/firestore');
    await addDoc(collection(db, 'auditLogs'), {
      action,
      details,
      adminUserId,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

export default {
  getAllUsers,
  getSystemStats,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserActivity,
  bulkUpdateUserStatus,
  getAuditLogs,
  createAuditLog
};
