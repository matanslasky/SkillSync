import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Briefcase } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Developer',
    skills: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const roles = ['Developer', 'Designer', 'Marketer']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
      
      // Better error messages
      let errorMsg = 'Registration failed'
      
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Email already registered. Try logging in instead.'
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.'
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.'
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Registration is not enabled. Check Firebase Console > Authentication.'
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Check your internet connection.'
      } else if (err.message) {
        errorMsg = err.message
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      }
      
      setError(errorMsg)
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
          <p className="text-gray-500">Join the Revolution</p>
        </div>

        {/* Register Card */}
        <div className="glass-effect rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg text-neon-pink text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
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
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Role
              </label>
              <div className="relative">
                <Briefcase size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all appearance-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-green text-dark font-semibold py-3 rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-blue hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
