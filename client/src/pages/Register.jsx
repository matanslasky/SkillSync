import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react'
import { ROLE_LIST } from '../constants/roles'
import { registerSchema } from '../utils/validation'
import ProfileCompletionWizard from '../components/ProfileCompletionWizard'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Developer',
    skills: [],
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    // Validate form data
    try {
      registerSchema.parse(formData)
    } catch (validationError) {
      if (validationError.errors) {
        const errors = {}
        validationError.errors.forEach((err) => {
          errors[err.path[0]] = err.message
        })
        setFieldErrors(errors)
      }
      setLoading(false)
      return
    }

    try {
      await register(formData)
      setShowWizard(true) // Show wizard after successful registration
    } catch (err) {
      console.error('Registration error:', err)
      
      // Better error messages
      let errorMsg = 'Registration failed'
      
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Email already registered. Try logging in instead.'
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.'
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 8 characters with uppercase, lowercase, and numbers.'
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
        <header role="banner" className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text-green mb-2">
            Skill<span className="text-neon-blue">Sync</span>
          </h1>
          <p className="text-gray-500">Join the Revolution</p>
        </header>

        {/* Register Card */}
        <main role="main" className="glass-effect rounded-xl p-8">
          <h2 id="register-heading" className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg text-neon-pink text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-labelledby="register-heading" noValidate className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name-input" className="block text-sm font-medium text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-dark-lighter border rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                    fieldErrors.name ? 'border-neon-pink' : 'border-gray-800'
                  }`}
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-label="Full name"
                  aria-invalid={fieldErrors.name ? 'true' : 'false'}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  required
                />
              </div>
              {fieldErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-dark-lighter border rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                    fieldErrors.email ? 'border-neon-pink' : 'border-gray-800'
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-label="Email address"
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full bg-dark-lighter border rounded-lg pl-10 pr-12 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                    fieldErrors.password ? 'border-neon-pink' : 'border-gray-800'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-label="Password (minimum 8 characters with uppercase, lowercase, and number)"
                  aria-invalid={fieldErrors.password ? 'true' : 'false'}
                  aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              <p id="password-hint" className="mt-1 text-xs text-gray-500">Min 8 characters with uppercase, lowercase, and number</p>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-password-input" className="block text-sm font-medium text-gray-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full bg-dark-lighter border rounded-lg pl-10 pr-12 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                    fieldErrors.confirmPassword ? 'border-neon-pink' : 'border-gray-800'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-label="Confirm password"
                  aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-sm text-neon-pink" role="alert">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role-select" className="block text-sm font-medium text-gray-400 mb-2">
                Role
              </label>
              <div className="relative">
                <Briefcase size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <select
                  id="role-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all appearance-none"
                  aria-label="Select your role"
                >
                  {ROLE_LIST.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
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
              aria-label={loading ? 'Creating account, please wait' : 'Create account'}
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
        </main>
      </div>

      {/* Profile Completion Wizard */}
      {showWizard && (
        <ProfileCompletionWizard
          onComplete={() => {
            setShowWizard(false)
            navigate('/dashboard')
          }}
          onSkip={() => {
            setShowWizard(false)
            navigate('/dashboard')
          }}
        />
      )}
    </div>
  )
}

export default Register
