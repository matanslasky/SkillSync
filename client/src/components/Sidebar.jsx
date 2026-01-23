import { 
  Home, 
  Briefcase, 
  MessageSquare, 
  Settings as SettingsIcon, 
  Users, 
  ClipboardList,
  LogOut,
  Info,
  Shield
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/marketplace', icon: Briefcase, label: 'Projects' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/assignments', icon: ClipboardList, label: 'Assignments' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
    { path: '/about', icon: Info, label: 'About' },
  ]

  // Add admin dashboard for admin users
  const adminNavItems = user?.isAdmin 
    ? [{ path: '/admin', icon: Shield, label: 'Admin', isAdmin: true }]
    : []

  const allNavItems = [...navItems, ...adminNavItems]

  return (
    <aside className="w-64 h-screen bg-dark-light border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
        <h1 className="text-2xl font-bold neon-text-green">
          Skill<span className="text-neon-blue">Sync</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Build. Collaborate. Ship.</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? item.isAdmin
                    ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30'
                    : 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                  : 'text-gray-400 hover:bg-dark-lighter hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? (item.isAdmin ? 'text-neon-pink' : 'text-neon-green') : ''} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-lighter hover:text-neon-pink transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
