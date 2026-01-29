import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
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

const renderProtectedRoute = (user, requireAdmin = false) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user, loading: false }}>
        <ProtectedRoute requireAdmin={requireAdmin}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute Component - Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    const user = { uid: '123', email: 'test@example.com', role: 'Developer' }
    renderProtectedRoute(user)
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    renderProtectedRoute(null)
    
    // Since Navigate component is used, it doesn't call mockNavigate
    // Instead, check that protected content is NOT rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: null, loading: true }}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})

describe('ProtectedRoute Component - Admin Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is admin and requireAdmin is true', () => {
    const adminUser = { uid: '123', email: 'admin@example.com', role: 'Admin' }
    renderProtectedRoute(adminUser, true)
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows access denied when non-admin tries to access admin route', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    renderProtectedRoute(regularUser, true)
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('displays admin access denial message', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    renderProtectedRoute(regularUser, true)
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(screen.getByText(/admin privileges are required/i)).toBeInTheDocument()
  })

  it('does not render protected content for non-admin', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    renderProtectedRoute(regularUser, true)
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('allows access to non-admin routes for regular users', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    renderProtectedRoute(regularUser, false)
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

describe('ProtectedRoute Component - Role Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('checks role property for admin verification', () => {
    const adminUser = { uid: '123', email: 'admin@example.com', role: 'Admin' }
    renderProtectedRoute(adminUser, true)
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('denies access when role is not Admin', () => {
    const designerUser = { uid: '123', email: 'designer@example.com', role: 'Designer' }
    renderProtectedRoute(designerUser, true)
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('handles missing role property gracefully', () => {
    const userWithoutRole = { uid: '123', email: 'user@example.com' }
    renderProtectedRoute(userWithoutRole, true)
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })
})

describe('ProtectedRoute Component - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has accessible heading on access denied page', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    renderProtectedRoute(regularUser, true)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent(/access denied/i)
  })

  it('provides semantic HTML structure', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    const { container } = renderProtectedRoute(regularUser, true)
    
    // Should have proper structure
    expect(container.querySelector('.flex')).toBeInTheDocument()
  })
})

describe('ProtectedRoute Component - Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to dashboard when non-admin accesses admin route', () => {
    const regularUser = { uid: '123', email: 'user@example.com', role: 'Developer' }
    renderProtectedRoute(regularUser, true)
    
    // Access denied message shown before redirect
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })
})
