import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, MessageSquare, Users, Trophy, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socketService';

/**
 * ActivityFeed - Real-time activity feed for dashboard
 * Shows recent actions across all user's projects
 */
const ActivityFeed = ({ projectIds = [], limit = 10 }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
    
    // Subscribe to real-time updates
    const unsubscribes = [];
    
    projectIds.forEach(projectId => {
      socketService.joinProject(projectId);
      
      // Listen for task updates
      const taskUnsub = socketService.onTaskUpdate((data) => {
        if (data.projectId && projectIds.includes(data.projectId)) {
          addActivity({
            type: 'task_update',
            icon: CheckCircle2,
            color: 'text-blue-400',
            message: `${data.updatedBy} moved "${data.task?.title || 'a task'}" to ${data.newStatus}`,
            projectId: data.projectId,
            timestamp: new Date(),
          });
        }
      });
      
      // Listen for messages
      const messageUnsub = socketService.onMessage((data) => {
        if (data.projectId && projectIds.includes(data.projectId)) {
          addActivity({
            type: 'message',
            icon: MessageSquare,
            color: 'text-purple-400',
            message: `${data.senderName} sent a message`,
            projectId: data.projectId,
            timestamp: new Date(),
          });
        }
      });
      
      unsubscribes.push(taskUnsub, messageUnsub);
    });
    
    return () => {
      unsubscribes.forEach(unsub => unsub());
      projectIds.forEach(projectId => socketService.leaveProject(projectId));
    };
  }, [projectIds.join(',')]);

  const loadRecentActivity = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from Firestore
      // For now, showing placeholder activities
      setActivities([
        {
          type: 'task_complete',
          icon: CheckCircle2,
          color: 'text-green-400',
          message: 'You completed "Implement user authentication"',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
        },
        {
          type: 'team_join',
          icon: Users,
          color: 'text-blue-400',
          message: 'Alex joined the project team',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        },
        {
          type: 'milestone',
          icon: Trophy,
          color: 'text-yellow-400',
          message: 'Project reached 50% completion',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
      ]);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (activity) => {
    setActivities(prev => [activity, ...prev].slice(0, limit));
  };

  const getActivityIcon = (activity) => {
    const Icon = activity.icon || Activity;
    return <Icon className={`w-5 h-5 ${activity.color}`} />;
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity from your projects will appear here</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                {getActivityIcon(activity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
