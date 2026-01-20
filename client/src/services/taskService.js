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
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Task status types
 */
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  IN_REVIEW: 'in-review',
  COMPLETED: 'completed'
}

/**
 * Task priority types
 */
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

/**
 * Create a new task
 * @param {Object} taskData - The task data
 * @returns {Promise<Object>} The created task
 */
export const createTask = async (taskData) => {
  try {
    const task = {
      ...taskData,
      status: taskData.status || TASK_STATUS.TODO,
      priority: taskData.priority || TASK_PRIORITY.MEDIUM,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      completedAt: null
    }

    const taskRef = await addDoc(collection(db, 'tasks'), task)
    return { id: taskRef.id, ...task }
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

/**
 * Get a single task by ID
 * @param {string} taskId - The task ID
 * @returns {Promise<Object>} The task data
 */
export const getTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId)
    const taskSnap = await getDoc(taskRef)
    
    if (taskSnap.exists()) {
      return { id: taskSnap.id, ...taskSnap.data() }
    } else {
      throw new Error('Task not found')
    }
  } catch (error) {
    console.error('Error fetching task:', error)
    throw error
  }
}

/**
 * Get all tasks for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of tasks
 */
export const getProjectTasks = async (projectId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching project tasks:', error)
    return []
  }
}

/**
 * Get tasks assigned to a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of tasks
 */
export const getUserTasks = async (userId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('assigneeId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user tasks:', error)
    return []
  }
}

/**
 * Update a task
 * @param {string} taskId - The task ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId)
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    }

    // If status is being changed to completed, set completedAt
    if (updates.status === TASK_STATUS.COMPLETED && !updates.completedAt) {
      updateData.completedAt = Timestamp.now()
    }

    await updateDoc(taskRef, updateData)
    
    // Return updated task
    const updatedTask = await getTask(taskId)
    return updatedTask
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

/**
 * Delete a task
 * @param {string} taskId - The task ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId)
    await deleteDoc(taskRef)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

/**
 * Move a task to a different status (for Kanban)
 * @param {string} taskId - The task ID
 * @param {string} newStatus - The new status
 * @returns {Promise<Object>} The updated task
 */
export const moveTask = async (taskId, newStatus) => {
  try {
    return await updateTask(taskId, { status: newStatus })
  } catch (error) {
    console.error('Error moving task:', error)
    throw error
  }
}

/**
 * Get tasks grouped by status (for Kanban board)
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Tasks grouped by status
 */
export const getTasksByStatus = async (projectId) => {
  try {
    const tasks = await getProjectTasks(projectId)
    
    const grouped = {
      [TASK_STATUS.TODO]: [],
      [TASK_STATUS.IN_PROGRESS]: [],
      [TASK_STATUS.IN_REVIEW]: [],
      [TASK_STATUS.COMPLETED]: []
    }

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    return grouped
  } catch (error) {
    console.error('Error grouping tasks by status:', error)
    return {
      [TASK_STATUS.TODO]: [],
      [TASK_STATUS.IN_PROGRESS]: [],
      [TASK_STATUS.IN_REVIEW]: [],
      [TASK_STATUS.COMPLETED]: []
    }
  }
}

/**
 * Calculate task completion rate for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Completion rate (0-100)
 */
export const calculateCompletionRate = async (userId) => {
  try {
    const tasks = await getUserTasks(userId)
    
    if (tasks.length === 0) return 0

    const completedTasks = tasks.filter(task => task.status === TASK_STATUS.COMPLETED)
    return Math.round((completedTasks.length / tasks.length) * 100)
  } catch (error) {
    console.error('Error calculating completion rate:', error)
    return 0
  }
}

/**
 * Calculate on-time completion rate for commitment score
 * @param {string} userId - The user ID
 * @returns {Promise<number>} On-time completion rate (0-100)
 */
export const calculateOnTimeRate = async (userId) => {
  try {
    const tasks = await getUserTasks(userId)
    
    const completedTasks = tasks.filter(task => task.status === TASK_STATUS.COMPLETED)
    
    if (completedTasks.length === 0) return 100 // No tasks = perfect score

    const onTimeTasks = completedTasks.filter(task => {
      if (!task.deadline || !task.completedAt) return false
      
      const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline)
      const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt)
      
      return completed <= deadline
    })

    return Math.round((onTimeTasks.length / completedTasks.length) * 100)
  } catch (error) {
    console.error('Error calculating on-time rate:', error)
    return 0
  }
}
