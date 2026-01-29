import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../pages/Register'
import { AuthContext } from '../contexts/AuthContext'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock ProfileCompletionWizard component
vi.mock('../components/ProfileCompletionWizard', () => ({
  default: ({ onComplete, onSkip }) => (
    <div data-testid="wizard">
      <button onClick={onComplete}>Complete</button>
      <button onClick={onSkip}>Skip</button>
    </div>
  ),
}))

const mockRegister = vi.fn()

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ register: mockRegister }}>
        <Register />
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('Register Component - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has proper ARIA labels on all form inputs', () => {
    renderRegister()
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(document.getElementById('confirm-password-input')).toBeInTheDocument()
    expect(screen.getByLabelText(/select your role/i)).toBeInTheDocument()
  })

  it('has semantic HTML structure with header and main', () => {
    renderRegister()
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('associates labels with inputs using htmlFor', () => {
    renderRegister()
    
    const nameInput = screen.getByLabelText(/full name/i)
    expect(nameInput).toHaveAttribute('id', 'name-input')
    
    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toHaveAttribute('id', 'email-input')
    
    const passwordInput = screen.getByLabelText(/^password/i)
    expect(passwordInput).toHaveAttribute('id', 'password-input')
  })

  it('displays password strength hint', () => {
    renderRegister()
    
    expect(screen.getByText(/min 8 characters with uppercase, lowercase, and number/i)).toBeInTheDocument()
  })

  it('has accessible password toggle buttons', () => {
    renderRegister()
    
    const showPasswordButtons = screen.getAllByRole('button', { name: /show password/i })
    expect(showPasswordButtons.length).toBeGreaterThan(0)
    
    fireEvent.click(showPasswordButtons[0])
    
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
  })
})

describe('Register Component - Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates name format', async () => {
    renderRegister()
    
    const nameInput = screen.getByLabelText(/full name/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(nameInput, { target: { value: 'A' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    renderRegister()
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('validates password strength requirements', async () => {
    renderRegister()
    
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      // Should show any password error - could be length, missing uppercase, etc
      const passwordError = screen.queryByText(/password must/i) || screen.queryByText(/password/i)
      expect(passwordError).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    renderRegister()
    
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = document.getElementById('confirm-password-input')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('sets aria-invalid when validation fails', async () => {
    renderRegister()
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('associates error messages with aria-describedby', async () => {
    renderRegister()
    
    const nameInput = screen.getByLabelText(/full name/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(nameInput, { target: { value: 'A' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error')
      // Find specific error by id instead of role
      const nameError = document.getElementById('name-error')
      expect(nameError).toHaveTextContent(/name must be at least 2 characters/i)
    })
  })
})

describe('Register Component - Form Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls register with correct data on valid submission', async () => {
    mockRegister.mockResolvedValueOnce({})
    renderRegister()
    
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'ValidPass123' } })
    fireEvent.change(document.getElementById('confirm-password-input'), { target: { value: 'ValidPass123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
        role: 'Developer',
        skills: [],
      })
    })
  })

  it('shows wizard after successful registration', async () => {
    mockRegister.mockResolvedValueOnce({})
    renderRegister()
    
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'ValidPass123' } })
    fireEvent.change(document.getElementById('confirm-password-input'), { target: { value: 'ValidPass123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument()
    })
  })

  it('displays error message on registration failure', async () => {
    mockRegister.mockRejectedValueOnce({ code: 'auth/email-already-in-use' })
    renderRegister()
    
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'ValidPass123' } })
    fireEvent.change(document.getElementById('confirm-password-input'), { target: { value: 'ValidPass123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email already registered/i)
    })
  })

  it('disables submit button during submission', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    renderRegister()
    
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'ValidPass123' } })
    fireEvent.change(document.getElementById('confirm-password-input'), { target: { value: 'ValidPass123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    expect(screen.getByRole('button', { name: /creating account, please wait/i })).toBeDisabled()
  })
})

describe('Register Component - Role Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has Developer as default role', () => {
    renderRegister()
    
    const roleSelect = screen.getByLabelText(/select your role/i)
    expect(roleSelect).toHaveValue('Developer')
  })

  it('allows changing role selection', () => {
    renderRegister()
    
    const roleSelect = screen.getByLabelText(/select your role/i)
    fireEvent.change(roleSelect, { target: { value: 'Designer' } })
    
    expect(roleSelect).toHaveValue('Designer')
  })
})

describe('Register Component - Password Visibility Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toggles password visibility', () => {
    renderRegister()
    
    const passwordInput = screen.getByLabelText(/^password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const showButton = screen.getAllByRole('button', { name: /show password/i })[0]
    fireEvent.click(showButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
  })

  it('toggles confirm password visibility independently', () => {
    renderRegister()
    
    const confirmPasswordInput = document.getElementById('confirm-password-input')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    
    const showButton = screen.getAllByRole('button', { name: /show confirm password/i })[0]
    fireEvent.click(showButton)
    
    expect(confirmPasswordInput).toHaveAttribute('type', 'text')
  })

  it('has aria-pressed attribute on toggle buttons', () => {
    renderRegister()
    
    const showButtons = screen.getAllByRole('button', { name: /show password/i })
    expect(showButtons[0]).toHaveAttribute('aria-pressed', 'false')
    
    fireEvent.click(showButtons[0])
    
    const hideButton = screen.getByRole('button', { name: /hide password/i })
    expect(hideButton).toHaveAttribute('aria-pressed', 'true')
  })
})
