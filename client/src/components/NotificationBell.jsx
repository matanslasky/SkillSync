import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  subscribeToNotifications, 
  markAsRead, 
  markAllAsRead,
  getUnreadCount 
} from '../services/notificationService'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [indexError, setIndexError] = useState(false)

  useEffect(() => {
    if (!user?.uid) return

    let unsubscribe = null

    // Subscribe to real-time notifications
    try {
      unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
        setNotifications(newNotifications)
        const unread = newNotifications.filter(n => !n.read).length
        setUnreadCount(unread)
        setIndexError(false)
      })
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error)
      setIndexError(true)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user?.uid])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      await markAllAsRead(user.uid)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      project_invite: '📨',
      project_update: '🔔',
      message: '💬',
      task_assigned: '✅',
      task_completed: '🎉',
      milestone_reached: '🏆',
      team_join: '👋',
      team_leave: '👋',
      comment: '💭',
      mention: '@',
      system: 'ℹ️'
    }
    return iconMap[type] || '🔔'
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-dark-lighter transition-colors"
      >
        <Bell size={20} className="text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-pink rounded-full flex items-center justify-center text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-dark-light border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-500">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-xs text-neon-blue hover:text-neon-green transition-colors disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-dark-lighter rounded transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-2">We'll notify you when something happens</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      getIcon={getNotificationIcon}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const NotificationItem = ({ notification, onMarkAsRead, getIcon }) => {
  const isUnread = !notification.read

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div
      className={`p-4 hover:bg-dark-lighter transition-colors cursor-pointer ${
        isUnread ? 'bg-neon-green/5 border-l-2 border-neon-green' : ''
      }`}
      onClick={() => isUnread && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-white">
              {notification.title}
            </h4>
            {isUnread && (
              <div className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotificationBell
