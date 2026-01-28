/**
 * Gamification Service
 * Handles XP, levels, achievements, badges, and streaks
 */

import { doc, getDoc, updateDoc, setDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// XP values for different actions
export const XP_VALUES = {
  TASK_CREATED: 10,
  TASK_COMPLETED: 25,
  TASK_COMPLETED_EARLY: 35,
  PROJECT_CREATED: 50,
  PROJECT_COMPLETED: 100,
  COMMENT_ADDED: 5,
  MILESTONE_REACHED: 75,
  HELPED_TEAMMATE: 20,
  CODE_REVIEW: 15,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10,
  FIRST_CONTRIBUTION: 30
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
  15000, 20000, 26000, 33000, 41000, 50000
];

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_TASK: {
    id: 'first_task',
    name: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    xp: 50,
    rarity: 'common'
  },
  TASK_MASTER_10: {
    id: 'task_master_10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⭐',
    xp: 100,
    rarity: 'common'
  },
  TASK_MASTER_50: {
    id: 'task_master_50',
    name: 'Task Veteran',
    description: 'Complete 50 tasks',
    icon: '🌟',
    xp: 250,
    rarity: 'rare'
  },
  TASK_MASTER_100: {
    id: 'task_master_100',
    name: 'Task Legend',
    description: 'Complete 100 tasks',
    icon: '💎',
    xp: 500,
    rarity: 'epic'
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 tasks in one day',
    icon: '⚡',
    xp: 75,
    rarity: 'rare'
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before deadline',
    icon: '🐦',
    xp: 50,
    rarity: 'common'
  },
  TEAM_PLAYER: {
    id: 'team_player',
    name: 'Team Player',
    description: 'Help 5 teammates',
    icon: '🤝',
    xp: 100,
    rarity: 'rare'
  },
  STREAK_WEEK: {
    id: 'streak_week',
    name: 'Week Warrior',
    description: 'Login for 7 days in a row',
    icon: '🔥',
    xp: 150,
    rarity: 'rare'
  },
  STREAK_MONTH: {
    id: 'streak_month',
    name: 'Monthly Master',
    description: 'Login for 30 days in a row',
    icon: '🏆',
    xp: 500,
    rarity: 'epic'
  },
  PROJECT_CREATOR: {
    id: 'project_creator',
    name: 'Project Creator',
    description: 'Create your first project',
    icon: '🚀',
    xp: 100,
    rarity: 'common'
  },
  PROJECT_FINISHER: {
    id: 'project_finisher',
    name: 'Project Finisher',
    description: 'Complete a project',
    icon: '✅',
    xp: 200,
    rarity: 'rare'
  },
  REVIEWER: {
    id: 'reviewer',
    name: 'Code Reviewer',
    description: 'Review 10 tasks',
    icon: '👀',
    xp: 100,
    rarity: 'common'
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Send 50 messages',
    icon: '💬',
    xp: 75,
    rarity: 'common'
  },
  MILESTONE_ACHIEVER: {
    id: 'milestone_achiever',
    name: 'Milestone Achiever',
    description: 'Reach 5 milestones',
    icon: '🎖️',
    xp: 200,
    rarity: 'rare'
  },
  LEVEL_10: {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    xp: 300,
    rarity: 'epic'
  },
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 tasks with no revisions',
    icon: '💯',
    xp: 150,
    rarity: 'rare'
  }
};

/**
 * Get user's gamification data
 */
export const getUserGameData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return createInitialGameData();
    }
    
    const data = userDoc.data();
    return {
      xp: data.xp || 0,
      level: data.level || 1,
      achievements: data.achievements || [],
      badges: data.badges || [],
      streak: data.streak || 0,
      lastLogin: data.lastLogin,
      stats: data.stats || createInitialStats(),
      nextLevelXP: getNextLevelXP(data.level || 1)
    };
  } catch (error) {
    console.error('Error getting game data:', error);
    return createInitialGameData();
  }
};

/**
 * Create initial game data for new users
 */
const createInitialGameData = () => ({
  xp: 0,
  level: 1,
  achievements: [],
  badges: [],
  streak: 0,
  lastLogin: null,
  stats: createInitialStats(),
  nextLevelXP: LEVEL_THRESHOLDS[1]
});

/**
 * Create initial stats
 */
const createInitialStats = () => ({
  tasksCompleted: 0,
  tasksCreated: 0,
  projectsCreated: 0,
  projectsCompleted: 0,
  commentsAdded: 0,
  milestonesReached: 0,
  codeReviews: 0,
  messagesSent: 0,
  helpedTeammates: 0
});

/**
 * Calculate XP needed for next level
 */
export const getNextLevelXP = (currentLevel) => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
  }
  return LEVEL_THRESHOLDS[currentLevel];
};

/**
 * Calculate level from XP
 */
export const getLevelFromXP = (xp) => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
};

/**
 * Award XP to user
 */
export const awardXP = async (userId, amount, reason) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        xp: amount,
        level: 1,
        achievements: [],
        badges: [],
        streak: 0,
        stats: createInitialStats()
      });
      return { xp: amount, level: 1, leveledUp: false };
    }
    
    const currentData = userDoc.data();
    const currentXP = currentData.xp || 0;
    const currentLevel = currentData.level || 1;
    const newXP = currentXP + amount;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > currentLevel;
    
    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      lastXPGain: {
        amount,
        reason,
        timestamp: Timestamp.now()
      }
    });
    
    // Check for level-based achievements
    if (leveledUp) {
      await checkLevelAchievements(userId, newLevel);
    }
    
    return { xp: newXP, level: newLevel, leveledUp };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

