import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      attended: {
        type: Boolean,
        default: false,
      },
      joinedAt: Date,
      leftAt: Date,
    }],
    recordingUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const Meeting = mongoose.model('Meeting', meetingSchema)

export default Meeting
