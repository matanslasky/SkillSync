import express from 'express'
import { protect } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      // Only allow users to update their own profile
      if (user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this profile' })
      }

      user.name = req.body.name || user.name
      user.bio = req.body.bio || user.bio
      user.portfolio = req.body.portfolio || user.portfolio
      user.skills = req.body.skills || user.skills
      user.githubUsername = req.body.githubUsername || user.githubUsername

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        bio: updatedUser.bio,
        portfolio: updatedUser.portfolio,
        commitmentScore: updatedUser.commitmentScore,
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
