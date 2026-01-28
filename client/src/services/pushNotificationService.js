/**
 * Push Notification Service
 * Handles browser push notifications and permission management
 */

class PushNotificationService {
  constructor() {
    this.permission = 'default';
    this.supported = 'Notification' in window;
    this.checkPermission();
  }

  /**
   * Check current notification permission
   */
  checkPermission() {
    if (this.supported) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!this.supported) {
      logger.warn('Push notifications are not supported in this browser');
      return 'unsupported';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      logger.info('Notification permission:', permission);
      return permission;
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  async showNotification(title, options = {}) {
    if (!this.supported) {
      logger.warn('Notifications not supported');
      return null;
    }

    // Request permission if not granted
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        logger.warn('Notification permission denied');
        return null;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      logger.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show notification for a new message
   */
  showMessageNotification(sender, message, projectName) {
    return this.showNotification(`New message from ${sender}`, {
      body: projectName ? `In ${projectName}: ${message}` : message,
      tag: 'message',
      requireInteraction: false,
    });
  }

  /**
   * Show notification for a task assignment
   */
  showTaskNotification(taskTitle, projectName, assignedBy) {
    return this.showNotification('New Task Assignment', {
      body: `${assignedBy} assigned you "${taskTitle}" in ${projectName}`,
      tag: 'task',
      requireInteraction: true,
    });
  }

  /**
   * Show notification for a task status change
   */
  showTaskUpdateNotification(taskTitle, status, updatedBy) {
    return this.showNotification('Task Updated', {
      body: `${updatedBy} moved "${taskTitle}" to ${status}`,
      tag: 'task-update',
      requireInteraction: false,
    });
  }

  /**
   * Show notification for a team invitation
   */
  showInviteNotification(teamName, invitedBy) {
    return this.showNotification('Team Invitation', {
      body: `${invitedBy} invited you to join ${teamName}`,
      tag: 'invite',
      requireInteraction: true,
    });
  }

  /**
   * Show notification for a join request
   */
  showJoinRequestNotification(userName, projectName) {
    return this.showNotification('New Join Request', {
      body: `${userName} wants to join ${projectName}`,
      tag: 'join-request',
      requireInteraction: true,
    });
  }

  /**
   * Show notification for a milestone completion
   */
  showMilestoneNotification(milestoneName, projectName) {
    return this.showNotification('Milestone Completed! 🎉', {
      body: `${milestoneName} in ${projectName}`,
      tag: 'milestone',
      requireInteraction: false,
    });
  }

  /**
   * Show notification for a project update
   */
  showProjectUpdateNotification(projectName, updateType, updatedBy) {
    return this.showNotification('Project Updated', {
      body: `${updatedBy} updated ${updateType} in ${projectName}`,
      tag: 'project-update',
      requireInteraction: false,
    });
  }

  /**
   * Check if user has notification preference enabled for a type
   */
  shouldShowNotification(notificationType, userPreferences) {
    if (!userPreferences) return true;
    
    const prefMap = {
      message: 'messages',
      task: 'taskAssignments',
      'task-update': 'taskUpdates',
      invite: 'teamInvites',
      'join-request': 'joinRequests',
      milestone: 'milestones',
      'project-update': 'projectUpdates',
    };

    const prefKey = prefMap[notificationType];
    return prefKey ? userPreferences[prefKey] !== false : true;
  }

  /**
   * Show notification based on type and preferences
   */
  async showNotificationIfEnabled(type, data, userPreferences) {
    if (!this.shouldShowNotification(type, userPreferences)) {
      logger.debug('Notification disabled by user preferences:', type);
      return null;
    }

    switch (type) {
      case 'message':
        return this.showMessageNotification(
          data.sender,
          data.message,
          data.projectName
        );
      case 'task':
        return this.showTaskNotification(
          data.taskTitle,
          data.projectName,
          data.assignedBy
        );
      case 'task-update':
        return this.showTaskUpdateNotification(
          data.taskTitle,
          data.status,
          data.updatedBy
        );
      case 'invite':
        return this.showInviteNotification(data.teamName, data.invitedBy);
      case 'join-request':
        return this.showJoinRequestNotification(
          data.userName,
          data.projectName
        );
      case 'milestone':
        return this.showMilestoneNotification(
          data.milestoneName,
          data.projectName
        );
      case 'project-update':
        return this.showProjectUpdateNotification(
          data.projectName,
          data.updateType,
          data.updatedBy
        );
      default:
        logger.warn('Unknown notification type:', type);
        return null;
    }
  }

  /**
   * Test notification (for settings page)
   */
  async testNotification() {
    return this.showNotification('Test Notification', {
      body: 'Push notifications are working! 🎉',
      tag: 'test',
    });
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
