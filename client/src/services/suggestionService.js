/**
 * AI-Powered Suggestions Service (Rule-Based)
 * Provides intelligent suggestions without external APIs
 */

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get all suggestions for a project
 */
export const getProjectSuggestions = async (projectId, userId) => {
  const suggestions = [];
  
  try {
    // Get project data
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Check for various patterns
    suggestions.push(...detectOverdueTasks(tasks));
    suggestions.push(...detectUnassignedTasks(tasks));
    suggestions.push(...detectBlockedTasks(tasks));
    suggestions.push(...detectWorkloadImbalance(tasks));
    suggestions.push(...detectPriorityIssues(tasks));
    suggestions.push(...detectStaleTasks(tasks));
    suggestions.push(...detectMilestoneRisks(tasks));
    suggestions.push(...detectDependencyIssues(tasks));
    
    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};

/**
 * Get user-specific suggestions
 */
export const getUserSuggestions = async (userId) => {
  const suggestions = [];
  
  try {
    // Get user's tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignee', '==', userId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    suggestions.push(...detectUserOverload(tasks, userId));
    suggestions.push(...detectUserInactivity(tasks, userId));
    suggestions.push(...detectEfficiencyPatterns(tasks, userId));
    
    return suggestions;
  } catch (error) {
    console.error('Error getting user suggestions:', error);
    return [];
  }
};

/**
 * Detect overdue tasks
 */
const detectOverdueTasks = (tasks) => {
  const suggestions = [];
  const now = new Date();
  
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    return dueDate < now;
  });
  
  if (overdueTasks.length > 0) {
    suggestions.push({
      id: 'overdue_tasks',
      type: 'deadline',
      priority: 'critical',
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
      description: `You have ${overdueTasks.length} task(s) past their deadline. Consider extending deadlines or prioritizing completion.`,
      action: 'Review overdue tasks',
      tasks: overdueTasks.map(t => t.id),
      icon: '⏰'
    });
  }
  
  // Tasks due soon (next 2 days)
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 2;
  });
  
  if (upcomingTasks.length > 0) {
    suggestions.push({
      id: 'upcoming_deadlines',
      type: 'deadline',
      priority: 'high',
      title: `${upcomingTasks.length} Task${upcomingTasks.length > 1 ? 's' : ''} Due Soon`,
      description: `${upcomingTasks.length} task(s) due within the next 2 days. Plan your work accordingly.`,
      action: 'Review upcoming tasks',
      tasks: upcomingTasks.map(t => t.id),
      icon: '📅'
    });
  }
  
  return suggestions;
};

/**
 * Detect unassigned tasks
 */
const detectUnassignedTasks = (tasks) => {
  const suggestions = [];
  
  const unassignedTasks = tasks.filter(task => 
    !task.assignee && task.status !== 'done'
  );
  
  if (unassignedTasks.length > 0) {
    suggestions.push({
      id: 'unassigned_tasks',
      type: 'assignment',
      priority: 'high',
      title: `${unassignedTasks.length} Unassigned Task${unassignedTasks.length > 1 ? 's' : ''}`,
      description: `${unassignedTasks.length} task(s) have no assignee. Assign them to team members to keep the project moving.`,
      action: 'Assign tasks',
      tasks: unassignedTasks.map(t => t.id),
      icon: '👤'
    });
  }
  
  return suggestions;
};

/**
 * Detect blocked tasks
 */
const detectBlockedTasks = (tasks) => {
  const suggestions = [];
  
  const blockedTasks = tasks.filter(task => 
    task.status === 'blocked' || task.blockedBy
  );
  
  if (blockedTasks.length > 0) {
    suggestions.push({
      id: 'blocked_tasks',
      type: 'blocker',
      priority: 'high',
      title: `${blockedTasks.length} Blocked Task${blockedTasks.length > 1 ? 's' : ''}`,
      description: `${blockedTasks.length} task(s) are blocked. Resolve blockers to maintain project velocity.`,
      action: 'Resolve blockers',
      tasks: blockedTasks.map(t => t.id),
      icon: '🚧'
    });
  }
  
  return suggestions;
};

