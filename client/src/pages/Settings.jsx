import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Lock, Bell, Palette, Shield, Github, Linkedin } from 'lucide-react'
import { ROLE_LIST } from '../constants/roles'
import { getUserSettings, saveUserSettings } from '../services/settingsService'
import ImageUpload from '../components/ImageUpload'
import { profileUpdateSchema } from '../utils/validation'
import logger from '../utils/logger'

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
        <header className="mb-8">
          <h2 id="settings-heading" className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </header>

        <div className="flex gap-8">
          {/* Sidebar Tabs */}
          <nav aria-label="Settings navigation" className="w-64 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                    : 'text-gray-400 hover:bg-dark-lighter hover:text-white'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                aria-label={`${tab.label} settings`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

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
  const [fieldErrors, setFieldErrors] = useState({})
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

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
    setFieldErrors({})
    
    // Validate form data
    const profileData = {
      name: formData.name,
      bio: formData.bio,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      github: formData.github,
      linkedin: formData.linkedin,
    }

    try {
      profileUpdateSchema.parse(profileData)
    } catch (validationError) {
      if (validationError.errors) {
        const errors = {}
        validationError.errors.forEach((err) => {
          errors[err.path[0]] = err.message
        })
        setFieldErrors(errors)
        logger.warn('Profile validation failed', { errors })
      }
      setSaving(false)
      return
    }
    
    try {
      // Upload image first if one was selected
      let photoURL = user?.photoURL
      if (selectedImage) {
        setUploadingImage(true)
        const { uploadProfilePicture } = await import('../services/storageService')
        const { updateProfilePicture } = await import('../services/userService')
        
        const result = await uploadProfilePicture(user.uid, selectedImage)
        photoURL = result.url
        
        // Update photo URL in user profile
        await updateProfilePicture(user.uid, photoURL)
        setUploadingImage(false)
      }
      
      const newSettings = {
        ...settings,
        profile: { ...profileData, role: formData.role, photoURL }
      }
      
      await updateSettings(newSettings)
      
      // Also update the main user profile
      const { updateUserProfile } = await import('../services/settingsService')
      await updateUserProfile(user.uid, { ...profileData, role: formData.role })
      
      logger.info('Profile updated successfully', { userId: user.uid })
      logger.logUserAction('profile_updated', { role: formData.role })
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
      setSelectedImage(null)
    } catch (error) {
      logger.error('Error updating profile', error, { userId: user.uid })
      setSaveMessage('Failed to save profile. Please try again.')
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-6">Profile Information</h3>
      
      {saveMessage && (
        <div role="alert" aria-live="polite" className={`mb-4 p-3 rounded-lg text-sm ${
          saveMessage.includes('success') 
            ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green' 
            : 'bg-neon-pink/10 border border-neon-pink/30 text-neon-pink'
        }`}>
          {saveMessage}
        </div>
      )}
      
      {/* Avatar Upload */}
      <div className="mb-8">
        <ImageUpload 
          currentImage={user?.photoURL}
          onImageSelect={(file) => setSelectedImage(file)}
          onImageRemove={() => setSelectedImage(null)}
          label="Profile Picture"
        />
        {uploadingImage && (
          <p className="text-sm text-neon-blue mt-2">Uploading image...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} aria-label="Profile settings form" className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                fieldErrors.name ? 'border-neon-pink' : 'border-gray-800'
              }`}
              aria-invalid={fieldErrors.name ? 'true' : 'false'}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="profile-role" className="block text-sm font-medium text-gray-400 mb-2">
              Role
            </label>
            <select
              id="profile-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
              aria-label="Select your role"
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
          <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-400 mb-2">
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
              fieldErrors.bio ? 'border-neon-pink' : 'border-gray-800'
            }`}
            placeholder="Tell us about yourself..."
            maxLength={500}
            aria-invalid={fieldErrors.bio ? 'true' : 'false'}
            aria-describedby={fieldErrors.bio ? 'bio-error' : 'bio-hint'}
          />
          <p id="bio-hint" className="mt-1 text-xs text-gray-500">{formData.bio.length}/500 characters</p>
          {fieldErrors.bio && (
            <p id="bio-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.bio}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-skills" className="block text-sm font-medium text-gray-400 mb-2">
            Skills (comma-separated)
          </label>
          <input
            id="profile-skills"
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
              fieldErrors.skills ? 'border-neon-pink' : 'border-gray-800'
            }`}
            placeholder="React, Node.js, UI/UX..."
            aria-label="Your skills separated by commas"
            aria-invalid={fieldErrors.skills ? 'true' : 'false'}
            aria-describedby={fieldErrors.skills ? 'skills-error' : 'skills-hint'}
          />
          <p id="skills-hint" className="mt-1 text-xs text-gray-500">Separate skills with commas (max 20)</p>
          {fieldErrors.skills && (
            <p id="skills-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.skills}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="profile-github" className="block text-sm font-medium text-gray-400 mb-2">
              <Github size={16} className="inline mr-2" aria-hidden="true" />
              GitHub Username
            </label>
            <input
              id="profile-github"
              type="text"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                fieldErrors.github ? 'border-neon-pink' : 'border-gray-800'
              }`}
              placeholder="username"
              aria-label="GitHub username"
              aria-invalid={fieldErrors.github ? 'true' : 'false'}
              aria-describedby={fieldErrors.github ? 'github-error' : undefined}
            />
            {fieldErrors.github && (
              <p id="github-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.github}</p>
            )}
          </div>

          <div>
            <label htmlFor="profile-linkedin" className="block text-sm font-medium text-gray-400 mb-2">
              <Linkedin size={16} className="inline mr-2" aria-hidden="true" />
              LinkedIn URL
            </label>
            <input
              id="profile-linkedin"
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                fieldErrors.linkedin ? 'border-neon-pink' : 'border-gray-800'
              }`}
              placeholder="linkedin.com/in/..."
              aria-label="LinkedIn profile URL"
              aria-invalid={fieldErrors.linkedin ? 'true' : 'false'}
              aria-describedby={fieldErrors.linkedin ? 'linkedin-error' : undefined}
            />
            {fieldErrors.linkedin && (
              <p id="linkedin-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.linkedin}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50"
            aria-label={saving ? 'Saving changes, please wait' : 'Save profile changes'}
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
