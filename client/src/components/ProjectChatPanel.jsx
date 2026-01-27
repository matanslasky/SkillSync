import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, Trash2, MoreVertical } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  sendProjectMessage, 
  subscribeToProjectMessages,
  markProjectMessagesAsRead,
  deleteMessage
} from '../services/messageService'
import socketService from '../services/socketService'
import { formatDistanceToNow } from 'date-fns'

const ProjectChatPanel = ({ projectId, projectName }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to messages
  useEffect(() => {
    if (!projectId) return

    const unsubscribe = subscribeToProjectMessages(projectId, (newMessages) => {
      setMessages(newMessages)
    })

    // Mark messages as read when component mounts
    markProjectMessagesAsRead(projectId, user.uid)

    return () => unsubscribe()
  }, [projectId, user.uid])

  // Join project room for real-time updates
  useEffect(() => {
    if (!projectId) return

    socketService.joinProject(projectId)

    return () => {
      socketService.leaveProject(projectId)
    }
  }, [projectId])

  // Listen for typing indicators
  useEffect(() => {
    if (!projectId) return

    socketService.onTyping(({ userId, userName, isTyping: typing }) => {
      if (userId === user.uid) return

      setTypingUsers(prev => {
        const newSet = new Set(prev)
        if (typing) {
          newSet.add(userName)
        } else {
          newSet.delete(userName)
        }
        return newSet
      })
    })

    return () => {
      socketService.off('typing')
    }
  }, [projectId, user.uid])

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socketService.setTypingStatus(projectId, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socketService.setTypingStatus(projectId, false)
    }, 2000)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageText.trim() || sending) return

    setSending(true)
    const text = messageText.trim()
    setMessageText('')

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      socketService.setTypingStatus(projectId, false)
    }

    try {
      await sendProjectMessage(projectId, user.uid, user.name, text)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return

    try {
      await deleteMessage(messageId, user.uid)
    } catch (error) {
      console.error('Error deleting message:', error)
      alert(error.message || 'Failed to delete message')
    }
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-dark-lighter">
        <h3 className="font-bold text-lg">{projectName} Chat</h3>
        <p className="text-xs text-gray-500">{messages.length} messages</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  message.userId === user.uid
                    ? 'bg-neon-blue text-white'
                    : 'bg-dark-lighter text-gray-300'
                } rounded-lg p-3 group relative`}
              >
                {message.userId !== user.uid && (
                  <p className="text-xs font-semibold mb-1 text-neon-green">
                    {message.userName}
                  </p>
                )}
                
                <p className={message.deleted ? 'italic text-gray-500' : ''}>
                  {message.text}
                </p>
                
                <div className="flex items-center justify-between mt-2 gap-3">
                  <span className="text-xs opacity-70">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  
                  {message.userId === user.uid && !message.deleted && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-dark-lighter rounded-lg p-3 text-sm text-gray-400 italic">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-dark-lighter">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
            title="Attach file (coming soon)"
            disabled
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            className="flex-1 bg-dark border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
            disabled={sending}
          />

          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
            title="Emoji (coming soon)"
            disabled
          >
            <Smile size={20} />
          </button>

          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:shadow-neon-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectChatPanel
