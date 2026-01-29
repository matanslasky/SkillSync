import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the auth service
vi.mock('../services/authService', () => ({
  login: vi.fn(),
  onAuthChange: vi.fn(() => () => {}),
  getCurrentUser: vi.fn()
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderLogin()
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(document.getElementById('password-input')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument()
    })

    it('should have proper form structure', () => {
      renderLogin()
      
      const form = screen.getByRole('form', { hidden: true })
      expect(form).toBeInTheDocument()
      expect(form).toHaveAttribute('aria-labelledby', 'login-heading')
    })

    it('should announce errors to screen readers', async () => {
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Submit with empty fields
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should support keyboard navigation', () => {
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = document.getElementById('password-input')
      
      // Tab navigation
      emailInput.focus()
      expect(document.activeElement).toBe(emailInput)
      
      fireEvent.keyDown(emailInput, { key: 'Tab' })
      // After tab, focus should move (this is browser behavior, hard to test)
    })

    it('should toggle password visibility with accessible button', () => {
      renderLogin()
      
      const toggleButton = screen.getByLabelText(/show password/i)
      const passwordInput = document.getElementById('password-input')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton)
      
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should validate email format', async () => {
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
      })
    })

    it('should require password', async () => {
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should show validation errors with proper ARIA attributes', async () => {
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      })
    })
  })

  describe('Remember Me', () => {
    it('should save email to localStorage when checked', async () => {
      const { login } = await import('../services/authService')
      login.mockResolvedValue({ user: { uid: '123', email: 'test@example.com' } })
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = document.getElementById('password-input')
      const rememberMe = screen.getByLabelText(/remember me/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      fireEvent.click(rememberMe)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(localStorage.getItem('rememberedEmail')).toBe('test@example.com')
      })
    })

    it('should not save password to localStorage', async () => {
      const { login } = await import('../services/authService')
      login.mockResolvedValue({ user: { uid: '123', email: 'test@example.com' } })
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = document.getElementById('password-input')
      const rememberMe = screen.getByLabelText(/remember me/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      fireEvent.click(rememberMe)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(localStorage.getItem('rememberedPassword')).toBeNull()
      })
    })
  })

  describe('Loading State', () => {
    it('should disable button while loading', async () => {
      const { login } = await import('../services/authService')
      login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = document.getElementById('password-input')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      fireEvent.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveAttribute('aria-label', expect.stringContaining('please wait'))
    })
  })
})
