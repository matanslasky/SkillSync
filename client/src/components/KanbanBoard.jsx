import { useState, useEffect } from 'react'
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Clock, AlertCircle, CheckCircle2, Eye, Trash2 } from 'lucide-react'
import { getTasksByStatus, moveTask, createTask, deleteTask, TASK_STATUS, TASK_PRIORITY } from '../services/taskService'
import { getProjectById, createNotification } from '../services/firestoreService'
import { mockUsers } from '../data/mockData'
import { useAuth } from '../contexts/AuthContext'
import socketService from '../services/socketService'

const KanbanBoard = ({ projectId }) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState({
    [TASK_STATUS.TODO]: [],
    [TASK_STATUS.IN_PROGRESS]: [],
    [TASK_STATUS.IN_REVIEW]: [],
    [TASK_STATUS.COMPLETED]: []
  })
  const [activeTask, setActiveTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createInColumn, setCreateInColumn] = useState(TASK_STATUS.TODO)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    if (projectId) {
      loadTasks()
      
      // Join project room for real-time updates
      socketService.joinProject(projectId)
      
      // Listen for task updates from other users
      const unsubscribe = socketService.onTaskUpdate((data) => {
        if (data.projectId === projectId) {
          loadTasks() // Reload tasks when updates occur
        }
      })
      
      return () => {
        unsubscribe()
        socketService.leaveProject(projectId)
      }
    }
  }, [projectId])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const grouped = await getTasksByStatus(projectId)
      setTasks(grouped)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event) => {
    const { active } = event
    const task = findTask(active.id)
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id
    const newStatus = over.id

    // If dropped on a column (status)
    if (Object.values(TASK_STATUS).includes(newStatus)) {
      const task = findTask(taskId)
      
      if (task && task.status !== newStatus) {
        const oldStatus = task.status
        
        // Optimistic update
        const updatedTasks = { ...tasks }
        updatedTasks[task.status] = updatedTasks[task.status].filter(t => t.id !== taskId)
        updatedTasks[newStatus] = [...updatedTasks[newStatus], { ...task, status: newStatus }]
        setTasks(updatedTasks)

        // Update in Firestore
        try {
          await moveTask(taskId, newStatus)
          
          // Broadcast update via Socket.io
          socketService.updateTask(projectId, {
            taskId,
            oldStatus,
            newStatus,
            task: { ...task, status: newStatus },
            updatedBy: user?.displayName || user?.email
          })
        } catch (error) {
          console.error('Error moving task:', error)
          // Revert on error
          loadTasks()
        }
      }
    }

    setActiveTask(null)
  }

  const findTask = (id) => {
    for (const status of Object.keys(tasks)) {
      const task = tasks[status].find(t => t.id === id)
      if (task) return task
    }
    return null
  }

  const handleCreateTask = (status) => {
    setCreateInColumn(status)
    setShowCreateModal(true)
  }

  const handleDeleteTask = async (taskId, status) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      const updatedTasks = { ...tasks }
      updatedTasks[status] = updatedTasks[status].filter(t => t.id !== taskId)
      setTasks(updatedTasks)
      
      // Broadcast deletion via Socket.io
      socketService.updateTask(projectId, {
        taskId,
        action: 'delete',
        status,
        updatedBy: user?.displayName || user?.email
      })
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const columns = [
    { id: TASK_STATUS.TODO, title: 'To Do', color: 'gray', icon: AlertCircle },
    { id: TASK_STATUS.IN_PROGRESS, title: 'In Progress', color: 'blue', icon: Clock },
    { id: TASK_STATUS.IN_REVIEW, title: 'In Review', color: 'purple', icon: Eye },
    { id: TASK_STATUS.COMPLETED, title: 'Completed', color: 'green', icon: CheckCircle2 }
  ]

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-8 border border-gray-800 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div>
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 kanban-grid">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks[column.id]}
              onCreateTask={() => handleCreateTask(column.id)}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          initialStatus={createInColumn}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={loadTasks}
        />
      )}
    </>
  )
}

