import { useState, useEffect } from 'react';
import { Circle } from 'lucide-react';
import socketService from '../services/socketService';

/**
 * OnlineStatusIndicator - Shows user online/offline status
 * @param {string} userId - User ID to track
 * @param {boolean} showLabel - Whether to show "Online" label
 * @param {string} size - Size: 'sm', 'md', 'lg'
 */
const OnlineStatusIndicator = ({ userId, showLabel = false, size = 'md' }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Listen for status changes
    const unsubscribe = socketService.onStatusChange((data) => {
      if (data.userId === userId) {
        setIsOnline(data.status === 'online');
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`${sizeClasses[size]} relative`}>
        <Circle
          className={`w-full h-full ${
            isOnline ? 'text-green-500 fill-green-500' : 'text-gray-500 fill-gray-500'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 animate-ping">
            <Circle className="w-full h-full text-green-500 opacity-75" />
          </div>
        )}
      </div>
      {showLabel && (
        <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineStatusIndicator;
