import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize Express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Make io accessible in routes
app.set('io', io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSync API is running' })
})

// Error handling middleware
app.use(errorHandler)

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })

  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`)
    console.log(`User ${socket.id} joined project ${projectId}`)
  })

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`)
    console.log(`User ${socket.id} left project ${projectId}`)
  })
})

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.io server running`)
})

export { io }
