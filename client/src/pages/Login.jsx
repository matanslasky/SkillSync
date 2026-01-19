import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      
      // Store admin session if admin login
      if (result.user?.isAdmin) {
        sessionStorage.setItem('adminUser', JSON.stringify(result.user))
      }
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text-green mb-2">
            Skill<span className="text-neon-blue">Sync</span>
          </h1>
          <p className="text-gray-500">Build. Collaborate. Ship.</p>
        </div>

        {/* Login Card */}
        <div className="glass-effect rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg text-neon-pink text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e)
                    }
                  }}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-12 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-green text-dark font-semibold py-3 rounded-lg hover:shadow-neon-green transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-neon-blue hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
