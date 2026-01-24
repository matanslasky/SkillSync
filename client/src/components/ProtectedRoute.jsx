import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/adminUtils'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check for admin access if required
  if (requireAdmin && !isAdmin(user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="text-center glass-effect rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-neon-pink mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You don't have permission to access this page. Admin privileges are required.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
