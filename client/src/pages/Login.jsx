import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { loginSchema, validateField } from '../utils/validation'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    // Validate form data
    try {
      loginSchema.parse(formData)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      if (validationError.issues) {
        const errors = {}
        validationError.issues.forEach((err) => {
          errors[err.path[0]] = err.message
        })
        setFieldErrors(errors)
      } else {
        setError('Please check your input and try again')
      }
      setLoading(false)
      return
    }

    try {
      await login(formData.email, formData.password)
      
      // Handle Remember Me - only store email, never password
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" role="banner">
          <h1 className="text-4xl font-bold neon-text-green mb-2" aria-label="SkillSync">
            Skill<span className="text-neon-blue">Sync</span>
          </h1>
          <p className="text-gray-500" aria-label="Tagline">Build. Collaborate. Ship.</p>
        </div>

        {/* Login Card */}
        <div className="glass-effect rounded-xl p-8" role="main">
          <h2 className="text-2xl font-bold text-white mb-6" id="login-heading">Welcome Back</h2>

          {error && (
            <div 
              role="alert" 
              aria-live="assertive"
              className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg text-neon-pink text-sm"
            >
              {error}
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            aria-labelledby="login-heading"
            noValidate
          >
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email-input"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-dark-lighter border rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                    fieldErrors.email ? 'border-neon-pink' : 'border-gray-800'
                  }`}
                  placeholder="you@example.com"
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-neon-pink" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password-input"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e)
                    }
                  }}
                  className={`w-full bg-dark-lighter border rounded-lg pl-10 pr-12 py-3 text-white focus:border-neon-green focus:outline-none transition-all ${
                    fieldErrors.password ? 'border-neon-pink' : 'border-gray-800'
                  }`}
                  placeholder="••••••••"
                  aria-invalid={fieldErrors.password ? 'true' : 'false'}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-neon-pink" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-800 bg-dark-lighter text-neon-green focus:ring-neon-green focus:ring-2"
                aria-describedby="remember-me-description"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-400 cursor-pointer">
                Remember me on this device
              </label>
              <span id="remember-me-description" className="sr-only">
                Your email will be saved for easier login next time
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-green text-dark font-semibold py-3 rounded-lg hover:shadow-neon-green transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              aria-label={loading ? 'Logging in, please wait' : 'Sign in to your account'}
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={20} aria-hidden="true" />
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