/**
 * Detect workload imbalance
 */
const detectWorkloadImbalance = (tasks) => {
  const suggestions = [];
  
  // Group tasks by assignee
  const workloadMap = {};
  tasks.forEach(task => {
    if (task.assignee && task.status !== 'done') {
      workloadMap[task.assignee] = (workloadMap[task.assignee] || 0) + 1;
    }
  });
  
  const assignees = Object.keys(workloadMap);
  if (assignees.length < 2) return suggestions;
  
  const workloads = Object.values(workloadMap);
  const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
  const maxWorkload = Math.max(...workloads);
  const minWorkload = Math.min(...workloads);
  
  // If imbalance is significant (3x difference)
  if (maxWorkload > minWorkload * 3 && maxWorkload > avgWorkload * 1.5) {
    suggestions.push({
      id: 'workload_imbalance',
      type: 'balance',
      priority: 'medium',
      title: 'Workload Imbalance Detected',
      description: `Some team members have significantly more tasks than others. Consider redistributing work for better balance.`,
      action: 'Rebalance tasks',
      icon: '⚖️'
    });
  }
  
  return suggestions;
};

/**
 * Detect priority issues
 */
const detectPriorityIssues = (tasks) => {
  const suggestions = [];
  
  // Check for too many high/critical priority tasks
  const highPriorityTasks = tasks.filter(task => 
    (task.priority === 'high' || task.priority === 'critical') && 
    task.status !== 'done'
  );
  
  const totalActiveTasks = tasks.filter(task => task.status !== 'done').length;
  
  if (highPriorityTasks.length > totalActiveTasks * 0.7) {
    suggestions.push({
      id: 'priority_inflation',
      type: 'priority',
      priority: 'medium',
      title: 'Priority Inflation Detected',
      description: `Over 70% of active tasks are marked as high/critical priority. Consider re-evaluating priorities for better focus.`,
      action: 'Review priorities',
      icon: '🎯'
    });
  }
  
  // Check for critical tasks in backlog
  const criticalInBacklog = tasks.filter(task => 
    task.priority === 'critical' && task.status === 'todo'
  );
  
  if (criticalInBacklog.length > 0) {
    suggestions.push({
      id: 'critical_in_backlog',
      type: 'priority',
      priority: 'high',
      title: `${criticalInBacklog.length} Critical Task${criticalInBacklog.length > 1 ? 's' : ''} in Backlog`,
      description: `Critical tasks should be started immediately. Move them to "In Progress".`,
      action: 'Start critical tasks',
      tasks: criticalInBacklog.map(t => t.id),
      icon: '🔥'
    });
  }
  
  return suggestions;
};

/**
 * Detect stale tasks (not updated in a while)
 */
const detectStaleTasks = (tasks) => {
  const suggestions = [];
  const now = new Date();
  const thresholdDays = 14; // 2 weeks
  
  const staleTasks = tasks.filter(task => {
    if (task.status === 'done' || task.status === 'todo') return false;
    
    const lastUpdate = task.updatedAt?.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt || task.createdAt);
    const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    
    return daysSinceUpdate >= thresholdDays;
  });
  
  if (staleTasks.length > 0) {
    suggestions.push({
      id: 'stale_tasks',
      type: 'activity',
      priority: 'medium',
      title: `${staleTasks.length} Stale Task${staleTasks.length > 1 ? 's' : ''}`,
      description: `${staleTasks.length} task(s) haven't been updated in ${thresholdDays}+ days. Check if they're still relevant.`,
      action: 'Review stale tasks',
      tasks: staleTasks.map(t => t.id),
      icon: '🕰️'
    });
  }
  
  return suggestions;
};

/**
 * Detect milestone risks
 */
