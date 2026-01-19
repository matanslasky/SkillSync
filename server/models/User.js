import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['Developer', 'Designer', 'Marketer'],
      default: 'Developer',
    },
    skills: [{
      type: String,
    }],
    portfolio: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    commitmentScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    scoreHistory: [{
      date: {
        type: Date,
        default: Date.now,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
    }],
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
    githubUsername: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
