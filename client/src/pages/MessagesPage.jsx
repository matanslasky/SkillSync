import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react'
import { mockUsers } from '../data/mockData'

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(mockUsers[0])
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock conversations
  const conversations = mockUsers.map(user => ({
    user,
    lastMessage: "Hey! How's the project going?",
    timestamp: '2 min ago',
    unread: user.id === 'user2' ? 3 : 0
  }))

  // Mock messages for selected chat
  const messages = [
    {
      id: 1,
      sender: 'other',
      text: 'Hey! Have you seen the latest design mockups?',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Yes! They look amazing. Great work on the color scheme.',
      timestamp: '10:32 AM'
    },
    {
      id: 3,
      sender: 'other',
      text: 'Thanks! I was thinking we could iterate on the dashboard layout. What do you think?',
      timestamp: '10:35 AM'
    },
    {
      id: 4,
      sender: 'me',
      text: 'Absolutely! I have some ideas. Can we schedule a quick call?',
      timestamp: '10:38 AM'
    },
    {
      id: 5,
      sender: 'other',
      text: 'Sure! How about 3 PM today?',
      timestamp: '10:40 AM'
    }
  ]

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageText.trim()) {
      // TODO: Send message via Firebase
      console.log('Sending message:', messageText)
      setMessageText('')
    }
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
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
            {filteredConversations.map(conv => (
              <button
                key={conv.user.id}
                onClick={() => setSelectedChat(conv.user)}
                className={`w-full p-4 flex items-start gap-3 border-b border-gray-800 hover:bg-dark-lighter transition-all ${
                  selectedChat?.id === conv.user.id ? 'bg-dark-lighter border-l-2 border-l-neon-green' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {conv.user.name.charAt(0)}
                  </div>
                  {conv.user.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-dark"></span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-white text-sm">{conv.user.name}</p>
                    <span className="text-xs text-gray-500">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-neon-green text-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
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
                    {selectedChat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedChat.name}</p>
                    <p className="text-xs text-gray-500">{selectedChat.role}</p>
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
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${msg.sender === 'me' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.sender === 'me'
                          ? 'bg-neon-green text-dark'
                          : 'glass-effect border border-gray-800'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
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
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MessagesPage
