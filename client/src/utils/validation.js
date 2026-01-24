import { z } from 'zod'

/**
 * Validation schemas for SkillSync
 */

// User registration schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
  
  role: z.enum([
    'Developer',
    'Designer',
    'Product Manager',
    'Marketing',
    'Data Scientist',
    'Business Analyst',
    'Other'
  ], { errorMap: () => ({ message: 'Please select a valid role' }) }),
  
  skills: z.array(z.string()).min(1, 'Please add at least one skill')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(1, 'Password is required')
})

// Project creation schema
export const projectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  category: z.enum([
    'Web Development',
    'Mobile App',
    'Data Science',
    'AI/ML',
    'Game Development',
    'DevOps',
    'Design',
    'Marketing',
    'Other'
  ]),
  
  requiredRoles: z.array(z.string())
    .min(1, 'At least one role is required')
    .max(10, 'Maximum 10 roles allowed'),
  
  techStack: z.array(z.string())
    .min(1, 'At least one technology is required')
    .max(15, 'Maximum 15 technologies allowed'),
  
  maxTeamSize: z.number()
    .int('Team size must be a whole number')
    .min(2, 'Team size must be at least 2')
    .max(20, 'Team size cannot exceed 20'),
  
  duration: z.string()
    .min(1, 'Duration is required'),
  
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced'])
})

// Task creation schema
export const taskSchema = z.object({
  title: z.string()
    .min(3, 'Task title must be at least 3 characters')
    .max(100, 'Task title must be less than 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  
  estimatedHours: z.number()
    .min(0.5, 'Estimated hours must be at least 0.5')
    .max(100, 'Estimated hours cannot exceed 100'),
  
  dueDate: z.date()
    .min(new Date(), 'Due date must be in the future')
})

// Message schema
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  skills: z.array(z.string())
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  
  github: z.string()
    .regex(/^[a-zA-Z0-9-]*$/, 'Invalid GitHub username')
    .optional()
    .or(z.literal('')),
  
  linkedin: z.string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal(''))
})

// Helper function to validate and get errors
export const validateData = (schema, data) => {
  try {
    schema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

// Helper function to validate single field
export const validateField = (schema, fieldName, value) => {
  try {
    const fieldSchema = schema.shape[fieldName]
    if (!fieldSchema) return { success: true }
    
    fieldSchema.parse(value)
    return { success: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Validation failed' }
  }
}
