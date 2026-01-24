import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, validateData } from '../utils/validation'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123'
      }
      
      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: ''
      }
      
      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        role: 'Developer',
        skills: ['JavaScript']
      }
      
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject weak password', () => {
      const data = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        role: 'Developer',
        skills: ['JavaScript']
      }
      
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const data = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        role: 'Developer',
        skills: ['JavaScript']
      }
      
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid name', () => {
      const data = {
        name: 'A',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        role: 'Developer',
        skills: ['JavaScript']
      }
      
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('validateData helper', () => {
    it('should return success for valid data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const result = validateData(loginSchema, data)
      expect(result.success).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should return errors for invalid data', () => {
      const data = {
        email: 'invalid',
        password: ''
      }
      
      const result = validateData(loginSchema, data)
      expect(result.success).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })
})
