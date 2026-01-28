/**
 * Analytics Service
 * Provides data aggregation and analysis for projects, tasks, and team performance
 */

import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfWeek, startOfMonth, subDays, subMonths, format } from 'date-fns';

/**
 * Get project analytics for a specific project
 */
export const getProjectAnalytics = async (projectId) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      'in-review': 0,
      done: 0
    };

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });

    const completionRate = tasks.length > 0 
      ? Math.round((statusCounts.done / tasks.length) * 100)
      : 0;

    return {
      totalTasks: tasks.length,
      completedTasks: statusCounts.done,
      inProgressTasks: statusCounts['in-progress'],
      todoTasks: statusCounts.todo,
      reviewTasks: statusCounts['in-review'],
      completionRate,
      statusCounts,
      priorityCounts,
      tasks
    };
  } catch (error) {
    console.error('Error getting project analytics:', error);
    throw error;
  }
};

/**
 * Get user productivity analytics
 */
export const getUserProductivityAnalytics = async (userId, days = 30) => {
  try {
    const startDate = subDays(new Date(), days);
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('assignedTo', '==', userId),
      where('updatedAt', '>=', Timestamp.fromDate(startDate))
    );
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by day
    const dailyActivity = {};
    tasks.forEach(task => {
      const date = task.updatedAt?.toDate();
      if (date) {
        const dayKey = format(date, 'yyyy-MM-dd');
        if (!dailyActivity[dayKey]) {
          dailyActivity[dayKey] = {
            date: dayKey,
            completed: 0,
            created: 0,
            updated: 0
          };
        }
        
        if (task.status === 'done') {
          dailyActivity[dayKey].completed++;
        }
        dailyActivity[dayKey].updated++;
      }
    });

    const activityData = Object.values(dailyActivity).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      averageTasksPerDay: tasks.length / days,
      activityData
    };
  } catch (error) {
    console.error('Error getting user productivity:', error);
    throw error;
  }
};

/**
 * Get team performance metrics
 */
export const getTeamPerformanceMetrics = async (projectId) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by assignee
    const memberStats = {};
    tasks.forEach(task => {
      const assignee = task.assignedTo || 'unassigned';
      if (!memberStats[assignee]) {
        memberStats[assignee] = {
          userId: assignee,
          userName: task.assignedToName || 'Unassigned',
          total: 0,
          completed: 0,
          inProgress: 0,
          todo: 0
        };
      }
      
      memberStats[assignee].total++;
      if (task.status === 'done') memberStats[assignee].completed++;
      if (task.status === 'in-progress') memberStats[assignee].inProgress++;
      if (task.status === 'todo') memberStats[assignee].todo++;
    });

    const teamData = Object.values(memberStats).map(member => ({
      ...member,
      completionRate: member.total > 0 
        ? Math.round((member.completed / member.total) * 100)
        : 0
    }));

    return {
      totalMembers: teamData.length,
      teamData: teamData.sort((a, b) => b.completionRate - a.completionRate)
    };
  } catch (error) {
    console.error('Error getting team performance:', error);
    throw error;
  }
};

/**
 * Get project timeline data (for burndown chart)
 */
export const getProjectTimeline = async (projectId, days = 30) => {
  try {
    const startDate = subDays(new Date(), days);
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('projectId', '==', projectId)
    );
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Create timeline data
    const timeline = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const completedByDate = tasks.filter(task => {
        const completedAt = task.completedAt?.toDate();
        return completedAt && completedAt <= date && task.status === 'done';
      }).length;

      const totalAtDate = tasks.filter(task => {
        const createdAt = task.createdAt?.toDate();
        return createdAt && createdAt <= date;
      }).length;

      timeline.push({
        date: dateStr,
        total: totalAtDate,
        completed: completedByDate,
        remaining: totalAtDate - completedByDate
      });
    }

    return timeline;
  } catch (error) {
    console.error('Error getting project timeline:', error);
    throw error;
  }
};

/**
 * Get overall dashboard statistics
 */
export const getDashboardStats = async (userId) => {
  try {
    // Get user's projects
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(
      projectsRef,
      where('members', 'array-contains', userId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get user's tasks
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(
      tasksRef,
      where('assignedTo', '==', userId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'Active').length,
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      completionRate: tasks.length > 0 
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * Get velocity metrics (tasks completed per week)
 */
export const getVelocityMetrics = async (projectId, weeks = 4) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('projectId', '==', projectId),
      where('status', '==', 'done')
    );
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const weeklyData = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = subDays(weekStart, -7);
      
      const tasksInWeek = tasks.filter(task => {
        const completedAt = task.completedAt?.toDate();
        return completedAt && completedAt >= weekStart && completedAt < weekEnd;
      });

      weeklyData.push({
        week: format(weekStart, 'MMM dd'),
        completed: tasksInWeek.length,
        velocity: tasksInWeek.length
      });
    }

    const averageVelocity = weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, w) => sum + w.completed, 0) / weeklyData.length)
      : 0;

    return {
      weeklyData,
      averageVelocity
    };
  } catch (error) {
    console.error('Error getting velocity metrics:', error);
    throw error;
  }
};
