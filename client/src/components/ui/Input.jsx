import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

/**
 * Enhanced Input component with animations and validation states
 */
const Input = forwardRef(({
  type = 'text',
  label,
  error,
  success,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const inputType = type === 'password' && showPassword ? 'text' : type
  
  const baseClasses = 'w-full px-4 py-2.5 bg-dark-lighter border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark'
  
  const stateClasses = error
    ? 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink/50 text-white'
    : success
    ? 'border-neon-green focus:border-neon-green focus:ring-neon-green/50 text-white'
    : 'border-gray-700 focus:border-neon-blue focus:ring-neon-blue/50 text-white'
  
  const iconPaddingClasses = Icon && iconPosition === 'left' ? 'pl-12' : Icon ? 'pr-12' : ''
  const passwordTogglePadding = showPasswordToggle ? 'pr-12' : ''
  
  const inputClasses = `
    ${baseClasses}
    ${stateClasses}
    ${iconPaddingClasses}
    ${passwordTogglePadding}
    ${className}
  `
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? 'text-neon-blue' : error ? 'text-neon-pink' : success ? 'text-neon-green' : 'text-gray-400'
          }`}>
            <Icon size={20} />
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Right Icon or Password Toggle */}
        {showPasswordToggle && type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        ) : Icon && iconPosition === 'right' ? (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? 'text-neon-blue' : error ? 'text-neon-pink' : success ? 'text-neon-green' : 'text-gray-400'
          }`}>
            <Icon size={20} />
          </div>
        ) : null}
        
        {/* Success/Error Icons */}
        {!showPasswordToggle && (error || success) && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${
            error ? 'text-neon-pink' : 'text-neon-green'
          }`}>
            {error ? <AlertCircle size={20} /> : <Check size={20} />}
          </div>
        )}
      </div>
      
      {/* Helper Text or Error Message */}
      {(helperText || error || success) && (
        <div className={`mt-2 text-sm flex items-start gap-2 animate-fade-in ${
          error ? 'text-neon-pink' : success ? 'text-neon-green' : 'text-gray-400'
        }`}>
          {error || success || helperText}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
