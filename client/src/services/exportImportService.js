/**
 * Export/Import Service
 * Provides functionality to export and import project data, tasks, and settings
 */

import { saveAs } from 'file-saver';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Export project data to JSON
 */
export const exportProject = async (projectId) => {
  try {
    // Get project
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }
    
    const projectData = {
      id: projectDoc.id,
      ...projectDoc.data()
    };

    // Get tasks
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('projectId', '==', projectId));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Create export data
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project: projectData,
      tasks,
      metadata: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length
      }
    };

    // Create JSON blob
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    // Download
    const fileName = `${projectData.name || projectData.title}_${Date.now()}.json`;
    saveAs(blob, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Export all user projects
 */
export const exportAllProjects = async (userId) => {
  try {
    // Get all user projects
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

    // Get all tasks for these projects
    const tasksRef = collection(db, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    const allTasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter tasks by project
    const projectIds = projects.map(p => p.id);
    const tasks = allTasks.filter(t => projectIds.includes(t.projectId));

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId,
      projects,
      tasks,
      metadata: {
        totalProjects: projects.length,
        totalTasks: tasks.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const fileName = `skillsync_backup_${Date.now()}.json`;
    saveAs(blob, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Export all error:', error);
    throw error;
  }
};

/**
 * Export to CSV format
 */
export const exportToCSV = async (projectId) => {
  try {
    // Get tasks
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('projectId', '==', projectId));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Create CSV content
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Assigned To', 'Created At', 'Updated At'];
    const rows = tasks.map(task => [
      task.id,
      task.title || '',
      task.description || '',
      task.status || '',
      task.priority || '',
      task.assignedToName || '',
      task.createdAt?.toDate().toISOString() || '',
      task.updatedAt?.toDate().toISOString() || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `tasks_${projectId}_${Date.now()}.csv`;
    saveAs(blob, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('CSV export error:', error);
    throw error;
  }
};

/**
 * Import project from JSON
 */
export const importProject = async (file, userId) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate format
    if (!data.version || !data.project) {
      throw new Error('Invalid import file format');
    }

    // Create new project (without ID to generate new)
    const { id, ...projectData } = data.project;
    const newProjectRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      importedAt: new Date(),
      importedBy: userId,
      members: [userId, ...(projectData.members || [])].filter((v, i, a) => a.indexOf(v) === i)
    });

    // Import tasks
    let importedTasksCount = 0;
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        const { id: taskId, ...taskData } = task;
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          projectId: newProjectRef.id,
          importedAt: new Date()
        });
        importedTasksCount++;
      }
    }

    return {
      success: true,
      projectId: newProjectRef.id,
      tasksImported: importedTasksCount
    };
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

/**
 * Export project as Markdown
 */
export const exportToMarkdown = async (projectId) => {
  try {
    // Get project
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }
    
    const project = { id: projectDoc.id, ...projectDoc.data() };

    // Get tasks
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('projectId', '==', projectId));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by status
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      'in-review': tasks.filter(t => t.status === 'in-review'),
      done: tasks.filter(t => t.status === 'done')
    };

    // Generate Markdown
    let markdown = `# ${project.name || project.title}\n\n`;
    markdown += `## Project Overview\n\n`;
    markdown += `**Description:** ${project.description || 'No description'}\n\n`;
    markdown += `**Status:** ${project.status || 'Unknown'}\n\n`;
    markdown += `**Team Size:** ${project.members?.length || 0} members\n\n`;
    markdown += `**Created:** ${project.createdAt?.toDate().toLocaleDateString() || 'Unknown'}\n\n`;
    markdown += `---\n\n`;

    markdown += `## Tasks Summary\n\n`;
    markdown += `- Total Tasks: ${tasks.length}\n`;
    markdown += `- Completed: ${tasksByStatus.done.length}\n`;
    markdown += `- In Progress: ${tasksByStatus['in-progress'].length}\n`;
    markdown += `- To Do: ${tasksByStatus.todo.length}\n`;
    markdown += `- In Review: ${tasksByStatus['in-review'].length}\n\n`;
    markdown += `---\n\n`;

    // Add tasks by status
    const statusLabels = {
      todo: '📋 To Do',
      'in-progress': '⚡ In Progress',
      'in-review': '👀 In Review',
      done: '✅ Done'
    };

    Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
      if (statusTasks.length > 0) {
        markdown += `## ${statusLabels[status]} (${statusTasks.length})\n\n`;
        statusTasks.forEach((task, index) => {
          markdown += `### ${index + 1}. ${task.title}\n\n`;
          if (task.description) {
            markdown += `${task.description}\n\n`;
          }
          markdown += `- **Priority:** ${task.priority || 'Not set'}\n`;
          if (task.assignedToName) {
            markdown += `- **Assigned to:** ${task.assignedToName}\n`;
          }
          if (task.dueDate) {
            markdown += `- **Due date:** ${task.dueDate.toDate().toLocaleDateString()}\n`;
          }
          markdown += `\n`;
        });
        markdown += `---\n\n`;
      }
    });

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const fileName = `${project.name || project.title}_${Date.now()}.md`;
    saveAs(blob, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Markdown export error:', error);
    throw error;
  }
};

import { getDoc } from 'firebase/firestore';

export default {
  exportProject,
  exportAllProjects,
  exportToCSV,
  exportToMarkdown,
  importProject
};
