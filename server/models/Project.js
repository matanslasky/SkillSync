import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    tags: [{
      type: String,
    }],
    techStack: [{
      type: String,
    }],
    teamMembers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: String,
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roadmap: {
      phases: [{
        title: String,
        tasks: [String],
        estimatedDuration: String,
      }],
    },
    meetingsLog: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
    }],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
)

const Project = mongoose.model('Project', projectSchema)

export default Project
