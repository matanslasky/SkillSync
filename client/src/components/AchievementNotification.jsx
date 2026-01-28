import React, { useEffect } from 'react';
import { Trophy, Star, Zap, Award } from 'lucide-react';

/**
 * Achievement Notification Toast
 */
const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-500 to-gray-700';
      case 'rare':
        return 'from-blue-500 to-purple-600';
      case 'epic':
        return 'from-purple-600 to-pink-600';
      case 'legendary':
        return 'from-yellow-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };
  
  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500';
      case 'rare':
        return 'border-blue-500';
      case 'epic':
        return 'border-purple-500';
      case 'legendary':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };
  
  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div 
        className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} 
          rounded-lg shadow-2xl border-2 ${getRarityBorder(achievement.rarity)} 
          p-4 min-w-[320px] max-w-[400px]`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            {achievement.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                Achievement Unlocked!
              </span>
            </div>
            
            <h3 className="text-lg font-bold mb-1">
              {achievement.name}
            </h3>
            
            <p className="text-sm opacity-90 mb-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-semibold">+{achievement.xp} XP</span>
              </div>
              
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Award className="w-3 h-3" />
                <span className="text-xs font-semibold capitalize">{achievement.rarity}</span>
              </div>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/60 animate-progress-bar"
            style={{ animation: 'progress 5s linear' }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .animate-progress-bar {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
};

export default AchievementNotification;
