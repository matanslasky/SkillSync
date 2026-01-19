import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Calendar, Clock, AlertCircle, CheckCircle2, Filter, Plus } from 'lucide-react'
import { mockTasks, mockProjects } from '../data/mockData'

const AssignmentsPage = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('deadline')
  const [tasks, setTasks] = useState(mockTasks)

  // Toggle task completion
  const handleToggleTask = (taskId) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'Done' ? 'To Do' : 'Done'
        return { ...task, status: newStatus }
      }
      return task
    }))
  }

  // Group tasks by status
  const tasksByStatus = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  }

  const allTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus)

  // Sort tasks
  const sortedTasks = [...allTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.createdAt) - new Date(b.createdAt)
    }
    return a.title.localeCompare(b.title)
  })

  const getProject = (projectId) => {
    return mockProjects.find(p => p.id === projectId)
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">My Assignments</h2>
              <p className="text-gray-500">Track and manage all your tasks across projects</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all">
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<AlertCircle className="text-neon-pink" />}
            label="To Do"
            value={tasksByStatus['To Do'].length}
            color="pink"
          />
          <StatCard
            icon={<Clock className="text-neon-blue" />}
            label="In Progress"
            value={tasksByStatus['In Progress'].length}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="text-neon-green" />}
            label="Completed"
            value={tasksByStatus['Done'].length}
            color="green"
          />
          <StatCard
            icon={<Calendar className="text-neon-purple" />}
            label="This Week"
            value={mockTasks.length}
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none transition-all"
          >
            <option value="deadline">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              project={getProject(task.projectId)} 
              onToggle={handleToggleTask}
            />
          ))}
        </div>

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No assignments found. Great job staying on top of things!</p>
          </div>
        )}
      </main>
    </div>
  )
}

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    pink: 'border-neon-pink/20',
    blue: 'border-neon-blue/20',
    green: 'border-neon-green/20',
    purple: 'border-neon-purple/20'
  }

  return (
    <div className={`glass-effect rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

const TaskCard = ({ task, project, onToggle }) => {
  const statusColors = {
    'To Do': 'bg-neon-pink/10 text-neon-pink border-neon-pink/30',
    'In Progress': 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
    'Done': 'bg-neon-green/10 text-neon-green border-neon-green/30'
  }

  const priorityColors = {
    high: 'bg-neon-pink/20 text-neon-pink',
    medium: 'bg-neon-blue/20 text-neon-blue',
    low: 'bg-gray-800 text-gray-400'
  }

  const priority = task.id.includes('1') ? 'high' : task.id.includes('2') ? 'medium' : 'low'

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800 hover:border-neon-green/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Title and Status */}
          <div className="flex items-start gap-3 mb-3">
            <input
              type="checkbox"
              checked={task.status === 'Done'}
              onChange={() => onToggle(task.id)}
              className="mt-1 w-5 h-5 rounded border-gray-700 bg-dark-lighter accent-neon-green cursor-pointer"
            />
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-2 ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-white'}`}>
                {task.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3">{task.description}</p>
              
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {project && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                    {project.name}
                  </span>
                )}
                {task.assignedToName && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-xs font-bold">
                      {task.assignedToName.charAt(0)}
                    </span>
                    {task.assignedToName}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} />
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[task.status]}`}>
            {task.status}
          </span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${priorityColors[priority]}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AssignmentsPage
