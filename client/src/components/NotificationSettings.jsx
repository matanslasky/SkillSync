import { useState, useEffect } from 'react';
import { Bell, Volume2, MessageSquare, CheckSquare, Users, Trophy, AlertCircle } from 'lucide-react';
import { pushNotificationService } from '../services/pushNotificationService';
import { useAuth } from '../contexts/AuthContext';
import { updateUserSettings, getUserSettings } from '../services/settingsService';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  
  const [preferences, setPreferences] = useState({
    messages: true,
    taskAssignments: true,
    taskUpdates: true,
    teamInvites: true,
    joinRequests: true,
    milestones: true,
    projectUpdates: true,
    soundEnabled: true,
  });

  useEffect(() => {
    loadSettings();
    checkBrowserSupport();
  }, [user]);

  const checkBrowserSupport = () => {
    const supported = pushNotificationService.supported;
    setBrowserSupported(supported);
    if (supported) {
      setPushEnabled(pushNotificationService.permission === 'granted');
    }
  };

  const loadSettings = async () => {
    if (!user?.uid) return;
    
    try {
      const settings = await getUserSettings(user.uid);
      if (settings?.notifications) {
        setPreferences(prev => ({ ...prev, ...settings.notifications }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (!browserSupported) {
      alert('Push notifications are not supported in your browser');
      return;
    }

    const permission = await pushNotificationService.requestPermission();
    setPushEnabled(permission === 'granted');
    
    if (permission === 'granted') {
      // Show test notification
      await pushNotificationService.testNotification();
    }
  };

  const handleToggle = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    
    setPreferences(newPreferences);
    await saveSettings(newPreferences);
  };

  const saveSettings = async (newPreferences) => {
    if (!user?.uid) return;
    
    setSaving(true);
    try {
      await updateUserSettings(user.uid, {
        notifications: newPreferences,
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: 'messages',
      icon: MessageSquare,
      label: 'Messages',
      description: 'New messages in project chats',
    },
    {
      key: 'taskAssignments',
      icon: CheckSquare,
      label: 'Task Assignments',
      description: 'When you are assigned to a task',
    },
    {
      key: 'taskUpdates',
      icon: AlertCircle,
      label: 'Task Updates',
      description: 'Status changes on tasks you\'re involved in',
    },
    {
      key: 'teamInvites',
      icon: Users,
      label: 'Team Invitations',
      description: 'Invitations to join teams',
    },
    {
      key: 'joinRequests',
      icon: Users,
      label: 'Join Requests',
      description: 'New requests to join your projects (admins only)',
    },
    {
      key: 'milestones',
      icon: Trophy,
      label: 'Milestones',
      description: 'Milestone completions and achievements',
    },
    {
      key: 'projectUpdates',
      icon: Bell,
      label: 'Project Updates',
      description: 'Important project changes and announcements',
    },
    {
      key: 'soundEnabled',
      icon: Volume2,
      label: 'Sound',
      description: 'Play sound for notifications',
    },
  ];

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-purple-500" />
        <div>
          <h2 className="text-xl font-bold text-white">Notification Settings</h2>
          <p className="text-sm text-gray-400">Manage how you receive notifications</p>
        </div>
      </div>

      {/* Browser Push Notifications */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Browser Push Notifications
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {!browserSupported && 'Your browser does not support push notifications'}
              {browserSupported && !pushEnabled && 'Receive notifications even when SkillSync is not open'}
              {browserSupported && pushEnabled && 'Push notifications are enabled ✓'}
            </p>
          </div>
          
          {browserSupported && (
            <button
              onClick={handleEnablePush}
              disabled={pushEnabled}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pushEnabled
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {pushEnabled ? 'Enabled' : 'Enable'}
            </button>
          )}
        </div>

        {!browserSupported && (
          <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-400">
              ℹ️ Try using Chrome, Firefox, or Edge for push notification support
            </p>
          </div>
        )}
      </div>

      {/* Notification Type Toggles */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Types</h3>
        
        {notificationTypes.map(({ key, icon: Icon, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-medium">{label}</h4>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle(key)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                preferences[key] ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Save Status */}
      {saving && (
        <div className="mt-4 text-center text-sm text-gray-400">
          Saving...
        </div>
      )}

      {/* Test Notification Button */}
      {pushEnabled && (
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
          <button
            onClick={() => pushNotificationService.testNotification()}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Send Test Notification
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