/**
 * Check and award achievements
 */
export const checkAchievements = async (userId, action, data = {}) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data();
    const currentAchievements = userData.achievements || [];
    const stats = userData.stats || createInitialStats();
    const newAchievements = [];
    
    // Check for achievements based on action
    switch (action) {
      case 'TASK_COMPLETED':
        if (!currentAchievements.includes('first_task') && stats.tasksCompleted === 1) {
          newAchievements.push(ACHIEVEMENTS.FIRST_TASK);
        }
        if (!currentAchievements.includes('task_master_10') && stats.tasksCompleted === 10) {
          newAchievements.push(ACHIEVEMENTS.TASK_MASTER_10);
        }
        if (!currentAchievements.includes('task_master_50') && stats.tasksCompleted === 50) {
          newAchievements.push(ACHIEVEMENTS.TASK_MASTER_50);
        }
        if (!currentAchievements.includes('task_master_100') && stats.tasksCompleted === 100) {
          newAchievements.push(ACHIEVEMENTS.TASK_MASTER_100);
        }
        if (!currentAchievements.includes('early_bird') && data.beforeDeadline) {
          newAchievements.push(ACHIEVEMENTS.EARLY_BIRD);
        }
        break;
        
      case 'PROJECT_CREATED':
        if (!currentAchievements.includes('project_creator') && stats.projectsCreated === 1) {
          newAchievements.push(ACHIEVEMENTS.PROJECT_CREATOR);
        }
        break;
        
      case 'PROJECT_COMPLETED':
        if (!currentAchievements.includes('project_finisher')) {
          newAchievements.push(ACHIEVEMENTS.PROJECT_FINISHER);
        }
        break;
        
      case 'STREAK_UPDATE':
        const streak = data.streak || 0;
        if (!currentAchievements.includes('streak_week') && streak >= 7) {
          newAchievements.push(ACHIEVEMENTS.STREAK_WEEK);
        }
        if (!currentAchievements.includes('streak_month') && streak >= 30) {
          newAchievements.push(ACHIEVEMENTS.STREAK_MONTH);
        }
        break;
    }
    
    // Award new achievements
    if (newAchievements.length > 0) {
      const achievementIds = newAchievements.map(a => a.id);
      await updateDoc(userRef, {
        achievements: [...currentAchievements, ...achievementIds]
      });
      
      // Award XP for achievements
      const totalXP = newAchievements.reduce((sum, a) => sum + a.xp, 0);
      await awardXP(userId, totalXP, 'Achievements unlocked');
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Check level-based achievements
 */
const checkLevelAchievements = async (userId, level) => {
  if (level >= 10) {
    await checkAchievements(userId, 'LEVEL_REACHED', { level });
  }
};

/**
 * Update user stats
 */
export const updateUserStats = async (userId, statName, incrementBy = 1) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`stats.${statName}`]: increment(incrementBy)
    });
  } catch (error) {
    console.error('Error updating stats:', error);
  }
};

/**
 * Update login streak
 */
export const updateLoginStreak = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return 0;
    
    const userData = userDoc.data();
    const lastLogin = userData.lastLogin?.toDate();
    const currentStreak = userData.streak || 0;
    const now = new Date();
    
    let newStreak = currentStreak;
    
    if (!lastLogin) {
      newStreak = 1;
    } else {
      const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastLogin === 1) {
        // Consecutive day
        newStreak = currentStreak + 1;
        await awardXP(userId, XP_VALUES.DAILY_LOGIN + XP_VALUES.STREAK_BONUS, 'Daily streak');
      } else if (daysSinceLastLogin === 0) {
        // Same day, don't update
        return currentStreak;
      } else {
        // Streak broken
        newStreak = 1;
        await awardXP(userId, XP_VALUES.DAILY_LOGIN, 'Daily login');
      }
    }
    
    await updateDoc(userRef, {
      streak: newStreak,
      lastLogin: Timestamp.now()
    });
    
    // Check streak achievements
    await checkAchievements(userId, 'STREAK_UPDATE', { streak: newStreak });
    
    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    // Note: This would require a Firestore query with orderBy
    // For now, returning mock data
    return [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Get achievement progress
 */
export const getAchievementProgress = (stats, achievements) => {
  const progress = {};
  
  // Task achievements
  progress.task_master_10 = Math.min((stats.tasksCompleted / 10) * 100, 100);
  progress.task_master_50 = Math.min((stats.tasksCompleted / 50) * 100, 100);
  progress.task_master_100 = Math.min((stats.tasksCompleted / 100) * 100, 100);
  
  // Project achievements
  progress.project_creator = stats.projectsCreated >= 1 ? 100 : 0;
  progress.project_finisher = stats.projectsCompleted >= 1 ? 100 : 0;
  
  return progress;
};

export default {
  getUserGameData,
  awardXP,
  checkAchievements,
  updateUserStats,
  updateLoginStreak,
  getLeaderboard,
  getAchievementProgress,
  XP_VALUES,
  ACHIEVEMENTS
};