const detectMilestoneRisks = (tasks) => {
  const suggestions = [];
  
  // Group tasks by milestone
  const milestones = {};
  tasks.forEach(task => {
    if (task.milestone) {
      if (!milestones[task.milestone]) {
        milestones[task.milestone] = { total: 0, completed: 0, overdue: 0 };
      }
      milestones[task.milestone].total++;
      if (task.status === 'done') {
        milestones[task.milestone].completed++;
      }
      if (task.dueDate && task.status !== 'done') {
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        if (dueDate < new Date()) {
          milestones[task.milestone].overdue++;
        }
      }
    }
  });
  
  Object.entries(milestones).forEach(([milestone, stats]) => {
    const completionRate = (stats.completed / stats.total) * 100;
    
    if (stats.overdue > 0 && completionRate < 50) {
      suggestions.push({
        id: `milestone_risk_${milestone}`,
        type: 'milestone',
        priority: 'high',
        title: `Milestone "${milestone}" At Risk`,
        description: `Only ${Math.round(completionRate)}% complete with ${stats.overdue} overdue task(s). May need deadline extension.`,
        action: 'Review milestone',
        icon: '🎖️'
      });
    }
  });
  
  return suggestions;
};

/**
 * Detect dependency issues
 */
const detectDependencyIssues = (tasks) => {
  const suggestions = [];
  
  // Find tasks that depend on incomplete tasks
  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0 && task.status !== 'done') {
      const incompleteDeps = task.dependencies.filter(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'done';
      });
      
      if (incompleteDeps.length > 0 && task.status === 'in-progress') {
        suggestions.push({
          id: `dependency_${task.id}`,
          type: 'dependency',
          priority: 'medium',
          title: 'Task Started Before Dependencies',
          description: `Task "${task.title}" is in progress but has ${incompleteDeps.length} incomplete dependencies.`,
          action: 'Review dependencies',
          tasks: [task.id],
          icon: '🔗'
        });
      }
    }
  });
  
  return suggestions;
};

/**
 * Detect user overload
 */
const detectUserOverload = (tasks, userId) => {
  const suggestions = [];
  
  const activeTasks = tasks.filter(task => 
    task.status !== 'done' && task.status !== 'cancelled'
  );
  
  if (activeTasks.length > 10) {
    suggestions.push({
      id: 'user_overload',
      type: 'workload',
      priority: 'medium',
      title: 'High Task Load',
      description: `You have ${activeTasks.length} active tasks. Consider delegating some tasks or focusing on high-priority items.`,
      action: 'Review workload',
      icon: '📊'
    });
  }
  
  return suggestions;
};

/**
 * Detect user inactivity
 */
const detectUserInactivity = (tasks, userId) => {
  const suggestions = [];
  
  // Check for tasks not updated recently
  const now = new Date();
  const inactiveTasks = tasks.filter(task => {
    if (task.status === 'done') return false;
    
    const lastUpdate = task.updatedAt?.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt || task.createdAt);
    const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    
    return daysSinceUpdate >= 7;
  });
  
  if (inactiveTasks.length > 3) {
    suggestions.push({
      id: 'user_inactivity',
      type: 'activity',
      priority: 'medium',
      title: 'Multiple Inactive Tasks',
      description: `You have ${inactiveTasks.length} tasks with no recent activity. Update their status or comment on progress.`,
      action: 'Update tasks',
      tasks: inactiveTasks.map(t => t.id),
      icon: '💤'
    });
  }
  
  return suggestions;
};

/**
 * Detect efficiency patterns
 */
const detectEfficiencyPatterns = (tasks, userId) => {
  const suggestions = [];
  
  const completedTasks = tasks.filter(task => task.status === 'done');
  
  if (completedTasks.length >= 5) {
    // Calculate average completion time
    const completionTimes = completedTasks
      .filter(task => task.completedAt && task.createdAt)
      .map(task => {
        const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
        const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        return (completed - created) / (1000 * 60 * 60 * 24); // days
      });
    
    if (completionTimes.length >= 3) {
      const avgTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
      
      if (avgTime < 2) {
        suggestions.push({
          id: 'efficient_worker',
          type: 'insight',
          priority: 'low',
          title: 'Great Efficiency!',
          description: `You complete tasks in an average of ${avgTime.toFixed(1)} days. Keep up the great work!`,
          action: 'View stats',
          icon: '⚡'
        });
      }
    }
  }
  
  return suggestions;
};

export default {
  getProjectSuggestions,
  getUserSuggestions
};
