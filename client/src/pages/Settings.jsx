import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Lock, Bell, Palette, Shield, Github, Linkedin } from 'lucide-react'
import { ROLE_LIST } from '../constants/roles'
import { getUserSettings, saveUserSettings } from '../services/settingsService'

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.uid) {
        try {
          const userSettings = await getUserSettings(user.uid)
          setSettings(userSettings)
        } catch (error) {
          console.error('Failed to load settings:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadSettings()
  }, [user?.uid])

  const updateSettings = async (newSettings) => {
    setSettings(newSettings)
    if (user?.uid) {
      try {
        await saveUserSettings(user.uid, newSettings)
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading settings...</div>
        </main>
      </div>
    )
  }

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
            {activeTab === 'profile' && <ProfileSettings user={user} settings={settings} updateSettings={updateSettings} />}
            {activeTab === 'account' && <AccountSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSettings={updateSettings} />}
            {activeTab === 'appearance' && <AppearanceSettings settings={settings} updateSettings={updateSettings} />}
            {activeTab === 'privacy' && <PrivacySettings settings={settings} updateSettings={updateSettings} />}
          </div>
        </div>
      </main>
    </div>
  )
}

const ProfileSettings = ({ user, settings, updateSettings }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'Developer',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    github: '',
    linkedin: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Load profile data from settings when available
  useEffect(() => {
    if (settings?.profile) {
      setFormData({
        name: settings.profile.name || user?.name || '',
        role: settings.profile.role || user?.role || 'Developer',
        bio: settings.profile.bio || user?.bio || '',
        skills: Array.isArray(settings.profile.skills) 
          ? settings.profile.skills.join(', ') 
          : settings.profile.skills || '',
        github: settings.profile.github || '',
        linkedin: settings.profile.linkedin || '',
      })
    }
  }, [settings, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMessage('')
    
    try {
      const profileData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      }
      
      const newSettings = {
        ...settings,
        profile: profileData
      }
      
      await updateSettings(newSettings)
      
      // Also update the main user profile
      const { updateUserProfile } = await import('../services/settingsService')
      await updateUserProfile(user.uid, profileData)
      
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveMessage('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Profile Information</h3>
      
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          saveMessage.includes('success') 
            ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green' 
            : 'bg-neon-pink/10 border border-neon-pink/30 text-neon-pink'
        }`}>
          {saveMessage}
        </div>
      )}
      
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
            disabled={saving}
            className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              // Reset to loaded settings
              if (settings?.profile) {
                setFormData({
                  name: settings.profile.name || user?.name || '',
                  role: settings.profile.role || user?.role || 'Developer',
                  bio: settings.profile.bio || user?.bio || '',
                  skills: Array.isArray(settings.profile.skills) 
                    ? settings.profile.skills.join(', ') 
                    : settings.profile.skills || '',
                  github: settings.profile.github || '',
                  linkedin: settings.profile.linkedin || '',
                })
              }
            }}
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

const NotificationSettings = ({ settings, updateSettings }) => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    teamMessages: true,
    weeklyDigest: false,
    marketingEmails: false,
  })

  // Load notification settings
  useEffect(() => {
    if (settings?.notifications) {
      setNotifications(settings.notifications)
    }
  }, [settings])

  const handleToggle = async (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] }
    setNotifications(newNotifications)
    
    const newSettings = {
      ...settings,
      notifications: newNotifications
    }
    await updateSettings(newSettings)
  }

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
                onChange={() => handleToggle(key)}
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

const AppearanceSettings = ({ settings, updateSettings }) => {
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    accentColor: 'green'
  })

  // Load appearance settings
  useEffect(() => {
    if (settings?.appearance) {
      setAppearance(settings.appearance)
    }
  }, [settings])

  const handleThemeChange = async (theme) => {
    const newAppearance = { ...appearance, theme }
    setAppearance(newAppearance)
    
    const newSettings = {
      ...settings,
      appearance: newAppearance
    }
    await updateSettings(newSettings)
  }

  const handleAccentChange = async (color) => {
    const newAppearance = { ...appearance, accentColor: color }
    setAppearance(newAppearance)
    
    const newSettings = {
      ...settings,
      appearance: newAppearance
    }
    await updateSettings(newSettings)
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Appearance</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`p-4 border-2 rounded-lg ${
                appearance.theme === 'dark' 
                  ? 'bg-neon-green/10 border-neon-green' 
                  : 'bg-dark-lighter border-gray-800 opacity-50'
              }`}
            >
              <div className="w-full h-16 bg-dark rounded mb-2"></div>
              <p className={`text-sm font-medium ${
                appearance.theme === 'dark' ? 'text-neon-green' : 'text-gray-500'
              }`}>
                {appearance.theme === 'dark' ? 'Dark (Active)' : 'Dark'}
              </p>
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
            <button 
              onClick={() => handleAccentChange('green')}
              className={`w-12 h-12 rounded-full bg-neon-green border-2 ${
                appearance.accentColor === 'green' ? 'border-white' : 'border-transparent opacity-50'
              }`}
            ></button>
            <button 
              onClick={() => handleAccentChange('blue')}
              className={`w-12 h-12 rounded-full bg-neon-blue border-2 ${
                appearance.accentColor === 'blue' ? 'border-white' : 'border-transparent opacity-50'
              }`}
            ></button>
            <button 
              onClick={() => handleAccentChange('pink')}
              className={`w-12 h-12 rounded-full bg-neon-pink border-2 ${
                appearance.accentColor === 'pink' ? 'border-white' : 'border-transparent opacity-50'
              }`}
            ></button>
            <button 
              onClick={() => handleAccentChange('purple')}
              className={`w-12 h-12 rounded-full bg-neon-purple border-2 ${
                appearance.accentColor === 'purple' ? 'border-white' : 'border-transparent opacity-50'
              }`}
            ></button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PrivacySettings = ({ settings, updateSettings }) => {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'everyone',
    showOnlineStatus: true,
    showCommitmentScore: true
  })

  // Load privacy settings
  useEffect(() => {
    if (settings?.privacy) {
      setPrivacy(settings.privacy)
    }
  }, [settings])

  const handleVisibilityChange = async (value) => {
    const newPrivacy = { ...privacy, profileVisibility: value }
    setPrivacy(newPrivacy)
    
    const newSettings = {
      ...settings,
      privacy: newPrivacy
    }
    await updateSettings(newSettings)
  }

  const handleToggle = async (key) => {
    const newPrivacy = { ...privacy, [key]: !privacy[key] }
    setPrivacy(newPrivacy)
    
    const newSettings = {
      ...settings,
      privacy: newPrivacy
    }
    await updateSettings(newSettings)
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Privacy & Security</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="font-medium text-white">Profile Visibility</p>
            <p className="text-sm text-gray-500">Who can see your profile</p>
          </div>
          <select 
            value={privacy.profileVisibility}
            onChange={(e) => handleVisibilityChange(e.target.value)}
            className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none"
          >
            <option value="everyone">Everyone</option>
            <option value="team">Team Members Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="font-medium text-white">Show Online Status</p>
            <p className="text-sm text-gray-500">Let others see when you're online</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={privacy.showOnlineStatus}
              onChange={() => handleToggle('showOnlineStatus')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-white">Show Commitment Score</p>
            <p className="text-sm text-gray-500">Display your score on your profile</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={privacy.showCommitmentScore}
              onChange={() => handleToggle('showCommitmentScore')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
          </label>
        </div>
      </div>
    </div>
  )
}

export default Settings