const KanbanColumn = ({ column, tasks, onCreateTask, onDeleteTask }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'column' }
  })

  const colorMap = {
    gray: 'border-gray-600 bg-gray-600/10',
    blue: 'border-neon-blue bg-neon-blue/10',
    purple: 'border-neon-purple bg-neon-purple/10',
    green: 'border-neon-green bg-neon-green/10'
  }

  const Icon = column.icon

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 rounded-t-xl border-2 ${colorMap[column.color]}`}>
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <h3 className="font-semibold">{column.title}</h3>
          <span className="px-2 py-0.5 bg-dark-lighter rounded-full text-xs font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onCreateTask}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-4 bg-dark-lighter/30 rounded-b-xl border-2 border-t-0 border-gray-800 min-h-[500px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={() => onDeleteTask(task.id, column.id)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

const TaskCard = ({ task, isDragging, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  }

  const priorityColors = {
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    high: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const isOverdue = task.deadline && new Date(task.deadline.toDate ? task.deadline.toDate() : task.deadline) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-effect rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-2xl' : ''
      }`}
    >
      {/* Drag Handle & Title */}
      <div className="flex items-start gap-2 mb-3">
        <div {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab mt-0.5">
          <GripVertical size={16} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white leading-tight">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Task Meta */}
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.deadline && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            <Clock size={12} />
            <span>
              {new Date(task.deadline.toDate ? task.deadline.toDate() : task.deadline).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        )}
      </div>

      {/* Assignee */}
      {task.assigneeName && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold">
              {task.assigneeName.charAt(0)}
            </div>
            <span className="text-xs text-gray-400">{task.assigneeName}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const CreateTaskModal = ({ projectId, initialStatus, onClose, onTaskCreated }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TASK_PRIORITY.MEDIUM,
    deadline: '',
    assigneeId: user.uid,
    assigneeName: user.name
  })
  const [creating, setCreating] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    // Load team members for assignment
    const loadTeamMembers = async () => {
      try {
        const project = await getProjectById(projectId)
        // For now, use mock users. In production, fetch real team members
        const members = mockUsers.filter(u => project.team?.includes(u.id))
        setTeamMembers(members)
      } catch (error) {
        console.error('Error loading team members:', error)
        setTeamMembers(mockUsers.slice(0, 5)) // Fallback to mock data
      }
    }
    
    loadTeamMembers()
  }, [projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const newTask = await createTask({
        projectId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        status: initialStatus,
        assigneeId: formData.assigneeId,
        assigneeName: formData.assigneeName,
        createdBy: user.uid
      })

      // Create notification for assignee if not self-assigned
      if (formData.assigneeId !== user.uid) {
        await createNotification({
          userId: formData.assigneeId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You've been assigned: ${formData.title}`,
          link: `/project/${projectId}`,
          metadata: {
            taskId: newTask.id,
            projectId,
            assignedBy: user.name
          }
        })
      }

      onTaskCreated()
      onClose()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Create New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-blue/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-blue/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-blue/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>
          </div>

          {/* Assign to Team Member */}
          <div>
            <label className="block text-sm font-medium mb-2">Assign To</label>
            <select
              value={formData.assigneeId}
              onChange={(e) => {
                const selectedMember = teamMembers.find(m => m.id === e.target.value || m.uid === e.target.value)
                setFormData({ 
                  ...formData, 
                  assigneeId: e.target.value,
                  assigneeName: selectedMember?.name || 'Unknown'
                })
              }}
              className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-blue/50"
            >
              {teamMembers.map(member => (
                <option key={member.id || member.uid} value={member.id || member.uid}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-4 py-2 bg-neon-blue text-dark font-semibold rounded-lg hover:shadow-neon-blue transition-all disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default KanbanBoard
