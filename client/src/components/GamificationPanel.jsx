import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Award, TrendingUp, Target, Calendar } from 'lucide-react';
import { getUserGameData, ACHIEVEMENTS } from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Gamification Panel Component
 * Displays user XP, level, achievements, and streak
 */
const GamificationPanel = () => {
  const { user } = useAuth();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  useEffect(() => {
    loadGameData();
  }, [user]);
  
  const loadGameData = async () => {
    if (!user) return;
    
    try {
      const data = await getUserGameData(user.uid);
      setGameData(data);
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }
  
  if (!gameData) {
    return null;
  }
  
  const xpProgress = ((gameData.xp % gameData.nextLevelXP) / gameData.nextLevelXP) * 100;
  const earnedAchievements = Object.values(ACHIEVEMENTS).filter(a => 
    gameData.achievements.includes(a.id)
  );
  const lockedAchievements = Object.values(ACHIEVEMENTS).filter(a => 
    !gameData.achievements.includes(a.id)
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Your Progress
          </h2>
          
          {/* Streak */}
          <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full">
            <Zap className="w-5 h-5 text-orange-500" />
            <div className="text-sm">
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {gameData.streak}
              </span>
              <span className="text-orange-500 dark:text-orange-400 ml-1">
                day streak
              </span>
            </div>
          </div>
        </div>
        
        {/* Level & XP */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{gameData.level}</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Level {gameData.level}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {gameData.xp} XP
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Next Level</div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {gameData.nextLevelXP} XP
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Level {gameData.level}</span>
              <span>Level {gameData.level + 1}</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              {Math.round(xpProgress)}% to next level
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('achievements')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'achievements'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Achievements ({earnedAchievements.length}/{Object.keys(ACHIEVEMENTS).length})
          </button>
        </nav>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={<Target className="w-5 h-5" />}
                label="Tasks Completed"
                value={gameData.stats.tasksCompleted}
                color="blue"
              />
              <StatCard 
                icon={<Trophy className="w-5 h-5" />}
                label="Projects Completed"
                value={gameData.stats.projectsCompleted}
                color="purple"
              />
              <StatCard 
                icon={<Award className="w-5 h-5" />}
                label="Achievements"
                value={earnedAchievements.length}
                color="green"
              />
              <StatCard 
                icon={<Calendar className="w-5 h-5" />}
                label="Current Streak"
                value={gameData.streak}
                color="orange"
              />
            </div>
            
            {/* Recent Achievements */}
            {earnedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {earnedAchievements.slice(0, 4).map(achievement => (
                    <AchievementCard 
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'achievements' && (
          <div className="space-y-6">
            {/* Unlocked */}
            {earnedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  Unlocked ({earnedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {earnedAchievements.map(achievement => (
                    <AchievementCard 
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={true}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-400" />
                  Locked ({lockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lockedAchievements.map(achievement => (
                    <AchievementCard 
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
};

/**
 * Achievement Card Component
 */
const AchievementCard = ({ achievement, unlocked }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-purple-500';
      case 'epic':
        return 'from-purple-500 to-pink-500';
      case 'legendary':
        return 'from-yellow-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };
  
  return (
    <div 
      className={`relative rounded-lg border-2 p-4 transition-all ${
        unlocked
          ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div 
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} ${
            !unlocked && 'grayscale'
          }`}
        >
          {unlocked ? achievement.icon : '🔒'}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {achievement.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {achievement.description}
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {achievement.xp} XP
              </span>
            </div>
            
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 capitalize">
              {achievement.rarity}
            </span>
          </div>
        </div>
      </div>
      
      {unlocked && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationPanel;
