import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Lock, Bell, Palette, Shield, Github, Linkedin } from 'lucide-react'
import { ROLE_LIST } from '../constants/roles'

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'account', label: 'Account', icon: <Mail size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> },
  ]

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Tabs */}
          <div className="w-64 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                    : 'text-gray-400 hover:bg-dark-lighter hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'account' && <AccountSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
          </div>
        </div>
      </main>
    </div>
  )
}

const ProfileSettings = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'Developer',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    github: '',
    linkedin: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Update user profile in Firebase
    console.log('Updating profile:', formData)
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Profile Information</h3>
      
      {/* Avatar */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-3xl font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <button className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all text-sm font-semibold mb-2">
            Change Avatar
          </button>
          <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            >
              {ROLE_LIST.map(role => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            placeholder="React, Node.js, UI/UX..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Github size={16} className="inline mr-2" />
              GitHub Username
            </label>
            <input
              type="text"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Linkedin size={16} className="inline mr-2" />
              LinkedIn URL
            </label>
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
              placeholder="linkedin.com/in/..."
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-dark-lighter border border-gray-800 text-white font-semibold rounded-lg hover:bg-dark-light transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const AccountSettings = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-6">Account Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">Contact support to change your email</p>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-6">Change Password</h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
          >
            Update Password
          </button>
        </form>
      </div>

      <div className="glass-effect rounded-xl p-6 border border-neon-pink/20">
        <h3 className="text-xl font-bold mb-4 text-neon-pink">Danger Zone</h3>
        <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back.</p>
        <button className="px-6 py-3 bg-neon-pink/10 text-neon-pink border border-neon-pink/30 font-semibold rounded-lg hover:bg-neon-pink/20 transition-all">
          Delete Account
        </button>
      </div>
    </div>
  )
}

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    teamMessages: true,
    weeklyDigest: false,
    marketingEmails: false,
  })

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
      
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-800">
            <div>
              <p className="font-medium text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </p>
              <p className="text-sm text-gray-500">
                Receive notifications for this activity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => setNotifications({ ...notifications, [key]: !value })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

const AppearanceSettings = () => {
  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Appearance</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button className="p-4 bg-neon-green/10 border-2 border-neon-green rounded-lg">
              <div className="w-full h-16 bg-dark rounded mb-2"></div>
              <p className="text-sm font-medium text-neon-green">Dark (Active)</p>
            </button>
            <button className="p-4 bg-dark-lighter border-2 border-gray-800 rounded-lg opacity-50 cursor-not-allowed">
              <div className="w-full h-16 bg-white rounded mb-2"></div>
              <p className="text-sm font-medium text-gray-500">Light (Soon)</p>
            </button>
            <button className="p-4 bg-dark-lighter border-2 border-gray-800 rounded-lg opacity-50 cursor-not-allowed">
              <div className="w-full h-16 bg-gradient-to-br from-dark to-gray-700 rounded mb-2"></div>
              <p className="text-sm font-medium text-gray-500">Auto (Soon)</p>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Accent Color
          </label>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-full bg-neon-green border-2 border-white"></button>
            <button className="w-12 h-12 rounded-full bg-neon-blue border-2 border-transparent opacity-50"></button>
            <button className="w-12 h-12 rounded-full bg-neon-pink border-2 border-transparent opacity-50"></button>
            <button className="w-12 h-12 rounded-full bg-neon-purple border-2 border-transparent opacity-50"></button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PrivacySettings = () => {
  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Privacy & Security</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="font-medium text-white">Profile Visibility</p>
            <p className="text-sm text-gray-500">Who can see your profile</p>
          </div>
          <select className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none">
            <option>Everyone</option>
            <option>Team Members Only</option>
            <option>Private</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="font-medium text-white">Show Online Status</p>
            <p className="text-sm text-gray-500">Let others see when you're online</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-white">Show Commitment Score</p>
            <p className="text-sm text-gray-500">Display your score on your profile</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
          </label>
        </div>
      </div>
    </div>
  )
}

export default Settings
