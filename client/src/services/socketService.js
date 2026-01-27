import { io } from 'socket.io-client'
import logger from '../utils/logger'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  /**
   * Initialize socket connection
   * @param {string} userId - The current user's ID
   */
  connect(userId) {
    if (this.socket?.connected) {
      logger.info('Socket already connected')
      return
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          userId
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        logger.info('Socket connected', { socketId: this.socket.id, userId })
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        logger.warn('Socket disconnected', { reason, userId })
      })

      this.socket.on('connect_error', (error) => {
        logger.error('Socket connection error', error, { userId })
      })

      this.socket.on('reconnect', (attemptNumber) => {
        logger.info('Socket reconnected', { attemptNumber, userId })
      })

    } catch (error) {
      logger.error('Failed to initialize socket', error, { userId })
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.listeners.clear()
      logger.info('Socket disconnected manually')
    }
  }

  /**
   * Join a project room for real-time updates
   * @param {string} projectId - The project ID
   */
  joinProject(projectId) {
    if (!this.socket?.connected) {
      logger.warn('Cannot join project - socket not connected', { projectId })
      return
    }

    this.socket.emit('join-project', projectId)
    logger.info('Joined project room', { projectId })
  }

  /**
   * Leave a project room
   * @param {string} projectId - The project ID
   */
  leaveProject(projectId) {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('leave-project', projectId)
    logger.info('Left project room', { projectId })
  }

  /**
   * Send a message in a project chat
   * @param {string} projectId - The project ID
   * @param {Object} message - The message object
   */
  sendMessage(projectId, message) {
    if (!this.socket?.connected) {
      logger.error('Cannot send message - socket not connected', null, { projectId })
      throw new Error('Socket not connected')
    }

    this.socket.emit('project-message', { projectId, message })
    logger.logUserAction('message_sent', { projectId, messageLength: message.text?.length })
  }

  /**
   * Listen for project messages
   * @param {Function} callback - Callback function to handle messages
   */
  onMessage(callback) {
    if (!this.socket) return

    this.socket.on('project-message', (data) => {
      callback(data)
    })

    this.listeners.set('project-message', callback)
  }

  /**
   * Update task status in real-time
   * @param {string} projectId - The project ID
   * @param {Object} taskUpdate - The task update data
   */
  updateTask(projectId, taskUpdate) {
    if (!this.socket?.connected) {
      logger.error('Cannot update task - socket not connected', null, { projectId })
      throw new Error('Socket not connected')
    }

    this.socket.emit('task-update', { projectId, taskUpdate })
    logger.logUserAction('task_updated', { projectId, taskId: taskUpdate.id })
  }

  /**
   * Listen for task updates
   * @param {Function} callback - Callback function to handle task updates
   */
  onTaskUpdate(callback) {
    if (!this.socket) return

    this.socket.on('task-update', (data) => {
      callback(data)
    })

    this.listeners.set('task-update', callback)
  }

  /**
   * Broadcast user typing status
   * @param {string} projectId - The project ID
   * @param {boolean} isTyping - Whether user is typing
   */
  setTypingStatus(projectId, isTyping) {
    if (!this.socket?.connected) return

    this.socket.emit('typing', { projectId, isTyping })
  }

  /**
   * Listen for typing indicators
   * @param {Function} callback - Callback function to handle typing status
   */
  onTyping(callback) {
    if (!this.socket) return

    this.socket.on('typing', (data) => {
      callback(data)
    })

    this.listeners.set('typing', callback)
  }

  /**
   * Update user online status
   * @param {string} status - online | away | offline
   */
  setOnlineStatus(status) {
    if (!this.socket?.connected) return

    this.socket.emit('status-change', { status })
    logger.logUserAction('status_changed', { status })
  }

  /**
   * Listen for user online status changes
   * @param {Function} callback - Callback function to handle status changes
   */
  onStatusChange(callback) {
    if (!this.socket) return

    this.socket.on('status-change', (data) => {
      callback(data)
    })

    this.listeners.set('status-change', callback)
  }

  /**
   * Send project update notification
   * @param {string} projectId - The project ID
   * @param {Object} update - The update data
   */
  sendProjectUpdate(projectId, update) {
    if (!this.socket?.connected) return

    this.socket.emit('project-update', { projectId, update })
    logger.logUserAction('project_updated', { projectId, updateType: update.type })
  }

  /**
   * Listen for project updates
   * @param {Function} callback - Callback function to handle updates
   */
  onProjectUpdate(callback) {
    if (!this.socket) return

    this.socket.on('project-update', (data) => {
      callback(data)
    })

    this.listeners.set('project-update', callback)
  }

  /**
   * Remove event listener
   * @param {string} event - The event name
   */
  off(event) {
    if (!this.socket) return

    const callback = this.listeners.get(event)
    if (callback) {
      this.socket.off(event, callback)
      this.listeners.delete(event)
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    if (!this.socket) return

    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback)
    })

    this.listeners.clear()
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected
  }
}

// Export singleton instance
const socketService = new SocketService()
export default socketService
