import express from 'express'
import { protect } from '../middleware/auth.js'
import Task from '../models/Task.js'

const router = express.Router()

// @desc    Get tasks for a project
// @route   GET /api/tasks?projectId=xxx
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' })
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name role')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { project, title, description, assignee, deadline, priority } = req.body

    const task = await Task.create({
      project,
      title,
      description,
      assignee,
      deadline,
      priority: priority || 'Medium',
      createdBy: req.user._id,
    })

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name role')
      .populate('createdBy', 'name')

    // Emit socket event for real-time update
    const io = req.app.get('io')
    io.to(`project-${project}`).emit('task-created', populatedTask)

    res.status(201).json(populatedTask)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.title = req.body.title || task.title
    task.description = req.body.description || task.description
    task.status = req.body.status || task.status
    task.assignee = req.body.assignee || task.assignee
    task.deadline = req.body.deadline || task.deadline
    task.priority = req.body.priority || task.priority

    const updatedTask = await task.save()
    const populated = await Task.findById(updatedTask._id)
      .populate('assignee', 'name role')
      .populate('createdBy', 'name')

    // Emit socket event for real-time update
    const io = req.app.get('io')
    io.to(`project-${task.project}`).emit('task-updated', populated)

    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    await task.deleteOne()

    // Emit socket event for real-time update
    const io = req.app.get('io')
    io.to(`project-${task.project}`).emit('task-deleted', req.params.id)

    res.json({ message: 'Task removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
