import express from 'express'
import { protect } from '../middleware/auth.js'
import Project from '../models/Project.js'

const router = express.Router()

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Active' })
      .populate('owner', 'name email role')
      .populate('teamMembers.user', 'name role skills')
      .sort({ createdAt: -1 })

    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role commitmentScore')
      .populate('teamMembers.user', 'name role skills commitmentScore')

    if (project) {
      res.json(project)
    } else {
      res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, tags, techStack } = req.body

    const project = await Project.create({
      title,
      description,
      tags: tags || [],
      techStack: techStack || [],
      owner: req.user._id,
      teamMembers: [{
        user: req.user._id,
        role: 'Owner',
      }],
    })

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('teamMembers.user', 'name role skills')

    res.status(201).json(populatedProject)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Only owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' })
    }

    project.title = req.body.title || project.title
    project.description = req.body.description || project.description
    project.tags = req.body.tags || project.tags
    project.techStack = req.body.techStack || project.techStack
    project.status = req.body.status || project.status

    const updatedProject = await project.save()
    const populated = await Project.findById(updatedProject._id)
      .populate('owner', 'name email role')
      .populate('teamMembers.user', 'name role skills')

    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
