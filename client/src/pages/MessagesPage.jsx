import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Plus, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage, 
  getOrCreateConversation,
  getUserInfo,
  markMessagesAsRead 
} from '../services/messageService'
import { mockUsers } from '../data/mockData'

const MessagesPage = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [selectedChat, setSelectedChat] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [conversationUsers, setConversationUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to user's conversations
  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = subscribeToConversations(user.uid, async (convos) => {
      setConversations(convos)
      
      // Fetch user info for all conversation participants
      const userIds = new Set()
      convos.forEach(convo => {
        convo.participants.forEach(id => {
          if (id !== user.uid) userIds.add(id)
        })
      })
      
      const usersData = {}
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          const userInfo = await getUserInfo(userId)
          if (userInfo) {
            usersData[userId] = userInfo
          }
        })
      )
      
      setConversationUsers(usersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Subscribe to messages in selected conversation
  useEffect(() => {
    if (!selectedChat?.conversationId) {
      setMessages([])
      return
    }

    const unsubscribe = subscribeToMessages(selectedChat.conversationId, (msgs) => {
      setMessages(msgs)
      
      // Mark messages as read
      if (user?.uid) {
        markMessagesAsRead(selectedChat.conversationId, user.uid)
      }
    })

    return () => unsubscribe()
  }, [selectedChat, user])

  // Handle starting a new conversation with a team member
  const handleStartConversation = async (otherUser) => {
    if (!user?.uid) return
    
    const conversationId = await getOrCreateConversation(user.uid, otherUser.id)
    setSelectedChat({
      conversationId,
      otherUser
    })
  }

  // Auto-open chat if navigated from Team page with specific user
  useEffect(() => {
    const openChatWithUser = location.state?.openChatWithUser
    if (openChatWithUser && user?.uid && !loading) {
      const startChat = async () => {
        if (!user?.uid) return
        
        const conversationId = await getOrCreateConversation(user.uid, openChatWithUser.id)
        setSelectedChat({
          conversationId,
          otherUser: openChatWithUser
        })
      }
      startChat()
    }
  }, [location.state?.openChatWithUser, user?.uid, loading])

  const filteredConversations = conversations.filter(conv => {
    const otherUserId = conv.participants.find(id => id !== user?.uid)
    const otherUser = conversationUsers[otherUserId]
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Available team members to start new conversations
  const availableUsers = mockUsers.filter(u => u.id !== user?.uid)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedChat?.conversationId || !user?.uid) return
    
    try {
      await sendMessage(selectedChat.conversationId, user.uid, messageText.trim())
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 bg-neon-green/10 text-neon-green rounded-lg hover:bg-neon-green/20 transition-all"
                title="New conversation"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-neon-green focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500 text-sm">Loading conversations...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const otherUserId = conv.participants.find(id => id !== user?.uid)
                const otherUser = conversationUsers[otherUserId]
                
                if (!otherUser) return null
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleStartConversation(otherUser)}
                    className={`w-full p-4 flex items-start gap-3 border-b border-gray-800 hover:bg-dark-lighter transition-all ${
                      selectedChat?.conversationId === conv.id ? 'bg-dark-lighter border-l-2 border-l-neon-green' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {otherUser.name?.charAt(0) || '?'}
                      </div>
                      {otherUser.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-dark"></span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-white text-sm">{otherUser.name || 'Unknown'}</p>
                        <span className="text-xs text-gray-500">{formatRelativeTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="p-4">
                <p className="text-gray-500 text-sm text-center mb-4">No conversations yet</p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 text-center mb-2">Start chatting with:</p>
                  {availableUsers.slice(0, 5).map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleStartConversation(u)}
                      className="w-full p-3 flex items-center gap-3 bg-dark-lighter rounded-lg hover:bg-dark-light transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-sm font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-sm font-bold">
                    {selectedChat.otherUser.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedChat.otherUser.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{selectedChat.otherUser.role || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-dark-lighter transition-all">
                    <Phone size={20} className="text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-dark-lighter transition-all">
                    <Video size={20} className="text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-dark-lighter transition-all">
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      No messages yet.<br />
                      <span className="text-sm">Say hello to start the conversation!</span>
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md ${msg.senderId === user?.uid ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.senderId === user?.uid
                            ? 'bg-neon-green text-dark'
                            : 'glass-effect border border-gray-800'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${msg.senderId === user?.uid ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-dark-lighter transition-all"
                  >
                    <Paperclip size={20} className="text-gray-400" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-dark-lighter transition-all"
                  >
                    <Smile size={20} className="text-gray-400" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-3 bg-neon-green text-dark rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-blue to-neon-green opacity-20 flex items-center justify-center">
                  <Search size={32} className="text-white" />
                </div>
                <p className="text-gray-500 mb-2">Select a conversation to start messaging</p>
                <p className="text-sm text-gray-600">or start a new chat from the sidebar</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-light rounded-xl border border-gray-800 w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold">New Conversation</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 hover:bg-dark-lighter rounded-lg transition-all"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-neon-green focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Available Users List */}
            <div className="flex-1 overflow-y-auto p-4">
              {availableUsers.length > 0 ? (
                <div className="space-y-2">
                  {availableUsers.map(availableUser => (
                    <button
                      key={availableUser.id}
                      onClick={() => {
                        handleStartConversation(availableUser)
                        setShowNewChatModal(false)
                        setSearchTerm('')
                      }}
                      className="w-full p-3 flex items-center gap-3 bg-dark hover:bg-dark-lighter rounded-lg transition-all border border-gray-800 hover:border-neon-green/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {availableUser.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{availableUser.name}</p>
                        <p className="text-xs text-gray-500">{availableUser.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagesPage
