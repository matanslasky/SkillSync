import { 
  Home, 
  Briefcase, 
  MessageSquare, 
  Settings as SettingsIcon, 
  Users, 
  ClipboardList,
  LogOut,
  Info,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

const Sidebar = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-dark-light p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static w-64 h-screen bg-dark-light border-r border-gray-800 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div 
          className="p-6 border-b border-gray-800 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => {
            navigate('/dashboard')
            closeMobileMenu()
          }}
        >
          <h1 className="text-2xl font-bold neon-text-green">
            Skill<span className="text-neon-blue">Sync</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Build. Collaborate. Ship.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {allNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target ${
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
            onClick={() => {
              logout()
              closeMobileMenu()
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-lighter hover:text-neon-pink transition-all duration-200 w-full touch-target"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
