import { Inbox, FolderOpen, Users, CheckCircle, MessageCircle, Bell, Rocket } from 'lucide-react'

export const EmptyProjects = ({ onCreateProject }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <FolderOpen className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">No projects yet</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Start your journey by creating your first project or explore the marketplace to join existing ones.
    </p>
    {onCreateProject && (
      <button
        onClick={onCreateProject}
        className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
      >
        Create Your First Project
      </button>
    )}
  </div>
)

export const EmptyTasks = ({ onCreateTask }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">No tasks yet</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Get started by creating your first task. Break down your project into manageable pieces.
    </p>
    {onCreateTask && (
      <button
        onClick={onCreateTask}
        className="px-6 py-3 bg-neon-blue text-dark font-semibold rounded-lg hover:shadow-neon-blue transition-all"
      >
        Create First Task
      </button>
    )}
  </div>
)

export const EmptyTeam = ({ onInviteMembers }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Users className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">No team members yet</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Build your dream team! Invite talented people to collaborate on your projects.
    </p>
    {onInviteMembers && (
      <button
        onClick={onInviteMembers}
        className="px-6 py-3 bg-neon-purple text-white font-semibold rounded-lg hover:shadow-neon-purple transition-all"
      >
        Invite Team Members
      </button>
    )}
  </div>
)

export const EmptyMessages = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <MessageCircle className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">No messages</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      Start a conversation with your teammates to collaborate better.
    </p>
  </div>
)

export const EmptyNotifications = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Bell className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">All caught up!</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      You don't have any notifications right now. We'll let you know when something important happens.
    </p>
  </div>
)

export const EmptySearch = ({ searchTerm }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Inbox className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">No results found</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      {searchTerm ? (
        <>No matches for "<span className="text-white">{searchTerm}</span>". Try adjusting your search.</>
      ) : (
        <>Try adjusting your filters or search criteria.</>
      )}
    </p>
  </div>
)

export const EmptyState = ({ icon: Icon = Rocket, title, description, action, actionLabel }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="text-gray-600" size={40} />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
    {action && actionLabel && (
      <button
        onClick={action}
        className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
)
